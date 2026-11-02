/**
 * The Cozy Nook - EPUB & Official Book Cover Extractor
 * Multi-layer cover sourcing:
 * 1. Deep ZIP analysis (OPF cover-image, manifest id='cover', cover.* files, largest archive image)
 * 2. ePub.js book.coverUrl() fallback
 * 3. Free Online Service fallback (Open Library Covers API)
 * 4. Automatic dominant color sampling for book spine
 */

class EpubExtractor {
    static async extract(file) {
        const cleanFileName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        let title = cleanFileName;
        let author = "Unknown Author";
        let description = "";
        let coverUrl = "";
        let dominantColor = "#e07a5f";

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'epub') {
            try {
                // 1. First, attempt deep direct ZIP extraction from EPUB file
                if (typeof JSZip !== 'undefined') {
                    try {
                        const zipCover = await this.extractCoverFromZip(file);
                        if (zipCover) coverUrl = zipCover;
                    } catch (zipErr) {
                        console.warn('JSZip cover extraction attempt:', zipErr);
                    }
                }

                // 2. Extract metadata via ePub.js
                if (typeof ePub !== 'undefined') {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const book = ePub(arrayBuffer);
                        const meta = await book.loaded.metadata;
                        if (meta) {
                            if (meta.title && meta.title.trim()) title = meta.title.trim().replace(/[_-]+/g, " ");
                            if (meta.creator && meta.creator.trim()) author = meta.creator.trim().replace(/[_-]+/g, " ");
                            if (meta.description) description = meta.description.trim().replace(/<[^>]*>?/gm, '');
                        }

                        // If zip didn't find cover, try ePub.js coverUrl()
                        if (!coverUrl) {
                            try {
                                const epCover = await book.coverUrl();
                                if (epCover) coverUrl = await this.blobUrlToDataUrl(epCover);
                            } catch (e) {}
                        }
                    } catch (epubErr) {
                        console.warn('ePub.js metadata extraction error:', epubErr);
                    }
                }
            } catch (err) {
                console.warn('EPUB general extraction error:', err);
            }
        }

        // 3. Online fallback: If cover is missing or was a tiny placeholder, query free Open Library Covers API
        if (!coverUrl || (coverUrl.startsWith('data:') && coverUrl.length < 5000)) {
            try {
                const onlineCover = await this.fetchCoverFromOnline(title, author);
                if (onlineCover) coverUrl = onlineCover;
            } catch (onlineErr) {
                console.warn('Online cover search error:', onlineErr);
            }
        }

        // 4. Sample dominant color from cover image for spine
        if (coverUrl) {
            try {
                dominantColor = await this.sampleDominantColor(coverUrl);
            } catch (colErr) {
                dominantColor = '#e07a5f';
            }
        }

        return {
            title,
            author,
            description,
            cover_url: coverUrl,
            dominant_color: dominantColor,
            file_blob: file
        };
    }

    // Deep ZIP Extraction for Official Book Cover Images
    static async extractCoverFromZip(file) {
        if (typeof JSZip === 'undefined' || !file) return '';
        try {
            const zip = await JSZip.loadAsync(file);
            const fileKeys = Object.keys(zip.files);

            // Step A: Parse META-INF/container.xml to find the OPF file
            let opfPath = '';
            const containerFile = zip.file('META-INF/container.xml');
            if (containerFile) {
                const containerXml = await containerFile.async('text');
                const parser = new DOMParser();
                const containerDoc = parser.parseFromString(containerXml, 'application/xml');
                const rootfile = containerDoc.querySelector('rootfile');
                if (rootfile) opfPath = rootfile.getAttribute('full-path') || '';
            }

            // Step B: If OPF exists, check manifest for explicit cover item
            if (opfPath && zip.file(opfPath)) {
                const opfXml = await zip.file(opfPath).async('text');
                const parser = new DOMParser();
                const opfDoc = parser.parseFromString(opfXml, 'application/xml');
                const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

                let coverHref = '';

                // Check <meta name="cover" content="cover-id">
                const metaCover = opfDoc.querySelector('meta[name="cover"]');
                if (metaCover) {
                    const coverId = metaCover.getAttribute('content');
                    if (coverId) {
                        const item = opfDoc.querySelector(`manifest item[id="${coverId}"]`) || opfDoc.getElementById(coverId);
                        if (item) coverHref = item.getAttribute('href');
                    }
                }

                // Check <item properties="cover-image">
                if (!coverHref) {
                    const propItem = opfDoc.querySelector('manifest item[properties~="cover-image"]') || opfDoc.querySelector('item[properties*="cover-image"]');
                    if (propItem) coverHref = propItem.getAttribute('href');
                }

                // Check item with id containing cover
                if (!coverHref) {
                    const coverItem = opfDoc.querySelector('manifest item[id*="cover"]');
                    if (coverItem && coverItem.getAttribute('media-type', '').startsWith('image/')) {
                        coverHref = coverItem.getAttribute('href');
                    }
                }

                // Check guide <reference type="cover">
                if (!coverHref) {
                    const ref = opfDoc.querySelector('guide reference[type="cover"]');
                    if (ref) {
                        const href = ref.getAttribute('href');
                        if (href && /\.(jpg|jpeg|png|webp)$/i.test(href)) coverHref = href;
                    }
                }

                if (coverHref) {
                    const fullCoverPath = this.resolveRelativePath(opfDir, coverHref);
                    const matchingFile = zip.file(fullCoverPath) || zip.file(coverHref) || fileKeys.find(k => k.endsWith(coverHref));
                    if (matchingFile) {
                        return await this.zipEntryToDataUrl(matchingFile);
                    }
                }
            }

            // Step C: Scan zip for image files with 'cover' in filename (> 15 KB)
            const imageKeys = fileKeys.filter(k => /\.(jpg|jpeg|png|webp)$/i.test(k) && !k.startsWith('__MACOSX'));
            const coverKeys = imageKeys.filter(k => {
                const baseName = k.split('/').pop().toLowerCase();
                return baseName.includes('cover') || baseName.includes('titlepage') || baseName.includes('jacket');
            });

            for (const key of coverKeys) {
                const entry = zip.file(key);
                if (entry) {
                    const size = (entry._data && entry._data.uncompressedSize) || 0;
                    if (size > 15000 || size === 0) {
                        const dataUrl = await this.zipEntryToDataUrl(entry);
                        if (dataUrl) return dataUrl;
                    }
                }
            }

            // Step D: Find the LARGEST image in the archive (full-page book covers are almost always the largest image)
            if (imageKeys.length > 0) {
                let largestFile = null;
                let maxSize = 0;
                for (const k of imageKeys) {
                    const entry = zip.file(k);
                    if (entry) {
                        const size = (entry._data && entry._data.uncompressedSize) || 0;
                        if (size > maxSize) {
                            maxSize = size;
                            largestFile = entry;
                        }
                    }
                }
                if (largestFile && maxSize > 20000) { // > 20 KB
                    return await this.zipEntryToDataUrl(largestFile);
                }
            }

        } catch (e) {
            console.warn('extractCoverFromZip error:', e);
        }
        return '';
    }

    // Free Online Service Fallback: Open Library Covers API
    static async fetchCoverFromOnline(title, author) {
        try {
            const cleanT = title
                .replace(/\.[^/.]+$/, '')
                .replace(/[_-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const cleanA = (author && author !== 'Unknown Author') 
                ? author.replace(/[_-]+/g, ' ').trim() 
                : '';

            // Clean up queries (e.g. "Cyberpunk 2077 No Coincidence", "Cyberpunk 2077")
            const queryVariants = [];
            if (cleanT) {
                if (cleanA) queryVariants.push(`${cleanT} ${cleanA}`);
                queryVariants.push(cleanT);
                if (cleanT.includes(':')) queryVariants.push(cleanT.split(':')[0].trim());
            }

            for (const query of queryVariants) {
                if (!query || query.length < 3) continue;
                const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=title,author_name,cover_i,isbn&limit=5`;
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();
                if (data && data.docs && data.docs.length > 0) {
                    const match = data.docs.find(d => d.cover_i) || (data.docs[0].isbn ? data.docs[0] : null);
                    if (match && match.cover_i) {
                        return `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`;
                    } else if (match && match.isbn && match.isbn.length > 0) {
                        return `https://covers.openlibrary.org/b/isbn/${match.isbn[0]}-L.jpg`;
                    }
                }
            }
        } catch (err) {
            console.warn('fetchCoverFromOnline error:', err);
        }
        return '';
    }

    // Free Online Service Fallback: Google Books API + Open Library Synopsis & Book Preview
    static async fetchSynopsisFromOnline(title, author) {
        try {
            const cleanT = (title || '')
                .replace(/\.[^/.]+$/, '')
                .replace(/[:_-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const cleanA = (author && author !== 'Unknown Author')
                ? author.replace(/[:_-]+/g, ' ').replace(/\s+/g, ' ').trim()
                : '';

            const queryVariants = [];
            if (cleanT) {
                if (cleanA) queryVariants.push(`intitle:"${cleanT}" inauthor:"${cleanA}"`);
                if (cleanA) queryVariants.push(`${cleanT} ${cleanA}`);
                queryVariants.push(`intitle:"${cleanT}"`);
                queryVariants.push(cleanT);
            }

            // 1. Google Books Public API (https://www.googleapis.com/books/v1/volumes)
            for (const q of queryVariants) {
                if (!q || q.length < 3) continue;
                try {
                    const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`;
                    const gbRes = await fetch(gbUrl);
                    if (gbRes.ok) {
                        const gbData = await gbRes.json();
                        if (gbData && Array.isArray(gbData.items) && gbData.items.length > 0) {
                            // First pass: check volumeInfo.description directly
                            for (const item of gbData.items) {
                                const vInfo = item.volumeInfo || {};
                                if (vInfo.description) {
                                    const cleaned = this.cleanSynopsisText(vInfo.description);
                                    if (cleaned && cleaned.length >= 40) {
                                        return cleaned;
                                    }
                                }
                            }
                            // Second pass: fetch full volume detail from Google Books Volume endpoint
                            for (const item of gbData.items.slice(0, 2)) {
                                if (item.id) {
                                    try {
                                        const detailRes = await fetch(`https://www.googleapis.com/books/v1/volumes/${item.id}`);
                                        if (detailRes.ok) {
                                            const detailData = await detailRes.json();
                                            const fullDesc = detailData && detailData.volumeInfo && detailData.volumeInfo.description;
                                            if (fullDesc) {
                                                const cleaned = this.cleanSynopsisText(fullDesc);
                                                if (cleaned && cleaned.length >= 30) return cleaned;
                                            }
                                        }
                                    } catch (dErr) {}
                                }
                            }
                            // Third pass: check searchInfo.textSnippet
                            for (const item of gbData.items) {
                                const snippet = item.searchInfo && item.searchInfo.textSnippet;
                                if (snippet) {
                                    const cleaned = this.cleanSynopsisText(snippet);
                                    if (cleaned && cleaned.length >= 30) return cleaned;
                                }
                            }
                        }
                    }
                } catch (gbErr) {}
            }

            // 2. Fallback: Open Library Search + Works API
            const olQueries = [];
            if (cleanT) {
                if (cleanA) olQueries.push(`${cleanT} ${cleanA}`);
                olQueries.push(cleanT);
            }
            for (const q of olQueries) {
                if (!q || q.length < 3) continue;
                try {
                    const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,first_sentence&limit=5`;
                    const olRes = await fetch(olUrl);
                    if (!olRes.ok) continue;
                    const olData = await olRes.json();
                    if (olData && Array.isArray(olData.docs) && olData.docs.length > 0) {
                        for (const doc of olData.docs) {
                            if (doc.key) {
                                try {
                                    const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
                                    if (workRes.ok) {
                                        const workData = await workRes.json();
                                        let desc = workData.description;
                                        if (desc && typeof desc === 'object' && desc.value) desc = desc.value;
                                        if (typeof desc === 'string') {
                                            const cleaned = this.cleanSynopsisText(desc);
                                            if (cleaned && cleaned.length >= 30) return cleaned;
                                        }
                                    }
                                } catch (wErr) {}
                            }
                            if (doc.first_sentence) {
                                const fs = Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence;
                                const cleaned = this.cleanSynopsisText(fs);
                                if (cleaned && cleaned.length >= 25) return cleaned;
                            }
                        }
                    }
                } catch (olErr) {}
            }
        } catch (err) {
            console.warn('fetchSynopsisFromOnline error:', err);
        }
        return '';
    }

    // Extract description or opening chapter preview directly from EPUB ZIP archive
    static async extractSynopsisFromZip(file) {
        if (typeof JSZip === 'undefined' || !file) return '';
        try {
            const zip = await JSZip.loadAsync(file);
            let opfPath = '';
            const containerFile = zip.file('META-INF/container.xml');
            if (containerFile) {
                const containerXml = await containerFile.async('text');
                const parser = new DOMParser();
                const containerDoc = parser.parseFromString(containerXml, 'application/xml');
                const rootfile = containerDoc.querySelector('rootfile');
                if (rootfile) opfPath = rootfile.getAttribute('full-path') || '';
            }

            if (opfPath && zip.file(opfPath)) {
                const opfXml = await zip.file(opfPath).async('text');
                const parser = new DOMParser();
                const opfDoc = parser.parseFromString(opfXml, 'application/xml');
                const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

                // 1. Check <dc:description> or <description> in OPF metadata
                const descEl = opfDoc.getElementsByTagName('dc:description')[0] || opfDoc.querySelector('description');
                if (descEl && descEl.textContent) {
                    const cleaned = this.cleanSynopsisText(descEl.textContent);
                    if (cleaned && cleaned.length >= 30) return cleaned;
                }

                // 2. Otherwise extract opening text preview from early spine chapters
                const itemrefs = Array.from(opfDoc.querySelectorAll('spine itemref')).slice(0, 6);
                for (const ref of itemrefs) {
                    const idref = ref.getAttribute('idref');
                    if (!idref) continue;
                    const item = opfDoc.querySelector(`manifest item[id="${idref}"]`) || opfDoc.getElementById(idref);
                    if (!item) continue;
                    const href = item.getAttribute('href');
                    if (!href) continue;
                    const fullPath = this.resolveRelativePath(opfDir, href);
                    const chFile = zip.file(fullPath) || zip.file(href);
                    if (!chFile) continue;

                    const html = await chFile.async('text');
                    const htmlDoc = parser.parseFromString(html, 'text/html');
                    const paragraphs = Array.from(htmlDoc.querySelectorAll('p'))
                        .map(p => (p.textContent || '').replace(/\s+/g, ' ').trim())
                        .filter(t => t.length > 60 && !/copyright|all rights reserved|isbn|published by|table of contents/i.test(t));

                    if (paragraphs.length > 0) {
                        const excerpt = paragraphs.slice(0, 2).join(' ');
                        return excerpt.length > 420 ? excerpt.slice(0, 417).trim() + '...' : excerpt;
                    }
                }
            }
        } catch (e) {}
        return '';
    }

    static cleanSynopsisText(raw) {
        if (!raw) return '';
        const div = document.createElement('div');
        div.innerHTML = String(raw)
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/p>/gi, ' ');
        return (div.textContent || div.innerText || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Helper: Extracts only cover from a file blob (for background backfills)
    static async extractCoverOnly(file) {
        if (!file) return '';
        try {
            const zipCover = await this.extractCoverFromZip(file);
            if (zipCover && zipCover.length > 5000) return zipCover;

            if (typeof ePub !== 'undefined') {
                const arrayBuffer = await file.arrayBuffer();
                const book = ePub(arrayBuffer);
                const epCover = await book.coverUrl();
                if (epCover) {
                    const dataUrl = await this.blobUrlToDataUrl(epCover);
                    if (dataUrl && dataUrl.length > 5000) return dataUrl;
                }
            }
        } catch (e) {}
        return '';
    }

    // Converts zip entry to Data URL
    static async zipEntryToDataUrl(zipEntry) {
        try {
            const base64 = await zipEntry.async('base64');
            const name = zipEntry.name.toLowerCase();
            let mime = 'image/jpeg';
            if (name.endsWith('.png')) mime = 'image/png';
            else if (name.endsWith('.webp')) mime = 'image/webp';
            return `data:${mime};base64,${base64}`;
        } catch (e) {
            return '';
        }
    }

    static resolveRelativePath(base, relative) {
        if (!base || relative.startsWith('/') || relative.includes('://')) return relative.replace(/^\//, '');
        const stack = base.split('/').filter(Boolean);
        const parts = relative.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return stack.join('/');
    }

    static async blobUrlToDataUrl(blobUrl) {
        if (!blobUrl || blobUrl.startsWith('data:')) return blobUrl;
        try {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(blobUrl);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return blobUrl;
        }
    }

    static sampleDominantColor(imageUrl) {
        return new Promise((resolve) => {
            if (!imageUrl) return resolve('#e07a5f');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 30;
                    canvas.height = 30;
                    ctx.drawImage(img, 0, 0, 30, 30);
                    const data = ctx.getImageData(0, 0, 30, 30).data;
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let i = 0; i < data.length; i += 16) {
                        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
                        if (brightness > 30 && brightness < 235) {
                            r += data[i];
                            g += data[i+1];
                            b += data[i+2];
                            count++;
                        }
                    }
                    if (count > 0) {
                        r = Math.round(r / count);
                        g = Math.round(g / count);
                        b = Math.round(b / count);
                        return resolve(`rgb(${r}, ${g}, ${b})`);
                    }
                } catch (e) {}
                resolve('#e07a5f');
            };
            img.onerror = () => resolve('#e07a5f');
            img.src = imageUrl;
        });
    }
}

window.EpubExtractor = EpubExtractor;
