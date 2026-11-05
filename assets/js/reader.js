/**
 * The Cozy Nook - Universal Reader Engine
 * Multi-format reading: EPUB, PDF, and MOBI
 * Modes: Single-page / Two-page spread / Continuous scroll + Bookmark management
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

    // Fullscreen & Zen View Elements
    const btnFullscreen = document.getElementById('btnFullscreen');
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    const fullscreenText = document.getElementById('fullscreenText');
    const btnMenuFullscreen = document.getElementById('btnMenuFullscreen');
    const btnFloatingZen = document.getElementById('btnFloatingZen');
    const zenIcon = document.getElementById('zenIcon');
    const zenText = document.getElementById('zenText');
    const btnMenuZen = document.getElementById('btnMenuZen');

    // Mobile / Tablet Center Title & Reader Side Panel Elements
    const mobileCenterTitle = document.getElementById('mobileCenterTitle');
    const btnReaderPullTab = document.getElementById('btnReaderPullTab');
    const readerPullTabIcon = document.getElementById('readerPullTabIcon');
    const readerDrawerBackdrop = document.getElementById('readerDrawerBackdrop');
    const btnSidebarFullscreen = document.getElementById('btnSidebarFullscreen');
    const sidebarFullscreenIcon = document.getElementById('sidebarFullscreenIcon');
    const sidebarFullscreenText = document.getElementById('sidebarFullscreenText');
    const btnSidebarZen = document.getElementById('btnSidebarZen');
    const btnSidebarBookmark = document.getElementById('btnSidebarBookmark');
    const sidebarBookmarkIcon = document.getElementById('sidebarBookmarkIcon');
    const sidebarBookmarkText = document.getElementById('sidebarBookmarkText');
    const btnSidebarDownload = document.getElementById('btnSidebarDownload');

    // State
    let currentReadingMode = localStorage.getItem('cozy_reading_mode') || 'single';
    if (window.innerWidth < 640 && currentReadingMode === 'spread') {
        currentReadingMode = 'single';
    }
    let currentFontSize = parseInt(localStorage.getItem('cozy_reader_font_size') || '105', 10);
    let currentTheme = localStorage.getItem('cozy_reader_theme') || 'theme-sepia';
    let currentFontFamily = localStorage.getItem('cozy_reader_font') || "'Lora', Georgia, serif";

    document.body.className = currentTheme;
    document.documentElement.style.setProperty('--reader-font', currentFontFamily);
    if (fontSizeDisplay) fontSizeDisplay.innerText = currentFontSize + '%';

    // Synchronize active states on UI buttons immediately
    themeChoices.forEach(b => {
        b.classList.toggle('active', b.dataset.theme === currentTheme);
    });
    fontButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.font === currentFontFamily);
    });

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
    if (mobileCenterTitle) mobileCenterTitle.innerText = book.title;

    function updateChapterTitle(title) {
        if (chapterTitleEl) chapterTitleEl.innerText = title;
        if (mobileCenterTitle) mobileCenterTitle.innerText = title;
    }

    // Determine book file format
    let bookFormat = (book.file_type || '').toLowerCase();
    if (!bookFormat && book.file_name) {
        bookFormat = book.file_name.split('.').pop().toLowerCase();
    }

    // Download handler for both desktop and mobile side panel
    function handleDownloadBook() {
        if (book.file_blob) {
            const url = URL.createObjectURL(book.file_blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = bookFormat ? `.${bookFormat}` : '.epub';
            a.download = book.file_name || `${book.title}${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (book.file_url) {
            window.open(book.file_url, '_blank');
        }
    }
    if (btnDownloadBook) btnDownloadBook.addEventListener('click', handleDownloadBook);
    if (btnSidebarDownload) btnSidebarDownload.addEventListener('click', handleDownloadBook);

    // Prepare input source
    let epubSource;
    if (book.file_blob) {
        epubSource = await book.file_blob.arrayBuffer();
    } else if (book.file_url) {
        epubSource = book.file_url;
    }

    // Magic bytes fallback check
    if (epubSource instanceof ArrayBuffer && epubSource.byteLength >= 4) {
        const u8 = new Uint8Array(epubSource.slice(0, 4));
        if (u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46) {
            bookFormat = 'pdf';
        } else if (u8[0] === 0x50 && u8[1] === 0x4B) {
            bookFormat = 'epub';
        } else if (epubSource.byteLength >= 68) {
            const view = new DataView(epubSource);
            const creator = view.getUint32(64, false);
            if (creator === 0x4D4F4249 || creator === 0x50616C6D) {
                bookFormat = 'mobi';
            }
        }
    }
    if (!bookFormat) bookFormat = 'epub';

    // --- Reader Themes & Typography Engine ---
    const THEME_CONFIG = {
        'theme-light': {
            bg: '#ffffff',
            text: '#1a1a1a',
            accent: '#2a6f97',
            heading: '#111111'
        },
        'theme-sepia': {
            bg: '#fbf5e8',
            text: '#2c221e',
            accent: '#e07a5f',
            heading: '#1a120e'
        },
        'theme-dark': {
            bg: '#1e1916',
            text: '#f2ebd9',
            accent: '#f2cc8f',
            heading: '#fff5e4'
        },
        'theme-black': {
            bg: '#000000',
            text: '#e0d6c8',
            accent: '#f2cc8f',
            heading: '#ffffff'
        }
    };

    function generateReaderCSS(themeKey, fontFamily, fontSizePercent) {
        const theme = THEME_CONFIG[themeKey] || THEME_CONFIG['theme-sepia'];
        const isDyslexic = fontFamily.includes('OpenDyslexic');
        return `
            @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');
            @import url('https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.3.0/index.css');
            @import url('https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.3.0/700.css');

            html {
                background-color: ${theme.bg} !important;
                background: ${theme.bg} !important;
                color: ${theme.text} !important;
                font-size: ${fontSizePercent}% !important;
            }

            body {
                background-color: ${theme.bg} !important;
                background: ${theme.bg} !important;
                color: ${theme.text} !important;
                font-family: ${fontFamily} !important;
                font-size: 1rem !important;
                line-height: ${isDyslexic ? '1.85' : '1.65'} !important;
                ${isDyslexic ? 'letter-spacing: 0.04em !important; word-spacing: 0.08em !important;' : ''}
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            *, *:before, *:after,
            html body, html body *,
            body, p, span, div, small,
            h1, h2, h3, h4, h5, h6,
            header, footer, nav,
            blockquote, article, section,
            em, strong, b, i, u,
            li, ul, ol, dl, dt, dd,
            a, [class*="chapter"], [class*="title"], [class*="heading"], [class*="header"], [class*="dropcap"] {
                font-family: ${fontFamily} !important;
                ${isDyslexic ? 'letter-spacing: 0.04em !important; word-spacing: 0.08em !important;' : ''}
            }

            body, p, span, div, small, blockquote, article, section, em, strong, b, i, li, ul, ol, dl, dt, dd {
                color: ${theme.text} !important;
                background-color: transparent !important;
                background: transparent !important;
            }

            h1, h2, h3, h4, h5, h6,
            [class*="chapter"], [class*="title"], [class*="heading"], [class*="header"] {
                color: ${theme.heading} !important;
                background-color: transparent !important;
                background: transparent !important;
                font-weight: 700 !important;
                line-height: 1.3 !important;
            }

            p {
                line-height: ${isDyslexic ? '1.85' : '1.65'} !important;
                margin-bottom: 0.9em !important;
            }

            a, a:link, a:visited {
                color: ${theme.accent} !important;
                text-decoration: underline !important;
                background-color: transparent !important;
            }

            img, svg, image {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                margin: 12px auto !important;
            }

            html, body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            ::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
            }
        `;
    }

    function injectStylesIntoDoc(doc) {
        if (!doc) return;
        const head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
        if (!head) return;

        if (!doc.getElementById('cozy-google-fonts')) {
            const fontLink = doc.createElement('link');
            fontLink.id = 'cozy-google-fonts';
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap';
            head.appendChild(fontLink);
        }

        if (!doc.getElementById('cozy-dyslexic-fonts')) {
            const dysLink = doc.createElement('link');
            dysLink.id = 'cozy-dyslexic-fonts';
            dysLink.rel = 'stylesheet';
            dysLink.href = 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.3.0/index.css';
            head.appendChild(dysLink);

            const dysBold = doc.createElement('link');
            dysBold.id = 'cozy-dyslexic-bold';
            dysBold.rel = 'stylesheet';
            dysBold.href = 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.3.0/700.css';
            head.appendChild(dysBold);
        }

        let styleTag = doc.getElementById('cozy-reader-injected-style');
        if (!styleTag) {
            styleTag = doc.createElement('style');
            styleTag.id = 'cozy-reader-injected-style';
            head.appendChild(styleTag);
        } else {
            head.appendChild(styleTag);
        }
        styleTag.textContent = generateReaderCSS(currentTheme, currentFontFamily, currentFontSize);
    }

    function applyCurrentTheme() {
        document.body.className = currentTheme;
        document.documentElement.style.setProperty('--reader-font', currentFontFamily);

        if (bookFormat === 'mobi' && mobiIframe && mobiIframe.contentDocument) {
            injectStylesIntoDoc(mobiIframe.contentDocument);
            applyMobiModeStyles(mobiIframe.contentDocument, currentReadingMode);
        } else if (bookFormat === 'epub') {
            const iframes = epubViewer.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                    if (doc) injectStylesIntoDoc(doc);
                } catch (e) {}
            });

            if (rendition) {
                try {
                    rendition.themes.select(currentTheme);
                    rendition.themes.fontSize(currentFontSize + '%');
                    rendition.themes.font(currentFontFamily);
                } catch (e) {}
            }
        }
    }

    // ========================================================
    // ENGINE 1: PDF READING ENGINE
    // ========================================================
    let pdfDoc = null;
    let pdfCurrentPage = 1;
    let pdfTotalPages = 1;

    async function initPdfEngine() {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library is not loaded');
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        if (book.last_cfi && book.last_cfi.startsWith('page-')) {
            const savedP = parseInt(book.last_cfi.replace('page-', ''), 10);
            if (!isNaN(savedP) && savedP >= 1) pdfCurrentPage = savedP;
        }

        const loadingTask = pdfjsLib.getDocument({ data: epubSource });
        pdfDoc = await loadingTask.promise;
        pdfTotalPages = pdfDoc.numPages;

        if (pdfCurrentPage > pdfTotalPages) pdfCurrentPage = 1;

        try {
            const outline = await pdfDoc.getOutline();
            renderPdfOutline(outline);
        } catch (e) {
            renderPdfPageList(pdfTotalPages);
        }

        renderBookmarksList();
        renderPdfMode(currentReadingMode);
    }

    function renderPdfMode(mode) {
        currentReadingMode = mode;
        localStorage.setItem('cozy_reading_mode', mode);

        modeButtons.forEach(b => {
            if (b) b.classList.toggle('active', b.dataset.mode === mode);
        });
        document.querySelectorAll('.sidebar-mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        epubViewer.innerHTML = '';
        epubViewer.className = `epub-viewer ${mode}-page-mode`;

        if (mode === 'scroll') {
            btnPrevPage.style.display = 'none';
            btnNextPage.style.display = 'none';
            renderPdfScrollMode();
        } else {
            btnPrevPage.style.display = 'flex';
            btnNextPage.style.display = 'flex';
            renderPdfPaginatedMode();
        }
    }

    async function renderPdfPageToCanvas(pageNum, canvas) {
        if (!pdfDoc || pageNum < 1 || pageNum > pdfTotalPages) return;
        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        const containerWidth = epubViewer.clientWidth || window.innerWidth;
        const containerHeight = (epubViewer.clientHeight || window.innerHeight) - 40;
        const dpr = window.devicePixelRatio || 1;

        let targetWidth = containerWidth - 36;
        if (currentReadingMode === 'spread') {
            targetWidth = (containerWidth / 2) - 44;
        }
        if (targetWidth > 820) targetWidth = 820;

        let scale = targetWidth / unscaledViewport.width;
        if (scale * unscaledViewport.height > containerHeight && currentReadingMode !== 'scroll') {
            scale = containerHeight / unscaledViewport.height;
        }
        if (scale < 0.25) scale = 0.25;

        const viewport = page.getViewport({ scale: scale * dpr });
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        canvas.style.width = `${Math.round(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.round(viewport.height / dpr)}px`;
        canvas.className = 'pdf-page-canvas';

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    }

    async function renderPdfPaginatedMode() {
        readerLoader.style.display = 'block';
        epubViewer.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'pdf-viewer-wrap';

        const container = document.createElement('div');
        container.className = 'pdf-canvas-container';

        const canvas1 = document.createElement('canvas');
        container.appendChild(canvas1);
        await renderPdfPageToCanvas(pdfCurrentPage, canvas1);

        const isWide = window.innerWidth >= 640;
        if (currentReadingMode === 'spread' && isWide && pdfCurrentPage + 1 <= pdfTotalPages) {
            const canvas2 = document.createElement('canvas');
            container.appendChild(canvas2);
            await renderPdfPageToCanvas(pdfCurrentPage + 1, canvas2);
        }

        wrap.appendChild(container);
        epubViewer.appendChild(wrap);

        wrap.addEventListener('click', (e) => {
            const w = window.innerWidth;
            if (e.clientX < w * 0.35) {
                pdfPrevPage();
            } else if (e.clientX > w * 0.65) {
                pdfNextPage();
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;
        wrap.addEventListener('touchstart', (e) => {
            if (!e.changedTouches || !e.changedTouches.length) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        wrap.addEventListener('touchend', (e) => {
            if (!e.changedTouches || !e.changedTouches.length) return;
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            const deltaY = e.changedTouches[0].screenY - touchStartY;
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
                if (deltaX < 0) {
                    pdfNextPage();
                } else {
                    pdfPrevPage();
                }
            }
        }, { passive: true });

        readerLoader.style.display = 'none';
        updatePdfProgress();
    }

    async function renderPdfScrollMode() {
        readerLoader.style.display = 'block';
        epubViewer.innerHTML = '';

        const scrollList = document.createElement('div');
        scrollList.className = 'pdf-scroll-list';

        for (let p = 1; p <= pdfTotalPages; p++) {
            const pageWrap = document.createElement('div');
            pageWrap.className = 'pdf-scroll-page-slot';
            pageWrap.dataset.pageNum = p;
            pageWrap.style.minHeight = '300px';

            const canvas = document.createElement('canvas');
            canvas.dataset.pageNum = p;
            pageWrap.appendChild(canvas);
            scrollList.appendChild(pageWrap);
        }

        epubViewer.appendChild(scrollList);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const canvas = entry.target.querySelector('canvas');
                    const pageNum = parseInt(entry.target.dataset.pageNum, 10);
                    if (canvas && !canvas.dataset.rendered) {
                        canvas.dataset.rendered = 'true';
                        renderPdfPageToCanvas(pageNum, canvas);
                    }
                    pdfCurrentPage = pageNum;
                    updatePdfProgress();
                }
            });
        }, { root: epubViewer, rootMargin: '400px 0px 400px 0px', threshold: 0.1 });

        scrollList.querySelectorAll('.pdf-scroll-page-slot').forEach(slot => observer.observe(slot));

        if (pdfCurrentPage > 1) {
            setTimeout(() => {
                const targetSlot = scrollList.querySelector(`.pdf-scroll-page-slot[data-page-num="${pdfCurrentPage}"]`);
                if (targetSlot) targetSlot.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }

        readerLoader.style.display = 'none';
        updatePdfProgress();
    }

    function updatePdfProgress() {
        const percent = Math.max(1, Math.min(100, Math.floor((pdfCurrentPage / pdfTotalPages) * 100)));
        if (footerProgress) footerProgress.innerText = `Page ${pdfCurrentPage} of ${pdfTotalPages} (${percent}%)`;
        if (progressFill) progressFill.style.width = `${percent}%`;
        updateChapterTitle(`Page ${pdfCurrentPage} of ${pdfTotalPages}`);
        checkIfCurrentPageIsBookmarked(`page-${pdfCurrentPage}`);
        saveReadingProgress(`page-${pdfCurrentPage}`, percent);
    }

    function pdfNextPage() {
        if (!pdfDoc) return;
        const step = (currentReadingMode === 'spread' && window.innerWidth >= 640) ? 2 : 1;
        if (pdfCurrentPage + step <= pdfTotalPages) {
            pdfCurrentPage += step;
            renderPdfPaginatedMode();
        } else if (pdfCurrentPage < pdfTotalPages) {
            pdfCurrentPage = pdfTotalPages;
            renderPdfPaginatedMode();
        }
    }

    function pdfPrevPage() {
        if (!pdfDoc) return;
        const step = (currentReadingMode === 'spread' && window.innerWidth >= 640) ? 2 : 1;
        if (pdfCurrentPage - step >= 1) {
            pdfCurrentPage -= step;
            renderPdfPaginatedMode();
        } else if (pdfCurrentPage > 1) {
            pdfCurrentPage = 1;
            renderPdfPaginatedMode();
        }
    }

    function renderPdfOutline(outline) {
        tocList.innerHTML = '';
        if (!outline || outline.length === 0) {
            renderPdfPageList(pdfTotalPages);
            return;
        }

        const addItems = (items) => {
            items.forEach(item => {
                const link = document.createElement('a');
                link.className = 'toc-item';
                link.innerText = item.title ? item.title.trim() : 'Section';
                link.href = 'javascript:void(0)';
                link.addEventListener('click', async () => {
                    let destPage = 1;
                    if (typeof item.dest === 'string') {
                        const dest = await pdfDoc.getDestination(item.dest);
                        if (dest && dest[0]) {
                            const pageIndex = await pdfDoc.getPageIndex(dest[0]);
                            destPage = pageIndex + 1;
                        }
                    } else if (Array.isArray(item.dest) && item.dest[0]) {
                        const pageIndex = await pdfDoc.getPageIndex(item.dest[0]);
                        destPage = pageIndex + 1;
                    }
                    pdfCurrentPage = destPage;
                    setDrawerOpen(false);
                    renderPdfMode(currentReadingMode);
                });
                tocList.appendChild(link);
                if (item.items && item.items.length) {
                    addItems(item.items);
                }
            });
        };
        addItems(outline);
    }

    function renderPdfPageList(totalPages) {
        tocList.innerHTML = '';
        const step = totalPages > 40 ? 5 : 1;
        for (let p = 1; p <= totalPages; p += step) {
            const link = document.createElement('a');
            link.className = 'toc-item';
            link.innerText = step === 1 ? `Page ${p}` : `Page ${p} - ${Math.min(totalPages, p + step - 1)}`;
            link.href = 'javascript:void(0)';
            const targetPage = p;
            link.addEventListener('click', () => {
                pdfCurrentPage = targetPage;
                setDrawerOpen(false);
                renderPdfMode(currentReadingMode);
            });
            tocList.appendChild(link);
        }
    }

    // ========================================================
    // ENGINE 2: MOBI READING ENGINE
    // ========================================================
    let mobiData = null;
    let mobiIframe = null;

    async function initMobiEngine() {
        if (typeof MobiParser === 'undefined') {
            throw new Error('MobiParser library is not loaded');
        }

        mobiData = await MobiParser.parse(epubSource);
        if (!mobiData || !mobiData.html) {
            throw new Error('Could not parse MOBI content');
        }

        renderBookmarksList();
        renderMobiMode(currentReadingMode);
    }

    function renderMobiMode(mode) {
        currentReadingMode = mode;
        localStorage.setItem('cozy_reading_mode', mode);

        modeButtons.forEach(b => {
            if (b) b.classList.toggle('active', b.dataset.mode === mode);
        });
        document.querySelectorAll('.sidebar-mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        epubViewer.innerHTML = '';
        epubViewer.className = `epub-viewer ${mode}-page-mode`;

        readerLoader.style.display = 'block';

        const iframe = document.createElement('iframe');
        iframe.className = 'mobi-viewer-iframe';
        iframe.src = 'about:blank';
        epubViewer.appendChild(iframe);
        mobiIframe = iframe;

        iframe.onload = () => {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <div id="mobiContentWrap">
                        ${mobiData.html}
                    </div>
                </body>
                </html>
            `);
            doc.close();

            injectStylesIntoDoc(doc);
            applyMobiModeStyles(doc, mode);

            const win = iframe.contentWindow;
            win.addEventListener('scroll', () => {
                const sTop = win.scrollY || doc.documentElement.scrollTop;
                const sHeight = doc.documentElement.scrollHeight - win.innerHeight;
                if (sHeight > 0) {
                    const percent = Math.max(0, Math.min(100, Math.round((sTop / sHeight) * 100)));
                    if (footerProgress) footerProgress.innerText = `${percent}% read`;
                    if (progressFill) progressFill.style.width = `${percent}%`;
                    saveReadingProgress(`mobi-${percent}`, percent);
                }
            }, { passive: true });

            if (book.last_cfi && book.last_cfi.startsWith('mobi-')) {
                const savedPercent = parseInt(book.last_cfi.replace('mobi-', ''), 10);
                if (!isNaN(savedPercent) && savedPercent > 0) {
                    setTimeout(() => {
                        const sHeight = doc.documentElement.scrollHeight - win.innerHeight;
                        win.scrollTo({ top: (savedPercent / 100) * sHeight, behavior: 'auto' });
                    }, 200);
                }
            }

            doc.addEventListener('keydown', (e) => {
                if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    toggleFullscreen();
                } else if (e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    toggleZenMode();
                } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                    win.scrollBy({ top: win.innerHeight * 0.85, behavior: 'smooth' });
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    win.scrollBy({ top: -win.innerHeight * 0.85, behavior: 'smooth' });
                }
            });

            readerLoader.style.display = 'none';
        };

        btnPrevPage.style.display = mode === 'scroll' ? 'none' : 'flex';
        btnNextPage.style.display = mode === 'scroll' ? 'none' : 'flex';
    }

    function applyMobiModeStyles(doc, mode) {
        if (!doc) return;
        let modeStyle = doc.getElementById('cozy-mobi-mode-style');
        if (!modeStyle) {
            modeStyle = doc.createElement('style');
            modeStyle.id = 'cozy-mobi-mode-style';
            doc.head.appendChild(modeStyle);
        }

        const maxW = mode === 'spread' ? '1100px' : (mode === 'single' ? '740px' : '760px');
        const columns = (mode === 'spread' && window.innerWidth >= 640) ? '2' : '1';

        modeStyle.textContent = `
            #mobiContentWrap {
                max-width: ${maxW};
                margin: 0 auto;
                padding: 24px 20px;
                box-sizing: border-box;
                ${columns === '2' ? 'column-count: 2; column-gap: 40px;' : ''}
            }
        `;
    }

    // ========================================================
    // ENGINE 3: EPUB READING ENGINE
    // ========================================================
    let epubBook, rendition;

    function registerEpubThemes() {
        Object.keys(THEME_CONFIG).forEach(themeKey => {
            const t = THEME_CONFIG[themeKey];
            rendition.themes.register(themeKey, {
                'html': { 'background': `${t.bg} !important`, 'background-color': `${t.bg} !important`, 'color': `${t.text} !important` },
                'body': { 'background': `${t.bg} !important`, 'background-color': `${t.bg} !important`, 'color': `${t.text} !important`, 'font-family': `${currentFontFamily} !important` },
                'p, span, div, h1, h2, h3, h4, em, strong, li': { 'color': `${t.text} !important`, 'background': 'transparent !important', 'background-color': 'transparent !important', 'font-family': `${currentFontFamily} !important` }
            });
        });
    }

    function renderReaderEngine(mode) {
        currentReadingMode = mode;
        localStorage.setItem('cozy_reading_mode', mode);

        modeButtons.forEach(b => {
            if (b) b.classList.toggle('active', b.dataset.mode === mode);
        });
        document.querySelectorAll('.sidebar-mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        epubViewer.className = `epub-viewer ${mode}-page-mode`;
        if (mode === 'scroll') {
            epubViewer.className = 'epub-viewer scroll-mode';
            btnPrevPage.style.display = 'none';
            btnNextPage.style.display = 'none';
        } else {
            btnPrevPage.style.display = 'flex';
            btnNextPage.style.display = 'flex';
        }

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
            options.minSpreadWidth = 10000;
        } else if (mode === 'spread') {
            options.spread = "always";
            options.flow = "paginated";
            options.minSpreadWidth = 0;
        } else if (mode === 'scroll') {
            options.manager = "continuous";
            options.flow = "scrolled";
        }

        rendition = epubBook.renderTo("epubViewer", options);
        registerEpubThemes();

        rendition.hooks.content.register((contents) => {
            const doc = contents.document;
            if (doc) {
                injectStylesIntoDoc(doc);

                if (currentReadingMode === 'scroll') {
                    doc.addEventListener('wheel', (e) => {
                        epubViewer.scrollBy({ top: e.deltaY, behavior: 'auto' });
                    }, { passive: true });
                } else {
                    doc.addEventListener('click', (e) => {
                        const pageWidth = contents.window.innerWidth;
                        if (e.clientX < pageWidth * 0.35) {
                            if (rendition) rendition.prev();
                        } else if (e.clientX > pageWidth * 0.65) {
                            if (rendition) rendition.next();
                        }
                    });

                    let touchStartX = 0;
                    let touchStartY = 0;
                    doc.addEventListener('touchstart', (e) => {
                        if (!e.changedTouches || !e.changedTouches.length) return;
                        touchStartX = e.changedTouches[0].screenX;
                        touchStartY = e.changedTouches[0].screenY;
                    }, { passive: true });

                    doc.addEventListener('touchend', (e) => {
                        if (!e.changedTouches || !e.changedTouches.length) return;
                        const deltaX = e.changedTouches[0].screenX - touchStartX;
                        const deltaY = e.changedTouches[0].screenY - touchStartY;
                        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
                            if (deltaX < 0) {
                                if (rendition) rendition.next();
                            } else {
                                if (rendition) rendition.prev();
                            }
                        }
                    }, { passive: true });
                }

                doc.addEventListener('keydown', (e) => {
                    if (e.key === 'f' || e.key === 'F') {
                        e.preventDefault();
                        toggleFullscreen();
                    } else if (e.key === 'z' || e.key === 'Z') {
                        e.preventDefault();
                        toggleZenMode();
                    } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                        if (rendition && currentReadingMode !== 'scroll') rendition.next();
                    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                        if (rendition && currentReadingMode !== 'scroll') rendition.prev();
                    }
                });

                doc.addEventListener('mousemove', (e) => {
                    if (!isZenMode) return;
                    if (e.clientY < 30) {
                        document.body.classList.add('hover-top');
                    } else if (e.clientY > 80) {
                        document.body.classList.remove('hover-top');
                    }
                });
            }
        });

        rendition.on('rendered', (section, view) => {
            if (view && view.document) {
                injectStylesIntoDoc(view.document);
            }
        });

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

        const startTarget = book.last_cfi || undefined;
        rendition.display(startTarget).then(() => {
            readerLoader.style.display = 'none';
            applyCurrentTheme();
        }).catch(() => {
            rendition.display();
            readerLoader.style.display = 'none';
        });

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

        if (mode !== 'scroll') {
            rendition.on('click', (e) => {
                const width = window.innerWidth;
                if (e.clientX < width * 0.25) rendition.prev();
                else if (e.clientX > width * 0.75) rendition.next();
            });
        }
    }

    function initEpubEngine() {
        epubBook = ePub(epubSource);
        renderReaderEngine(currentReadingMode);

        epubBook.ready.then(() => epubBook.locations.generate(1000));
        epubBook.loaded.navigation.then(nav => {
            renderChapters(nav.toc);
        });
        renderBookmarksList();
    }

    // Launch Format Engine
    try {
        if (bookFormat === 'pdf') {
            await initPdfEngine();
        } else if (bookFormat === 'mobi' || bookFormat === 'azw' || bookFormat === 'azw3' || bookFormat === 'prc') {
            await initMobiEngine();
        } else {
            initEpubEngine();
        }
    } catch (err) {
        console.error('Book Load Error:', err);
        readerLoader.innerHTML = `<p style="color:#ef4444;">Could not load book.<br><small>${err.message}</small></p>`;
    }

    // --- Mode Switcher Clicks ---
    function handleSwitchMode(mode) {
        if (bookFormat === 'pdf') {
            renderPdfMode(mode);
        } else if (bookFormat === 'mobi' || bookFormat === 'azw' || bookFormat === 'azw3' || bookFormat === 'prc') {
            renderMobiMode(mode);
        } else {
            renderReaderEngine(mode);
        }
    }

    btnModeSingle.addEventListener('click', () => handleSwitchMode('single'));
    btnModeSpread.addEventListener('click', () => handleSwitchMode('spread'));
    btnModeScroll.addEventListener('click', () => handleSwitchMode('scroll'));

    // --- Navigation Controls ---
    btnPrevPage.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (bookFormat === 'pdf') {
            pdfPrevPage();
        } else if (bookFormat === 'mobi') {
            if (mobiIframe && mobiIframe.contentWindow) {
                mobiIframe.contentWindow.scrollBy({ top: -mobiIframe.contentWindow.innerHeight * 0.85, behavior: 'smooth' });
            }
        } else {
            if (rendition) rendition.prev();
        }
    });

    btnNextPage.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (bookFormat === 'pdf') {
            pdfNextPage();
        } else if (bookFormat === 'mobi') {
            if (mobiIframe && mobiIframe.contentWindow) {
                mobiIframe.contentWindow.scrollBy({ top: mobiIframe.contentWindow.innerHeight * 0.85, behavior: 'smooth' });
            }
        } else {
            if (rendition) rendition.next();
        }
    });

    // --- Full Screen & Zen Reading Engine ---
    function isFullscreenActive() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    }

    async function toggleFullscreen() {
        try {
            if (!isFullscreenActive()) {
                const docEl = document.documentElement;
                if (docEl.requestFullscreen) {
                    await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                    await docEl.webkitRequestFullscreen();
                } else if (docEl.msRequestFullscreen) {
                    await docEl.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
        } catch (err) {
            console.warn('Fullscreen request failed, falling back to Zen mode:', err);
            toggleZenMode();
        }
    }

    function updateFullscreenUI() {
        const active = isFullscreenActive();
        document.body.classList.toggle('is-fullscreen', active);
        if (btnFullscreen) {
            btnFullscreen.classList.toggle('is-active-fullscreen', active);
            if (fullscreenIcon) {
                fullscreenIcon.innerHTML = `<img src="assets/images/icons/${active ? 'close.png' : 'settings.png'}" alt="" class="w-3.5 h-3.5 pixel-art-img">`;
            }
            if (fullscreenText) fullscreenText.innerText = active ? 'Exit Full' : 'Full Screen';
            btnFullscreen.title = active ? 'Exit Full Screen (F or Esc)' : 'Toggle Full Screen (F)';
        }
        if (btnMenuFullscreen) {
            btnMenuFullscreen.innerHTML = `<img src="assets/images/icons/${active ? 'close.png' : 'settings.png'}" alt="" class="w-3.5 h-3.5 pixel-art-img mr-2"> <span>${active ? 'Exit Full Screen (F)' : 'Toggle Full Screen (F)'}</span>`;
        }
        if (btnSidebarFullscreen) {
            btnSidebarFullscreen.classList.toggle('active-action', active);
            if (sidebarFullscreenIcon) {
                sidebarFullscreenIcon.innerHTML = `<img src="assets/images/icons/${active ? 'close.png' : 'settings.png'}" alt="" class="w-3.5 h-3.5 pixel-art-img">`;
            }
            if (sidebarFullscreenText) sidebarFullscreenText.innerText = active ? 'Exit Full' : 'Full Screen';
        }
        showToast(active ? 'Entered Full Screen' : 'Exited Full Screen', 'info');
        setTimeout(() => {
            if (rendition) rendition.resize();
            if (bookFormat === 'pdf' && currentReadingMode !== 'scroll') renderPdfPaginatedMode();
        }, 150);
    }

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateFullscreenUI);
    });

    let isZenMode = false;
    function toggleZenMode() {
        isZenMode = !isZenMode;
        document.body.classList.toggle('zen-mode', isZenMode);
        if (zenIcon) {
            zenIcon.innerHTML = `<img src="assets/images/icons/${isZenMode ? 'book_open.png' : 'moon.png'}" alt="" class="w-3.5 h-3.5 pixel-art-img">`;
        }
        if (zenText) zenText.innerText = isZenMode ? 'Show Menu' : 'Zen View';
        if (btnMenuZen) {
            btnMenuZen.innerHTML = `<img src="assets/images/icons/${isZenMode ? 'book_open.png' : 'moon.png'}" alt="" class="w-3.5 h-3.5 pixel-art-img mr-2"> <span>${isZenMode ? 'Show Menu Bars (Z)' : 'Distraction-Free (Z)'}</span>`;
        }
        showToast(isZenMode ? 'Distraction-free mode enabled' : 'Menu bars restored', 'info');
        setTimeout(() => {
            if (rendition) rendition.resize();
            if (bookFormat === 'pdf' && currentReadingMode !== 'scroll') renderPdfPaginatedMode();
        }, 280);
    }

    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
    if (btnSidebarFullscreen) btnSidebarFullscreen.addEventListener('click', toggleFullscreen);
    if (btnMenuFullscreen) {
        btnMenuFullscreen.addEventListener('click', () => {
            appearanceMenu.classList.remove('show');
            toggleFullscreen();
        });
    }

    if (btnFloatingZen) btnFloatingZen.addEventListener('click', toggleZenMode);
    if (btnSidebarZen) btnSidebarZen.addEventListener('click', toggleZenMode);
    if (btnMenuZen) {
        btnMenuZen.addEventListener('click', () => {
            appearanceMenu.classList.remove('show');
            toggleZenMode();
        });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
            return;
        }
        if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            toggleZenMode();
            return;
        }
        if (currentReadingMode === 'scroll') return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            if (bookFormat === 'pdf') pdfNextPage();
            else if (rendition) rendition.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            if (bookFormat === 'pdf') pdfPrevPage();
            else if (rendition) rendition.prev();
        }
    });

    // --- Bookmarks Feature ---
    const pageBookmarkRibbon = document.getElementById('pageBookmarkRibbon');
    const headerBookmarkBadge = document.getElementById('headerBookmarkBadge');

    async function toggleBookmarkCurrentPage() {
        let cfi = '';
        let pageText = '';
        let percent = 0;

        if (bookFormat === 'pdf') {
            cfi = `page-${pdfCurrentPage}`;
            percent = Math.floor((pdfCurrentPage / pdfTotalPages) * 100);
            pageText = `Page ${pdfCurrentPage} of ${pdfTotalPages} (${percent}%)`;
        } else if (bookFormat === 'mobi') {
            percent = parseInt(footerProgress.innerText) || 0;
            cfi = `mobi-${percent}`;
            pageText = `${percent}% read`;
        } else {
            if (!rendition) return;
            const location = rendition.currentLocation();
            if (!location || !location.start) return;
            cfi = location.start.cfi;
            if (epubBook && epubBook.locations && epubBook.locations.total > 0) {
                percent = Math.floor(epubBook.locations.percentageFromCfi(cfi) * 100);
            } else if (footerProgress) {
                percent = parseInt(footerProgress.innerText) || 0;
            }
            pageText = location.start.displayed && location.start.displayed.page 
                ? `Page ${location.start.displayed.page} (${percent}%)` 
                : `${percent}% read`;
        }

        const curBook = await window.storageEngine.getBook(book.id);
        const bookmarks = curBook.bookmarks || [];
        const existingIndex = bookmarks.findIndex(b => b.cfi === cfi);

        if (existingIndex !== -1) {
            const bmId = bookmarks[existingIndex].id;
            await window.storageEngine.removeBookmark(book.id, bmId);
            showToast('Bookmark removed', 'info');
        } else {
            const curChapter = (chapterTitleEl && chapterTitleEl.innerText.trim()) ? chapterTitleEl.innerText.trim() : 'Bookmarked Page';
            await window.storageEngine.addBookmark(book.id, {
                cfi: cfi,
                title: curChapter,
                snippet: `${pageText} • Saved spot`
            });
            showToast(`Page bookmarked (${percent}% read)!`, 'success');
            showBookmarksTab();
        }

        await checkIfCurrentPageIsBookmarked(cfi);
        await renderBookmarksList();
    }

    if (btnAddBookmark) btnAddBookmark.addEventListener('click', toggleBookmarkCurrentPage);
    if (btnSidebarBookmark) btnSidebarBookmark.addEventListener('click', toggleBookmarkCurrentPage);
    if (pageBookmarkRibbon) pageBookmarkRibbon.addEventListener('click', toggleBookmarkCurrentPage);

    async function renderBookmarksList() {
        const updatedBook = await window.storageEngine.getBook(book.id);
        const bookmarks = (updatedBook && updatedBook.bookmarks) ? updatedBook.bookmarks : [];
        if (bookmarkCount) bookmarkCount.innerText = bookmarks.length;

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
                    <p class="font-bold text-sm text-[#2c221e] mb-1">No bookmarks yet</p>
                    <p class="text-xs text-[#786457]">Click "Bookmark" at the top to save your favorite spots!</p>
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
                        <span>${escapeHtml(bm.title || `Bookmark #${idx + 1}`)}</span>
                    </div>
                    <button class="btn-delete-bookmark p-1 hover:scale-110 active:scale-95 transition-transform" title="Remove bookmark">
                        <img src="assets/images/icons/close.png" alt="Remove" class="w-2.5 h-2.5 pixel-art-img">
                    </button>
                </div>
                <div class="text-xs text-[#786457] mt-1 flex items-center justify-between">
                    <span>${escapeHtml(bm.snippet || '')}</span>
                    <span class="text-[10px] text-[#a39488]">${escapeHtml(bm.date || '')}</span>
                </div>
                <div class="mt-2 pt-1 border-t border-[#f0e7d8] text-right">
                    <span class="text-xs font-bold text-[#e07a5f] hover:underline inline-flex items-center gap-1 justify-end">
                        <span>Jump to page</span>
                        <img src="assets/images/ui/arrow_wood_right.png" alt="" class="w-3.5 h-2 pixel-art-img">
                    </span>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-bookmark')) return;
                if (bookFormat === 'pdf') {
                    if (bm.cfi && bm.cfi.startsWith('page-')) {
                        const p = parseInt(bm.cfi.replace('page-', ''), 10);
                        if (!isNaN(p)) {
                            pdfCurrentPage = p;
                            renderPdfMode(currentReadingMode);
                        }
                    }
                } else if (bookFormat === 'mobi') {
                    if (bm.cfi && bm.cfi.startsWith('mobi-') && mobiIframe && mobiIframe.contentWindow) {
                        const pct = parseInt(bm.cfi.replace('mobi-', ''), 10);
                        const doc = mobiIframe.contentDocument;
                        const win = mobiIframe.contentWindow;
                        const sHeight = doc.documentElement.scrollHeight - win.innerHeight;
                        win.scrollTo({ top: (pct / 100) * sHeight, behavior: 'smooth' });
                    }
                } else {
                    if (rendition) rendition.display(bm.cfi);
                }
                setDrawerOpen(false);
                showToast(`Jumped to ${bm.title || 'bookmark'}`, 'info');
            });

            card.querySelector('.btn-delete-bookmark').addEventListener('click', async (e) => {
                e.stopPropagation();
                await window.storageEngine.removeBookmark(book.id, bm.id);
                showToast('Bookmark removed', 'info');
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
            if (btnAddBookmark) {
                btnAddBookmark.classList.add('is-bookmarked');
                bookmarkIcon.innerHTML = '<img src="assets/images/icons/star_large.png" alt="" class="w-3.5 h-3.5 pixel-art-img">';
                bookmarkText.innerText = 'Bookmarked';
            }
            if (pageBookmarkRibbon) pageBookmarkRibbon.classList.add('active');
            if (btnSidebarBookmark) {
                btnSidebarBookmark.classList.add('is-bookmarked');
                if (sidebarBookmarkIcon) sidebarBookmarkIcon.innerHTML = '<img src="assets/images/icons/star_large.png" alt="" class="w-3.5 h-3.5 pixel-art-img">';
                if (sidebarBookmarkText) sidebarBookmarkText.innerText = 'Page Bookmarked';
            }
        } else {
            if (btnAddBookmark) {
                btnAddBookmark.classList.remove('is-bookmarked');
                bookmarkIcon.innerHTML = '<img src="assets/images/icons/star.png" alt="" class="w-3.5 h-3.5 pixel-art-img">';
                bookmarkText.innerText = 'Bookmark';
            }
            if (pageBookmarkRibbon) pageBookmarkRibbon.classList.remove('active');
            if (btnSidebarBookmark) {
                btnSidebarBookmark.classList.remove('is-bookmarked');
                if (sidebarBookmarkIcon) sidebarBookmarkIcon.innerHTML = '<img src="assets/images/icons/star.png" alt="" class="w-3.5 h-3.5 pixel-art-img">';
                if (sidebarBookmarkText) sidebarBookmarkText.innerText = 'Bookmark Current Page';
            }
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

    function setDrawerOpen(isOpen) {
        if (isOpen) {
            tocSidebar.classList.add('open');
            if (readerDrawerBackdrop) readerDrawerBackdrop.classList.add('active');
            if (readerPullTabIcon) {
                readerPullTabIcon.innerHTML = '<img src="assets/images/icons/close.png" alt="Close" class="w-3.5 h-3.5 pixel-art-img">';
            }
        } else {
            tocSidebar.classList.remove('open');
            if (readerDrawerBackdrop) readerDrawerBackdrop.classList.remove('active');
            if (readerPullTabIcon) {
                readerPullTabIcon.innerHTML = '<img src="assets/images/ui/cat_paw.png" alt="Menu" class="w-4 h-4 pixel-art-img select-none">';
            }
        }
    }

    if (btnToggleDrawer) btnToggleDrawer.addEventListener('click', () => setDrawerOpen(!tocSidebar.classList.contains('open')));
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => setDrawerOpen(false));
    if (readerDrawerBackdrop) readerDrawerBackdrop.addEventListener('click', () => setDrawerOpen(false));
    if (btnReaderPullTab) btnReaderPullTab.addEventListener('click', () => setDrawerOpen(!tocSidebar.classList.contains('open')));

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
                if (rendition) rendition.display(item.href);
                setDrawerOpen(false);
                updateChapterTitle(item.label.trim());
            });
            tocList.appendChild(link);
        });
    }

    // --- Appearance Controls & Custom Typography ---
    if (btnAppearance) {
        btnAppearance.addEventListener('click', (e) => {
            e.stopPropagation();
            appearanceMenu.classList.toggle('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-wrapper') && appearanceMenu) appearanceMenu.classList.remove('show');
    });

    themeChoices.forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen = btn.dataset.theme;
            currentTheme = chosen;
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
            applyCurrentTheme();
        });
    });

    if (btnFontInc) {
        btnFontInc.addEventListener('click', () => {
            if (currentFontSize < 180) {
                currentFontSize += 10;
                updateFontSize();
            }
        });
    }

    if (btnFontDec) {
        btnFontDec.addEventListener('click', () => {
            if (currentFontSize > 70) {
                currentFontSize -= 10;
                updateFontSize();
            }
        });
    }

    function updateFontSize() {
        if (fontSizeDisplay) fontSizeDisplay.innerText = currentFontSize + '%';
        localStorage.setItem('cozy_reader_font_size', currentFontSize);
        applyCurrentTheme();
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
        toast.innerHTML = `<span>${escapeHtml(msg)}</span>`;
        const tc = document.getElementById('toastContainer');
        if (tc) tc.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.addEventListener('resize', () => {
        if (rendition) rendition.resize();
        if (bookFormat === 'pdf' && currentReadingMode !== 'scroll') {
            renderPdfPaginatedMode();
        }
    });
});
