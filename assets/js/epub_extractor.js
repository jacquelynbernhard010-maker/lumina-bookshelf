/**
 * The Cozy Nook - EPUB & Cover Extractor
 * Multi-layer cover sourcing:
 * 1. Deep ZIP analysis (OPF cover-image, manifest id='cover', cover.* files, spine <img>, largest image)
 * 2. ePub.js book.coverUrl() fallback
 * 3. Free Online Service fallback (Open Library Covers API)
 * 4. Automatic dominant color sampling for the book spine
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
                // 1. First, attempt direct ZIP extraction for cover image and metadata
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

        // 3. Online fallback: If cover is STILL missing, query free Open Library Covers API
        if (!coverUrl && title) {
            try {
                coverUrl = await this.fetchCoverFromOnline(title, author);
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

    // Deep ZIP Extraction for Cover Images
    static async extractCoverFromZip(file) {
        if (typeof JSZip === 'undefined') return '';
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

            // Step C: Scan zip for any image whose name or path contains 'cover'
            const imageKeys = fileKeys.filter(k => /\.(jpg|jpeg|png|webp)$/i.test(k) && !k.startsWith('__MACOSX'));
            const coverKeys = imageKeys.filter(k => /cover/i.test(k));

            if (coverKeys.length > 0) {
                // Prefer filename containing 'cover' over directory name containing 'cover'
                coverKeys.sort((a, b) => {
                    const aName = a.split('/').pop().toLowerCase();
                    const bName = b.split('/').pop().toLowerCase();
                    const aHas = aName.includes('cover') ? 1 : 0;
                    const bHas = bName.includes('cover') ? 1 : 0;
                    return bHas - aHas;
                });
                return await this.zipEntryToDataUrl(zip.file(coverKeys[0]));
            }

            // Step D: Scan first HTML/XHTML file for <img> or <image>
            const htmlKeys = fileKeys.filter(k => /\.(xhtml|html|htm)$/i.test(k) && !k.startsWith('__MACOSX'));
            for (let i = 0; i < Math.min(htmlKeys.length, 3); i++) {
                const htmlFile = zip.file(htmlKeys[i]);
                if (htmlFile) {
                    const text = await htmlFile.async('text');
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const img = doc.querySelector('img') || doc.querySelector('image');
                    if (img) {
                        const src = img.getAttribute('src') || img.getAttribute('xlink:href');
                        if (src) {
                            const htmlDir = htmlKeys[i].includes('/') ? htmlKeys[i].substring(0, htmlKeys[i].lastIndexOf('/') + 1) : '';
                            const resolved = this.resolveRelativePath(htmlDir, src);
                            const found = zip.file(resolved) || fileKeys.find(k => k.endsWith(src.split('/').pop()));
                            if (found) return await this.zipEntryToDataUrl(zip.file(found));
                        }
                    }
                }
            }

            // Step E: Find the largest image in the archive (book covers are typically highest resolution)
            if (imageKeys.length > 0) {
                let largestFile = null;
                let maxSize = 0;
                for (const k of imageKeys) {
                    const entry = zip.file(k);
                    if (entry && entry._data && entry._data.uncompressedSize) {
                        if (entry._data.uncompressedSize > maxSize) {
                            maxSize = entry._data.uncompressedSize;
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
            const cleanT = title.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
            const cleanA = (author && author !== 'Unknown Author') ? author.replace(/[_-]+/g, ' ').trim() : '';

            // Clean up queries (e.g. "Cyberpunk 2077 No Coincidence" -> "Cyberpunk 2077")
            const queryVariants = [
                cleanA ? `${cleanT} ${cleanA}` : cleanT,
                cleanT,
                cleanT.split(':')[0].trim()
            ];

            for (const query of queryVariants) {
                if (!query || query.length < 3) continue;
                const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=title,author_name,cover_i,isbn&limit=5`;
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();
                if (data && data.docs && data.docs.length > 0) {
                    const match = data.docs.find(d => d.cover_i) || (data.docs[0].isbn ? data.docs[0] : null);
                    if (match && match.cover_i) {
                        const coverImgUrl = `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`;
                        return await this.imageUrlToDataUrl(coverImgUrl);
                    } else if (match && match.isbn && match.isbn.length > 0) {
                        const coverImgUrl = `https://covers.openlibrary.org/b/isbn/${match.isbn[0]}-L.jpg`;
                        return await this.imageUrlToDataUrl(coverImgUrl);
                    }
                }
            }
        } catch (err) {
            console.warn('fetchCoverFromOnline error:', err);
        }
        return '';
    }

    // Helper: Extracts only cover from a file blob (for background backfills)
    static async extractCoverOnly(file) {
        if (!file) return '';
        try {
            const zipCover = await this.extractCoverFromZip(file);
            if (zipCover) return zipCover;

            if (typeof ePub !== 'undefined') {
                const arrayBuffer = await file.arrayBuffer();
                const book = ePub(arrayBuffer);
                const epCover = await book.coverUrl();
                if (epCover) return await this.blobUrlToDataUrl(epCover);
            }
        } catch (e) {}
        return '';
    }

    // Converts a remote image URL to Base64 Data URL
    static imageUrlToDataUrl(url) {
        return new Promise((resolve) => {
            if (!url) return resolve('');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                } catch (e) {
                    resolve(url);
                }
            };
            img.onerror = () => resolve(url);
            img.src = url;
        });
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
