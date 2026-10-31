/**
 * Lumina Bookshelf - Storage Engine
 * Hybrid IndexedDB (Browser Memory) + Supabase Cloud Storage
 */

class StorageEngine {
    constructor() {
        this.dbName = 'LuminaBookshelfDB';
        this.dbVersion = 1;
        this.db = null;
        this.supabase = null;
        this.isCloudEnabled = false;

        this.initSupabase();
    }

    // Initialize Supabase if keys exist in localStorage
    initSupabase() {
        const url = localStorage.getItem('lumina_supabase_url');
        const key = localStorage.getItem('lumina_supabase_key');
        if (url && key && window.supabase) {
            try {
                this.supabase = window.supabase.createClient(url, key);
                this.isCloudEnabled = true;
            } catch (e) {
                console.warn('Could not initialize Supabase:', e);
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

    // Open or initialize IndexedDB
    async initIndexedDB() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
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

            req.onsuccess = async (e) => {
                this.db = e.target.result;
                await this.seedDefaultDataIfNeeded();
                resolve(this.db);
            };

            req.onerror = (e) => reject(e.target.error);
        });
    }

    async seedDefaultDataIfNeeded() {
        const shelves = await this.getLocalShelves();
        if (shelves.length === 0) {
            const defaultShelves = [
                { id: 1, name: 'Currently Reading', slug: 'currently-reading', color: '#3b82f6', icon: 'book-open' },
                { id: 2, name: 'Want to Read', slug: 'want-to-read', color: '#10b981', icon: 'bookmark' },
                { id: 3, name: 'Favorites', slug: 'favorites', color: '#f59e0b', icon: 'star' },
                { id: 4, name: 'Completed', slug: 'completed', color: '#8b5cf6', icon: 'check-circle' },
                { id: 5, name: 'Tech & Coding', slug: 'tech-coding', color: '#06b6d4', icon: 'terminal' }
            ];
            for (const s of defaultShelves) {
                await this.saveLocalShelf(s);
            }
        }

        const books = await this.getLocalBooks();
        if (books.length === 0) {
            try {
                // Fetch sample book
                const res = await fetch('assets/sample/the_time_machine.epub');
                if (res.ok) {
                    const blob = await res.blob();
                    await this.saveLocalBook({
                        title: 'The Time Machine',
                        author: 'H. G. Wells',
                        description: 'A classic science fiction novella about an English scientist who travels to the year 802,701 AD.',
                        file_blob: blob,
                        file_name: 'the_time_machine.epub',
                        file_size: blob.size,
                        file_type: 'epub',
                        cover_url: 'assets/sample/cover_time_machine.png',
                        shelf_id: 1,
                        reading_progress: 18,
                        last_cfi: ''
                    });
                }
            } catch (err) {
                console.warn('Could not seed sample book:', err);
            }
        }
    }

    // --- SHELVES API ---

    async getShelves() {
        if (this.isCloudEnabled) {
            try {
                const { data, error } = await this.supabase
                    .from('shelves')
                    .select('*')
                    .order('id', { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Supabase fetch shelves failed, falling back to local:', err);
            }
        }
        return this.getLocalShelves();
    }

    async createShelf(name, color = '#3b82f6') {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const shelfData = { name, slug, color, icon: 'shelf' };

        if (this.isCloudEnabled) {
            try {
                const { data, error } = await this.supabase.from('shelves').insert([shelfData]).select();
                if (!error && data && data.length > 0) {
                    await this.saveLocalShelf(data[0]);
                    return data[0];
                }
            } catch (err) {
                console.warn('Cloud shelf create failed:', err);
            }
        }

        const localId = Date.now();
        const localShelf = { id: localId, ...shelfData };
        await this.saveLocalShelf(localShelf);
        return localShelf;
    }

    // --- BOOKS API ---

    async getBooks(shelfId = 'all', searchQuery = '', sortBy = 'latest') {
        let books = [];
        if (this.isCloudEnabled) {
            try {
                let query = this.supabase.from('books').select('*');
                if (shelfId !== 'all') {
                    query = query.eq('shelf_id', parseInt(shelfId, 10));
                }
                const { data, error } = await query;
                if (!error && data) {
                    books = data;
                } else {
                    books = await this.getLocalBooks();
                }
            } catch (err) {
                books = await this.getLocalBooks();
            }
        } else {
            books = await this.getLocalBooks();
            if (shelfId !== 'all') {
                const sid = parseInt(shelfId, 10);
                books = books.filter(b => b.shelf_id === sid);
            }
        }

        // Filter search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            books = books.filter(b => 
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.description && b.description.toLowerCase().includes(q))
            );
        }

