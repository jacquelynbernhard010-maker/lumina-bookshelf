/**
 * The Cozy Nook - EPUB Metadata & Cover Extractor (Client-Side)
 * Uses ePub.js & JSZip to extract cover image, clean title, and author
 */

class EpubExtractor {
    static async extract(file) {
        return new Promise(async (resolve) => {
            const fallback = {
                title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
                author: "Unknown Author",
                description: "",
                cover_url: "",
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

                // Extract metadata
                const meta = await book.loaded.metadata;
                if (meta) {
                    if (meta.title && meta.title.trim()) title = meta.title.trim();
                    if (meta.creator && meta.creator.trim()) author = meta.creator.trim();
                    if (meta.description) description = meta.description.trim().replace(/<[^>]*>?/gm, '');
                }

                // Extract cover image
                try {
                    const extractedCover = await book.coverUrl();
                    if (extractedCover) {
                        coverUrl = extractedCover;
                    }
                } catch (coverErr) {
                    console.warn('Could not extract cover:', coverErr);
                }

                resolve({
                    title,
                    author,
                    description,
                    cover_url: coverUrl,
                    file_blob: file
                });
            } catch (err) {
                console.warn('EPUB parser error, using fallback:', err);
                resolve(fallback);
            }
        });
    }
}

window.EpubExtractor = EpubExtractor;
