/**
 * The Cozy Nook - Storage Engine (IndexedDB + Supabase)
 * Supports Bookmarks, EPUB covers, reading modes, and shelf customization
 */

class StorageEngine {
    constructor() {
        this.dbName = 'CozyNookDB';
        this.dbVersion = 2;
        this.db = null;
        this.supabase = null;
        this.isCloudEnabled = false;

        this.initSupabase();
    }

    initSupabase() {
        const url = localStorage.getItem('lumina_supabase_url');
        const key = localStorage.getItem('lumina_supabase_key');
        if (url && key && window.supabase) {
            try {
                this.supabase = window.supabase.createClient(url, key);
                this.isCloudEnabled = true;
            } catch (e) {
                this.isCloudEnabled = false;
            }
        } else {
            this.isCloudEnabled = false;
        }
    }

    setSupabaseConfig(url, key) {
        if (!url || !key) {
            localStorage.removeItem('lumina_supabase_url');
            localStorage.removeItem('lumina_supabase_key');
            this.supabase = null;
            this.isCloudEnabled = false;
            return;
        }
        localStorage.setItem('lumina_supabase_url', url.trim());
        localStorage.setItem('lumina_supabase_key', key.trim());
        this.initSupabase();
    }

    getSupabaseConfig() {
        return {
            url: localStorage.getItem('lumina_supabase_url') || '',
            key: localStorage.getItem('lumina_supabase_key') || '',
            isEnabled: this.isCloudEnabled
        };
    }