        // Sort
        books.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'progress') return (b.reading_progress || 0) - (a.reading_progress || 0);
            if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
            return (b.id || 0) - (a.id || 0);
        });

        return books;
    }

    async getBook(id) {
        id = isNaN(id) ? id : parseInt(id, 10);
        if (this.isCloudEnabled) {
            try {
                const { data, error } = await this.supabase.from('books').select('*').eq('id', id).single();
                if (!error && data) return data;
            } catch (err) {
                console.warn('Cloud getBook failed:', err);
            }
        }
        return this.getLocalBook(id);
    }

    async saveBook({ file, title, author, description, shelf_id, cover_file }) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let coverUrl = '';

        if (this.isCloudEnabled) {
            try {
                // 1. Upload file to Supabase storage bucket
                const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_\.-]/g, '_')}`;
                const { data: fileData, error: fileErr } = await this.supabase.storage
                    .from('books')
                    .upload(`files/${safeName}`, file);

                if (fileErr) throw fileErr;

                const { data: publicUrlData } = this.supabase.storage
                    .from('books')
                    .getPublicUrl(`files/${safeName}`);
                const fileUrl = publicUrlData.publicUrl;

                // 2. Upload cover if provided
                if (cover_file) {
                    const coverName = `covers/${Date.now()}_${cover_file.name.replace(/[^a-zA-Z0-9_\.-]/g, '_')}`;
                    await this.supabase.storage.from('books').upload(coverName, cover_file);
                    const { data: cUrlData } = this.supabase.storage.from('books').getPublicUrl(coverName);
                    coverUrl = cUrlData.publicUrl;
                }

                // 3. Insert record into Postgres
                const { data: bookRecord, error: dbErr } = await this.supabase.from('books').insert([{
                    title: title || file.name.replace(/\.[^/.]+$/, ''),
                    author: author || 'Unknown Author',
                    description: description || '',
                    file_url: fileUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: fileExt,
                    cover_url: coverUrl,
                    shelf_id: parseInt(shelf_id, 10) || 1,
                    reading_progress: 0,
                    last_cfi: ''
                }]).select();

                if (dbErr) throw dbErr;
                return bookRecord[0];
            } catch (err) {
                console.warn('Supabase upload failed, falling back to IndexedDB:', err);
            }
        }

        // Local IndexedDB fallback
        let localCoverUrl = '';
        if (cover_file) {
            localCoverUrl = await this.fileToDataUrl(cover_file);
        }

        const localRecord = {
            title: title || file.name.replace(/\.[^/.]+$/, ''),
            author: author || 'Unknown Author',
            description: description || '',
            file_blob: file,
            file_name: file.name,
            file_size: file.size,
            file_type: fileExt,
            cover_url: localCoverUrl,
            shelf_id: parseInt(shelf_id, 10) || 1,
            reading_progress: 0,
            last_cfi: '',
            created_at: new Date().toISOString()
        };

        const id = await this.saveLocalBook(localRecord);
        localRecord.id = id;
        return localRecord;
    }

    async updateProgress(id, progress, lastCfi = '') {
        id = isNaN(id) ? id : parseInt(id, 10);
        if (this.isCloudEnabled) {
            try {
                await this.supabase.from('books').update({
                    reading_progress: progress,
                    last_cfi: lastCfi
                }).eq('id', id);
            } catch (err) {}
        }
        await this.updateLocalBook(id, { reading_progress: progress, last_cfi: lastCfi });
    }

    async updateBookMeta(id, { title, author, shelf_id }) {
        id = isNaN(id) ? id : parseInt(id, 10);
        shelf_id = parseInt(shelf_id, 10);
        if (this.isCloudEnabled) {
            try {
                await this.supabase.from('books').update({
                    title, author, shelf_id
                }).eq('id', id);
            } catch (err) {}
        }
        await this.updateLocalBook(id, { title, author, shelf_id });
    }

    async deleteBook(id) {
        id = isNaN(id) ? id : parseInt(id, 10);
        if (this.isCloudEnabled) {
            try {
                await this.supabase.from('books').delete().eq('id', id);
            } catch (err) {}
        }
        await this.deleteLocalBook(id);
    }

    // --- IndexedDB Helpers ---

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

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

window.storageEngine = new StorageEngine();
