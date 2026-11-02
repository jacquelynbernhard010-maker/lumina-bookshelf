/**
 * The Cozy Nook - Hand-drawn Cozy Bookshelf Application
 * Restored from approved prototype handdrawn_cozy_shelf.html
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Whimsical color themes for hand-drawn book spines
    const coverThemes = [
        { bg: '#81b29a', text: '#1e2d24', emoji: '🌿', ribbon: '#e07a5f' }, // Matcha
        { bg: '#e07a5f', text: '#ffffff', emoji: '⏳', ribbon: '#f2cc8f' }, // Terracotta
        { bg: '#f2cc8f', text: '#3f2b12', emoji: '🍂', ribbon: '#81b29a' }, // Honey
        { bg: '#9d8189', text: '#ffffff', emoji: '🌙', ribbon: '#e07a5f' }, // Dusty Rose
        { bg: '#8ecae6', text: '#103b4f', emoji: '☁️', ribbon: '#e07a5f' }, // Sky Blue
        { bg: '#e76f51', text: '#ffffff', emoji: '✦',  ribbon: '#f2cc8f' }, // Rust
        { bg: '#eed9c4', text: '#4a2e18', emoji: '🕯️', ribbon: '#81b29a' }, // Soft Oat
        { bg: '#e9c46a', text: '#2c221e', emoji: '⭐', ribbon: '#e07a5f' }  // Little Prince Yellow
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
        plantLevel: 1
    };

    // DOM Elements
    const shelvesContainer = document.getElementById('shelvesContainer');
    const shelfNavList = document.getElementById('shelfNavList');
    const totalBooksCount = document.getElementById('totalBooksCount');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const btnPlant = document.getElementById('btnPlant');
    const plantLabel = document.getElementById('plantLabel');

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
            storageModeLabel.innerText = '📁 Stored locally in your browser';
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

        // Plant Easter Egg
        btnPlant.addEventListener('click', () => {
            state.plantLevel = (state.plantLevel % 4) + 1;
            const plantEl = document.getElementById('plantDisplay');
            if (plantEl) {
                const icons = ['🌱', '🪴', '🌿', '✨🪴✨'];
                plantEl.innerText = icons[state.plantLevel - 1];
            }
            plantLabel.innerText = state.plantLevel === 4 ? "Pothos is thriving!" : "Water Pothos";
            showToast('You watered the little pothos!', 'success');
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
                showToast(`Shelf style: ${newStyle}`, 'success');
                renderShelves();
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

        // Click outside backdrop to close
        readModal.addEventListener('click', (e) => {
            if (e.target === readModal) readModal.classList.remove('active');
        });
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) uploadModal.classList.remove('active');
        });
        cloudModal.addEventListener('click', (e) => {
            if (e.target === cloudModal) cloudModal.classList.remove('active');
        });
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
            showToast('Extracted book cover & details!', 'success');
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
        const spine_style = uploadStyleSelect.value || 'spine';
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

            showToast(`"${title}" slipped onto the shelf!`, 'success');
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
        backfillMissingCovers();
    }

    // Auto-backfill missing covers for existing books on the shelf
    async function backfillMissingCovers() {
        for (const book of state.books) {
            const needsCover = !book.cover_url || (book.cover_url.startsWith('data:') && book.cover_url.length < 5000);
            if (needsCover) {
                try {
                    let newCover = '';
                    if (book.file_blob && window.EpubExtractor) {
                        newCover = await window.EpubExtractor.extractCoverOnly(book.file_blob);
                    }
                    if (!newCover && window.EpubExtractor) {
                        newCover = await window.EpubExtractor.fetchCoverFromOnline(book.title, book.author);
                    }
                    if (newCover) {
                        book.cover_url = newCover;
                        if (!book.spine_color || book.spine_color === '#81b29a' || book.spine_color === '#e07a5f') {
                            book.spine_color = await window.EpubExtractor.sampleDominantColor(newCover);
                        }
                        await window.storageEngine.updateBook(book.id, { 
                            cover_url: newCover,
                            spine_color: book.spine_color
                        });
                        renderShelves();
                    }
                } catch (e) {
                    console.warn('Cover backfill error:', e);
                }
            }
        }
    }

    function renderShelves() {
        shelvesContainer.innerHTML = '';

        const itemsPerShelf = 5;
        const shelfCount = Math.max(1, Math.ceil(state.books.length / itemsPerShelf));

        for (let sIdx = 0; sIdx < shelfCount; sIdx++) {
            const chunk = state.books.slice(sIdx * itemsPerShelf, (sIdx + 1) * itemsPerShelf);
            const isFirstShelf = (sIdx === 0);

            const shelfSection = document.createElement('div');
            shelfSection.className = 'relative';

            // Top shelf accessories on first shelf: Mochi sleeping cat, vine plant, hot tea
            let accessoriesHtml = '';
            if (isFirstShelf) {
                accessoriesHtml = `
                    <div class="flex items-end justify-between px-6 mb-[-2px] relative z-10">
                        <div class="sleeping-cat flex items-center gap-1.5 bg-[#fdfaf3] px-3 py-1 rounded-full border-2 border-[#2c221e] shadow-[2px_2px_0px_#2c221e] text-sm select-none">
                            <span class="text-lg">🐱</span>
                            <span class="font-bold text-xs text-[#524137]">Mochi is sleeping... zZz</span>
                        </div>
                        <div class="flex items-end gap-3 text-2xl select-none">
                            <div id="plantDisplay" class="transition-transform hover:scale-125 cursor-pointer" title="A happy little vine">🪴</div>
                            <div class="transition-transform hover:rotate-6 cursor-pointer" title="Hot Chamomile Tea">🍵</div>
                        </div>
                    </div>
                `;
            } else {
                accessoriesHtml = `
                    <div class="flex items-end justify-end px-6 mb-[-2px] relative z-10 select-none">
                        <div class="text-2xl" title="Warm Candle">🕯️</div>
                    </div>
                `;
            }

            // Shelf Book Box (Exactly from handdrawn_cozy_shelf.html)
            const box = document.createElement('div');
            box.className = 'bg-[#fffcf7] p-6 pb-2 border-x-2 border-t-2 border-[#2c221e] rounded-t-2xl shadow-inner min-h-[220px] flex items-end gap-3 md:gap-4 overflow-x-auto';

            let bIdx = 0;
            while (bIdx < chunk.length) {
                const book = chunk[bIdx];
                const theme = coverThemes[(sIdx * itemsPerShelf + bIdx) % coverThemes.length];

                if (book.spine_style === 'stacked') {
                    // Group stacked books
                    const stackPile = [book];
                    let nextIdx = bIdx + 1;
                    while (nextIdx < chunk.length && chunk[nextIdx].spine_style === 'stacked') {
                        stackPile.push(chunk[nextIdx]);
                        nextIdx++;
                    }
                    box.appendChild(createStackedBooksGroup(stackPile, sIdx * itemsPerShelf + bIdx));
                    bIdx = nextIdx;
                } else {
                    box.appendChild(createDoodleBook(book, theme));
                    bIdx++;
                }
            }

            // Empty Slot sketch
            const emptySlot = document.createElement('div');
            emptySlot.className = 'border-2 border-dashed border-[#c4b5a5] rounded-lg w-16 h-36 flex flex-col items-center justify-center p-2 text-center text-xs text-[#a89685] cursor-pointer hover:border-[#2c221e] transition-colors flex-shrink-0';
            emptySlot.innerHTML = `
                <span class="text-lg">+</span>
                <span>Slip in</span>
            `;
            emptySlot.addEventListener('click', () => uploadModal.classList.add('active'));
            box.appendChild(emptySlot);

            // Shelf label badge on right
            const shelfBadge = document.createElement('div');
            shelfBadge.className = 'ml-auto flex items-end pb-1 pr-2 select-none';
            shelfBadge.innerHTML = `
                <div class="px-3 py-1 bg-[#fffdfa] border-2 border-[#2c221e] rounded-lg shadow-[2px_2px_0px_#2c221e] text-xs font-bold flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>Shelf ${sIdx + 1}</span>
                </div>
            `;
            box.appendChild(shelfBadge);

            // Solid Wooden Shelf Plank with Knots
            const plank = document.createElement('div');
            plank.className = 'sketch-shelf flex items-center justify-between px-8';
            plank.innerHTML = `
                <div class="wood-knot" style="left: ${15 + sIdx * 10}%;"></div>
                <div class="wood-knot" style="left: ${55 - sIdx * 5}%;"></div>
                <div class="wood-knot" style="left: 88%;"></div>
            `;

            shelfSection.innerHTML = accessoriesHtml;
            shelfSection.appendChild(box);
            shelfSection.appendChild(plank);
            shelvesContainer.appendChild(shelfSection);
        }
    }

    // Creates an individual book item on the shelf
    function createDoodleBook(book, theme) {
        const item = document.createElement('div');
        const style = book.spine_style || 'spine';
        const color = book.spine_color || theme.bg;
        const displayTitle = cleanTitle(book.title);
        const displayAuthor = cleanAuthor(book.author);

        item.className = `doodle-book ${style === 'leaning' ? 'is-leaning' : ''}`;

        if (style === 'front') {
            // Front-Facing Cover
            let coverBgStyle = book.cover_url
                ? `background-image: url("${book.cover_url}"); background-color: #2c221e;`
                : `background-color: ${color}; color: ${theme.text};`;

            item.innerHTML = `
                <div class="hover-tooltip">Take out 📖</div>
                <div class="book-front-cover" style="${coverBgStyle}">
                    <div class="dangle-ribbon" style="background-color: ${theme.ribbon};"></div>
                    <span class="text-xs font-bold uppercase tracking-wide bg-black/60 px-2 py-0.5 rounded text-white self-start backdrop-blur-sm shadow-sm">${escapeHtml(book.file_type || 'epub')}</span>
                    
                    <div class="bg-black/65 p-2 rounded-md text-white z-10 backdrop-blur-sm mt-auto shadow-sm">
                        <h4 class="font-bold text-xs line-clamp-2 leading-tight">${escapeHtml(displayTitle)}</h4>
                        <p class="text-[10px] opacity-90 truncate mt-0.5">${escapeHtml(displayAuthor)}</p>
                    </div>
                </div>
            `;
        } else {
            // Upright Spine with clean horizontal title wrapping (as shown in user's shelf view)
            const height = 190 + ((displayTitle.length * 2) % 20);
            const spineWidth = 54;
            const textColor = isLightColor(color) ? '#1e2d24' : '#ffffff';

            item.innerHTML = `
                <div class="hover-tooltip">Take out 📖</div>
                <div class="book-body w-[${spineWidth}px] h-[${height}px] flex flex-col items-center justify-between py-2 px-1 relative select-none" style="background-color: ${color};">
                    <div class="dangle-ribbon" style="background: ${theme.ribbon};"></div>
                    <span class="text-xs mt-0.5">${theme.emoji}</span>
                    <div class="flex-1 flex items-center justify-center text-center my-1 w-full overflow-hidden">
                        <span class="font-bold text-xs leading-snug line-clamp-4 break-words" style="color: ${textColor};">${escapeHtml(displayTitle)}</span>
                    </div>
                    <span class="text-[10px] font-bold text-center w-full truncate px-0.5" style="color: ${textColor};">${escapeHtml(displayAuthor)}</span>
                </div>
            `;
        }

        item.addEventListener('click', () => openBookModal(book, theme));
        return item;
    }

    // Creates stacked books lying down
    function createStackedBooksGroup(booksInStack, baseThemeIdx) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-col gap-1 items-center pb-0.5 ml-2 flex-shrink-0';

        booksInStack.forEach((b, i) => {
            const theme = coverThemes[(baseThemeIdx + i) % coverThemes.length];
            const color = b.spine_color || theme.bg;
            const displayTitle = cleanTitle(b.title);
            const textColor = isLightColor(color) ? '#1e2d24' : '#ffffff';

            const layer = document.createElement('div');
            layer.className = 'doodle-book';
            layer.innerHTML = `
                <div class="hover-tooltip">Take out 📖</div>
                <div class="w-32 h-7 border-2 border-[#2c221e] rounded flex items-center justify-between px-2 text-xs font-bold shadow-sm" style="background: ${color}; color: ${textColor};">
                    <span class="truncate max-w-[95px]">${escapeHtml(displayTitle)}</span>
                    <span class="text-[10px] opacity-80">✦</span>
                </div>
            `;
            layer.addEventListener('click', () => openBookModal(b, theme));
            wrap.appendChild(layer);
        });

        return wrap;
    }

    // --- Pop-Out Book Modal ---

    function openBookModal(book, theme) {
        state.selectedBook = book;
        const displayTitle = cleanTitle(book.title);
        const displayAuthor = cleanAuthor(book.author);

        if (book.cover_url) {
            modalCover.style.backgroundImage = `url("${book.cover_url}")`;
            modalCover.style.backgroundColor = '#2c221e';
        } else {
            modalCover.style.backgroundImage = 'none';
            modalCover.style.backgroundColor = book.spine_color || theme.bg;
        }

        modalEmoji.innerText = theme.emoji;
        modalFileType.innerText = book.file_type || 'epub';
        modalBookTitle.innerText = displayTitle;
        modalBookAuthor.innerText = displayAuthor;

        modalDetailTitle.innerText = displayTitle;
        modalDetailAuthor.innerText = "by " + displayAuthor;
        modalDetailDesc.innerText = book.description || 'A cozy digital volume resting on your wooden shelf.';

        const shelf = state.shelves.find(s => s.id == book.shelf_id);
        modalShelfBadge.innerText = shelf ? `Shelf: ${shelf.name}` : 'Saved to your shelf';

        const prog = Math.round(book.reading_progress || 0);
        modalProgText.innerText = `${prog}% completed`;
        modalProgFill.style.width = `${prog}%`;

        // Highlight active style button
        const curStyle = book.spine_style || 'spine';
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

    function cleanTitle(raw) {
        if (!raw) return 'Untitled';
        return raw
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function cleanAuthor(raw) {
        if (!raw || raw.toLowerCase() === 'unknown') return 'Unknown Author';
        return raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    }

    function isLightColor(color) {
        if (!color) return false;
        if (color === '#f2cc8f' || color === '#e9c46a' || color === '#eed9c4' || color === '#81b29a') return true;
        return false;
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
