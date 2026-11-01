/**
 * The Cozy Nook - Reader Engine
 * Single-page / Two-page / Continuous scroll modes + Bookmark management
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
    const epubViewer = document.getElementById('epubViewer');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const progressIndicator = document.getElementById('progressIndicator');
    const progressFill = document.getElementById('progressFill');
    const footerProgress = document.getElementById('footerProgress');
    const chapterTitleEl = document.getElementById('chapterTitle');
    const btnDownloadBook = document.getElementById('btnDownloadBook');

    // Mode Switchers
    const btnModeSingle = document.getElementById('btnModeSingle');
    const btnModeSpread = document.getElementById('btnModeSpread');
    const btnModeScroll = document.getElementById('btnModeScroll');
    const modeButtons = [btnModeSingle, btnModeSpread, btnModeScroll];

    // Bookmarking Elements
    const btnAddBookmark = document.getElementById('btnAddBookmark');
    const bookmarkIcon = document.getElementById('bookmarkIcon');
    const bookmarkText = document.getElementById('bookmarkText');
    const bookmarkCount = document.getElementById('bookmarkCount');
    const bookmarkList = document.getElementById('bookmarkList');

    // Drawer Elements
    const btnToggleDrawer = document.getElementById('btnToggleDrawer');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const tocSidebar = document.getElementById('tocSidebar');
    const tabChapters = document.getElementById('tabChapters');
    const tabBookmarks = document.getElementById('tabBookmarks');
    const tocList = document.getElementById('tocList');

    // Appearance Elements
    const btnAppearance = document.getElementById('btnAppearance');
    const appearanceMenu = document.getElementById('appearanceMenu');
    const btnFontInc = document.getElementById('btnFontInc');
    const btnFontDec = document.getElementById('btnFontDec');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const themeChoices = document.querySelectorAll('.theme-choice');
    const fontButtons = document.querySelectorAll('.font-btn');

    // State
    let currentReadingMode = localStorage.getItem('cozy_reading_mode') || 'single'; // 'single', 'spread', or 'scroll'
    let currentFontSize = parseInt(localStorage.getItem('cozy_reader_font_size') || '105', 10);
    let currentTheme = localStorage.getItem('cozy_reader_theme') || 'theme-sepia';
    let currentFontFamily = localStorage.getItem('cozy_reader_font') || "'Lora', Georgia, serif";

    document.body.className = currentTheme;
    fontSizeDisplay.innerText = currentFontSize + '%';

    // Init storage & load book
    await window.storageEngine.initIndexedDB();
    const book = await window.storageEngine.getBook(bookId);

    if (!book) {
        alert('Book not found on your shelf!');
        window.location.href = 'index.html';
        return;
    }

    bookTitle.innerText = book.title;
    bookAuthor.innerText = book.author || 'Unknown Author';
    document.title = `${book.title} - The Cozy Nook`;

    // Download handler
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

    // Prepare ePub input source
    let epubSource;
    if (book.file_blob) {
        epubSource = await book.file_blob.arrayBuffer();
    } else if (book.file_url) {
        epubSource = book.file_url;
    }

    let epubBook, rendition;

    function renderReaderEngine(mode) {
        currentReadingMode = mode;
        localStorage.setItem('cozy_reading_mode', mode);

        // Update mode button styles
        modeButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        // Configure viewer container CSS
        epubViewer.className = `epub-viewer ${mode}-page-mode`;
        if (mode === 'scroll') {
            epubViewer.className = 'epub-viewer scroll-mode';
            btnPrevPage.style.display = 'none';
            btnNextPage.style.display = 'none';
        } else {
            btnPrevPage.style.display = 'flex';
            btnNextPage.style.display = 'flex';
        }

        // Clean existing rendition
        if (rendition) {
            try { rendition.destroy(); } catch(e) {}
        }

        readerLoader.style.display = 'block';

        const options = {
            width: "100%",
            height: "100%"
        };

        if (mode === 'single') {
            options.spread = "none";
            options.flow = "paginated";
        } else if (mode === 'spread') {
            options.spread = "always";
            options.flow = "paginated";
        } else if (mode === 'scroll') {
            options.manager = "continuous";
            options.flow = "scrolled";
        }

        rendition = epubBook.renderTo("epubViewer", options);
        registerEpubThemes();

        // Injected rules: completely hide scrollbars inside reader iframe & add bottom breathing space
        rendition.hooks.content.register((contents) => {
            contents.addStylesheetRules({
                "html, body": {
                    "scrollbar-width": "none !important",
                    "-ms-overflow-style": "none !important",
                    "padding-bottom": "80px !important",
                    "overflow-x": "hidden !important"
                },
                "::-webkit-scrollbar": {
                    "display": "none !important",
                    "width": "0px !important",
                    "height": "0px !important"
                }
            });

            // Smooth mousewheel & touch scroll forwarding in scroll mode
            const doc = contents.document;
            if (doc) {
                doc.addEventListener('wheel', (e) => {
                    if (currentReadingMode === 'scroll') {
                        epubViewer.scrollBy({ top: e.deltaY, behavior: 'auto' });
                    }
                }, { passive: true });
            }
        });

        // Infinite Scroll listener: when nearing the bottom, auto-trigger next section so user never gets stuck!
        let scrollThrottle = false;
        epubViewer.onscroll = () => {
            if (currentReadingMode !== 'scroll' || !rendition || scrollThrottle) return;
            const { scrollTop, scrollHeight, clientHeight } = epubViewer;
            if (scrollHeight - (scrollTop + clientHeight) < 450) {
                scrollThrottle = true;
                rendition.next();
                setTimeout(() => { scrollThrottle = false; }, 300);
            }
        };

        // Restore saved CFI or beginning
        const startTarget = book.last_cfi || undefined;
        rendition.display(startTarget).then(() => {
            readerLoader.style.display = 'none';
            applyCurrentTheme();
        }).catch(() => {
            rendition.display();
            readerLoader.style.display = 'none';
        });

        // Relocated event: tracks location, percentage, and checks bookmark status
        rendition.on('relocated', (location) => {
            if (!location || !location.start) return;

            const cfi = location.start.cfi;
            let percent = 0;

            if (epubBook.locations && epubBook.locations.total > 0) {
                percent = Math.floor(epubBook.locations.percentageFromCfi(cfi) * 100);
            }

            if (footerProgress) footerProgress.innerText = `${percent}% read`;
            if (progressFill) progressFill.style.width = `${percent}%`;

            checkIfCurrentPageIsBookmarked(cfi);
            saveReadingProgress(cfi, percent);
        });

        // Click to turn page in paginated mode
        if (mode !== 'scroll') {
            rendition.on('click', (e) => {
                const width = window.innerWidth;
                if (e.clientX < width * 0.25) rendition.prev();
                else if (e.clientX > width * 0.75) rendition.next();
            });
        }
    }

    try {
        epubBook = ePub(epubSource);

        // Initial render with saved mode (default: single page)
        renderReaderEngine(currentReadingMode);

        // Generate location map
        epubBook.ready.then(() => epubBook.locations.generate(1000));

        // Load chapters & bookmarks
        epubBook.loaded.navigation.then(nav => {
            renderChapters(nav.toc);
        });
        renderBookmarksList();

    } catch (err) {
        console.error('EPUB Error:', err);
        readerLoader.innerHTML = `<p style="color:#ef4444;">Could not load book.<br><small>${err.message}</small></p>`;
    }

    // --- Mode Switcher Clicks ---

    btnModeSingle.addEventListener('click', () => renderReaderEngine('single'));
    btnModeSpread.addEventListener('click', () => renderReaderEngine('spread'));
    btnModeScroll.addEventListener('click', () => renderReaderEngine('scroll'));

    // --- Navigation Controls ---

    btnPrevPage.addEventListener('click', () => { if (rendition) rendition.prev(); });
    btnNextPage.addEventListener('click', () => { if (rendition) rendition.next(); });

    document.addEventListener('keydown', (e) => {
        if (!rendition || currentReadingMode === 'scroll') return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') rendition.next();
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') rendition.prev();
    });

    // --- Bookmarks Feature ---
    const pageBookmarkRibbon = document.getElementById('pageBookmarkRibbon');
    const headerBookmarkBadge = document.getElementById('headerBookmarkBadge');

    async function toggleBookmarkCurrentPage() {
        if (!rendition) return;
        const location = rendition.currentLocation();
        if (!location || !location.start) return;

        const cfi = location.start.cfi;
        const curBook = await window.storageEngine.getBook(book.id);
        const bookmarks = curBook.bookmarks || [];
        const existingIndex = bookmarks.findIndex(b => b.cfi === cfi);

        if (existingIndex !== -1) {
            // Already bookmarked -> Remove bookmark
            const bmId = bookmarks[existingIndex].id;
            await window.storageEngine.removeBookmark(book.id, bmId);
            showToast('Bookmark removed ✕', 'info');
        } else {
            // Calculate progress percentage
            let percent = 0;
            if (epubBook.locations && epubBook.locations.total > 0) {
                percent = Math.floor(epubBook.locations.percentageFromCfi(cfi) * 100);
            } else if (footerProgress) {
                percent = parseInt(footerProgress.innerText) || 0;
            }

            const curChapter = (chapterTitleEl && chapterTitleEl.innerText.trim()) ? chapterTitleEl.innerText.trim() : 'Bookmarked Page';
            const pageText = location.start.displayed && location.start.displayed.page 
                ? `Page ${location.start.displayed.page} (${percent}%)` 
                : `${percent}% read`;

            await window.storageEngine.addBookmark(book.id, {
                cfi: cfi,
                title: curChapter,
                snippet: `${pageText} • Saved spot`
            });

            showToast(`🔖 Page bookmarked (${percent}% read)!`, 'success');
            
            // Auto switch drawer to Bookmarks tab so it's ready when user opens Contents
            showBookmarksTab();
        }

        await checkIfCurrentPageIsBookmarked(cfi);
        await renderBookmarksList();
    }

    btnAddBookmark.addEventListener('click', toggleBookmarkCurrentPage);
    if (pageBookmarkRibbon) {
        pageBookmarkRibbon.addEventListener('click', toggleBookmarkCurrentPage);
    }

    async function renderBookmarksList() {
        const updatedBook = await window.storageEngine.getBook(book.id);
        const bookmarks = updatedBook.bookmarks || [];
        bookmarkCount.innerText = bookmarks.length;

        if (headerBookmarkBadge) {
            if (bookmarks.length > 0) {
                headerBookmarkBadge.innerText = bookmarks.length;
                headerBookmarkBadge.classList.remove('hidden');
            } else {
                headerBookmarkBadge.classList.add('hidden');
            }
        }

        if (bookmarks.length === 0) {
            bookmarkList.innerHTML = `
                <div class="p-4 text-center">
                    <span class="text-3xl block mb-2">🔖</span>
                    <p class="font-bold text-sm text-[#2c221e] mb-1">No bookmarks yet</p>
                    <p class="text-xs text-[#786457]">Click "🔖 Bookmark" at the top to save your favorite spots!</p>
                </div>
            `;
            return;
        }

        bookmarkList.innerHTML = '';
        bookmarks.forEach((bm, idx) => {
            const card = document.createElement('div');
            card.className = 'bookmark-card';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="font-bold text-sm text-[#2c221e] flex items-center gap-1.5">
                        <span>🔖</span>
                        <span>${escapeHtml(bm.title || `Bookmark #${idx + 1}`)}</span>
                    </div>
                    <button class="btn-delete-bookmark text-xs font-bold text-red-600 hover:text-red-800 p-1" title="Remove bookmark">✕</button>
                </div>
                <div class="text-xs text-[#786457] mt-1 flex items-center justify-between">
                    <span>${escapeHtml(bm.snippet || '')}</span>
                    <span class="text-[10px] text-[#a39488]">${escapeHtml(bm.date || '')}</span>
                </div>
                <div class="mt-2 pt-1 border-t border-[#f0e7d8] text-right">
                    <span class="text-xs font-bold text-[#e07a5f] hover:underline">Jump to page ➔</span>
                </div>
            `;

            // Click jumps to bookmark
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-bookmark')) return;
                rendition.display(bm.cfi);
                tocSidebar.classList.remove('open');
                showToast(`Jumped to ${bm.title || 'bookmark'}`, 'info');
            });

            // Delete bookmark
            card.querySelector('.btn-delete-bookmark').addEventListener('click', async (e) => {
                e.stopPropagation();
                await window.storageEngine.removeBookmark(book.id, bm.id);
                showToast('Bookmark removed', 'info');
                const curLoc = rendition.currentLocation();
                if (curLoc && curLoc.start) checkIfCurrentPageIsBookmarked(curLoc.start.cfi);
                await renderBookmarksList();
            });

            bookmarkList.appendChild(card);
        });
    }

    async function checkIfCurrentPageIsBookmarked(currentCfi) {
        const curBook = await window.storageEngine.getBook(book.id);
        if (!curBook) return;
        const bookmarks = curBook.bookmarks || [];
        const isBm = bookmarks.some(b => b.cfi === currentCfi);

        if (isBm) {
            btnAddBookmark.classList.add('is-bookmarked');
            bookmarkIcon.innerText = '🔖';
            bookmarkText.innerText = 'Bookmarked';
            if (pageBookmarkRibbon) pageBookmarkRibbon.classList.add('active');
        } else {
            btnAddBookmark.classList.remove('is-bookmarked');
            bookmarkIcon.innerText = '🔖';
            bookmarkText.innerText = 'Bookmark';
            if (pageBookmarkRibbon) pageBookmarkRibbon.classList.remove('active');
        }
    }

    function showBookmarksTab() {
        tabBookmarks.classList.add('active');
        tabChapters.classList.remove('active');
        bookmarkList.classList.remove('hidden');
        tocList.classList.add('hidden');
    }

    function showChaptersTab() {
        tabChapters.classList.add('active');
        tabBookmarks.classList.remove('active');
        tocList.classList.remove('hidden');
        bookmarkList.classList.add('hidden');
    }

    // --- Drawer Tabs (Chapters vs Bookmarks) ---

    btnToggleDrawer.addEventListener('click', () => tocSidebar.classList.toggle('open'));
    btnCloseDrawer.addEventListener('click', () => tocSidebar.classList.remove('open'));

    tabChapters.addEventListener('click', showChaptersTab);
    tabBookmarks.addEventListener('click', showBookmarksTab);

    function renderChapters(toc) {
        tocList.innerHTML = '';
        if (!toc || toc.length === 0) {
            tocList.innerHTML = '<p class="text-xs text-[#786457] p-3">No table of contents available.</p>';
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
                chapterTitleEl.innerText = item.label.trim();
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
        if (!e.target.closest('.dropdown-wrapper')) appearanceMenu.classList.remove('show');
    });

    themeChoices.forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen = btn.dataset.theme;
            currentTheme = chosen;
            document.body.className = chosen;
            localStorage.setItem('cozy_reader_theme', chosen);

            themeChoices.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyCurrentTheme();
        });
    });

    fontButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const font = btn.dataset.font;
            currentFontFamily = font;
            localStorage.setItem('cozy_reader_font', font);

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
        localStorage.setItem('cozy_reader_font_size', currentFontSize);
        if (rendition) rendition.themes.fontSize(currentFontSize + '%');
    }

    function registerEpubThemes() {
        rendition.themes.register('theme-light', { body: { background: '#ffffff', color: '#1a1a1a', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-sepia', { body: { background: '#fbf5e8', color: '#2c221e', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-dark',  { body: { background: '#1e1916', color: '#f2ebd9', 'font-family': currentFontFamily } });
        rendition.themes.register('theme-black', { body: { background: '#000000', color: '#e0d6c8', 'font-family': currentFontFamily } });
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
            } catch (err) {}
        }, 1200);
    }

    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${type === 'success' ? '✨' : '📖'}</span><span>${escapeHtml(msg)}</span>`;
        document.getElementById('toastContainer').appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.addEventListener('resize', () => {
        if (rendition) rendition.resize();
    });
});
