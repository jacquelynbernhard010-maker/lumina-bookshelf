/**
 * Lumina Bookshelf - Frontend Controller (IndexedDB + Supabase)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // State
    const state = {
        activeShelf: 'all',
        searchQuery: '',
        sortBy: 'latest',
        viewMode: localStorage.getItem('shelf_view_mode') || 'shelf',
        books: [],
        shelves: []
    };

    // DOM Elements
    const shelfNavList = document.getElementById('shelfNavList');
    const currentShelfTitle = document.getElementById('currentShelfTitle');
    const currentShelfDesc = document.getElementById('currentShelfDesc');
    const statsBadge = document.getElementById('statsBadge');
    const bookshelfView = document.getElementById('bookshelfView');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const sortSelect = document.getElementById('sortSelect');
    const themeToggle = document.getElementById('themeToggle');
    const viewButtons = document.querySelectorAll('.view-btn');

    // Modals
    const uploadModal = document.getElementById('uploadModal');
    const newShelfModal = document.getElementById('newShelfModal');
    const editBookModal = document.getElementById('editBookModal');
    const cloudSettingsModal = document.getElementById('cloudSettingsModal');

    // Cloud Status Elements
    const btnOpenCloudSettings = document.getElementById('btnOpenCloudSettings');
    const cloudStatusTitle = document.getElementById('cloudStatusTitle');
    const cloudStatusSub = document.getElementById('cloudStatusSub');
    const systemStatusLabel = document.getElementById('systemStatusLabel');
    const systemStatusDot = document.getElementById('systemStatusDot');

    // Buttons
    const btnOpenUpload = document.getElementById('btnOpenUpload');
    const btnOpenNewShelf = document.getElementById('btnOpenNewShelf');

    // Upload Elements
    const dropZone = document.getElementById('dropZone');
    const bookFileInput = document.getElementById('bookFileInput');
    const fileBanner = document.getElementById('fileBanner');
    const fileNameLabel = document.getElementById('fileNameLabel');
    const fileSizeLabel = document.getElementById('fileSizeLabel');
    const btnRemoveFile = document.getElementById('btnRemoveFile');
    const uploadForm = document.getElementById('uploadForm');
    const uploadProgressWrapper = document.getElementById('uploadProgressWrapper');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const btnSubmitUpload = document.getElementById('btnSubmitUpload');

    // Initialize Theme
    const savedTheme = localStorage.getItem('lumina_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initialize Storage Engine (IndexedDB + Supabase)
    await window.storageEngine.initIndexedDB();
    updateCloudStatusUI();

    // Init View Mode
    setViewMode(state.viewMode);

    // Initial Data Fetch
    await reloadData();

    // Setup Event Listeners
    setupEventListeners();

    function updateCloudStatusUI() {
        const config = window.storageEngine.getSupabaseConfig();
        if (config.isEnabled) {
            cloudStatusTitle.innerText = 'Supabase Cloud';
            cloudStatusSub.innerText = 'Connected & syncing';
            systemStatusLabel.innerHTML = 'Storage: <strong>Supabase Cloud</strong>';
            systemStatusDot.style.backgroundColor = '#10b981';
            systemStatusDot.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.6)';
        } else {
            cloudStatusTitle.innerText = 'Browser Storage';
            cloudStatusSub.innerText = 'Click to link Supabase Cloud';
            systemStatusLabel.innerHTML = 'Storage: <strong>IndexedDB (Offline)</strong>';
            systemStatusDot.style.backgroundColor = '#3b82f6';
            systemStatusDot.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.6)';
        }
    }

    async function reloadData() {
        await fetchShelves();
        await fetchBooks();
    }

    function setupEventListeners() {
        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('lumina_theme', next);
            updateThemeIcon(next);
        });

        // Search Input
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            searchClear.style.display = state.searchQuery ? 'block' : 'none';
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fetchBooks(), 250);
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            state.searchQuery = '';
            searchClear.style.display = 'none';
            fetchBooks();
        });

        // Sort Select
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            fetchBooks();
        });

        // View Mode Switcher
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => setViewMode(btn.dataset.view));
        });

        // Shelf Navigation
        shelfNavList.addEventListener('click', (e) => {
            const item = e.target.closest('.shelf-item');
            if (!item) return;

            document.querySelectorAll('.shelf-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            state.activeShelf = item.dataset.shelfId;
            const shelfName = item.querySelector('.shelf-name').innerText;
            currentShelfTitle.innerText = shelfName;
            currentShelfDesc.innerText = state.activeShelf === 'all'
                ? 'Viewing all digital books in your personal library'
                : `Books in shelf: ${shelfName}`;

            fetchBooks();
        });

        // Modal Triggers
        btnOpenUpload.addEventListener('click', () => openModal(uploadModal));
        btnOpenNewShelf.addEventListener('click', () => openModal(newShelfModal));
        btnOpenCloudSettings.addEventListener('click', () => {
            const cfg = window.storageEngine.getSupabaseConfig();
            document.getElementById('supabaseUrlInput').value = cfg.url;
            document.getElementById('supabaseKeyInput').value = cfg.key;
            openModal(cloudSettingsModal);
        });

        // Modal Close Buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                closeModal(e.target.closest('.modal-overlay'));
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(overlay);
            });
        });

        // Drag & Drop
        ['dragenter', 'dragover'].forEach(name => {
            dropZone.addEventListener(name, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            dropZone.addEventListener(name, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) handleSelectedFile(files[0]);
        });

        bookFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleSelectedFile(e.target.files[0]);
        });

        btnRemoveFile.addEventListener('click', () => {
            bookFileInput.value = '';
            fileBanner.style.display = 'none';
            dropZone.style.display = 'block';
        });

        // Forms
        uploadForm.addEventListener('submit', handleUploadSubmit);
        document.getElementById('newShelfForm').addEventListener('submit', handleCreateShelf);
        document.getElementById('editBookForm').addEventListener('submit', handleEditBookSubmit);
        document.getElementById('cloudSettingsForm').addEventListener('submit', handleCloudSettingsSubmit);
        document.getElementById('btnDisconnectCloud').addEventListener('click', handleDisconnectCloud);

        // Close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.book-actions-pill')) {
                document.querySelectorAll('.card-menu-dropdown.show').forEach(m => m.classList.remove('show'));
            }
        });
    }

    function setViewMode(mode) {
        state.viewMode = mode;
        localStorage.setItem('shelf_view_mode', mode);
        viewButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === mode));
        bookshelfView.className = mode === 'shelf' ? 'shelf-display-shelf' : 'shelf-display-grid';
        renderBooks();
    }

    function updateThemeIcon(theme) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fa-solid fa-moon"></i>' 
            : '<i class="fa-solid fa-sun"></i>';
    }

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        if (modal === uploadModal) {
            uploadForm.reset();
            fileBanner.style.display = 'none';
            dropZone.style.display = 'block';
            uploadProgressWrapper.style.display = 'none';
            btnSubmitUpload.disabled = false;
        }
    }

    function handleSelectedFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['epub', 'pdf', 'mobi'].includes(ext)) {
            showToast('Only .epub, .pdf, and .mobi files are allowed', 'error');
            return;
        }

        fileNameLabel.innerText = file.name;
        fileSizeLabel.innerText = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        dropZone.style.display = 'none';
        fileBanner.style.display = 'flex';

        const titleField = document.getElementById('bookTitleInput');
        if (!titleField.value) {
            titleField.placeholder = file.name.replace(/\.[^/.]+$/, "");
        }
    }

    // --- Data Fetching ---

    async function fetchShelves() {
        state.shelves = await window.storageEngine.getShelves();

        // Update modal selects
        const uploadSelect = document.getElementById('uploadShelfSelect');
        const editSelect = document.getElementById('editBookShelf');
        uploadSelect.innerHTML = '';
        editSelect.innerHTML = '';

        state.shelves.forEach(shelf => {
            const opt1 = new Option(shelf.name, shelf.id);
            const opt2 = new Option(shelf.name, shelf.id);
            uploadSelect.add(opt1);
            editSelect.add(opt2);
        });

        // Re-render shelf list in sidebar (keep "All Books" at top)
        const items = shelfNavList.querySelectorAll('.shelf-item:not([data-shelf-id="all"])');
        items.forEach(el => el.remove());

        state.shelves.forEach(shelf => {
            const li = document.createElement('li');
            li.className = `shelf-item ${state.activeShelf == shelf.id ? 'active' : ''}`;
            li.dataset.shelfId = shelf.id;
            li.innerHTML = `
                <a href="javascript:void(0)" class="shelf-link">
                    <span class="shelf-dot" style="background-color: ${escapeHtml(shelf.color)};"></span>
                    <span class="shelf-name">${escapeHtml(shelf.name)}</span>
                    <span class="shelf-count" id="shelf-count-${shelf.id}">0</span>
                </a>
            `;
            shelfNavList.appendChild(li);
        });
    }

    async function fetchBooks() {
        state.books = await window.storageEngine.getBooks(state.activeShelf, state.searchQuery, state.sortBy);
        statsBadge.innerText = `${state.books.length} ${state.books.length === 1 ? 'Book' : 'Books'}`;
        
        // Update total book count
        const allBooks = await window.storageEngine.getBooks('all');
        document.getElementById('totalBooksCount').innerText = allBooks.length;

        // Update badge counts for each shelf
        state.shelves.forEach(shelf => {
            const count = allBooks.filter(b => b.shelf_id == shelf.id).length;
            const badge = document.getElementById(`shelf-count-${shelf.id}`);
            if (badge) badge.innerText = count;
        });

        renderBooks();
    }

    function renderBooks() {
        bookshelfView.innerHTML = '';

        if (state.books.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        if (state.viewMode === 'shelf') {
            const booksPerRow = 5;
            for (let i = 0; i < state.books.length; i += booksPerRow) {
                const chunk = state.books.slice(i, i + booksPerRow);
                const rowEl = document.createElement('div');
                rowEl.className = 'bookshelf-row';

                const booksContainer = document.createElement('div');
                booksContainer.className = 'bookshelf-books';

                chunk.forEach(book => booksContainer.appendChild(createBookCard(book)));

                const woodShelf = document.createElement('div');
                woodShelf.className = 'bookshelf-wood-shelf';

                rowEl.appendChild(booksContainer);
                rowEl.appendChild(woodShelf);
                bookshelfView.appendChild(rowEl);
            }
        } else {
            state.books.forEach(book => bookshelfView.appendChild(createBookCard(book)));
        }
    }

    function createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.dataset.id = book.id;

        const progressPercent = Math.min(100, Math.max(0, Math.round(book.reading_progress || 0)));

        let coverHtml = '';
        if (book.cover_url) {
            coverHtml = `<img src="${escapeHtml(book.cover_url)}" alt="${escapeHtml(book.title)}" class="book-cover-img" loading="lazy">`;
        } else {
            coverHtml = `
                <div class="book-cover-generated">
                    <div class="cover-gen-ornament"><i class="fa-solid fa-feather-pointed"></i></div>
                    <div class="cover-gen-title">${escapeHtml(book.title)}</div>
                    <div class="cover-gen-author">${escapeHtml(book.author || 'Unknown')}</div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="book-spine-3d">
                <span class="book-badge-type">${escapeHtml(book.file_type || 'epub')}</span>
                <div class="book-actions-pill">
                    <button class="btn-card-menu" title="Options"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    <div class="card-menu-dropdown">
                        <button class="card-menu-item btn-read"><i class="fa-solid fa-book-open"></i> Read</button>
                        <button class="card-menu-item btn-edit"><i class="fa-solid fa-pen"></i> Edit / Move</button>
                        <button class="card-menu-item danger-text btn-delete"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </div>
                ${coverHtml}
                <div class="book-progress-stripe">
                    <div class="book-progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>
            <div class="book-details">
                <div class="book-info-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
                <div class="book-info-author">${escapeHtml(book.author || 'Unknown Author')}</div>
            </div>
        `;

        // Click opens reader
        card.addEventListener('click', (e) => {
            if (e.target.closest('.book-actions-pill') || e.target.closest('.card-menu-dropdown')) return;
            window.location.href = `reader.html?id=${book.id}`;
        });

        // Dropdown toggle
        const menuBtn = card.querySelector('.btn-card-menu');
        const menuDropdown = card.querySelector('.card-menu-dropdown');
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.card-menu-dropdown.show').forEach(m => {
                if (m !== menuDropdown) m.classList.remove('show');
            });
            menuDropdown.classList.toggle('show');
        });

        // Actions
        card.querySelector('.btn-read').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `reader.html?id=${book.id}`;
        });

        card.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.remove('show');
            openEditModal(book);
        });

        card.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.remove('show');
            handleDeleteBook(book.id, book.title);
        });

        return card;
    }

    // --- Upload Handler ---

    async function handleUploadSubmit(e) {
        e.preventDefault();
        const file = bookFileInput.files[0];
        if (!file) {
            showToast('Please select a book file first', 'error');
            return;
        }

        const title = document.getElementById('bookTitleInput').value.trim();
        const author = document.getElementById('bookAuthorInput').value.trim();
        const shelf_id = document.getElementById('uploadShelfSelect').value;
        const cover_file = document.getElementById('coverFileInput').files[0];

        btnSubmitUpload.disabled = true;
        uploadProgressWrapper.style.display = 'block';
        uploadProgressBar.style.width = '40%';
        uploadProgressText.innerText = 'Saving book to storage...';

        try {
            const saved = await window.storageEngine.saveBook({
                file,
                title,
                author,
                shelf_id,
                cover_file
            });

            uploadProgressBar.style.width = '100%';
            showToast(`"${saved.title}" added to shelf!`, 'success');
            closeModal(uploadModal);
            await reloadData();
        } catch (err) {
            console.error(err);
            showToast('Failed to save book: ' + err.message, 'error');
            btnSubmitUpload.disabled = false;
            uploadProgressWrapper.style.display = 'none';
        }
    }

    // --- Shelf Handler ---

    async function handleCreateShelf(e) {
        e.preventDefault();
        const nameInput = document.getElementById('shelfNameInput');
        const colorInput = document.querySelector('input[name="shelfColor"]:checked');
        const name = nameInput.value.trim();
        const color = colorInput ? colorInput.value : '#3b82f6';

        if (!name) return;

        try {
            await window.storageEngine.createShelf(name, color);
            showToast(`Shelf "${name}" created!`, 'success');
            closeModal(newShelfModal);
            nameInput.value = '';
            await reloadData();
        } catch (err) {
            showToast('Failed to create shelf', 'error');
        }
    }

    // --- Edit Book Handler ---

    function openEditModal(book) {
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author || '';
        document.getElementById('editBookShelf').value = book.shelf_id || 1;
        openModal(editBookModal);
    }

    async function handleEditBookSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('editBookId').value;
        const title = document.getElementById('editBookTitle').value.trim();
        const author = document.getElementById('editBookAuthor').value.trim();
        const shelf_id = document.getElementById('editBookShelf').value;

        try {
            await window.storageEngine.updateBookMeta(id, { title, author, shelf_id });
            showToast('Book details updated', 'success');
            closeModal(editBookModal);
            await reloadData();
        } catch (err) {
            showToast('Failed to update book', 'error');
        }
    }

    // --- Delete Book Handler ---

    async function handleDeleteBook(id, title) {
        if (!confirm(`Are you sure you want to remove "${title}" from your library?`)) return;

        try {
            await window.storageEngine.deleteBook(id);
            showToast(`"${title}" deleted`, 'success');
            await reloadData();
        } catch (err) {
            showToast('Failed to delete book', 'error');
        }
    }

    // --- Cloud Settings Handler ---

    async function handleCloudSettingsSubmit(e) {
        e.preventDefault();
        const url = document.getElementById('supabaseUrlInput').value.trim();
        const key = document.getElementById('supabaseKeyInput').value.trim();

        if (!url || !key) {
            showToast('Please enter both Supabase URL and Anon Key', 'error');
            return;
        }

        window.storageEngine.setSupabaseConfig(url, key);
        updateCloudStatusUI();
        showToast('Supabase cloud connected!', 'success');
        closeModal(cloudSettingsModal);
        await reloadData();
    }

    function handleDisconnectCloud() {
        window.storageEngine.setSupabaseConfig('', '');
        updateCloudStatusUI();
        showToast('Disconnected from cloud. Using local IndexedDB.', 'success');
        closeModal(cloudSettingsModal);
        reloadData();
    }

    // --- Utilities ---

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
