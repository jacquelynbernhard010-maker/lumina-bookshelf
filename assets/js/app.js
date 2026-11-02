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
        extractedDescription: '',
        dragSource: null,
        plantLevel: 1
    };

    const MAX_STACK_SIZE = 5;

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
    const btnToggleFavorite = document.getElementById('btnToggleFavorite');
    const favoriteBtnText = document.getElementById('favoriteBtnText');
    const btnMoveBookPrev = document.getElementById('btnMoveBookPrev');
    const btnMoveBookNext = document.getElementById('btnMoveBookNext');
    const btnMoveStackPrev = document.getElementById('btnMoveStackPrev');
    const btnMoveStackNext = document.getElementById('btnMoveStackNext');
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
                updateStackMoveButtonsUI(newStyle === 'stacked');
                await window.storageEngine.updateBookSpineStyle(state.selectedBook.id, newStyle);
                showToast(`Shelf style: ${newStyle}`, 'success');
                renderShelves();
            });
        });

        // Shelf & Stack Reordering Buttons inside Read Modal
        if (btnMoveBookPrev) {
            btnMoveBookPrev.addEventListener('click', () => moveSelectedBook(-1));
        }
        if (btnMoveBookNext) {
            btnMoveBookNext.addEventListener('click', () => moveSelectedBook(1));
        }
        if (btnMoveStackPrev) {
            btnMoveStackPrev.addEventListener('click', () => moveSelectedStack(-1));
        }
        if (btnMoveStackNext) {
            btnMoveStackNext.addEventListener('click', () => moveSelectedStack(1));
        }

        // Toggle Favorite Button inside Read Modal
        if (btnToggleFavorite) {
            btnToggleFavorite.addEventListener('click', async () => {
                if (!state.selectedBook) return;
                const isFavNow = !(state.selectedBook.is_favorite === true || state.selectedBook.shelf_id === 2);
                state.selectedBook.is_favorite = isFavNow;
                if (!isFavNow && state.selectedBook.shelf_id === 2) {
                    state.selectedBook.shelf_id = 1;
                }

                updateFavoriteButtonUI(isFavNow);

                await window.storageEngine.updateBook(state.selectedBook.id, {
                    is_favorite: isFavNow,
                    shelf_id: state.selectedBook.shelf_id
                });

                showToast(isFavNow ? 'Marked as Favorite' : 'Removed from Favorites', 'success');
                await fetchBooks();
            });
        }

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
            state.extractedDescription = '';
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
        state.extractedDescription = extracted.description || '';

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
        const shelf_id = 1; // Always placed on Currently Reading; users can toggle Favorite in the book pop-up
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
            state.extractedDescription = '';

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

    // Group consecutive stacked books into stacks of up to MAX_STACK_SIZE (5)
    function buildVisualUnits(booksList) {
        const units = [];
        let idx = 0;
        while (idx < booksList.length) {
            const b = booksList[idx];
            if (b.spine_style === 'stacked') {
                const stackPile = [b];
                let nextIdx = idx + 1;
                while (
                    nextIdx < booksList.length &&
                    booksList[nextIdx].spine_style === 'stacked' &&
                    stackPile.length < MAX_STACK_SIZE
                ) {
                    stackPile.push(booksList[nextIdx]);
                    nextIdx++;
                }
                units.push({ type: 'stack', books: stackPile, startIndex: idx });
                idx = nextIdx;
            } else {
                units.push({ type: 'single', books: [b], startIndex: idx });
                idx++;
            }
        }
        return units;
    }

    async function persistCurrentBookOrder() {
        const orderedIds = state.books.map(b => b.id);
        state.books.forEach((b, idx) => {
            b.sort_order = (idx + 1) * 10;
        });
        await window.storageEngine.reorderBooks(orderedIds);
    }

    async function moveSelectedBook(delta) {
        if (!state.selectedBook) return;
        const idx = state.books.findIndex(b => b.id == state.selectedBook.id);
        if (idx === -1) return;
        const targetIdx = idx + delta;
        if (targetIdx < 0 || targetIdx >= state.books.length) {
            showToast(delta < 0 ? 'Already at the start of the shelf' : 'Already at the end of the shelf', 'info');
            return;
        }
        const temp = state.books[idx];
        state.books[idx] = state.books[targetIdx];
        state.books[targetIdx] = temp;
        await persistCurrentBookOrder();
        renderShelves();
        showToast('Moved book position', 'success');
    }

    async function moveSelectedStack(delta) {
        if (!state.selectedBook) return;
        const units = buildVisualUnits(state.books);
        const unitIdx = units.findIndex(u => u.books.some(b => b.id == state.selectedBook.id));
        if (unitIdx === -1) return;
        const targetUnitIdx = unitIdx + delta;
        if (targetUnitIdx < 0 || targetUnitIdx >= units.length) {
            showToast(delta < 0 ? 'Stack is already at the start' : 'Stack is already at the end', 'info');
            return;
        }
        const tempUnit = units[unitIdx];
        units[unitIdx] = units[targetUnitIdx];
        units[targetUnitIdx] = tempUnit;
        state.books = units.flatMap(u => u.books);
        await persistCurrentBookOrder();
        renderShelves();
        showToast('Moved entire stack', 'success');
    }

    async function reorderByDragDrop(draggedIds, targetIds, placeAfter) {
        if (!draggedIds || !draggedIds.length || !targetIds || !targetIds.length) return;
        const draggedSet = new Set(draggedIds.map(String));
        if (targetIds.some(id => draggedSet.has(String(id)))) return;

        const draggedBooks = state.books.filter(b => draggedSet.has(String(b.id)));
        const remainingBooks = state.books.filter(b => !draggedSet.has(String(b.id)));

        const anchorId = placeAfter ? targetIds[targetIds.length - 1] : targetIds[0];
        const anchorIdx = remainingBooks.findIndex(b => String(b.id) === String(anchorId));
        if (anchorIdx === -1) return;

        const insertIdx = placeAfter ? anchorIdx + 1 : anchorIdx;
        remainingBooks.splice(insertIdx, 0, ...draggedBooks);
        state.books = remainingBooks;

        await persistCurrentBookOrder();
        renderShelves();
        showToast(draggedIds.length > 1 ? 'Moved stack to new spot' : 'Reordered book on shelf', 'success');
    }

    function clearDragIndicators() {
        document.querySelectorAll('.drag-over-before, .drag-over-after, .is-dragging').forEach(el => {
            el.classList.remove('drag-over-before', 'drag-over-after', 'is-dragging');
        });
    }

    function attachDragAndDropHandlers(el, itemBookIds, isVerticalLayer = false) {
        el.setAttribute('draggable', 'true');

        el.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            state.dragSource = { ids: itemBookIds };
            el.classList.add('is-dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', JSON.stringify(itemBookIds));
            }
        });

        el.addEventListener('dragend', () => {
            state.dragSource = null;
            clearDragIndicators();
        });

        el.addEventListener('dragover', (e) => {
            if (!state.dragSource) return;
            e.preventDefault();
            e.stopPropagation();
            const draggedSet = new Set(state.dragSource.ids.map(String));
            if (itemBookIds.some(id => draggedSet.has(String(id)))) return;

            const rect = el.getBoundingClientRect();
            const placeAfter = isVerticalLayer
                ? (e.clientY - rect.top) > rect.height / 2
                : (e.clientX - rect.left) > rect.width / 2;

            el.classList.toggle('drag-over-before', !placeAfter);
            el.classList.toggle('drag-over-after', placeAfter);
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over-before', 'drag-over-after');
        });

        el.addEventListener('drop', async (e) => {
            if (!state.dragSource) return;
            e.preventDefault();
            e.stopPropagation();
            const draggedIds = state.dragSource.ids;
            state.dragSource = null;

            const rect = el.getBoundingClientRect();
            const placeAfter = isVerticalLayer
                ? (e.clientY - rect.top) > rect.height / 2
                : (e.clientX - rect.left) > rect.width / 2;

            clearDragIndicators();
            await reorderByDragDrop(draggedIds, itemBookIds, placeAfter);
        });
    }

    function renderShelves() {
        shelvesContainer.innerHTML = '';

        // Group stacked books (max 5 per stack) into visual units so stacks never grow taller than 5 or split across shelves
        const visualUnits = buildVisualUnits(state.books);
        const unitsPerShelf = 5;
        const shelfCount = Math.max(1, Math.ceil(visualUnits.length / unitsPerShelf));

        for (let sIdx = 0; sIdx < shelfCount; sIdx++) {
            const unitChunk = visualUnits.slice(sIdx * unitsPerShelf, (sIdx + 1) * unitsPerShelf);
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
                        <span class="text-[11px] font-bold text-[#7c6855] select-none hidden sm:inline">Tip: Drag any book or stack to rearrange your shelf</span>
                    </div>
                `;
            }

            // Fixed-height Shelf Book Box (h-[305px] max-h-[305px]) so stacks of up to 5 books never cause the shelf to grow taller
            const box = document.createElement('div');
            box.className = 'bg-[#fffcf7] px-6 pt-20 pb-2 border-x-2 border-t-2 border-[#2c221e] rounded-t-2xl shadow-inner h-[305px] max-h-[305px] flex items-end gap-3 md:gap-4 overflow-x-auto overflow-y-hidden';

            unitChunk.forEach((unit) => {
                if (unit.type === 'stack') {
                    box.appendChild(createStackedBooksGroup(unit.books, unit.startIndex));
                } else {
                    const book = unit.books[0];
                    const theme = coverThemes[unit.startIndex % coverThemes.length];
                    box.appendChild(createDoodleBook(book, theme));
                }
            });

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

        attachDragAndDropHandlers(item, [book.id], false);
        item.addEventListener('click', () => openBookModal(book, theme));
        return item;
    }

    // Creates stacked books lying down horizontally (max 5 books per stack)
    function createStackedBooksGroup(booksInStack, baseThemeIdx) {
        const wrap = document.createElement('div');
        wrap.className = 'stack-group';
        const stackIds = booksInStack.map(b => b.id);

        // Drag handle at the top of the stack to move the entire stack together
        const stackHandle = document.createElement('div');
        stackHandle.className = 'stack-handle';
        stackHandle.title = 'Drag to move this entire stack';
        stackHandle.innerText = `Move Stack (${booksInStack.length}/${MAX_STACK_SIZE})`;
        attachDragAndDropHandlers(stackHandle, stackIds, false);
        wrap.appendChild(stackHandle);

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
            // Each book inside the stack can also be dragged individually to reorder within the stack or moved out
            attachDragAndDropHandlers(layer, [b.id], true);
            layer.addEventListener('click', () => openBookModal(b, theme));
            wrap.appendChild(layer);
        });

        return wrap;
    }

    // --- Pop-Out Book Modal ---

    function updateStackMoveButtonsUI(isStacked) {
        if (btnMoveStackPrev) btnMoveStackPrev.classList.toggle('hidden', !isStacked);
        if (btnMoveStackNext) btnMoveStackNext.classList.toggle('hidden', !isStacked);
    }

    function updateFavoriteButtonUI(isFav) {
        if (!btnToggleFavorite || !favoriteBtnText) return;
        if (isFav) {
            btnToggleFavorite.className = 'hand-btn hand-btn-sm bg-[#f2cc8f] text-[#2c221e] text-xs font-bold py-1 px-3 flex items-center gap-1.5';
            favoriteBtnText.innerText = 'Favorited';
            if (modalShelfBadge) modalShelfBadge.innerText = 'In Favorites';
        } else {
            btnToggleFavorite.className = 'hand-btn hand-btn-sm bg-white text-[#2c221e] text-xs font-bold py-1 px-3 flex items-center gap-1.5';
            favoriteBtnText.innerText = 'Mark as Favorite';
            if (modalShelfBadge) modalShelfBadge.innerText = 'Shelf: Currently Reading';
        }
    }

    async function openBookModal(book, theme) {
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

        const isFav = book.is_favorite === true || book.shelf_id === 2;
        updateFavoriteButtonUI(isFav);

        const prog = Math.round(book.reading_progress || 0);
        modalProgText.innerText = `${prog}% completed`;
        modalProgFill.style.width = `${prog}%`;

        // Highlight active style button
        const curStyle = book.spine_style || 'spine';
        updateStackMoveButtonsUI(curStyle === 'stacked');
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
