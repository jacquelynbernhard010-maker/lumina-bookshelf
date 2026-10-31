/**
 * Lumina Bookshelf - Reader Engine (IndexedDB + Supabase)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');

    if (!bookId) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const readerLoader = document.getElementById('readerLoader');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const progressIndicator = document.getElementById('progressIndicator');
    const progressFill = document.getElementById('progressFill');
    const footerProgress = document.getElementById('footerProgress');
    const btnDownloadBook = document.getElementById('btnDownloadBook');
    const btnFullscreen = document.getElementById('btnFullscreen');

    // TOC
    const btnToggleToc = document.getElementById('btnToggleToc');
    const btnCloseToc = document.getElementById('btnCloseToc');
    const tocSidebar = document.getElementById('tocSidebar');
    const tocList = document.getElementById('tocList');

    // Appearance
    const btnAppearance = document.getElementById('btnAppearance');
    const appearanceMenu = document.getElementById('appearanceMenu');
    const btnFontInc = document.getElementById('btnFontInc');
    const btnFontDec = document.getElementById('btnFontDec');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const themeChoices = document.querySelectorAll('.theme-choice');
    const fontButtons = document.querySelectorAll('.font-btn');

    // State
    let currentFontSize = parseInt(localStorage.getItem('lumina_reader_font_size') || '105', 10);
    let currentTheme = localStorage.getItem('lumina_reader_theme') || 'theme-sepia';
    let currentFontFamily = localStorage.getItem('lumina_reader_font') || 'Merriweather, serif';

    document.body.className = currentTheme;
    fontSizeDisplay.innerText = currentFontSize + '%';

    themeChoices.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === currentTheme));
    fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.font === currentFontFamily));

    // Initialize DB & load book
    await window.storageEngine.initIndexedDB();
    const book = await window.storageEngine.getBook(bookId);

    if (!book) {
        alert('Book not found in library.');
        window.location.href = 'index.html';
        return;
    }

    bookTitle.innerText = book.title;
    bookAuthor.innerText = book.author || 'Unknown Author';
    document.title = `${book.title} - Reader`;

    // Download Button setup
    btnDownloadBook.addEventListener('click', () => {
        if (book.file_blob) {
            const url = URL.createObjectURL(book.file_blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = book.file_name || `${book.title}.epub`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (book.file_url) {
            window.open(book.file_url, '_blank');
        }
    });

    // Prepare ePub input source (Blob or URL)
    let epubSource;
    if (book.file_blob) {
        // Local IndexedDB blob
        epubSource = await book.file_blob.arrayBuffer();
    } else if (book.file_url) {
        epubSource = book.file_url;
    }

    let epubBook, rendition;

    try {
        epubBook = ePub(epubSource);
        rendition = epubBook.renderTo("epubViewer", {
            width: "100%",
            height: "100%",
            spread: window.innerWidth > 960 ? "auto" : "none",
            flow: "paginated"
        });

        registerEpubThemes();

        // Restore CFI or start from beginning
        const startTarget = book.last_cfi || undefined;
        rendition.display(startTarget).then(() => {
            readerLoader.style.display = 'none';
            applyCurrentTheme();
        }).catch(err => {
            console.warn('CFI fallback:', err);
            rendition.display();
            readerLoader.style.display = 'none';
        });

        // Generate location index for accurate percentage
        epubBook.ready.then(() => {
            return epubBook.locations.generate(1000);
        }).then(() => {
            updateProgressDisplay();
        });

        // Track pagination
        rendition.on('relocated', (location) => {
            if (!location || !location.start) return;

            const cfi = location.start.cfi;
            let percent = 0;

            if (epubBook.locations && epubBook.locations.total > 0) {
                percent = Math.floor(epubBook.locations.percentageFromCfi(cfi) * 100);
            }

            progressIndicator.innerText = `${percent}% read`;
            footerProgress.innerText = `${percent}%`;
            progressFill.style.width = `${percent}%`;

            // Debounced save to DB
            saveReadingProgress(cfi, percent);
        });

        // Populate Table of Contents
        epubBook.loaded.navigation.then(nav => {
            renderTableOfContents(nav.toc);
        });

    } catch (err) {
        console.error('ePub error:', err);
        readerLoader.innerHTML = `<p style="color:#ef4444;">Failed to load book.<br><small>${err.message}</small></p>`;
    }

    // --- Navigation ---

    btnPrevPage.addEventListener('click', () => { if (rendition) rendition.prev(); });
    btnNextPage.addEventListener('click', () => { if (rendition) rendition.next(); });

    document.addEventListener('keydown', (e) => {
        if (!rendition) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            rendition.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            rendition.prev();
        }
    });

    if (rendition) {
        rendition.on('click', (e) => {
            const width = window.innerWidth;
            if (e.clientX < width * 0.25) rendition.prev();
            else if (e.clientX > width * 0.75) rendition.next();
        });
    }

    // --- Table of Contents ---

    btnToggleToc.addEventListener('click', () => tocSidebar.classList.toggle('open'));
    btnCloseToc.addEventListener('click', () => tocSidebar.classList.remove('open'));

    function renderTableOfContents(toc) {
        tocList.innerHTML = '';
        if (!toc || toc.length === 0) {
            tocList.innerHTML = '<p style="padding: 14px; color: var(--text-chrome);">No table of contents available.</p>';
            return;
        }

        toc.forEach(item => {
            const link = document.createElement('a');
            link.className = 'toc-item';
            link.innerText = item.label ? item.label.trim() : 'Chapter';
            link.href = 'javascript:void(0)';
            link.addEventListener('click', () => {
                rendition.display(item.href);
                tocSidebar.classList.remove('open');
            });
            tocList.appendChild(link);
        });
    }

    // --- Appearance Controls ---

    btnAppearance.addEventListener('click', (e) => {
        e.stopPropagation();
        appearanceMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-wrapper')) {
            appearanceMenu.classList.remove('show');
        }
    });

    themeChoices.forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen = btn.dataset.theme;
            currentTheme = chosen;
            document.body.className = chosen;
            localStorage.setItem('lumina_reader_theme', chosen);

            themeChoices.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            applyCurrentTheme();
        });
    });

    fontButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const font = btn.dataset.font;
            currentFontFamily = font;
            localStorage.setItem('lumina_reader_font', font);

            fontButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (rendition) rendition.themes.font(font);
        });
    });

    btnFontInc.addEventListener('click', () => {
        if (currentFontSize < 180) {
            currentFontSize += 10;
            updateFontSize();
        }
    });

    btnFontDec.addEventListener('click', () => {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            updateFontSize();
        }
    });

    function updateFontSize() {
        fontSizeDisplay.innerText = currentFontSize + '%';
        localStorage.setItem('lumina_reader_font_size', currentFontSize);
        if (rendition) rendition.themes.fontSize(currentFontSize + '%');
    }

    function registerEpubThemes() {
        rendition.themes.register('theme-light', { body: { background: '#fcfcfc', color: '#111827', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-sepia', { body: { background: '#fbf0d9', color: '#5f4b32', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-dark',  { body: { background: '#18191c', color: '#d1d5db', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-black', { body: { background: '#000000', color: '#e5e5e5', 'font-family': currentFontFamily } });
    }

    function applyCurrentTheme() {
        if (rendition) {
            rendition.themes.select(currentTheme);
            rendition.themes.fontSize(currentFontSize + '%');
            rendition.themes.font(currentFontFamily);
        }
    }

    // --- Progress Persistence ---

    let saveTimer;
    function saveReadingProgress(cfi, progress) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
            try {
                await window.storageEngine.updateProgress(book.id, progress, cfi);
            } catch (err) {
                console.warn('Progress save failed:', err);
            }
        }, 1200);
    }

    function updateProgressDisplay() {
        if (rendition && epubBook.locations) {
            const loc = rendition.currentLocation();
            if (loc && loc.start) {
                const percent = Math.floor(epubBook.locations.percentageFromCfi(loc.start.cfi) * 100);
                progressIndicator.innerText = `${percent}% read`;
                footerProgress.innerText = `${percent}%`;
                progressFill.style.width = `${percent}%`;
            }
        }
    }

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    window.addEventListener('resize', () => {
        if (rendition) rendition.resize();
    });
});
