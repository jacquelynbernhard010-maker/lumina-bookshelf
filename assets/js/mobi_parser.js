/**
 * The Cozy Nook - MOBI & Kindle Ebook Parser
 * Pure client-side Palm Database & Mobipocket / PalmDOC LZ77 parser
 * Supports: .mobi, .prc, .azw, .azw3
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MobiParser = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class MobiParser {
        static async parse(buffer) {
            let ab;
            if (buffer instanceof ArrayBuffer) {
                ab = buffer;
            } else if (ArrayBuffer.isView(buffer)) {
                ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
            } else if (buffer && typeof buffer.arrayBuffer === 'function') {
                ab = await buffer.arrayBuffer();
            } else {
                throw new Error('Unsupported buffer format for MOBI parsing');
            }

            const u8 = new Uint8Array(ab);
            const view = new DataView(ab);

            if (u8.length < 78) {
                throw new Error('File too small to be a valid MOBI ebook');
            }

            // 1. PDB Database Name (32 bytes at offset 0)
            let nameBytes = u8.slice(0, 32);
            const nullIdx = nameBytes.indexOf(0);
            if (nullIdx !== -1) nameBytes = nameBytes.slice(0, nullIdx);
            const dbName = new TextDecoder('utf-8').decode(nameBytes).replace(/[_-]+/g, ' ').trim();

            // 2. Number of records (2 bytes at offset 76)
            const numRecords = view.getUint16(76, false);
            const offsets = [];
            for (let i = 0; i < numRecords; i++) {
                if (78 + i * 8 + 4 <= ab.byteLength) {
                    offsets.push(view.getUint32(78 + i * 8, false));
                }
            }

            const getRecordBytes = (idx) => {
                if (idx < 0 || idx >= offsets.length) return null;
                const start = offsets[idx];
                const end = (idx + 1 < offsets.length) ? offsets[idx + 1] : u8.length;
                if (start >= u8.length || start >= end) return null;
                return u8.slice(start, end);
            };

            // 3. Record 0: PalmDOC & MOBI & EXTH headers
            const rec0 = getRecordBytes(0);
            if (!rec0 || rec0.length < 16) {
                throw new Error('Invalid MOBI file: Record 0 is corrupt');
            }
            const view0 = new DataView(rec0.buffer, rec0.byteOffset, rec0.byteLength);

            const compression = view0.getUint16(0, false);
            const textLength = view0.getUint32(4, false);
            const textRecordCount = view0.getUint16(8, false);
            const recordSize = view0.getUint16(10, false);

            let title = dbName || 'Untitled Book';
            let author = 'Unknown Author';
            let description = '';
            let coverUrl = '';
            let encoding = 'utf-8';
            let firstImageIndex = textRecordCount + 1;

            // Check for 'MOBI' magic identifier at offset 16 of rec0
            const hasMobiMagic = rec0.length >= 20 &&
                rec0[16] === 0x4D && rec0[17] === 0x4F &&
                rec0[18] === 0x42 && rec0[19] === 0x49;

            if (hasMobiMagic) {
                const mobiHeaderLen = view0.getUint32(20, false);
                const encCode = view0.getUint32(28, false);
                if (encCode === 1252) encoding = 'windows-1252';

                // Full book name
                if (rec0.length >= 92) {
                    const nameOffset = view0.getUint32(84, false);
                    const nameLength = view0.getUint32(88, false);
                    if (nameOffset > 0 && nameLength > 0 && nameOffset + nameLength <= rec0.length) {
                        try {
                            const decodedTitle = new TextDecoder(encoding).decode(rec0.slice(nameOffset, nameOffset + nameLength)).trim();
                            if (decodedTitle) title = decodedTitle.replace(/[_-]+/g, ' ');
                        } catch (e) {}
                    }
                }

                // First non-book record index
                if (rec0.length >= 112) {
                    const firstNonBook = view0.getUint32(108, false);
                    if (firstNonBook > 0) firstImageIndex = firstNonBook;
                }

                // First image record index
                if (rec0.length >= 196) {
                    const fImg = view0.getUint32(192, false);
                    if (fImg > 0) firstImageIndex = fImg;
                }

                // EXTH Header Check (starts at 16 + mobiHeaderLen)
                const exthOffset = 16 + mobiHeaderLen;
                if (rec0.length >= exthOffset + 12 &&
                    rec0[exthOffset] === 0x45 && rec0[exthOffset + 1] === 0x58 &&
                    rec0[exthOffset + 2] === 0x54 && rec0[exthOffset + 3] === 0x48) {

                    const exthLen = view0.getUint32(exthOffset + 4, false);
                    const exthCount = view0.getUint32(exthOffset + 8, false);
                    let curOffset = exthOffset + 12;

                    for (let k = 0; k < exthCount && curOffset + 8 <= exthOffset + exthLen; k++) {
                        const tag = view0.getUint32(curOffset, false);
                        const tagLen = view0.getUint32(curOffset + 4, false);
                        if (tagLen < 8 || curOffset + tagLen > rec0.length) break;
                        const tagData = rec0.slice(curOffset + 8, curOffset + tagLen);

                        try {
                            if (tag === 100) { // Author
                                const a = new TextDecoder(encoding).decode(tagData).trim();
                                if (a) author = a.replace(/[_-]+/g, ' ');
                            } else if (tag === 503) { // Updated Title
                                const t = new TextDecoder(encoding).decode(tagData).trim();
                                if (t) title = t.replace(/[_-]+/g, ' ');
                            } else if (tag === 103) { // Description
                                const d = new TextDecoder(encoding).decode(tagData).trim();
                                if (d) description = d.replace(/<[^>]*>?/gm, '');
                            } else if (tag === 201) { // Cover offset
                                if (tagData.length >= 4) {
                                    const coverOffset = new DataView(tagData.buffer, tagData.byteOffset, tagData.byteLength).getUint32(0, false);
                                    const coverRecIdx = firstImageIndex + coverOffset;
                                    const coverBytes = getRecordBytes(coverRecIdx);
                                    if (coverBytes && coverBytes.length > 8) {
                                        coverUrl = MobiParser.bytesToDataUrl(coverBytes);
                                    }
                                }
                            }
                        } catch (tagErr) {}

                        curOffset += tagLen;
                    }
                }
            }

            // Fallback: If cover was not in EXTH, inspect first few image records for a valid image
            if (!coverUrl && firstImageIndex < numRecords) {
                for (let imgIdx = firstImageIndex; imgIdx < Math.min(firstImageIndex + 4, numRecords); imgIdx++) {
                    const rawImg = getRecordBytes(imgIdx);
                    if (rawImg && rawImg.length > 20) {
                        const maybeUrl = MobiParser.bytesToDataUrl(rawImg);
                        if (maybeUrl) {
                            coverUrl = maybeUrl;
                            break;
                        }
                    }
                }
            }

            // 4. Decompress PalmDOC Text Records
            const htmlChunks = [];
            const decoder = new TextDecoder(encoding);

            const effectiveTextRecords = Math.min(textRecordCount, numRecords - 1);
            for (let r = 1; r <= effectiveTextRecords; r++) {
                const rawRec = getRecordBytes(r);
                if (!rawRec || rawRec.length === 0) continue;

                let textBytes;
                if (compression === 1) {
                    textBytes = rawRec;
                } else if (compression === 2) {
                    textBytes = MobiParser.decompressPalmDoc(rawRec);
                } else {
                    textBytes = rawRec;
                }

                if (textBytes && textBytes.length > 0) {
                    try {
                        htmlChunks.push(decoder.decode(textBytes));
                    } catch (decErr) {
                        htmlChunks.push(new TextDecoder('utf-8', { fatal: false }).decode(textBytes));
                    }
                }
            }

            let rawHtml = htmlChunks.join('');

            // Replace embedded MOBI image references <img recindex="X"> with data URLs
            rawHtml = rawHtml.replace(/<img[^>]+recindex\s*=\s*["']?(\d+)["']?[^>]*>/gi, (match, recIndexStr) => {
                const recIdx = parseInt(recIndexStr, 10);
                const targetRec = firstImageIndex + recIdx - 1;
                const imgBytes = getRecordBytes(targetRec);
                if (imgBytes) {
                    const dataUrl = MobiParser.bytesToDataUrl(imgBytes);
                    if (dataUrl) {
                        return match.replace(/recindex\s*=\s*["']?\d+["']?/i, `src="${dataUrl}"`);
                    }
                }
                return match;
            });

            return {
                title,
                author,
                description,
                coverUrl,
                html: rawHtml,
                textLength,
                totalRecords: numRecords
            };
        }

        // Detect JPEG, PNG, GIF, BMP magic bytes and convert Uint8Array to data URL
        static bytesToDataUrl(bytes) {
            if (!bytes || bytes.length < 4) return '';

            let mime = '';
            // JPEG: FF D8 FF
            if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                mime = 'image/jpeg';
            }
            // PNG: 89 50 4E 47
            else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                mime = 'image/png';
            }
            // GIF: 47 49 46 38
            else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
                mime = 'image/gif';
            }
            // BMP: 42 4D
            else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
                mime = 'image/bmp';
            }

            if (!mime) return '';

            // Fast base64 encoding without buffer overflow
            let binary = '';
            const len = bytes.byteLength;
            const chunk = 8192;
            for (let i = 0; i < len; i += chunk) {
                const sub = bytes.subarray(i, Math.min(i + chunk, len));
                binary += String.fromCharCode.apply(null, sub);
            }
            return `data:${mime};base64,${btoa(binary)}`;
        }

        // PalmDOC LZ77 Decompressor
        static decompressPalmDoc(data) {
            const out = [];
            let i = 0;
            const len = data.length;

            while (i < len) {
                const byte = data[i++];
                if (byte === 0) {
                    out.push(0);
                } else if (byte >= 1 && byte <= 8) {
                    for (let j = 0; j < byte && i < len; j++) {
                        out.push(data[i++]);
                    }
                } else if (byte <= 0x7F) {
                    out.push(byte);
                } else if (byte >= 0xC0) {
                    out.push(32); // Space character
                    out.push(byte ^ 0x80);
                } else {
                    if (i >= len) break;
                    const next = data[i++];
                    const distance = (((byte & 0x3F) << 3) | (next >> 5));
                    const matchLength = (next & 0x1F) + 3;
                    const start = out.length - distance;
                    for (let k = 0; k < matchLength; k++) {
                        out.push(out[start + k]);
                    }
                }
            }
            return new Uint8Array(out);
        }
    }

    return MobiParser;
}));
