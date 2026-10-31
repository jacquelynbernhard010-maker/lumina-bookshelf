/**
 * The Cozy Nook - EPUB Extractor with Dominant Color Sampling & Persistent Cover Extraction
 */

class EpubExtractor {
    static async extract(file) {
        return new Promise(async (resolve) => {
            const cleanFileName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[_-]+/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            const fallback = {
                title: cleanFileName,
                author: "Unknown Author",
                description: "",
                cover_url: "",
                dominant_color: "#e07a5f",
                file_blob: file
            };

            const ext = file.name.split('.').pop().toLowerCase();
            if (ext !== 'epub' || typeof ePub === 'undefined') {
                return resolve(fallback);
            }

            try {
                const arrayBuffer = await file.arrayBuffer();
                const book = ePub(arrayBuffer);

                let title = fallback.title;
                let author = fallback.author;
                let description = fallback.description;
                let coverUrl = '';
                let dominantColor = '#e07a5f';

                // Extract metadata
                const meta = await book.loaded.metadata;
                if (meta) {
                    if (meta.title && meta.title.trim()) {
                        title = meta.title.trim().replace(/[_-]+/g, " ");
                    }
                    if (meta.creator && meta.creator.trim()) {
                        author = meta.creator.trim().replace(/[_-]+/g, " ");
                    }
                    if (meta.description) {
                        description = meta.description.trim().replace(/<[^>]*>?/gm, '');
                    }
                }

                // Extract cover using ePub.js
                try {
                    let extractedCover = await book.coverUrl();
                    if (extractedCover) {
                        // Convert temporary blob: URL to permanent Base64 Data URL so it never expires!
                        coverUrl = await this.blobUrlToDataUrl(extractedCover);
                        dominantColor = await this.sampleDominantColor(coverUrl);
                    }
                } catch (coverErr) {
                    console.warn('Cover extraction error:', coverErr);
                }

                // Fallback: If no explicit cover, check first spine item for <img>
                if (!coverUrl && book.spine && book.spine.length > 0) {
                    try {
                        const firstSection = book.spine.get(0);
                        if (firstSection) {
                            await firstSection.load(book.load.bind(book));
                            const doc = firstSection.document;
                            if (doc) {
                                const img = doc.querySelector('img') || doc.querySelector('image');
                                if (img) {
                                    const src = img.getAttribute('src') || img.getAttribute('xlink:href');
                                    if (src) {
                                        const resolved = book.resolvePath ? book.resolvePath(src) : src;
                                        if (resolved) {
                                            coverUrl = await this.blobUrlToDataUrl(resolved);
                                            dominantColor = await this.sampleDominantColor(coverUrl);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (spineErr) {
                        console.warn('Spine cover fallback error:', spineErr);
                    }
                }

                resolve({
                    title,
                    author,
                    description,
                    cover_url: coverUrl,
                    dominant_color: dominantColor,
                    file_blob: file
                });
            } catch (err) {
                console.warn('EPUB parser error:', err);
                resolve(fallback);
            }
        });
    }

    // Converts temporary blob: URL to permanent Data URL (Base64)
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

    // Samples dominant color from cover image using HTML Canvas
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
