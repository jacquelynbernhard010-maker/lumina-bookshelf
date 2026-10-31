/**
 * The Cozy Nook - Frontend Application
 * Real home bookshelf arrangement, auto-cover extraction, customizable spine positions
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Whimsical color themes for book spines
    const coverThemes = [
        { bg: '#81b29a', text: '#152b1e', emoji: '🌿', ribbon: '#e07a5f' }, // Matcha
        { bg: '#e07a5f', text: '#ffffff', emoji: '⏳', ribbon: '#f2cc8f' }, // Terracotta
        { bg: '#f2cc8f', text: '#3f2b12', emoji: '🍂', ribbon: '#81b29a' }, // Honey
        { bg: '#9d8189', text: '#ffffff', emoji: '🌙', ribbon: '#e07a5f' }, // Dusty Rose
        { bg: '#8ecae6', text: '#103548', emoji: '☁️', ribbon: '#e07a5f' }, // Sky Blue
        { bg: '#e76f51', text: '#ffffff', emoji: '✦',  ribbon: '#f2cc8f' }, // Rust
        { bg: '#eed9c4', text: '#4a2e18', emoji: '🕯️', ribbon: '#81b29a' }, // Oat Bread
        { bg: '#a3b18a', text: '#1b2c15', emoji: '🌱', ribbon: '#e07a5f' }  // Sage
    ];

    // State
    const state = {
        activeShelf: 'all',
        searchQuery: '',
        books: [],
        shelves: [],
        selectedBook: null,
        extractedCoverUrl: ''
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
    const modalEmoji = document.getElementById('modalEmoji');
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
    const bookTitleInput = document.getElementById('bookTitleInput');
    const bookAuthorInput = document.getElementById('bookAuthorInput');

    // Cloud Elements
    const btnOpenCloud = document.getElementById('btnOpenCloud');
    const btnCloseCloudModal = document.getElementById('btnCloseCloudModal');
    const btnCancelCloud = document.getElementById('btnCancelCloud');
    const cloudForm = document.getElementById('cloudForm');
    const btnDisconnectCloud = document.getElementById('btnDisconnectCloud');
    const storageModeLabel = document.getElementById('storageModeLabel');

    // Easter Egg Plant
    const btnPlant = document.getElementById('btnPlant');
    let plantClicks = 1;

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
            document.getElementById('supabaseUrlInput').value = cfg.url;
            document.getElementById('supabaseKeyInput').value = cfg.key;
            cloudModal.classList.add('active');
        });
        btnCloseCloudModal.addEventListener('click', () => cloudModal.classList.remove('active'));
        btnCancelCloud.addEventListener('click', () => cloudModal.classList.remove('active'));

        // Read Modal Actions
        btnCloseReadModal.addEventListener('click', () => readModal.classList.remove('active'));
        btnPutBack.addEventListener('click', () => readModal.classList.remove('active'));
        btnOpenReader.addEventListener('click', () => {
            if (state.selectedBook) {
                window.location.href = `reader.html?id=${state.selectedBook.id}`;
            }
        });

        btnDeleteBook.addEventListener('click', async () => {
            if (!state.selectedBook) return;
            if (confirm(`Remove "${state.selectedBook.title}" from your shelf?`)) {
                await window.storageEngine.deleteBook(state.selectedBook.id);
                readModal.classList.remove('active');
                showToast(`"${state.selectedBook.title}" put away`, 'info');
                await reloadData();
            }
        });

        // Style switcher buttons (Upright, Leaning, Stacked)
        document.querySelectorAll('.btn-spine-style').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!state.selectedBook) return;
                const newStyle = btn.dataset.style;
                document.querySelectorAll('.btn-spine-style').forEach(b => b.classList.replace('hand-btn-terracotta', 'bg-white'));
                btn.classList.add('hand-btn-terracotta');

                state.selectedBook.spine_style = newStyle;
                await window.storageEngine.updateBookSpineStyle(state.selectedBook.id, newStyle);
                showToast(`Shelf style set to ${newStyle}`, 'success');
                await reloadData();
            });
        });

        // Close on backdrop
        [readModal, uploadModal, cloudModal].forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) m.classList.remove('active');
            });
        });

        // Drag & Drop Upload
        dropZone.addEventListener('click', () => bookFileInput.click());
        bookFileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) await handleSelectedFile(e.target.files[0]);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '#f4ecd8';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.backgroundColor = '#fdfaf3';
        });
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '#fdfaf3';
            if (e.dataTransfer.files.length > 0) await handleSelectedFile(e.dataTransfer.files[0]);
        });

        btnRemoveFile.addEventListener('click', () => {
            bookFileInput.value = '';
            fileBanner.classList.add('hidden');
            dropZone.classList.remove('hidden');
            state.extractedCoverUrl = '';
        });

        uploadForm.addEventListener('submit', handleUploadSubmit);
        cloudForm.addEventListener('submit', handleCloudSubmit);
        btnDisconnectCloud.addEventListener('click', handleDisconnectCloud);

        // Easter Egg: Water Pothos
        btnPlant.addEventListener('click', () => {
            plantClicks = (plantClicks % 4) + 1;
            const stages = ['🌱', '🪴', '🌿', '✨🪴✨'];
            const plantEl = document.getElementById('shelfPlantDecor');
            if (plantEl) plantEl.innerText = stages[plantClicks - 1];
            document.getElementById('plantLabel').innerText = plantClicks === 4 ? "Pothos is thriving!" : "Water Pothos";
        });
    }

    // Auto-extract real EPUB cover & clean metadata on file selection!
    async function handleSelectedFile(file) {
        fileNameLabel.innerText = file.name;
        dropZone.classList.add('hidden');
        fileBanner.classList.remove('hidden');

        // Extract using client-side ePub parser
        const extracted = await window.EpubExtractor.extract(file);
        bookTitleInput.value = extracted.title;
        bookAuthorInput.value = extracted.author;
        state.extractedCoverUrl = extracted.cover_url || '';

        if (extracted.cover_url) {
            showToast('Extracted real book cover & author!', 'success');
        }
    }

    async function handleUploadSubmit(e) {
        e.preventDefault();
        const file = bookFileInput.files[0];
        if (!file) {
            showToast('Please pick a book file first!', 'error');
            return;
        }

        const title = bookTitleInput.value.trim() || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        const author = bookAuthorInput.value.trim() || 'Unknown Author';
        const shelf_id = uploadShelfSelect.value;
        const cover_url = state.extractedCoverUrl;

        // Choose random theme color
        const randomTheme = coverThemes[Math.floor(Math.random() * coverThemes.length)];

        try {
            await window.storageEngine.saveBook({
                file,
                title,
                author,
                shelf_id,
                cover_url,
                spine_color: randomTheme.bg,
                spine_style: 'upright'
            });

            uploadModal.classList.remove('active');
            uploadForm.reset();
            fileBanner.classList.add('hidden');
            dropZone.classList.remove('hidden');
            state.extractedCoverUrl = '';

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

        // Up to 6 books per shelf
        const booksPerShelf = 6;
        const shelfCount = Math.max(1, Math.ceil(state.books.length / booksPerShelf));

        for (let sIdx = 0; sIdx < shelfCount; sIdx++) {
            const chunk = state.books.slice(sIdx * booksPerShelf, (sIdx + 1) * booksPerShelf);
            const isFirstShelf = (sIdx === 0);

            const shelfWrap = document.createElement('div');
            shelfWrap.className = 'shelf-wrapper';

            // Top room decor: Sleeping Cat Mochi & Plant on first shelf
            let decorHtml = '';
            if (isFirstShelf) {
                decorHtml = `
                    <div class="shelf-room-decor">
                        <div class="sleeping-cat flex items-center gap-2 bg-[#fdfaf3] px-3.5 py-1 rounded-full border-2 border-[#2c221e] shadow-[2px_2px_0px_#2c221e] text-sm select-none">
                            <span class="text-xl">🐱</span>
                            <span class="font-bold text-xs text-[#524137]">Mochi is sleeping... zZz</span>
                        </div>
                        <div class="flex items-center gap-3 text-2xl select-none">
                            <div id="shelfPlantDecor" class="transition-transform hover:scale-125 cursor-pointer" title="Water me!">🪴</div>
                            <div class="transition-transform hover:rotate-6 cursor-pointer" title="Warm Tea">🍵</div>
                        </div>
                    </div>
                `;
            } else {
                decorHtml = `
                    <div class="shelf-room-decor justify-end">
                        <div class="flex items-center gap-3 text-xl select-none">
                            <span title="Vintage Clock">🕰️</span>
                            <span title="Candle">🕯️</span>
                        </div>
                    </div>
                `;
            }

            // Shelf Book Box (56px top padding ensures tooltips NEVER clip!)
            const box = document.createElement('div');
            box.className = 'shelf-bookcase-box';

            chunk.forEach((book, bIdx) => {
                const theme = coverThemes[(sIdx * booksPerShelf + bIdx) % coverThemes.length];
                box.appendChild(createShelfBookItem(book, theme));
            });

            // Empty Slot Button
            const emptySlot = document.createElement('div');
            emptySlot.className = 'empty-book-slot';
            emptySlot.innerHTML = `
                <span class="text-xl mb-1">+</span>
                <span class="font-bold text-xs">Slip in</span>
            `;
            emptySlot.addEventListener('click', () => uploadModal.classList.add('active'));
            box.appendChild(emptySlot);

            // Wooden Shelf Plank
            const plank = document.createElement('div');
            plank.className = 'sketch-shelf-plank flex items-center justify-between px-8';
            plank.innerHTML = `
                <div class="wood-knot" style="left: ${20 + sIdx * 15}%;"></div>
                <div class="wood-knot" style="left: ${60 - sIdx * 10}%;"></div>
                <div class="wood-knot" style="left: 85%;"></div>
            `;

            shelfWrap.innerHTML = decorHtml;
            shelfWrap.appendChild(box);
            shelfWrap.appendChild(plank);
            shelvesContainer.appendChild(shelfWrap);
        }
    }

    // Creates books sitting on the shelf (Upright, Leaning, or Stacked Flat)
    function createShelfBookItem(book, theme) {
        const item = document.createElement('div');
        const style = book.spine_style || 'upright';
        const prog = Math.round(book.reading_progress || 0);

        item.className = `cozy-shelf-book ${style === 'leaning' ? 'is-leaning' : (style === 'stacked' ? 'is-stacked' : '')}`;

        const spineBg = book.spine_color || theme.bg;

        if (style === 'stacked') {
            // Horizontal stacked flat book
            item.innerHTML = `
                <div class="hover-tooltip">Take out 📖</div>
                <div class="stack-book-layer" style="background-color: ${spineBg}; color: ${theme.text};">
                    <span>${theme.emoji} ${escapeHtml(book.title)}</span>
                    <span class="text-xs opacity-75">${prog}%</span>
                </div>
            `;
        } else {
            // Upright or Leaning vertical spine (clean horizontal title block, NO rotated overflow!)
            const height = 195 + ((book.title.length * 3) % 25);
            item.innerHTML = `
                <div class="hover-tooltip">Take out 📖</div>
                <div class="book-spine-upright" style="height: ${height}px; background-color: ${spineBg}; color: ${theme.text};">
                    <div class="dangle-ribbon" style="background-color: ${theme.ribbon};"></div>
                    <span class="spine-top-badge">${theme.emoji}</span>
                    <div class="spine-title-container">
                        <span class="spine-title-text">${escapeHtml(book.title)}</span>
                    </div>
                    <span class="spine-author-text">${escapeHtml(book.author || 'Tome')}</span>
                </div>
            `;
        }

        item.addEventListener('click', () => openBookModal(book, theme));
        return item;
    }

    // --- Pop-Out Book Modal ---

    function openBookModal(book, theme) {
        state.selectedBook = book;

        // Cover styling: if real cover image was extracted from EPUB, show it!
        if (book.cover_url) {
            modalCover.style.backgroundImage = `url("${book.cover_url}")`;
            modalCover.style.backgroundColor = '#2c221e';
        } else {
            modalCover.style.backgroundImage = 'none';
            modalCover.style.backgroundColor = book.spine_color || theme.bg;
        }

        modalEmoji.innerText = theme.emoji;
        modalFileType.innerText = book.file_type || 'epub';
        modalBookTitle.innerText = book.title;
        modalBookAuthor.innerText = book.author || 'Unknown Author';

        modalDetailTitle.innerText = book.title;
        modalDetailAuthor.innerText = "by " + (book.author || 'Unknown Author');
        modalDetailDesc.innerText = book.description || 'A cozy digital volume resting on your wooden shelf.';

        const shelf = state.shelves.find(s => s.id == book.shelf_id);
        modalShelfBadge.innerText = shelf ? `Shelf: ${shelf.name}` : 'Saved to shelf';

        const prog = Math.round(book.reading_progress || 0);
        modalProgText.innerText = `${prog}% completed`;
        modalProgFill.style.width = `${prog}%`;

        // Highlight active style button
        const curStyle = book.spine_style || 'upright';
        document.querySelectorAll('.btn-spine-style').forEach(b => {
            if (b.dataset.style === curStyle) {
                b.className = 'btn-spine-style hand-btn hand-btn-sm hand-btn-terracotta text-white';
            } else {
                b.className = 'btn-spine-style hand-btn hand-btn-sm bg-white';
            }
        });

        readModal.classList.add('active');
    }

    // --- Utilities ---

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