    async initIndexedDB() {
        if (this.db) return this.db;

        const openDB = () => {
            return new Promise((resolve, reject) => {
                let isSettled = false;
                const timer = setTimeout(() => {
                    if (!isSettled) {
                        isSettled = true;
                        reject(new Error('IndexedDB open timed out after 4 seconds'));
                    }
                }, 4000);

                const req = indexedDB.open(this.dbName, this.dbVersion);

                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('shelves')) {
                        const shelfStore = db.createObjectStore('shelves', { keyPath: 'id', autoIncrement: true });
                        shelfStore.createIndex('slug', 'slug', { unique: true });
                    }
                    if (!db.objectStoreNames.contains('books')) {
                        const bookStore = db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
                        bookStore.createIndex('shelf_id', 'shelf_id', { unique: false });
                    }
                };

                req.onblocked = () => {
                    console.warn('CozyNookDB upgrade blocked by an existing open tab.');
                };

                req.onsuccess = async (e) => {
                    if (isSettled) return;
                    isSettled = true;
                    clearTimeout(timer);
                    this.db = e.target.result;
                    this.db.onversionchange = () => {
                        if (this.db) {
                            this.db.close();
                            this.db = null;
                        }
                    };
                    try {
                        await this.seedDefaultDataIfNeeded();
                    } catch (err) {
                        console.warn('Seed error ignored:', err);
                    }
                    resolve(this.db);
                };

                req.onerror = (e) => {
                    if (isSettled) return;
                    isSettled = true;
                    clearTimeout(timer);
                    reject(e.target.error || new Error('IndexedDB open failed'));
                };
            });
        };

        try {
            return await openDB();
        } catch (err) {
            console.warn('Primary IndexedDB initialization failed, starting auto-recovery:', err);
            try {
                await new Promise((resolve) => {
                    const delReq = indexedDB.deleteDatabase(this.dbName);
                    delReq.onsuccess = () => resolve();
                    delReq.onerror = () => resolve();
                    delReq.onblocked = () => resolve();
                });
                return await openDB();
            } catch (recoveryErr) {
                console.error('Self-healing IndexedDB recreation failed:', recoveryErr);
                return null;
            }
        }
    }

    async seedDefaultDataIfNeeded() {
        const shelves = await this.getLocalShelves();
        if (shelves.length === 0) {
            const defaultShelves = [
                { id: 1, name: 'Currently Reading', slug: 'currently-reading', color: '#e07a5f' },
                { id: 2, name: 'Favorites', slug: 'favorites', color: '#81b29a' }
            ];
            for (const s of defaultShelves) {
                await this.saveLocalShelf(s);
            }
        } else {
            // Clean up removed default shelves from existing local databases
            for (const s of shelves) {
                if (s.name === 'Bedtime Stories' || s.name === 'Poetry & Lore' || s.slug === 'bedtime-stories' || s.slug === 'poetry-lore') {
                    await this.deleteLocalShelf(s.id);
                }
            }
        }

        const books = await this.getLocalBooks();
        for (const b of books) {
            if (b.shelf_id === 3 || b.shelf_id === 4) {
                await this.updateLocalBook(b.id, { shelf_id: 1 });
            } else if (b.shelf_id === 2 && !b.is_favorite) {
                await this.updateLocalBook(b.id, { shelf_id: 1, is_favorite: true });
            }
        }

        if (books.length === 0) {
            try {
                const res = await fetch('assets/sample/the_time_machine.epub');
                if (res.ok) {
                    const blob = await res.blob();
                    await this.saveLocalBook({
                        title: 'The Time Machine',
                        author: 'H. G. Wells',
                        description: 'An English scientist invents a device that transports him into the distant year 802,701 AD.',
                        file_blob: blob,
                        file_name: 'the_time_machine.epub',
                        file_size: blob.size,
                        file_type: 'epub',
                        cover_url: 'assets/sample/cover_time_machine.png',
                        shelf_id: 1,
                        reading_progress: 18,
                        last_cfi: '',
                        bookmarks: [
                            { id: 1, cfi: 'epubcfi(/6/6[chapter1]!/4/2/1:0)', title: 'Chapter I: Introduction', date: 'Oct 31, 2026', snippet: 'The Time Traveller was expounding a recondite matter to us...' }
                        ],
                        spine_style: 'upright', // 'upright', 'leaning', or 'stacked'
                        spine_color: '#e07a5f'
                    });
                }
            } catch (err) {
                console.warn('Could not seed sample book:', err);
            }
        }
    }

    // --- SHELVES API ---

    async getShelves() {
        let shelves = [];
        if (this.isCloudEnabled && this.supabase) {
            try {
                const { data, error } = await this.supabase.from('shelves').select('*').order('id', { ascending: true });
                if (!error && data && data.length > 0) shelves = data;
            } catch (err) {}
        }
        if (shelves.length === 0) {
            try {
                shelves = await this.getLocalShelves();
            } catch (e) {
                shelves = [];
            }
        }
        shelves = shelves.filter(s => s.name !== 'Bedtime Stories' && s.name !== 'Poetry & Lore' && s.slug !== 'bedtime-stories' && s.slug !== 'poetry-lore');
        if (shelves.length === 0) {
            shelves = [
                { id: 1, name: 'Currently Reading', slug: 'currently-reading', color: '#e07a5f' },
                { id: 2, name: 'Favorites', slug: 'favorites', color: '#81b29a' }
            ];
        }
        return shelves;
    }

    async resetAllLocalData() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            await new Promise((resolve) => {
                const req = indexedDB.deleteDatabase(this.dbName);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
                req.onblocked = () => resolve();
            });
        } catch (e) {}

        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('cozy_') || k.startsWith('lumina_'))) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (e) {}
    }

    async createShelf(name, color = '#81b29a') {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const shelfData = { name, slug, color };

        if (this.isCloudEnabled) {
            try {
                const { data, error } = await this.supabase.from('shelves').insert([shelfData]).select();
                if (!error && data && data.length > 0) {
                    await this.saveLocalShelf(data[0]);
                    return data[0];
                }
            } catch (err) {}
        }

        const localShelf = { id: Date.now(), ...shelfData };
        await this.saveLocalShelf(localShelf);
        return localShelf;
    }

    // --- BOOKS API ---

    async getBooks(shelfId = 'all', searchQuery = '') {
        let books = await this.getLocalBooks();
        books.sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id));

        if (shelfId !== 'all') {
            const sid = parseInt(shelfId, 10);
            if (sid === 2) {
                // Favorites filter: books marked as favorite
                books = books.filter(b => b.is_favorite === true || b.shelf_id === 2);
            } else {
                books = books.filter(b => b.shelf_id === sid || !b.shelf_id);
            }
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            books = books.filter(b => 
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.description && b.description.toLowerCase().includes(q))
            );
        }

        return books;
    }

    async reorderBooks(orderedIds) {
        if (!Array.isArray(orderedIds)) return;
        for (let i = 0; i < orderedIds.length; i++) {
            const id = isNaN(orderedIds[i]) ? orderedIds[i] : parseInt(orderedIds[i], 10);
            await this.updateLocalBook(id, { sort_order: i + 1 });
        }
    }

    async getBook(id) {
        id = isNaN(id) ? id : parseInt(id, 10);
        return this.getLocalBook(id);
    }

    async saveBook({ file, title, author, description, shelf_id, cover_url, spine_color, spine_style, is_favorite }) {
        const fileExt = file.name.split('.').pop().toLowerCase();

        const localRecord = {
            title: title || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            author: author || 'Unknown Author',
            description: description || '',
            file_blob: file,
            file_name: file.name,
            file_size: file.size,
            file_type: fileExt,
            cover_url: cover_url || '',
            shelf_id: 1,
            is_favorite: Boolean(is_favorite),
            reading_progress: 0,
            last_cfi: '',
            bookmarks: [],
            spine_style: spine_style || 'spine',
            spine_color: spine_color || '#81b29a',
            sort_order: Date.now(),
            created_at: new Date().toISOString()
        };

        const id = await this.saveLocalBook(localRecord);
        localRecord.id = id;

        // If Cloud enabled, upload in background
        if (this.isCloudEnabled) {
            try {
                const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_\.-]/g, '_')}`;
                await this.supabase.storage.from('books').upload(`files/${safeName}`, file);
                const { data } = this.supabase.storage.from('books').getPublicUrl(`files/${safeName}`);
                await this.supabase.from('books').insert([{
                    title: localRecord.title,
                    author: localRecord.author,
                    description: localRecord.description,
                    file_url: data.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: fileExt,
                    cover_url: cover_url || '',
                    shelf_id: localRecord.shelf_id
                }]);
            } catch (err) {
                console.warn('Background cloud upload error:', err);
            }
        }

        return localRecord;
    }

    async updateProgress(id, progress, lastCfi = '') {
        id = isNaN(id) ? id : parseInt(id, 10);
        await this.updateLocalBook(id, { reading_progress: progress, last_cfi: lastCfi });
    }

    async addBookmark(bookId, bookmark) {
        bookId = isNaN(bookId) ? bookId : parseInt(bookId, 10);
        const book = await this.getLocalBook(bookId);
        if (!book) return false;

        const bookmarks = book.bookmarks || [];
        const newBookmark = {
            id: Date.now(),
            cfi: bookmark.cfi,
            title: bookmark.title || 'Bookmark',
            snippet: bookmark.snippet || '',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        bookmarks.push(newBookmark);
        await this.updateLocalBook(bookId, { bookmarks });
        return newBookmark;
    }

    async removeBookmark(bookId, bookmarkId) {
        bookId = isNaN(bookId) ? bookId : parseInt(bookId, 10);
        const book = await this.getLocalBook(bookId);
        if (!book) return false;

        const bookmarks = (book.bookmarks || []).filter(b => b.id !== bookmarkId);
        await this.updateLocalBook(bookId, { bookmarks });
        return true;
    }

    async updateBookSpineStyle(id, spine_style) {
        id = isNaN(id) ? id : parseInt(id, 10);
        await this.updateLocalBook(id, { spine_style });
    }

    async updateBook(id, updates) {
        id = isNaN(id) ? id : parseInt(id, 10);
        await this.updateLocalBook(id, updates);
    }

    async deleteBook(id) {
        id = isNaN(id) ? id : parseInt(id, 10);
        await this.deleteLocalBook(id);
    }

    // --- IndexedDB Primitives ---

    getLocalShelves() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('shelves', 'readonly');
            const store = tx.objectStore('shelves');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    }

    saveLocalShelf(shelf) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('shelves', 'readwrite');
            const store = tx.objectStore('shelves');
            store.put(shelf);
            tx.oncomplete = () => resolve(shelf);
        });
    }

    deleteLocalShelf(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('shelves', 'readwrite');
            const store = tx.objectStore('shelves');
            store.delete(id);
            tx.oncomplete = () => resolve(true);
        });
    }

    getLocalBooks() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    }

    getLocalBook(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }

    saveLocalBook(book) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('books', 'readwrite');
            const store = tx.objectStore('books');
            const req = store.add(book);
            req.onsuccess = (e) => resolve(e.target.result);
        });
    }

    updateLocalBook(id, updates) {
        return new Promise(async (resolve) => {
            const book = await this.getLocalBook(id);
            if (!book) return resolve(false);
            const updated = Object.assign(book, updates);
            const tx = this.db.transaction('books', 'readwrite');
            const store = tx.objectStore('books');
            store.put(updated);
            tx.oncomplete = () => resolve(true);
        });
    }

    deleteLocalBook(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('books', 'readwrite');
            const store = tx.objectStore('books');
            store.delete(id);
            tx.oncomplete = () => resolve(true);
        });
    }
}

window.storageEngine = new StorageEngine();
