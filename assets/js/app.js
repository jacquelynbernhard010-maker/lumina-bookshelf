/**
 * The Cozy Nook - Frontend Application
 * Real home bookshelf: Front-Facing, Spine, Leaning, Stacked, & Hand-drawn Shelf Decors
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Whimsical color themes for book spines
    const coverThemes = [
        { bg: '#81b29a', text: '#152b1e', ribbon: '#e07a5f' }, // Matcha
        { bg: '#e07a5f', text: '#ffffff', ribbon: '#f2cc8f' }, // Terracotta
        { bg: '#f2cc8f', text: '#3f2b12', ribbon: '#81b29a' }, // Honey
        { bg: '#9d8189', text: '#ffffff', ribbon: '#e07a5f' }, // Dusty Rose
        { bg: '#8ecae6', text: '#103548', ribbon: '#e07a5f' }, // Sky Blue
        { bg: '#e76f51', text: '#ffffff', ribbon: '#f2cc8f' }, // Rust
        { bg: '#eed9c4', text: '#4a2e18', ribbon: '#81b29a' }, // Oat Bread
        { bg: '#a3b18a', text: '#1b2c15', ribbon: '#e07a5f' }  // Sage
    ];

    // State
    const state = {
        activeShelf: 'all',
        searchQuery: '',
        books: [],
        shelves: [],
        selectedBook: null,
        extractedCoverUrl: '',
        extractedDominantColor: '',
        shelfDecors: JSON.parse(localStorage.getItem('cozy_shelf_decors') || '["plant", "mug"]'),
        draggedBookId: null
    };

    // DOM Elements
    const shelvesContainer = document.getElementById('shelvesContainer');
    const shelfNavList = document.getElementById('shelfNavList');
    const totalBooksCount = document.getElementById('totalBooksCount');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');

    // Modals
    const readModal = document.getElementById('readModal');
    const uploadModal = document.getElementById('uploadModal');
    const cloudModal = document.getElementById('cloudModal');

    // Read Modal Elements
    const modalCover = document.getElementById('modalCover');
    const modalFileType = document.getElementById('modalFileType');
    const modalBookTitle = document.getElementById('modalBookTitle');
    const modalBookAuthor = document.getElementById('modalBookAuthor');
    const modalDetailTitle = document.getElementById('modalDetailTitle');
    const modalDetailAuthor = document.getElementById('modalDetailAuthor');
    const modalDetailDesc = document.getElementById('modalDetailDesc');
    const modalShelfBadge = document.getElementById('modalShelfBadge');
    const modalProgText = document.getElementById('modalProgText');
    const modalProgFill = document.getElementById('modalProgFill');
    const btnOpenReader = document.getElementById('btnOpenReader');
    const btnPutBack = document.getElementById('btnPutBack');
    const btnCloseReadModal = document.getElementById('btnCloseReadModal');
    const btnDeleteBook = document.getElementById('btnDeleteBook');

    // Upload Elements
    const btnOpenUpload = document.getElementById('btnOpenUpload');
    const btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
    const btnCancelUpload = document.getElementById('btnCancelUpload');
    const uploadForm = document.getElementById('uploadForm');
    const dropZone = document.getElementById('dropZone');
    const bookFileInput = document.getElementById('bookFileInput');
    const fileBanner = document.getElementById('fileBanner');
    const fileNameLabel = document.getElementById('fileNameLabel');
    const btnRemoveFile = document.getElementById('btnRemoveFile');
    const uploadShelfSelect = document.getElementById('uploadShelfSelect');
    const uploadStyleSelect = document.getElementById('uploadStyleSelect');
    const bookTitleInput = document.getElementById('bookTitleInput');
    const bookAuthorInput = document.getElementById('bookAuthorInput');

    // Cloud Elements
    const btnOpenCloud = document.getElementById('btnOpenCloud');
    const btnCloseCloudModal = document.getElementById('btnCloseCloudModal');
    const btnCancelCloud = document.getElementById('btnCancelCloud');
    const cloudForm = document.getElementById('cloudForm');
    const btnDisconnectCloud = document.getElementById('btnDisconnectCloud');
    const storageModeLabel = document.getElementById('storageModeLabel');

    // Initialize Storage
    await window.storageEngine.initIndexedDB();
    updateCloudStatusUI();

    // Initial Load
    await reloadData();
    setupEventListeners();

    function updateCloudStatusUI() {
        const config = window.storageEngine.getSupabaseConfig();
        if (config.isEnabled) {
            storageModeLabel.innerText = '☁️ Synced with Supabase Cloud';
            document.getElementById('cloudLabel').innerText = 'Cloud Connected';
        } else {
            storageModeLabel.innerText = '📁 Stored locally in your browser (IndexedDB)';
            document.getElementById('cloudLabel').innerText = 'Cloud Sync';
        }
    }

    async function reloadData() {
        await fetchShelves();
        await fetchBooks();
    }

    function setupEventListeners() {
        // Search
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fetchBooks(), 200);
        });

        // Shelf Filter Tabs
        shelfNavList.addEventListener('click', (e) => {
            const pill = e.target.closest('.shelf-pill');
            if (!pill) return;
            shelfNavList.querySelectorAll('.shelf-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeShelf = pill.dataset.shelfId;
            fetchBooks();
        });

        // Modals
        btnOpenUpload.addEventListener('click', () => uploadModal.classList.add('active'));
        btnCloseUploadModal.addEventListener('click', () => uploadModal.classList.remove('active'));
        btnCancelUpload.addEventListener('click', () => uploadModal.classList.remove('active'));

        btnOpenCloud.addEventListener('click', () => {
            const cfg = window.storageEngine.getSupabaseConfig();
            document.getElementById('supabaseUrlInput').value = cfg.url || '';
            document.getElementById('supabaseKeyInput').value = cfg.key || '';
            btnDisconnectCloud.style.display = cfg.isEnabled ? 'block' : 'none';
            cloudModal.classList.add('active');
        });

        btnCloseCloudModal.addEventListener('click', () => cloudModal.classList.remove('active'));
        btnCancelCloud.addEventListener('click', () => cloudModal.classList.remove('active'));
        cloudForm.addEventListener('submit', handleCloudSubmit);
        btnDisconnectCloud.addEventListener('click', handleDisconnectCloud);

        // Read Modal Actions
        btnCloseReadModal.addEventListener('click', () => readModal.classList.remove('active'));
        btnPutBack.addEventListener('click', () => readModal.classList.remove('active'));
        btnOpenReader.addEventListener('click', () => {
            if (state.selectedBook) {
                window.location.href = `reader.html?id=${state.selectedBook.id}`;
            }
        });

        // 4 Shelf Style switcher buttons inside Read Modal
        document.querySelectorAll('.btn-spine-style').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!state.selectedBook) return;
                const newStyle = btn.dataset.style;
                document.querySelectorAll('.btn-spine-style').forEach(b => {
                    b.className = 'btn-spine-style hand-btn hand-btn-sm bg-white';
                });
                btn.className = 'btn-spine-style hand-btn hand-btn-sm hand-btn-terracotta text-white';

                state.selectedBook.spine_style = newStyle;
                await window.storageEngine.updateBookSpineStyle(state.selectedBook.id, newStyle);
                showToast(`Arranged as ${newStyle}`, 'success');
                renderShelves(); // Updates shelf immediately!
            });
        });

        btnDeleteBook.addEventListener('click', async () => {
            if (!state.selectedBook) return;
            if (confirm(`Remove "${state.selectedBook.title}" from your shelf?`)) {
                await window.storageEngine.deleteBook(state.selectedBook.id);
                readModal.classList.remove('active');
                showToast('Book removed from shelf', 'info');
                await reloadData();
            }
        });

        // Drag & Drop Upload Handlers
        dropZone.addEventListener('click', () => bookFileInput.click());
        bookFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFileSelected(e.target.files[0]);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-[#f3ebd7]');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-[#f3ebd7]');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-[#f3ebd7]');
            if (e.dataTransfer.files.length) {
                bookFileInput.files = e.dataTransfer.files;
                handleFileSelected(e.dataTransfer.files[0]);
            }
        });

        btnRemoveFile.addEventListener('click', () => {
            uploadForm.reset();
            fileBanner.classList.add('hidden');
            dropZone.classList.remove('hidden');
            state.extractedCoverUrl = '';
            state.extractedDominantColor = '';
        });

        uploadForm.addEventListener('submit', handleUploadSubmit);
    }

    async function handleFileSelected(file) {
        fileNameLabel.innerText = file.name;
        dropZone.classList.add('hidden');
        fileBanner.classList.remove('hidden');

        // Extract using client-side ePub parser
        const extracted = await window.EpubExtractor.extract(file);
        bookTitleInput.value = cleanTitle(extracted.title);
        bookAuthorInput.value = extracted.author || 'Unknown Author';
        state.extractedCoverUrl = extracted.cover_url || '';
        state.extractedDominantColor = extracted.dominant_color || '#e07a5f';

        if (extracted.cover_url) {
            showToast('Extracted real cover image & book details!', 'success');
        }
    }

    async function handleUploadSubmit(e) {
        e.preventDefault();
        const file = bookFileInput.files[0];
        if (!file) {
            showToast('Please pick a book file first!', 'error');
            return;
        }

        const title = cleanTitle(bookTitleInput.value.trim() || file.name);
        const author = bookAuthorInput.value.trim() || 'Unknown Author';
        const shelf_id = uploadShelfSelect.value;
        const spine_style = uploadStyleSelect.value || 'front';
        const cover_url = state.extractedCoverUrl;
        const spine_color = state.extractedDominantColor || '#e07a5f';

        try {
            await window.storageEngine.saveBook({
                file,
                title,
                author,
                shelf_id,
                cover_url,
                spine_color,
                spine_style
            });

            uploadModal.classList.remove('active');
            uploadForm.reset();
            fileBanner.classList.add('hidden');
            dropZone.classList.remove('hidden');
            state.extractedCoverUrl = '';
            state.extractedDominantColor = '';

            showToast(`"${title}" placed on the shelf!`, 'success');
            await reloadData();
        } catch (err) {
            showToast('Failed to save book: ' + err.message, 'error');
        }
    }

    async function handleCloudSubmit(e) {
        e.preventDefault();
        const url = document.getElementById('supabaseUrlInput').value.trim();
        const key = document.getElementById('supabaseKeyInput').value.trim();

        if (!url || !key) return;

        window.storageEngine.setSupabaseConfig(url, key);
        updateCloudStatusUI();
        cloudModal.classList.remove('active');
        showToast('Supabase cloud connected!', 'success');
        await reloadData();
    }

    function handleDisconnectCloud() {
        window.storageEngine.setSupabaseConfig('', '');
        updateCloudStatusUI();
        cloudModal.classList.remove('active');
        showToast('Using local browser memory', 'info');
        reloadData();
    }

    // --- Data Rendering ---

    async function fetchShelves() {
        state.shelves = await window.storageEngine.getShelves();

        uploadShelfSelect.innerHTML = '';
        state.shelves.forEach(s => {
            const opt = new Option(s.name, s.id);
            uploadShelfSelect.add(opt);
        });

        const pills = shelfNavList.querySelectorAll('.shelf-pill:not([data-shelf-id="all"])');
        pills.forEach(p => p.remove());

        state.shelves.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `shelf-pill ${state.activeShelf == s.id ? 'active' : ''}`;
            btn.dataset.shelfId = s.id;
            btn.innerText = s.name;
            shelfNavList.appendChild(btn);
        });
    }

    async function fetchBooks() {
        state.books = await window.storageEngine.getBooks(state.activeShelf, state.searchQuery);
        totalBooksCount.innerText = (await window.storageEngine.getBooks('all')).length;

        if (state.books.length === 0) {
            shelvesContainer.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        renderShelves();
    }

    function renderShelves() {
        shelvesContainer.innerHTML = '';

        const bookcase = document.createElement('div');
        bookcase.className = 'bookcase-wrapper';

        const crown = document.createElement('div');
        crown.className = 'bookcase-top-crown';
        bookcase.appendChild(crown);

        const itemsPerShelf = 5;
        const shelfCount = Math.max(1, Math.ceil(state.books.length / itemsPerShelf));

        for (let sIdx = 0; sIdx < shelfCount; sIdx++) {
            const chunk = state.books.slice(sIdx * itemsPerShelf, (sIdx + 1) * itemsPerShelf);

            // Shelf Tier (Inner Wall)
            const tier = document.createElement('div');
            tier.className = 'shelf-tier';

            let bIdx = 0;
            while (bIdx < chunk.length) {
                const book = chunk[bIdx];
                const theme = coverThemes[(sIdx * itemsPerShelf + bIdx) % coverThemes.length];

                if (book.spine_style === 'stacked') {
                    // Group consecutive stacked books together into a neat pile
                    const stackPile = [book];
                    let nextIdx = bIdx + 1;
                    while (nextIdx < chunk.length && chunk[nextIdx].spine_style === 'stacked') {
                        stackPile.push(chunk[nextIdx]);
                        nextIdx++;
                    }
                    tier.appendChild(createStackedBooksPile(stackPile, sIdx * itemsPerShelf + bIdx));
                    bIdx = nextIdx;
                } else {
                    tier.appendChild(createShelfBookItem(book, theme));
                    bIdx++;
                }
            }

            // Empty Slot Button to slip a new book in
            const emptySlot = document.createElement('div');
            emptySlot.className = 'empty-book-slot';
            emptySlot.innerHTML = `
                <span style="font-size: 1.4rem;">+</span>
                <span style="font-size: 0.8rem; font-weight: 700;">Slip in</span>
            `;
            emptySlot.addEventListener('click', () => uploadModal.classList.add('active'));
            tier.appendChild(emptySlot);

            // Wooden Shelf Plank with wood knots
            const plank = document.createElement('div');
            plank.className = 'shelf-plank';
            plank.innerHTML = `
                <div class="wood-knot"></div>
                <div class="wood-knot"></div>
                <div class="wood-knot"></div>
            `;

            bookcase.appendChild(tier);
            bookcase.appendChild(plank);
        }

        shelvesContainer.appendChild(bookcase);
    }

    // Creates an individual book item on the shelf
    function createShelfBookItem(book, theme) {
        const item = document.createElement('div');
        const style = book.spine_style || 'spine';
        const spineColor = book.spine_color || theme.bg;
        const displayTitle = cleanTitle(book.title);

        item.className = `cozy-shelf-book ${style === 'leaning' ? 'is-leaning' : ''}`;
        item.draggable = true;
        item.dataset.bookId = book.id;

        // Dynamic font size based on title length
        let titleFontSize = '0.92rem';
        if (displayTitle.length > 32) titleFontSize = '0.74rem';
        else if (displayTitle.length > 20) titleFontSize = '0.80rem';
        else if (displayTitle.length > 13) titleFontSize = '0.86rem';

        if (style === 'front') {
            // 1. FRONT-FACING COVER: Shows the real extracted cover image or styled cover!
            let coverBgStyle = book.cover_url 
                ? `background-image: url("${book.cover_url}");` 
                : `background-color: ${spineColor}; color: ${theme.text};`;

            item.innerHTML = `
                <div class="book-cover-front" style="${coverBgStyle}">
                    <div class="dangle-ribbon" style="background-color: ${theme.ribbon};"></div>
                    <div class="flex items-center justify-between z-10 ${book.cover_url ? 'bg-black/50 px-2 py-0.5 rounded text-white' : ''}">
                        <span class="text-xs font-bold uppercase tracking-wide">${escapeHtml(book.file_type || 'epub')}</span>
                        <span class="text-xs font-bold bg-[#f2cc8f] text-[#2c221e] px-1.5 py-0.2 rounded">${Math.round(book.reading_progress || 0)}%</span>
                    </div>
                    <div class="z-10 ${book.cover_url ? 'bg-black/60 p-2.5 rounded text-white' : ''}">
                        <h4 class="font-bold line-clamp-2 leading-tight" style="font-size: ${titleFontSize};">${escapeHtml(displayTitle)}</h4>
                        <p class="text-xs opacity-90 truncate mt-0.5">${escapeHtml(book.author || 'Unknown')}</p>
                    </div>
                </div>
            `;
        } else {
            // 2. REALISTIC UPRIGHT OR LEANING SPINE (Clean, elegant, matches cover color)
            const height = 205 + ((displayTitle.length * 2) % 18);

            let spineBg = book.cover_url
                ? `background-image: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.15) 20%, transparent 60%, rgba(0,0,0,0.45) 100%), url("${book.cover_url}");`
                : `background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0.2) 20%, transparent 50%, rgba(0,0,0,0.18) 100%), ${spineColor}; color: ${theme.text};`;

            item.innerHTML = `
                <div class="book-spine-upright" style="height: ${height}px; ${spineBg}">
                    <div class="dangle-ribbon" style="background-color: ${theme.ribbon};"></div>
                    <div></div>
                    <div class="spine-title-container">
                        <span class="spine-title-text ${book.cover_url ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : ''}" style="font-size: ${titleFontSize};">${escapeHtml(displayTitle)}</span>
                    </div>
                    <span class="spine-author-text ${book.cover_url ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : ''}">${escapeHtml(book.author || 'Tome')}</span>
                </div>
            `;
        }

        // Click book to pull it off the shelf & open modal
        item.addEventListener('click', () => openBookModal(book, theme));

        // Drag & Drop
        setupDragEvents(item, book);

        return item;
    }

    // Creates a physical pile of books stacked flat on top of each other
    function createStackedBooksPile(booksInStack, baseThemeIdx) {
        const stackWrap = document.createElement('div');
        stackWrap.className = 'shelf-book-stack';

        booksInStack.forEach((b, i) => {
            const theme = coverThemes[(baseThemeIdx + i) % coverThemes.length];
            const spineColor = b.spine_color || theme.bg;
            const displayTitle = cleanTitle(b.title);

            const layer = document.createElement('div');
            layer.className = 'stack-book-layer';
            layer.style.backgroundColor = spineColor;
            layer.style.color = theme.text;
            layer.draggable = true;
            layer.dataset.bookId = b.id;

            layer.innerHTML = `
                <span class="truncate max-w-[110px]">${escapeHtml(displayTitle)}</span>
                <span class="text-xs opacity-75">${Math.round(b.reading_progress || 0)}%</span>
            `;

            layer.addEventListener('click', (e) => {
                e.stopPropagation();
                openBookModal(b, theme);
            });

            setupDragEvents(layer, b);
            stackWrap.appendChild(layer);
        });

        return stackWrap;
    }

    // Drag and drop handler
    function setupDragEvents(element, book) {
        element.addEventListener('dragstart', (e) => {
            state.draggedBookId = book.id;
            element.classList.add('is-dragging');
            e.dataTransfer.setData('text/plain', book.id);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('is-dragging');
            state.draggedBookId = null;
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        element.addEventListener('drop', async (e) => {
            e.preventDefault();
            const sourceId = state.draggedBookId || e.dataTransfer.getData('text/plain');
            if (!sourceId || sourceId == book.id) return;

            // Reorder books on shelf
            const fromIdx = state.books.findIndex(b => b.id == sourceId);
            const toIdx = state.books.findIndex(b => b.id == book.id);
            if (fromIdx !== -1 && toIdx !== -1) {
                const [movedBook] = state.books.splice(fromIdx, 1);
                state.books.splice(toIdx, 0, movedBook);
                renderShelves();
                showToast('Rearranged books on shelf', 'info');
            }
        });
    }

    // --- Pop-Out Book Modal ---

    function openBookModal(book, theme) {
        state.selectedBook = book;
        const displayTitle = cleanTitle(book.title);

        if (book.cover_url) {
            modalCover.style.backgroundImage = `url("${book.cover_url}")`;
            modalCover.style.backgroundColor = '#2c221e';
        } else {
            modalCover.style.backgroundImage = 'none';
            modalCover.style.backgroundColor = book.spine_color || theme.bg;
        }

        modalFileType.innerText = book.file_type || 'epub';
        modalBookTitle.innerText = displayTitle;
        modalBookAuthor.innerText = book.author || 'Unknown Author';

        modalDetailTitle.innerText = displayTitle;
        modalDetailAuthor.innerText = "by " + (book.author || 'Unknown Author');
        modalDetailDesc.innerText = book.description || 'A cozy digital volume resting on your wooden shelf.';

        const shelf = state.shelves.find(s => s.id == book.shelf_id);
        modalShelfBadge.innerText = shelf ? `Shelf: ${shelf.name}` : 'Saved to shelf';

        const prog = Math.round(book.reading_progress || 0);
        modalProgText.innerText = `${prog}% completed`;
        modalProgFill.style.width = `${prog}%`;

        // Highlight active style button
        const curStyle = book.spine_style || 'front';
        document.querySelectorAll('.btn-spine-style').forEach(b => {
            if (b.dataset.style === curStyle) {
                b.className = 'btn-spine-style hand-btn hand-btn-sm hand-btn-terracotta text-white';
            } else {
                b.className = 'btn-spine-style hand-btn hand-btn-sm bg-white';
            }
        });

        readModal.classList.add('active');
    }

    // --- Hand-Drawn Animated SVG Illustrations (Zero Emojis!) ---

    function getHanddrawnMochiSvg() {
        return `
            <svg class="cat-svg" width="38" height="28" viewBox="0 0 38 28" fill="none">
                <path class="cat-tail" d="M 30 22 C 35 24 37 17 34 14 C 32 12 29 14 30 17" stroke="#2c221e" stroke-width="2" stroke-linecap="round" fill="#e07a5f"/>
                <ellipse class="cat-body" cx="19" cy="18" rx="15" ry="9" fill="#f4a261" stroke="#2c221e" stroke-width="2"/>
                <circle cx="10" cy="15" r="7.5" fill="#f4a261" stroke="#2c221e" stroke-width="2"/>
                <polygon points="6,9 8,3 11,9" fill="#e07a5f" stroke="#2c221e" stroke-width="1.8"/>
                <polygon points="11,9 13,4 15,10" fill="#e07a5f" stroke="#2c221e" stroke-width="1.8"/>
                <path d="M 7 15 Q 9 17 11 15" stroke="#2c221e" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M 12 15 Q 14 17 16 15" stroke="#2c221e" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="11.5" cy="17.5" r="1.2" fill="#e07a5f"/>
            </svg>
        `;
    }

    function getHanddrawnMugSvg() {
        return `
            <div class="handdrawn-mug-decor" title="Warm Cinnamon Tea">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path class="steam-wave-1" d="M 12 10 Q 14 6 12 2" stroke="#8c786c" stroke-width="1.6" stroke-linecap="round" fill="none"/>
                    <path class="steam-wave-2" d="M 18 11 Q 20 7 18 3" stroke="#8c786c" stroke-width="1.6" stroke-linecap="round" fill="none"/>
                    <rect x="7" y="12" width="16" height="18" rx="4" fill="#eed9c4" stroke="#2c221e" stroke-width="2"/>
                    <path d="M 23 15 C 28 15 28 25 23 25" stroke="#2c221e" stroke-width="2" fill="none"/>
                    <line x1="7" y1="18" x2="23" y2="18" stroke="#e07a5f" stroke-width="1.5" stroke-dasharray="2 2"/>
                </svg>
            </div>
        `;
    }

    function getHanddrawnCandleSvg() {
        return `
            <div class="handdrawn-candle-decor" title="Cozy Candle">
                <svg width="28" height="42" viewBox="0 0 28 42" fill="none">
                    <path class="candle-flame" d="M 14 4 C 11 8 10 13 14 15 C 18 13 17 8 14 4 Z" fill="#f4a261" stroke="#2c221e" stroke-width="1.5"/>
                    <circle cx="14" cy="12" r="2.5" fill="#ffeaa7"/>
                    <line x1="14" y1="15" x2="14" y2="18" stroke="#2c221e" stroke-width="2"/>
                    <rect x="7" y="18" width="14" height="22" rx="3" fill="#fffdfa" stroke="#2c221e" stroke-width="2"/>
                    <path d="M 9 18 C 9 22 11 22 11 18" fill="#fffdfa" stroke="#2c221e" stroke-width="1.5"/>
                </svg>
            </div>
        `;
    }

    function getHanddrawnPlantSvg() {
        return `
            <div class="handdrawn-plant-decor" title="Pothos Plant">
                <svg width="42" height="48" viewBox="0 0 42 48" fill="none">
                    <path d="M 21 22 Q 10 18 8 12 Q 14 8 21 22" fill="#81b29a" stroke="#2c221e" stroke-width="1.8"/>
                    <path d="M 21 22 Q 32 16 34 10 Q 26 8 21 22" fill="#a3b18a" stroke="#2c221e" stroke-width="1.8"/>
                    <path d="M 21 20 Q 21 8 16 4 Q 14 12 21 20" fill="#588157" stroke="#2c221e" stroke-width="1.8"/>
                    <path d="M 10 24 Q 4 30 2 36 Q 8 36 12 26" fill="#81b29a" stroke="#2c221e" stroke-width="1.8"/>
                    <polygon points="12,22 30,22 27,42 15,42" fill="#e07a5f" stroke="#2c221e" stroke-width="2"/>
                    <rect x="10" y="20" width="22" height="4" rx="2" fill="#cfa170" stroke="#2c221e" stroke-width="1.8"/>
                </svg>
            </div>
        `;
    }

    function getHanddrawnClockSvg() {
        return `
            <div class="handdrawn-clock-decor" title="Vintage Clock">
                <svg width="36" height="46" viewBox="0 0 36 46" fill="none">
                    <rect x="6" y="6" width="24" height="26" rx="5" fill="#cfa170" stroke="#2c221e" stroke-width="2"/>
                    <circle cx="18" cy="18" r="9" fill="#ffffff" stroke="#2c221e" stroke-width="1.8"/>
                    <line x1="18" y1="18" x2="18" y2="12" stroke="#2c221e" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="18" y1="18" x2="22" y2="18" stroke="#2c221e" stroke-width="1.8" stroke-linecap="round"/>
                    <g class="clock-pendulum" style="transform-origin: 18px 32px;">
                        <line x1="18" y1="32" x2="18" y2="42" stroke="#2c221e" stroke-width="1.8"/>
                        <circle cx="18" cy="42" r="3" fill="#f2cc8f" stroke="#2c221e" stroke-width="1.5"/>
                    </g>
                </svg>
            </div>
        `;
    }

    function getHanddrawnBookendSvg() {
        return `
            <div class="handdrawn-bookend-decor" title="Brass Bookend">
                <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
                    <path d="M 4 40 L 4 10 Q 4 4 10 4 L 14 4 L 14 36 L 30 36 L 30 40 Z" fill="#f2cc8f" stroke="#2c221e" stroke-width="2.2" stroke-linejoin="round"/>
                    <path d="M 14 12 L 28 36" stroke="#2c221e" stroke-width="2" stroke-dasharray="2 3"/>
                </svg>
            </div>
        `;
    }

    function renderHanddrawnDecor(type) {
        switch (type) {
            case 'plant': return getHanddrawnPlantSvg();
            case 'mug': return getHanddrawnMugSvg();
            case 'candle': return getHanddrawnCandleSvg();
            case 'clock': return getHanddrawnClockSvg();
            case 'bookend': return getHanddrawnBookendSvg();
            default: return getHanddrawnPlantSvg();
        }
    }

    // --- Utilities ---

    function cleanTitle(raw) {
        if (!raw) return 'Untitled';
        return raw
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        const emoji = type === 'success' ? '✨' : (type === 'error' ? '⚠️' : '☕');
        toast.innerHTML = `<span>${emoji}</span><span>${escapeHtml(msg)}</span>`;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 2800);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
