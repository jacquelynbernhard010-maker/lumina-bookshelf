/**
 * The Cozy Nook - Hand-drawn Cozy Bookshelf Application
 * Restored from approved prototype handdrawn_cozy_shelf.html
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Whimsical color themes for hand-drawn book spines
    const coverThemes = [
        { bg: '#81b29a', text: '#1e2d24', ribbon: '#e07a5f' }, // Matcha
        { bg: '#e07a5f', text: '#fffdf7', ribbon: '#f2cc8f' }, // Terracotta
        { bg: '#f2cc8f', text: '#3f2b12', ribbon: '#81b29a' }, // Honey
        { bg: '#9d8189', text: '#fffdf7', ribbon: '#e07a5f' }, // Dusty Rose
        { bg: '#8ecae6', text: '#103b4f', ribbon: '#e07a5f' }, // Sky Blue
        { bg: '#e76f51', text: '#fffdf7', ribbon: '#f2cc8f' }, // Rust
        { bg: '#eed9c4', text: '#4a2e18', ribbon: '#81b29a' }, // Soft Oat
        { bg: '#e9c46a', text: '#2c221e', ribbon: '#e07a5f' }  // Little Prince Yellow
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
    const modalCoverTitleBox = document.getElementById('modalCoverTitleBox');
    const changeCoverFileInput = document.getElementById('changeCoverFileInput');
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
    const uploadCoverPreviewSection = document.getElementById('uploadCoverPreviewSection');
    const uploadCoverThumb = document.getElementById('uploadCoverThumb');
    const uploadCoverPlaceholder = document.getElementById('uploadCoverPlaceholder');
    const useDetectedCoverCheckbox = document.getElementById('useDetectedCoverCheckbox');
    const customCoverInput = document.getElementById('customCoverInput');
    const customCoverStatus = document.getElementById('customCoverStatus');
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
            storageModeLabel.innerText = 'Synced with Supabase Cloud';
            document.getElementById('cloudLabel').innerText = 'Cloud Connected';
        } else {
            storageModeLabel.innerText = 'Stored locally in your browser';
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

        // Change Cover Button inside Read Modal
        if (changeCoverFileInput) {
            changeCoverFileInput.addEventListener('change', async (e) => {
                if (!state.selectedBook || !e.target.files.length) return;
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    state.selectedBook.cover_url = dataUrl;
                    modalCover.style.backgroundImage = `url("${dataUrl}")`;
                    modalCover.style.backgroundColor = '#2c221e';
                    if (modalCoverTitleBox) modalCoverTitleBox.classList.add('hidden');

                    let dominantColor = state.selectedBook.spine_color;
                    if (window.EpubExtractor && window.EpubExtractor.sampleDominantColor) {
                        try {
                            dominantColor = await window.EpubExtractor.sampleDominantColor(dataUrl);
                            state.selectedBook.spine_color = dominantColor;
                        } catch (err) {}
                    }

                    await window.storageEngine.updateBook(state.selectedBook.id, {
                        cover_url: dataUrl,
                        spine_color: dominantColor
                    });

                    renderShelves();
                    showToast('Cover updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            });
        }

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

        // Custom Cover upload in Add Book modal
        if (customCoverInput) {
            customCoverInput.addEventListener('change', (e) => {
                if (!e.target.files.length) return;
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    state.extractedCoverUrl = dataUrl;
                    if (uploadCoverThumb) uploadCoverThumb.style.backgroundImage = `url("${dataUrl}")`;
                    if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'none';
                    if (useDetectedCoverCheckbox) useDetectedCoverCheckbox.checked = true;
                    if (customCoverStatus) customCoverStatus.innerText = file.name;

                    if (window.EpubExtractor && window.EpubExtractor.sampleDominantColor) {
                        try {
                            state.extractedDominantColor = await window.EpubExtractor.sampleDominantColor(dataUrl);
                        } catch (err) {}
                    }
                    showToast('Custom cover selected!', 'success');
                };
                reader.readAsDataURL(file);
            });
        }

        if (useDetectedCoverCheckbox) {
            useDetectedCoverCheckbox.addEventListener('change', () => {
                if (uploadCoverThumb) {
                    if (useDetectedCoverCheckbox.checked && state.extractedCoverUrl) {
                        uploadCoverThumb.style.backgroundImage = `url("${state.extractedCoverUrl}")`;
                        if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'none';
                    } else {
                        uploadCoverThumb.style.backgroundImage = 'none';
                        if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'block';
                    }
                }
            });
        }

        btnRemoveFile.addEventListener('click', () => {
            uploadForm.reset();
            fileBanner.classList.add('hidden');
            dropZone.classList.remove('hidden');
            if (uploadCoverPreviewSection) uploadCoverPreviewSection.classList.add('hidden');
            if (uploadCoverThumb) uploadCoverThumb.style.backgroundImage = 'none';
            if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'block';
            if (customCoverStatus) customCoverStatus.innerText = '';
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

        if (uploadCoverPreviewSection) {
            uploadCoverPreviewSection.classList.remove('hidden');
            if (state.extractedCoverUrl) {
                uploadCoverThumb.style.backgroundImage = `url("${state.extractedCoverUrl}")`;
                if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'none';
                if (useDetectedCoverCheckbox) useDetectedCoverCheckbox.checked = true;
                if (customCoverStatus) customCoverStatus.innerText = 'Official cover detected';
            } else {
                uploadCoverThumb.style.backgroundImage = 'none';
                if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'block';
                if (useDetectedCoverCheckbox) useDetectedCoverCheckbox.checked = false;
                if (customCoverStatus) customCoverStatus.innerText = 'No cover found in file';
            }
        }

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
        const cover_url = (useDetectedCoverCheckbox && useDetectedCoverCheckbox.checked) ? state.extractedCoverUrl : '';
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
            if (uploadCoverPreviewSection) uploadCoverPreviewSection.classList.add('hidden');
            if (uploadCoverThumb) uploadCoverThumb.style.backgroundImage = 'none';
            if (uploadCoverPlaceholder) uploadCoverPlaceholder.style.display = 'block';
            if (customCoverStatus) customCoverStatus.innerText = '';
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

            // Top shelf accessories on first shelf
            let accessoriesHtml = '';
            if (isFirstShelf) {
                accessoriesHtml = `
                    <div class="flex items-end justify-between px-6 mb-[-2px] relative z-10">
                        <div class="sleeping-cat flex items-center gap-1.5 bg-[#fdfaf3] px-3 py-1 rounded-full border-2 border-[#2c221e] shadow-[2px_2px_0px_#2c221e] text-sm select-none">
                            <span class="font-bold text-xs text-[#524137]">Mochi is sleeping... zZz</span>
                        </div>
                    </div>
                `;
            }

            // Shelf Book Box
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
            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-front-cover">
                    <div class="dangle-ribbon" style="background-color: ${theme.ribbon};"></div>
                    <span class="text-xs font-bold uppercase tracking-wide bg-black/60 px-2 py-0.5 rounded text-white self-start backdrop-blur-sm shadow-sm z-10">${escapeHtml(book.file_type || 'epub')}</span>
                    
                    ${book.cover_url ? '' : `
                    <div class="bg-[#fffdf7] border-2 border-[#2c221e] p-2.5 rounded-md text-[#2c221e] z-10 my-auto shadow-sm text-center">
                        <h4 class="font-lora font-bold text-xs line-clamp-3 leading-snug">${escapeHtml(displayTitle)}</h4>
                        <div class="w-8 h-[1px] bg-[#2c221e]/30 mx-auto my-1.5"></div>
                        <p class="font-lora italic text-[10px] text-[#5c4a3e] truncate">${escapeHtml(displayAuthor)}</p>
                    </div>
                    `}
                </div>
            `;

            const frontCoverEl = item.querySelector('.book-front-cover');
            if (book.cover_url) {
                frontCoverEl.style.backgroundImage = `url("${book.cover_url}")`;
                frontCoverEl.style.backgroundColor = '#2c221e';
            } else {
                frontCoverEl.style.backgroundColor = color;
                frontCoverEl.style.color = theme.text;
            }
        } else {
            // Cozy Clothbound Hardcover Spine (Standing or Leaning)
            const height = 196 + ((displayTitle.length * 3) % 18);
            const spineWidth = 64;
            const textColor = isLightColor(color) ? '#1e2d24' : '#fffdf7';

            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-body select-none" style="width: ${spineWidth}px; height: ${height}px; background-color: ${color}; color: ${textColor};">
                    <div class="dangle-ribbon" style="background: ${theme.ribbon};"></div>
                    <div class="spine-band"></div>
                    <div class="spine-title-frame">
                        <span class="spine-title-text">${escapeHtml(displayTitle)}</span>
                    </div>
                    <div class="spine-divider"></div>
                    <div class="spine-author-frame">
                        <span class="spine-author-text">${escapeHtml(displayAuthor)}</span>
                    </div>
                    <div class="spine-band"></div>
                </div>
            `;
        }

        item.addEventListener('click', () => openBookModal(book, theme));
        return item;
    }

    // Creates stacked books lying down horizontally
    function createStackedBooksGroup(booksInStack, baseThemeIdx) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-col gap-1.5 items-center pb-0.5 ml-2 flex-shrink-0';

        booksInStack.forEach((b, i) => {
            const theme = coverThemes[(baseThemeIdx + i) % coverThemes.length];
            const color = b.spine_color || theme.bg;
            const displayTitle = cleanTitle(b.title);
            const displayAuthor = cleanAuthor(b.author);
            const textColor = isLightColor(color) ? '#1e2d24' : '#fffdf7';

            const layer = document.createElement('div');
            layer.className = 'doodle-book';
            layer.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="stack-layer select-none" style="background-color: ${color}; color: ${textColor};">
                    <div class="stack-band-vert"></div>
                    <div class="flex-1 px-2 text-center overflow-hidden">
                        <div class="font-lora font-semibold text-[11px] leading-tight truncate">${escapeHtml(displayTitle)}</div>
                        <div class="font-lora italic text-[9px] opacity-85 truncate">${escapeHtml(displayAuthor)}</div>
                    </div>
                    <div class="stack-band-vert"></div>
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
            if (modalCoverTitleBox) modalCoverTitleBox.classList.add('hidden');
        } else {
            modalCover.style.backgroundImage = 'none';
            modalCover.style.backgroundColor = book.spine_color || theme.bg;
            if (modalCoverTitleBox) modalCoverTitleBox.classList.remove('hidden');
        }

        if (modalEmoji) modalEmoji.innerText = '';
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
        const c = color.trim();
        let r = 0, g = 0, b = 0;
        if (c.startsWith('#')) {
            const hex = c.slice(1);
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length >= 6) {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
            }
        } else if (c.startsWith('rgb')) {
            const match = c.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0], 10);
                g = parseInt(match[1], 10);
                b = parseInt(match[2], 10);
            }
        }
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.62;
    }

    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${escapeHtml(msg)}</span>`;

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
