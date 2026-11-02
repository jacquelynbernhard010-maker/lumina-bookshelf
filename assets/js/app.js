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
        woodTheme: localStorage.getItem('cozy_wood_theme') || 'oak',
        plantLevel: 1
    };

    // 8 horizontal books (8 * 33px + 7 * 2px = 278px) reach right up to the top border of the 292px shelf bay
    const MAX_STACK_TO_BORDER = 8;

    // DOM Elements
    const shelvesContainer = document.getElementById('shelvesContainer');
    const shelfNavList = document.getElementById('shelfNavList');
    const totalBooksCount = document.getElementById('totalBooksCount');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const btnWoodTheme = document.getElementById('btnWoodTheme');
    const woodThemeLabel = document.getElementById('woodThemeLabel');
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

        // Wood Finish Switcher
        updateWoodThemeButtonUI();
        if (btnWoodTheme) {
            btnWoodTheme.addEventListener('click', () => {
                const themes = ['oak', 'walnut', 'sage'];
                const nextIdx = (themes.indexOf(state.woodTheme) + 1) % themes.length;
                state.woodTheme = themes[nextIdx];
                localStorage.setItem('cozy_wood_theme', state.woodTheme);
                updateWoodThemeButtonUI();
                const bookcaseEl = document.querySelector('.wooden-bookcase');
                if (bookcaseEl) {
                    bookcaseEl.className = `wooden-bookcase wood-${state.woodTheme}`;
                }
            });
        }

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

        // Re-pack shelves on window resize so spines always fill up to the right border
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (state.books.length > 0) renderShelves();
            }, 120);
        });

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

    function updateWoodThemeButtonUI() {
        if (!woodThemeLabel) return;
        const labels = {
            oak: 'Wood: Honey Oak',
            walnut: 'Wood: Deep Walnut',
            sage: 'Wood: Sage Pine'
        };
        woodThemeLabel.innerText = labels[state.woodTheme] || 'Wood: Honey Oak';
    }

    // Deterministic organic spine dimensions based on book title & author
    function getBookSpineMetrics(book) {
        const seedStr = `${book.title || ''}-${book.author || ''}-${book.id || 0}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const absHash = Math.abs(hash);
        const width = 56 + (absHash % 15); // 56px to 70px natural spine width
        const height = 222 + ((absHash >> 3) % 34); // 222px to 255px natural spine height reaching near top border
        return { width, height };
    }

    // Estimates the horizontal pixel width an upright book occupies on the shelf
    // Consecutive leaning books tuck parallel against each other (-3px), while the last leaning book needs +26px for its tilted top-right corner
    function getUprightBookWidth(book, nextBookOnShelf) {
        const style = book.spine_style || 'spine';
        if (style === 'front') return 140;
        const { width } = getBookSpineMetrics(book);
        if (style === 'leaning') {
            const nextIsLeaning = nextBookOnShelf && (nextBookOnShelf.spine_style === 'leaning');
            return nextIsLeaning ? (width - 3) : (width + 26);
        }
        return width;
    }

    /**
     * Automatically optimizes stacking and packs each shelf right up to the top and right borders:
     * - Stacks pile all the way up to the top border of the shelf (up to MAX_STACK_TO_BORDER = 8 horizontal books high).
     * - When a stack has only 1 or 2 horizontal books at the bottom, up to 3 spine-facing books can stand vertically on top of that bottom book (just like a real library bookcase).
     * - Multiple stacks and upright spines pack snugly right up to the right border of each shelf.
     */
    function packBooksIntoShelves(booksList, bayInnerWidth) {
        const GAP = 4;
        const STACK_WIDTH = 172; // 168px stack layer + 4px margin
        const stackedBooks = booksList.filter(b => b.spine_style === 'stacked');
        const explicitTopSpines = booksList.filter(b => b.spine_style === 'top-spine');
        const otherUprightBooks = booksList.filter(b => b.spine_style !== 'stacked' && b.spine_style !== 'top-spine');

        // Build stack columns:
        // If there are explicit 'top-spine' books and we have >2 stacked books, reserve 1-2 bottom stacked books per group of up to 3 top-spines first
        const stackGroups = [];
        let sIdx = 0;
        let topSpineQueue = [...explicitTopSpines];

        while (sIdx < stackedBooks.length) {
            // If user explicitly marked books as 'top-spine', make sure this stack has 1-2 bottom books so those spines can stand on top of it
            if (topSpineQueue.length > 0) {
                const baseCount = Math.min(2, stackedBooks.length - sIdx);
                const bottomBooks = stackedBooks.slice(sIdx, sIdx + baseCount);
                sIdx += baseCount;
                const topSpines = topSpineQueue.splice(0, 3);
                stackGroups.push({ bottomBooks, topSpines });
            } else {
                const slice = stackedBooks.slice(sIdx, sIdx + MAX_STACK_TO_BORDER);
                sIdx += slice.length;
                stackGroups.push({ bottomBooks: slice, topSpines: [] });
            }
        }

        // If any stack group naturally has only 1 or 2 bottom books and no topSpines yet,
        // automatically place up to 3 standing spine-facing books on top of those 1-2 bottom stacked books!
        const uprightPool = [...topSpineQueue, ...otherUprightBooks];
        stackGroups.forEach(group => {
            if ((group.bottomBooks.length === 1 || group.bottomBooks.length === 2) && group.topSpines.length < 3) {
                while (group.topSpines.length < 3) {
                    const spineCandidateIdx = uprightPool.findIndex(b => (b.spine_style || 'spine') === 'spine' || b.spine_style === 'top-spine');
                    if (spineCandidateIdx !== -1) {
                        group.topSpines.push(uprightPool.splice(spineCandidateIdx, 1)[0]);
                    } else {
                        break;
                    }
                }
            }
        });

        const shelves = [];
        let gPtr = 0;
        let uPtr = 0;

        while (gPtr < stackGroups.length || uPtr < uprightPool.length) {
            const shelf = { stacks: [], upright: [], usedWidth: 0 };

            // 1. Place as many stack columns on this shelf as fit up to the right border
            while (gPtr < stackGroups.length) {
                const gapNeeded = (shelf.stacks.length > 0 || shelf.upright.length > 0) ? GAP : 0;
                if (shelf.usedWidth + gapNeeded + STACK_WIDTH <= bayInnerWidth || (shelf.stacks.length === 0 && shelf.upright.length === 0)) {
                    shelf.stacks.push(stackGroups[gPtr]);
                    shelf.usedWidth += gapNeeded + STACK_WIDTH;
                    gPtr++;
                } else {
                    break;
                }
            }

            // 2. Pack upright books (spines / front / leaning) into the remaining width right up to the right border
            while (uPtr < uprightPool.length) {
                const candidate = uprightPool[uPtr];
                const nextCandidate = uprightPool[uPtr + 1] || null;
                const worstCaseW = getUprightBookWidth(candidate, null);
                const pairW = getUprightBookWidth(candidate, nextCandidate);
                const gapNeeded = (shelf.stacks.length > 0 || shelf.upright.length > 0) ? GAP : 0;

                const nextFitsToo = nextCandidate && (
                    shelf.usedWidth + gapNeeded + pairW + GAP + getUprightBookWidth(nextCandidate, null) <= bayInnerWidth
                );
                const effectiveW = nextFitsToo ? pairW : worstCaseW;

                if (shelf.usedWidth + gapNeeded + effectiveW <= bayInnerWidth || (shelf.stacks.length === 0 && shelf.upright.length === 0)) {
                    shelf.upright.push(candidate);
                    shelf.usedWidth += gapNeeded + effectiveW;
                    uPtr++;
                } else {
                    break;
                }
            }

            shelves.push(shelf);
        }

        if (shelves.length === 0) {
            shelves.push({ stacks: [], upright: [], usedWidth: 0 });
        }

        return shelves;
    }

    function renderShelves() {
        shelvesContainer.innerHTML = '';

        // Measure the real interior width of the wooden bookcase bay (container width minus 2*18px bookcase walls and 2*10px bay padding)
        const containerWidth = shelvesContainer.clientWidth || 1024;
        const bayInnerWidth = Math.max(320, containerWidth - 56);

        const packedShelves = packBooksIntoShelves(state.books, bayInnerWidth);

        // Top accessory: Mochi sleeping on top of the wooden bookcase
        const topHeader = document.createElement('div');
        topHeader.className = 'flex items-end justify-between px-6 mb-[-3px] relative z-10';
        topHeader.innerHTML = `
            <div class="sleeping-cat flex items-center gap-1.5 bg-[#fdfaf3] px-3 py-1 rounded-full border-2 border-[#2c221e] shadow-[2px_2px_0px_#2c221e] text-sm select-none">
                <span class="font-bold text-xs text-[#524137]">Mochi is sleeping... zZz</span>
            </div>
        `;
        shelvesContainer.appendChild(topHeader);

        // Outer Wooden Bookcase Frame with selected wood stain
        const bookcase = document.createElement('div');
        bookcase.className = `wooden-bookcase wood-${state.woodTheme}`;

        // Top Wooden Crown Molding
        const crown = document.createElement('div');
        crown.className = 'bookcase-crown';
        bookcase.appendChild(crown);

        let globalThemeCounter = 0;

        packedShelves.forEach((shelfData, sIdx) => {
            const bay = document.createElement('div');
            bay.className = 'bookcase-bay';

            // Render all stack columns (up to 8 books reaching the top border, or 1-2 bottom books with standing spines on top)
            shelfData.stacks.forEach((stackGroup) => {
                bay.appendChild(createStackedBooksGroup(stackGroup, globalThemeCounter));
                globalThemeCounter += stackGroup.bottomBooks.length + stackGroup.topSpines.length;
            });

            // Render all upright spines / front / leaning books snugly across to the right border
            shelfData.upright.forEach((book) => {
                const theme = coverThemes[globalThemeCounter % coverThemes.length];
                globalThemeCounter++;
                bay.appendChild(createDoodleBook(book, theme));
            });

            const remainingSpace = bayInnerWidth - shelfData.usedWidth;

            // Cozy Brass Arch Bookend holding up the row of books when there is open room left on the shelf
            if ((shelfData.stacks.length > 0 || shelfData.upright.length > 0) && remainingSpace >= 52) {
                const bookend = document.createElement('div');
                bookend.className = 'shelf-bookend';
                bookend.title = 'Brass Library Bookend';
                bookend.innerHTML = `
                    <div class="brass-arch"></div>
                    <div class="brass-base"></div>
                `;
                bay.appendChild(bookend);
            }

            // Only show a slim "+ Slip in" slot on the last shelf if there is open space before the right border
            const isLastShelf = (sIdx === packedShelves.length - 1);
            if (isLastShelf && remainingSpace >= 120) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'border-2 border-dashed border-[#bfa88f] rounded-md w-14 h-44 flex flex-col items-center justify-center p-1.5 text-center text-xs text-[#8c735b] cursor-pointer hover:border-[#2c221e] hover:text-[#2c221e] transition-colors flex-shrink-0 select-none';
                emptySlot.innerHTML = `
                    <span class="text-base font-bold">+</span>
                    <span class="text-[11px] font-bold">Slip in</span>
                `;
                emptySlot.addEventListener('click', () => uploadModal.classList.add('active'));
                bay.appendChild(emptySlot);
            }

            // Solid Wooden Shelf Plank with Knots & Centered Nameplate
            const plank = document.createElement('div');
            plank.className = 'sketch-shelf flex items-center justify-between px-8';
            plank.innerHTML = `
                <div class="wood-knot" style="left: ${14 + (sIdx * 11) % 25}%;"></div>
                <div class="plank-plate">Shelf ${sIdx + 1}</div>
                <div class="wood-knot" style="left: ${82 - (sIdx * 7) % 20}%;"></div>
            `;

            bookcase.appendChild(bay);
            bookcase.appendChild(plank);
        });

        shelvesContainer.appendChild(bookcase);
    }

    function getRibbonClass(book) {
        const prog = Math.round(book.reading_progress || 0);
        if (prog >= 100) return 'dangle-ribbon is-completed';
        if (prog > 0) return 'dangle-ribbon in-progress';
        return 'dangle-ribbon';
    }

    // Creates an individual book item on the shelf (or standing on top of a 1-2 book bottom stack)
    function createDoodleBook(book, theme, customDimensions = null) {
        const item = document.createElement('div');
        const rawStyle = book.spine_style || 'spine';
        const style = customDimensions ? 'spine' : (rawStyle === 'top-spine' ? 'spine' : rawStyle);
        const color = book.spine_color || theme.bg;
        const displayTitle = cleanTitle(book.title);
        const displayAuthor = cleanAuthor(book.author);
        const ribbonClass = getRibbonClass(book);

        item.className = `doodle-book ${style === 'leaning' ? 'is-leaning' : ''}`;

        if (style === 'front') {
            // Front-Facing Cover
            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-front-cover">
                    <div class="${ribbonClass}" style="background-color: ${theme.ribbon};"></div>
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
            // Cozy Clothbound Hardcover Spine (Standing, Leaning, or Standing on top of a 1-2 book stack)
            const metrics = getBookSpineMetrics(book);
            const spineWidth = customDimensions ? customDimensions.width : metrics.width;
            const height = customDimensions ? customDimensions.height : metrics.height;
            const textColor = isLightColor(color) ? '#1e2d24' : '#fffdf7';

            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-body select-none" style="width: ${spineWidth}px; height: ${height}px; background-color: ${color}; color: ${textColor};">
                    <div class="${ribbonClass}" style="background: ${theme.ribbon};"></div>
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

    // Creates a stack column:
    // - Up to 8 horizontal books stacked all the way to the top border of the shelf
    // - Or 1-2 horizontal books at the bottom with spine-facing books standing directly on top of them!
    function createStackedBooksGroup(stackGroup, baseThemeIdx) {
        const { bottomBooks, topSpines } = stackGroup;
        const wrap = document.createElement('div');
        wrap.className = 'stack-group';
        const offsets = [-1.5, 1.5, -1, 2, -0.5, 1, -1.5, 0.5];

        // If there are standing spine-facing books resting on top of the 1-2 bottom stacked books, render them above the horizontal base
        if (topSpines && topSpines.length > 0) {
            const topRow = document.createElement('div');
            topRow.className = 'stack-top-spines';
            // Total usable vertical height is ~278px; each bottom horizontal book takes 35px (33px + 2px gap)
            const maxTopSpineHeight = 276 - (bottomBooks.length * 35);

            topSpines.forEach((tb, idx) => {
                const theme = coverThemes[(baseThemeIdx + bottomBooks.length + idx) % coverThemes.length];
                const naturalMetrics = getBookSpineMetrics(tb);
                const topSpineWidth = Math.min(53, Math.max(48, naturalMetrics.width - 8));
                const topSpineHeight = Math.min(maxTopSpineHeight, maxTopSpineHeight - ((idx * 7) % 14));
                topRow.appendChild(createDoodleBook(tb, theme, { width: topSpineWidth, height: topSpineHeight }));
            });

            wrap.appendChild(topRow);
        }

        // Render the horizontal stacked books at the bottom (or all the way to the top border)
        bottomBooks.forEach((b, i) => {
            const theme = coverThemes[(baseThemeIdx + i) % coverThemes.length];
            const color = b.spine_color || theme.bg;
            const displayTitle = cleanTitle(b.title);
            const displayAuthor = cleanAuthor(b.author);
            const textColor = isLightColor(color) ? '#1e2d24' : '#fffdf7';
            const offsetX = offsets[i % offsets.length];

            const layer = document.createElement('div');
            layer.className = 'doodle-book';
            layer.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="stack-layer select-none" style="background-color: ${color}; color: ${textColor}; transform: translateX(${offsetX}px);">
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
