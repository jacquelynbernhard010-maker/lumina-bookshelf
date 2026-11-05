/**
 * The Cozy Nook - Hand-drawn Cozy Bookshelf Application
 * Restored from approved prototype handdrawn_cozy_shelf.html
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Expanded Book Spine & Stack Color Palette (Current favorites + new expanded tones + vector classics)
    const bookPalette = [
        // Current favorites
        {
            name: 'Mustard Gold',
            bg: '#E5A93C',
            text: '#2A1F10',
            subText: '#4A3519',
            ribbon: '#236343',
            accent: '#543410',
            plaqueBg: 'rgba(255, 253, 247, 0.42)',
            plaqueSolid: '#693B16',
            plaqueStroke: '#543410',
            plaqueInnerStroke: '#784C1A'
        },
        {
            name: 'Classic Navy',
            bg: '#263366',
            text: '#FBF7EE',
            subText: '#D5DDF5',
            ribbon: '#E5A93C',
            accent: '#8FA1E0',
            plaqueBg: '#192247',
            plaqueSolid: '#192247',
            plaqueStroke: '#8FA1E0',
            plaqueInnerStroke: '#B8C5F2'
        },
        {
            name: 'Dusty Rose',
            bg: '#D98880',
            text: '#2B1C1A',
            subText: '#4D2B28',
            ribbon: '#9C8EB9',
            accent: '#6E2622',
            plaqueBg: 'rgba(255, 251, 247, 0.38)',
            plaqueSolid: '#F5D6D3',
            plaqueStroke: '#6E2622',
            plaqueInnerStroke: '#943B36'
        },
        {
            name: 'Forest Green',
            bg: '#236343',
            text: '#F4E4BA',
            subText: '#D8F3DC',
            ribbon: '#C86446',
            accent: '#78C994',
            plaqueBg: '#17452E',
            plaqueSolid: '#2F7D56',
            plaqueStroke: '#78C994',
            plaqueInnerStroke: '#B0EBCA'
        },

        // New expanded tones
        {
            name: 'Terracotta',
            bg: '#C86446',
            text: '#FDFBF7',
            subText: '#FFE4D9',
            ribbon: '#829A7F',
            accent: '#592012',
            plaqueBg: '#9E462C',
            plaqueSolid: '#9E462C',
            plaqueStroke: '#F7C5B4',
            plaqueInnerStroke: '#FFE0D4'
        },
        {
            name: 'Dusty Sage',
            bg: '#829A7F',
            text: '#223120',
            subText: '#2F452C',
            ribbon: '#D49B35',
            accent: '#2D422B',
            plaqueBg: 'rgba(253, 251, 247, 0.38)',
            plaqueSolid: '#647D61',
            plaqueStroke: '#2D422B',
            plaqueInnerStroke: '#436140'
        },
        {
            name: 'Cognac',
            bg: '#9E5E38',
            text: '#FBF7EE',
            subText: '#F5DEC9',
            ribbon: '#2E6F74',
            accent: '#42210D',
            plaqueBg: '#733F20',
            plaqueSolid: '#733F20',
            plaqueStroke: '#F2C19E',
            plaqueInnerStroke: '#F7D9C1'
        },
        {
            name: 'Antique Linen',
            bg: '#EFE6D5',
            text: '#2E3842',
            subText: '#4A5561',
            ribbon: '#B86B77',
            accent: '#6B5643',
            plaqueBg: 'rgba(255, 255, 255, 0.58)',
            plaqueSolid: '#DFD2BC',
            plaqueStroke: '#6B5643',
            plaqueInnerStroke: '#8C735B'
        },
        {
            name: 'Peacock Teal',
            bg: '#2E6F74',
            text: '#FDFBF7',
            subText: '#D2F0F2',
            ribbon: '#C86446',
            accent: '#8CE0E6',
            plaqueBg: '#1D4B4F',
            plaqueSolid: '#1D4B4F',
            plaqueStroke: '#8CE0E6',
            plaqueInnerStroke: '#B8F1F5'
        },
        {
            name: 'Dusty Plum',
            bg: '#5E3D56',
            text: '#FDFBF7',
            subText: '#F0D5E9',
            ribbon: '#8EAFBD',
            accent: '#D9A3CC',
            plaqueBg: '#42283C',
            plaqueSolid: '#42283C',
            plaqueStroke: '#D9A3CC',
            plaqueInnerStroke: '#EBC5E1'
        },
        {
            name: 'Powder Blue',
            bg: '#8EAFBD',
            text: '#1E2D33',
            subText: '#2C424B',
            ribbon: '#9E5E38',
            accent: '#29424D',
            plaqueBg: 'rgba(253, 251, 247, 0.44)',
            plaqueSolid: '#6E91A1',
            plaqueStroke: '#29424D',
            plaqueInnerStroke: '#3F606E'
        },

        // Additional vibrant vector classics
        {
            name: 'Coral Red',
            bg: '#F06461',
            text: '#FFFDF7',
            subText: '#FFE2D8',
            ribbon: '#81B29A',
            accent: '#78222B',
            plaqueBg: 'rgba(255, 253, 247, 0.22)',
            plaqueSolid: '#C04245',
            plaqueStroke: '#78222B',
            plaqueInnerStroke: '#FFD1D3'
        },
        {
            name: 'Royal Purple',
            bg: '#6C4DB5',
            text: '#FFFDF7',
            subText: '#DFD4F7',
            ribbon: '#E07A5F',
            accent: '#B399EB',
            plaqueBg: '#4D328C',
            plaqueSolid: '#4D328C',
            plaqueStroke: '#B399EB',
            plaqueInnerStroke: '#D8CAF5'
        },
        {
            name: 'Soft Lavender',
            bg: '#A890D3',
            text: '#2D1447',
            subText: '#4A2C6B',
            ribbon: '#236343',
            accent: '#4A2C6B',
            plaqueBg: 'rgba(255, 253, 247, 0.36)',
            plaqueSolid: '#886EB8',
            plaqueStroke: '#4A2C6B',
            plaqueInnerStroke: '#65418C'
        },
        {
            name: 'Wine Burgundy',
            bg: '#773037',
            text: '#FFFDF7',
            subText: '#FFD4D6',
            ribbon: '#E5A93C',
            accent: '#EB888C',
            plaqueBg: '#521A20',
            plaqueSolid: '#521A20',
            plaqueStroke: '#EB888C',
            plaqueInnerStroke: '#F7B2B5'
        }
    ];

    const coverThemes = bookPalette;

    // Helper to pick a color palette based on user customization or shelf slot index
    function getBookStyle(index, book = null) {
        if (book) {
            if (book.palette_name) {
                const byName = bookPalette.find(p => p.name === book.palette_name);
                if (byName) return byName;
            }
            if (book.custom_spine_color) {
                const byHex = bookPalette.find(p => p.bg.toLowerCase() === String(book.spine_color || '').toLowerCase());
                if (byHex) return byHex;
            }
        }
        return bookPalette[Math.abs(index) % bookPalette.length];
    }

    // Feature flag: Cozy Houseplants Greenhouse & Shelf Decorator
    const ENABLE_COZY_PLANTS = true;

    // Helper to resolve decoration asset URLs (supports both 'decorations' and 'plants' folders)
    function getDecorImgSrc(p) {
        if (!p || !p.file) return '';
        if (p.folder === 'plants') return `assets/images/plants/${p.file}`;
        if (p.folder === 'decorations') return `assets/images/decorations/${p.file}`;
        // Fallback detection for legacy items saved before folder distinction
        if (/^[0-3][0-9]_/.test(p.file)) {
            return `assets/images/plants/${p.file}`;
        }
        return `assets/images/decorations/${p.file}`;
    }

    // 51-Item Cozy Shelf Decor Catalog (Mini Animated Cats, Knick-Knacks, Toys & Houseplants)
    const COZY_DECOR_CATALOG = [
        // --- 1. Mini Animated Cats (3 items) ---
        { id: 'cat-mochi-idle', file: 'cat_mochi_idle.gif', name: 'Mochi (Idle)', category: 'cats', folder: 'decorations', defaultSize: 72 },
        { id: 'cat-mochi-box', file: 'cat_mochi_box.gif', name: 'Mochi in Box', category: 'cats', folder: 'decorations', defaultSize: 72 },
        { id: 'cat-sleeping-curled', file: 'cat_sleeping_curled.gif', name: 'Ginger Cat (Sleeping)', category: 'cats', folder: 'decorations', defaultSize: 72 },

        // --- 2. Cozy Knick-Knacks & Books (13 items) ---
        { id: 'knick-coffee-cup', file: 'coffee_cup.png', name: 'Coffee Cup', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-tea-cup-1', file: 'tea_cup_1.png', name: 'Green Tea', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-tea-cup-2', file: 'tea_cup_2.png', name: 'Floral Teacup', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-croissant', file: 'croissant.png', name: 'Croissant', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-candy-jar', file: 'candy_jar.png', name: 'Candy Jar', category: 'knick-knacks', folder: 'decorations', defaultSize: 72 },
        { id: 'knick-jam-jar', file: 'jam_jar.png', name: 'Jam Jar', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-camera', file: 'camera.png', name: 'Film Camera', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-photo-frame', file: 'photo_frame.png', name: 'Photo Frame', category: 'knick-knacks', folder: 'decorations', defaultSize: 72 },
        { id: 'knick-vase', file: 'vase.png', name: 'Ceramic Vase', category: 'knick-knacks', folder: 'decorations', defaultSize: 80 },
        { id: 'knick-lamp', file: 'lamp.png', name: 'Reading Lamp', category: 'knick-knacks', folder: 'decorations', defaultSize: 80 },
        { id: 'knick-books', file: 'books.png', name: 'Book Stack', category: 'knick-knacks', folder: 'decorations', defaultSize: 72 },
        { id: 'knick-book-1', file: 'book_1.png', name: 'Journal', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },
        { id: 'knick-book-2', file: 'book_2.png', name: 'Pencil & Pad', category: 'knick-knacks', folder: 'decorations', defaultSize: 64 },

        // --- 3. Cat Beds & Toys (5 items) ---
        { id: 'toy-cushion-teal', file: 'cat_cushion.png', name: 'Teal Cat Bed', category: 'toys', folder: 'decorations', defaultSize: 80 },
        { id: 'toy-cushion-pink', file: 'cat_cushion_pink.png', name: 'Pink Cat Bed', category: 'toys', folder: 'decorations', defaultSize: 80 },
        { id: 'toy-mouse', file: 'toy_mouse.png', name: 'Toy Mouse', category: 'toys', folder: 'decorations', defaultSize: 64 },
        { id: 'toy-bell', file: 'toy_bell.png', name: 'Jingle Bell', category: 'toys', folder: 'decorations', defaultSize: 64 },
        { id: 'toy-fish-snack', file: 'fish_snack.png', name: 'Fish Snack', category: 'toys', folder: 'decorations', defaultSize: 64 },

        // --- 4. Pixel-Art Houseplants (30 items) ---
        { id: 'plant-01', file: '01_monstera.png', name: 'Monstera', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-02', file: '02_banana_plant.png', name: 'Banana Plant', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-03', file: '03_red_aglaonema.png', name: 'Red Aglaonema', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-04', file: '04_purple_oxalis.png', name: 'Purple Oxalis', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-05', file: '05_spider_plant.png', name: 'Spider Plant', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-06', file: '06_fern_basket.png', name: 'Fern Basket', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-07', file: '07_dracaena_patterned_pot.png', name: 'Dracaena', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-08', file: '08_lucky_bamboo.png', name: 'Lucky Bamboo', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-09', file: '09_boxwood_topiary.png', name: 'Boxwood Topiary', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-10', file: '10_bonsai.png', name: 'Bonsai', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-11', file: '11_aloe_vera.png', name: 'Aloe Vera', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-12', file: '12_peace_lily.png', name: 'Peace Lily', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-13', file: '13_african_violet.png', name: 'African Violet', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-14', file: '14_geranium.png', name: 'Geranium', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-15', file: '15_ranunculus.png', name: 'Ranunculus', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-16', file: '16_rose_bush.png', name: 'Rose Bush', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-17', file: '17_hanging_pothos.png', name: 'Hanging Pothos', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-18', file: '18_macrame_hanger.png', name: 'Macrame Hanger', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-19', file: '19_face_pot.png', name: 'Face Pot', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-20', file: '20_teacup_plant.png', name: 'Teacup Plant', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-21', file: '21_window_box.png', name: 'Window Box', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-22', file: '22_monstera_dark_pot.png', name: 'Dark Monstera', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-23', file: '23_rubber_plant.png', name: 'Rubber Plant', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-24', file: '24_money_tree.png', name: 'Money Tree', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-25', file: '25_parlor_palm.png', name: 'Parlor Palm', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-26', file: '26_broad_leaf.png', name: 'Broad Leaf', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-27', file: '27_pothos_trellis.png', name: 'Pothos Trellis', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-28', file: '28_string_of_pearls.png', name: 'String of Pearls', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-29', file: '29_hanging_fern.png', name: 'Hanging Fern', category: 'plants', folder: 'plants', defaultSize: 80 },
        { id: 'plant-30', file: '30_variegated_patterned_pot.png', name: 'Variegated Pot', category: 'plants', folder: 'plants', defaultSize: 80 }
    ];

    // Alias for backward compatibility
    const COZY_PLANTS = COZY_DECOR_CATALOG;

    function loadInitialPlants() {
        const removedFiles = new Set(['cat_pochi_idle.gif', 'cat_pochi_sleep.gif', 'cat_pochi_stretch.gif', 'cat_pochi_groom.gif', 'cat_pochi_sit.gif', 'twinkling_star.gif']);
        try {
            const raw = localStorage.getItem('cozy_shelf_plants');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item => !removedFiles.has(item.file));
                }
            }
        } catch (e) {}
        // Default starter cozy decor: sleeping ginger cat, bonsai plant, and Mochi in a box
        return [
            { id: 'decor-starter-1', file: 'cat_sleeping_curled.gif', name: 'Ginger Cat (Sleeping)', folder: 'decorations', category: 'cats', xPercent: 24, yPx: -62, size: 72, flipped: false },
            { id: 'decor-starter-2', file: '10_bonsai.png', name: 'Bonsai', folder: 'plants', category: 'plants', xPercent: 68, yPx: -70, size: 80, flipped: false },
            { id: 'decor-starter-3', file: 'cat_mochi_box.gif', name: 'Mochi in Box', folder: 'decorations', category: 'cats', xPercent: 86, yPx: 234, size: 72, flipped: false }
        ];
    }

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
        catPose: localStorage.getItem('cozy_cat_pose') || 'pose-curled',
        placedPlants: loadInitialPlants(),
        activeDecorCategory: 'all'
    };

    // Authentic Pixel Cat Sprite Poses (from Free Pack)
    const CAT_POSES = [
        { id: 'pose-curled', label: 'Mochi is fast asleep... zZz', zzz: true },
        { id: 'pose-stretched', label: 'Mochi is stretched out napping... zZz', zzz: true },
        { id: 'pose-loaf', label: 'Mochi is curled in a cozy loaf... zZz', zzz: true },
        { id: 'pose-sitting', label: 'Mochi is watching you read!', zzz: false },
        { id: 'pose-calico', label: 'Patches the Calico is asleep... zZz', zzz: true },
        { id: 'pose-midnight', label: 'Shadow the Midnight cat is asleep... zZz', zzz: true }
    ];

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

    // Bulk & Folder Import Elements
    const btnOpenBulkImport = document.getElementById('btnOpenBulkImport');
    const bulkImportModal = document.getElementById('bulkImportModal');
    const btnCloseBulkModal = document.getElementById('btnCloseBulkModal');
    const btnTriggerFolderPick = document.getElementById('btnTriggerFolderPick');
    const bulkFolderInput = document.getElementById('bulkFolderInput');
    const btnTriggerMultiFilesPick = document.getElementById('btnTriggerMultiFilesPick');
    const bulkFilesInput = document.getElementById('bulkFilesInput');
    const bulkDropZone = document.getElementById('bulkDropZone');
    const bulkImportChooser = document.getElementById('bulkImportChooser');
    const bulkImportProgress = document.getElementById('bulkImportProgress');
    const bulkProgressSub = document.getElementById('bulkProgressSub');
    const bulkProgressBar = document.getElementById('bulkProgressBar');
    const bulkProgressCount = document.getElementById('bulkProgressCount');
    const storageModeLabel = document.getElementById('storageModeLabel');

    // Initialize Storage with Safeguard
    try {
        await window.storageEngine.initIndexedDB();
    } catch (err) {
        console.error('Storage initialization fallback:', err);
    }

    // Initial Load with Safeguard
    try {
        await reloadData();
    } catch (err) {
        console.error('Initial bookshelf load fallback:', err);
    }

    try {
        setupEventListeners();
    } catch (err) {
        console.error('Setup event listeners fallback:', err);
    }

    async function reloadData() {
        await fetchShelves();
        await fetchBooks();
    }

    function setMobileSidebarOpen(isOpen) {
        const navPanel = document.getElementById('mainNavPanel');
        const backdrop = document.getElementById('mobileSidebarBackdrop');
        const pullIcon = document.getElementById('mobilePullTabIcon');
        if (!navPanel) return;
        navPanel.classList.toggle('is-open', isOpen);
        if (backdrop) backdrop.classList.toggle('is-open', isOpen);
        if (pullIcon) {
            pullIcon.innerHTML = isOpen 
                ? '<img src="assets/images/icons/close.png" alt="Close" class="w-3.5 h-3.5 pixel-art-img">'
                : '<img src="assets/images/ui/cat_paw.png" alt="Menu" class="w-5 h-5 pixel-art-img select-none">';
        }
    }

    function setupEventListeners() {
        // Mobile Retractable Side Panel Controls
        const btnOpenMobileSidebar = document.getElementById('btnOpenMobileSidebar');
        const btnCloseMobileSidebar = document.getElementById('btnCloseMobileSidebar');
        const btnMobilePullTab = document.getElementById('btnMobilePullTab');
        const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');
        const btnQuickMobileUpload = document.getElementById('btnQuickMobileUpload');
        const navPanel = document.getElementById('mainNavPanel');

        if (btnOpenMobileSidebar) {
            btnOpenMobileSidebar.addEventListener('click', () => setMobileSidebarOpen(true));
        }
        if (btnCloseMobileSidebar) {
            btnCloseMobileSidebar.addEventListener('click', () => setMobileSidebarOpen(false));
        }
        if (btnMobilePullTab && navPanel) {
            btnMobilePullTab.addEventListener('click', () => {
                setMobileSidebarOpen(!navPanel.classList.contains('is-open'));
            });
        }
        if (mobileSidebarBackdrop) {
            mobileSidebarBackdrop.addEventListener('click', () => setMobileSidebarOpen(false));
        }
        if (btnQuickMobileUpload) {
            btnQuickMobileUpload.addEventListener('click', () => {
                setMobileSidebarOpen(false);
                uploadModal.classList.add('active');
            });
        }

        // Automatic Shelf Reflow on Device Rotation / Viewport Resize
        let resizeTimer = null;
        let lastContainerWidth = shelvesContainer ? shelvesContainer.clientWidth : window.innerWidth;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const curW = shelvesContainer ? shelvesContainer.clientWidth : window.innerWidth;
                if (Math.abs(curW - lastContainerWidth) >= 8 && state.books.length > 0) {
                    lastContainerWidth = curW;
                    renderShelves();
                }
            }, 150);
        });

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
            setMobileSidebarOpen(false);
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

        // Cozy Houseplants Greenhouse Drawer & Catalog (stored for future reimplementation)
        if (ENABLE_COZY_PLANTS) {
            initPlantGreenhouseTray();
        }

        // Modals
        btnOpenUpload.addEventListener('click', () => {
            setMobileSidebarOpen(false);
            uploadModal.classList.add('active');
        });
        btnCloseUploadModal.addEventListener('click', () => uploadModal.classList.remove('active'));
        btnCancelUpload.addEventListener('click', () => uploadModal.classList.remove('active'));

        // Bulk & Folder Import Listeners
        if (btnOpenBulkImport) {
            btnOpenBulkImport.addEventListener('click', () => {
                setMobileSidebarOpen(false);
                resetBulkImportModal();
                bulkImportModal.classList.add('active');
            });
        }
        if (btnCloseBulkModal) {
            btnCloseBulkModal.addEventListener('click', () => {
                bulkImportModal.classList.remove('active');
            });
        }
        if (btnTriggerFolderPick && bulkFolderInput) {
            btnTriggerFolderPick.addEventListener('click', () => {
                bulkFolderInput.click();
            });
        }
        if (btnTriggerMultiFilesPick && bulkFilesInput) {
            btnTriggerMultiFilesPick.addEventListener('click', () => {
                bulkFilesInput.click();
            });
        }
        if (bulkFolderInput) {
            bulkFolderInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    processBulkFiles(e.target.files);
                }
            });
        }
        if (bulkFilesInput) {
            bulkFilesInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    processBulkFiles(e.target.files);
                }
            });
        }

        // Bulk Drop Zone Drag & Drop
        if (bulkDropZone) {
            ['dragenter', 'dragover'].forEach(name => {
                bulkDropZone.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    bulkDropZone.classList.add('bg-[#f4ebd9]');
                });
            });
            ['dragleave', 'drop'].forEach(name => {
                bulkDropZone.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    bulkDropZone.classList.remove('bg-[#f4ebd9]');
                });
            });
            bulkDropZone.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                bulkDropZone.classList.remove('bg-[#f4ebd9]');
                const files = await getFilesFromDataTransfer(e.dataTransfer);
                if (files && files.length > 0) {
                    processBulkFiles(files);
                }
            });
            bulkDropZone.addEventListener('click', () => {
                if (btnTriggerFolderPick) btnTriggerFolderPick.click();
            });
        }

        // One-Click User Troubleshooting & Cache Reset Safeguard
        const btnResetApp = document.getElementById('btnResetApp');
        if (btnResetApp) {
            btnResetApp.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Reset local bookshelf data and refresh? This clears local browser storage so your bookshelf initializes fresh.')) {
                    if (window.storageEngine && typeof window.storageEngine.resetAllLocalData === 'function') {
                        await window.storageEngine.resetAllLocalData();
                    } else {
                        localStorage.clear();
                    }
                    window.location.reload();
                }
            });
        }

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
        if (bulkImportModal) {
            bulkImportModal.addEventListener('click', (e) => {
                if (e.target === bulkImportModal) {
                    if (bulkImportProgress && !bulkImportProgress.classList.contains('hidden')) return;
                    bulkImportModal.classList.remove('active');
                }
            });
        }
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

    function resetBulkImportModal() {
        if (bulkImportChooser) bulkImportChooser.classList.remove('hidden');
        if (bulkImportProgress) bulkImportProgress.classList.add('hidden');
        if (bulkProgressBar) bulkProgressBar.style.width = '0%';
        if (bulkProgressCount) bulkProgressCount.textContent = '0 of 0 books processed';
        if (bulkProgressSub) bulkProgressSub.textContent = 'Reading metadata...';
        if (bulkFolderInput) bulkFolderInput.value = '';
        if (bulkFilesInput) bulkFilesInput.value = '';
    }

    async function getFilesFromDataTransfer(dataTransfer) {
        const result = [];
        if (!dataTransfer) return result;

        if (dataTransfer.items && dataTransfer.items.length > 0) {
            const queue = [];
            for (let i = 0; i < dataTransfer.items.length; i++) {
                const item = dataTransfer.items[i];
                if (item.webkitGetAsEntry) {
                    const entry = item.webkitGetAsEntry();
                    if (entry) queue.push(entry);
                }
            }
            if (queue.length > 0) {
                async function readEntry(entry) {
                    if (entry.isFile) {
                        return new Promise((resolve) => {
                            entry.file(f => { result.push(f); resolve(); }, () => resolve());
                        });
                    } else if (entry.isDirectory) {
                        const reader = entry.createReader();
                        const readAllBatch = async () => {
                            return new Promise((resolve) => {
                                reader.readEntries(async (entries) => {
                                    if (!entries || entries.length === 0) {
                                        resolve();
                                    } else {
                                        for (const child of entries) {
                                            await readEntry(child);
                                        }
                                        await readAllBatch();
                                        resolve();
                                    }
                                }, () => resolve());
                            });
                        };
                        await readAllBatch();
                    }
                }
                for (const entry of queue) {
                    await readEntry(entry);
                }
                return result;
            }
        }

        if (dataTransfer.files && dataTransfer.files.length > 0) {
            for (let i = 0; i < dataTransfer.files.length; i++) {
                result.push(dataTransfer.files[i]);
            }
        }
        return result;
    }

    async function processBulkFiles(rawFileList) {
        const bookFiles = Array.from(rawFileList).filter(f => {
            const name = (f.name || '').toLowerCase();
            return (name.endsWith('.epub') || name.endsWith('.pdf') || name.endsWith('.mobi') || name.endsWith('.azw') || name.endsWith('.azw3') || name.endsWith('.prc')) && !name.startsWith('._') && !name.startsWith('.');
        });

        if (bookFiles.length === 0) {
            showToast('No .epub, .pdf, or .mobi books found in the selection.', 'error');
            resetBulkImportModal();
            return;
        }

        if (bulkImportChooser) bulkImportChooser.classList.add('hidden');
        if (bulkImportProgress) bulkImportProgress.classList.remove('hidden');

        let successCount = 0;
        const total = bookFiles.length;

        for (let i = 0; i < total; i++) {
            const file = bookFiles[i];
            const percent = Math.round(((i) / total) * 100);
            if (bulkProgressBar) bulkProgressBar.style.width = `${percent}%`;
            if (bulkProgressCount) bulkProgressCount.textContent = `${i + 1} of ${total} books processed`;
            if (bulkProgressSub) bulkProgressSub.textContent = `Extracting: ${file.name}`;

            try {
                let extracted = null;
                try {
                    extracted = await window.EpubExtractor.extract(file);
                } catch (extErr) {
                    console.warn('Metadata extractor fallback for', file.name, extErr);
                }

                const title = cleanTitle((extracted && extracted.title) ? extracted.title : file.name);
                const author = (extracted && extracted.author) ? cleanAuthor(extracted.author) : 'Unknown Author';
                const cover_url = (extracted && extracted.cover_url) ? extracted.cover_url : '';
                const spine_color = (extracted && extracted.dominant_color) ? extracted.dominant_color : '#81b29a';

                await window.storageEngine.saveBook({
                    file,
                    title,
                    author,
                    shelf_id: 1,
                    cover_url,
                    spine_color,
                    spine_style: 'spine'
                });
                successCount++;
            } catch (err) {
                console.error('Error importing book:', file.name, err);
            }
        }

        if (bulkProgressBar) bulkProgressBar.style.width = '100%';
        if (bulkProgressCount) bulkProgressCount.textContent = `Finished! ${successCount} of ${total} books added`;
        if (bulkProgressSub) bulkProgressSub.textContent = 'Updating your bookshelf...';

        await new Promise(r => setTimeout(r, 450));

        if (bulkImportModal) bulkImportModal.classList.remove('active');
        resetBulkImportModal();

        showToast(`Successfully imported ${successCount} books!`, 'success');
        await reloadData();
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

    // Returns proportional layout metrics for Phone (<640px), Tablet (640-1023px), and Desktop (>=1024px)
    function getViewportShelfMetrics() {
        const vw = window.innerWidth || 1024;
        if (vw < 640) {
            return {
                mode: 'mobile',
                gap: 3,
                stackWidth: 136, // 132px stack layer + 4px margin
                maxStackToBorder: 7,
                frontWidth: 112,
                leaningExtra: 18,
                wallPadding: 34, // 2*11px bookcase walls + 2*6px bay padding
                minWidthBase: 44,
                widthRange: 11,  // 44px to 54px spine width on phones
                minHeightBase: 178,
                heightRange: 26, // 178px to 203px spine height on phones (bay is 236px)
                maxTopSpineBaseH: 222,
                stackLayerPitch: 29,
                topSpineMinW: 38,
                topSpineMaxW: 42
            };
        } else if (vw < 1024) {
            return {
                mode: 'tablet',
                gap: 4,
                stackWidth: 156, // 152px stack layer + 4px margin
                maxStackToBorder: 8,
                frontWidth: 128,
                leaningExtra: 22,
                wallPadding: 52,
                minWidthBase: 50,
                widthRange: 13,  // 50px to 62px spine width on tablets
                minHeightBase: 204,
                heightRange: 29, // 204px to 232px spine height on tablets (bay is 268px)
                maxTopSpineBaseH: 252,
                stackLayerPitch: 32,
                topSpineMinW: 44,
                topSpineMaxW: 48
            };
        }
        return {
            mode: 'desktop',
            gap: 4,
            stackWidth: 172, // 168px stack layer + 4px margin
            maxStackToBorder: MAX_STACK_TO_BORDER,
            frontWidth: 140,
            leaningExtra: 26,
            wallPadding: 56,
            minWidthBase: 56,
            widthRange: 15,  // 56px to 70px natural spine width
            minHeightBase: 222,
            heightRange: 34, // 222px to 255px natural spine height
            maxTopSpineBaseH: 276,
            stackLayerPitch: 35,
            topSpineMinW: 48,
            topSpineMaxW: 53
        };
    }

    // Deterministic organic spine dimensions based on book title & author, scaled for phone/tablet/desktop
    function getBookSpineMetrics(book) {
        const vm = getViewportShelfMetrics();
        const seedStr = `${book.title || ''}-${book.author || ''}-${book.id || 0}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const absHash = Math.abs(hash);
        const width = vm.minWidthBase + (absHash % vm.widthRange);
        const height = vm.minHeightBase + ((absHash >> 3) % vm.heightRange);
        return { width, height };
    }

    // Estimates the horizontal pixel width an upright book occupies on the shelf
    // Consecutive leaning books tuck parallel against each other (-3px), while the last leaning book needs extra room for its tilted top-right corner
    function getUprightBookWidth(book, nextBookOnShelf) {
        const vm = getViewportShelfMetrics();
        const style = book.spine_style || 'spine';
        if (style === 'front') return vm.frontWidth;
        const { width } = getBookSpineMetrics(book);
        if (style === 'leaning') {
            const nextIsLeaning = nextBookOnShelf && (nextBookOnShelf.spine_style === 'leaning');
            return nextIsLeaning ? (width - 3) : (width + vm.leaningExtra);
        }
        return width;
    }

    /**
     * Automatically optimizes stacking and packs each shelf right up to the top and right borders:
     * - Stacks pile all the way up to the top border of the shelf.
     * - When a stack has only 1 or 2 horizontal books at the bottom, up to 3 spine-facing books can stand vertically on top of that bottom book (just like a real library bookcase).
     * - Multiple stacks and upright spines pack snugly right up to the right border of each shelf.
     */
    function packBooksIntoShelves(booksList, bayInnerWidth) {
        const vm = getViewportShelfMetrics();
        const GAP = vm.gap;
        const STACK_WIDTH = vm.stackWidth;
        const maxStack = vm.maxStackToBorder;
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
                const slice = stackedBooks.slice(sIdx, sIdx + maxStack);
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

        // Measure the real interior width of the wooden bookcase bay
        const vm = getViewportShelfMetrics();
        const containerWidth = shelvesContainer.clientWidth || window.innerWidth || 1024;
        const bayInnerWidth = Math.max(250, containerWidth - vm.wallPadding);

        const packedShelves = packBooksIntoShelves(state.books, bayInnerWidth);

        // Top accessory: Mochi the cozy ginger cat napping on top of the wooden bookcase (Authentic Pixel-art)
        const currentCat = CAT_POSES.find(p => p.id === state.catPose) || CAT_POSES[0];
        const topHeader = document.createElement('div');
        topHeader.className = 'flex items-end justify-between px-6 mb-[-1px] relative z-10';
        topHeader.innerHTML = `
            <div class="cozy-cat-container" id="cozyCat" title="${currentCat.label} (click to switch cat/pose)">
                <div class="cat-purr-bubble" id="catPurrBubble">${currentCat.label}</div>
                <div class="zzz-cluster" id="catZzz" style="display: ${currentCat.zzz ? 'block' : 'none'};">
                    <span class="cat-z cat-z1">z</span>
                    <span class="cat-z cat-z2">Z</span>
                    <span class="cat-z cat-z3">Z</span>
                </div>
                <div id="catSprite" class="pixel-cat-sprite ${currentCat.id}"></div>
            </div>
            <div class="flex items-center gap-2 pb-1.5">
                <div class="text-[11px] font-bold text-[#8c735b] select-none hidden sm:block">
                    <span>The Cozy Nook Bookcase</span>
                </div>
            </div>
        `;

        const cozyCat = topHeader.querySelector('#cozyCat');
        if (cozyCat) {
            cozyCat.addEventListener('click', () => {
                const curIdx = CAT_POSES.findIndex(p => p.id === state.catPose);
                const nextIdx = (curIdx + 1) % CAT_POSES.length;
                state.catPose = CAT_POSES[nextIdx].id;
                try { localStorage.setItem('cozy_cat_pose', state.catPose); } catch (e) {}

                const nextCat = CAT_POSES[nextIdx];
                const spriteEl = cozyCat.querySelector('#catSprite');
                const bubbleEl = cozyCat.querySelector('#catPurrBubble');
                const zzzEl = cozyCat.querySelector('#catZzz');
                if (spriteEl) spriteEl.className = `pixel-cat-sprite ${nextCat.id}`;
                if (bubbleEl) bubbleEl.textContent = nextCat.label;
                if (zzzEl) zzzEl.style.display = nextCat.zzz ? 'block' : 'none';
                cozyCat.title = `${nextCat.label} (click to switch cat/pose)`;
            });
        }
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
                const slotIdx = globalThemeCounter;
                const theme = getBookStyle(slotIdx, book);
                globalThemeCounter++;
                bay.appendChild(createDoodleBook(book, theme, null, slotIdx));
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
        if (ENABLE_COZY_PLANTS) {
            renderPlacedPlants(bookcase);
        }
    }

    // --- Cozy Houseplants Greenhouse & Drag-and-Drop Shelf Decorator ---

    const PLANT_PRESET_ORDER = ['balanced', 'jungle', 'zen', 'cottage'];
    let currentPresetIdx = -1;
    let activeSpotFilter = 'auto';
    let targetedSpotId = null;

    function savePlacedPlants() {
        try {
            localStorage.setItem('cozy_shelf_plants', JSON.stringify(state.placedPlants));
        } catch (e) {}
        updatePlantButtonUI();
    }

    function updatePlantButtonUI() {
        if (!plantLabel) return;
        const count = state.placedPlants.length;
        plantLabel.innerText = count > 0 ? `Cozy Decor (${count})` : 'Cozy Decor';
    }

    // Computes all well-organized, non-overlapping plant spots on the current bookcase
    function computeOrganizedPlantSpots(bookcaseEl) {
        if (!bookcaseEl) return [];
        const bcRect = bookcaseEl.getBoundingClientRect();
        if (bcRect.width <= 0) return [];
        const spots = [];

        // 1. Shelftop Crown Spots (avoiding Mochi on the far left 0..20%)
        spots.push({
            spotId: 'shelftop-center',
            category: 'shelftop',
            label: 'Shelftop Center',
            xPercent: 52,
            surfaceY: 10,
            defaultSize: 80
        });
        spots.push({
            spotId: 'shelftop-right',
            category: 'shelftop',
            label: 'Shelftop Right',
            xPercent: 83,
            surfaceY: 10,
            defaultSize: 80
        });
        spots.push({
            spotId: 'shelftop-left-mid',
            category: 'shelftop',
            label: 'Shelftop Mid-Left',
            xPercent: 28,
            surfaceY: 10,
            defaultSize: 64
        });

        // 2. Top of Horizontal Book Stacks (that don't have standing spines on top and have >= 70px vertical room)
        const bays = bookcaseEl.querySelectorAll('.bookcase-bay');
        const planks = bookcaseEl.querySelectorAll('.sketch-shelf');

        bays.forEach((bay, sIdx) => {
            const bayRect = bay.getBoundingClientRect();
            const stackGroups = bay.querySelectorAll('.stack-group');

            stackGroups.forEach((sg, gIdx) => {
                if (sg.querySelector('.stack-top-spines')) return;
                const sgRect = sg.getBoundingClientRect();
                const headroom = sgRect.top - bayRect.top;
                if (headroom >= 66) {
                    const centerPx = (sgRect.left + sgRect.width / 2) - bcRect.left - 32;
                    const xPercent = Math.max(2, Math.min(90, (centerPx / bcRect.width) * 100));
                    const surfaceY = Math.round((sgRect.top - bcRect.top) + 4);
                    spots.push({
                        spotId: `stack-${sIdx}-${gIdx}`,
                        category: 'stack',
                        label: `Stack Top`,
                        xPercent: Number(xPercent.toFixed(1)),
                        surfaceY,
                        defaultSize: 64
                    });
                }
            });

            // 3. Open Shelf Nook on each shelf plank (right after the last book/bookend)
            const plank = planks[sIdx];
            if (plank) {
                const pRect = plank.getBoundingClientRect();
                const plankSurfaceY = Math.round((pRect.top - bcRect.top) + 4);

                let maxBookRightPx = 24;
                Array.from(bay.children).forEach((child) => {
                    if (child.classList.contains('doodle-book') || child.classList.contains('stack-group') || child.classList.contains('shelf-bookend')) {
                        const cRect = child.getBoundingClientRect();
                        const rightRel = cRect.right - bcRect.left;
                        if (rightRel > maxBookRightPx) maxBookRightPx = rightRel;
                    }
                });

                const openWidthPx = (bcRect.width - 24) - maxBookRightPx;
                if (openWidthPx >= 68) {
                    const nookXPx = Math.min(bcRect.width - 96, maxBookRightPx + 14);
                    const nookXPercent = Math.max(15, Math.min(89, (nookXPx / bcRect.width) * 100));
                    spots.push({
                        spotId: `nook-${sIdx}-a`,
                        category: 'nook',
                        label: `Shelf ${sIdx + 1} Nook`,
                        xPercent: Number(nookXPercent.toFixed(1)),
                        surfaceY: plankSurfaceY,
                        defaultSize: 80
                    });

                    // If there is plenty of open shelf space, add a second corner nook on the right
                    if (openWidthPx >= 185 && nookXPercent < 74) {
                        spots.push({
                            spotId: `nook-${sIdx}-b`,
                            category: 'nook',
                            label: `Shelf ${sIdx + 1} Corner`,
                            xPercent: 86,
                            surfaceY: plankSurfaceY,
                            defaultSize: 80
                        });
                    }
                } else {
                    // Fallback neat corner spot if shelf is full
                    spots.push({
                        spotId: `nook-${sIdx}-corner`,
                        category: 'nook',
                        label: `Shelf ${sIdx + 1} Corner`,
                        xPercent: 88,
                        surfaceY: plankSurfaceY,
                        defaultSize: 64
                    });
                }
            }
        });

        return spots;
    }

    // Finds the best unoccupied organized spot matching the active category filter
    function pickBestOrganizedSpot(bookcaseEl, preferredCategory = 'auto') {
        const allSpots = computeOrganizedPlantSpots(bookcaseEl);
        if (allSpots.length === 0) return { xPercent: 70, surfaceY: 10, defaultSize: 80, label: 'Shelftop' };

        // 1. If the user explicitly clicked a "+ Plant Spot" marker on the shelf, use it!
        if (targetedSpotId) {
            const targeted = allSpots.find(s => s.spotId === targetedSpotId);
            if (targeted) {
                targetedSpotId = null;
                return targeted;
            }
        }

        // 2. Filter by category if requested
        const candidates = preferredCategory === 'auto'
            ? allSpots
            : allSpots.filter(s => s.category === preferredCategory);
        const pool = candidates.length > 0 ? candidates : allSpots;

        // 3. Pick the first spot that doesn't already have a plant right on it
        for (const spot of pool) {
            const occupied = state.placedPlants.some(p => {
                const pBottom = p.yPx + (p.size || 80);
                return Math.abs(p.xPercent - spot.xPercent) < 8 && Math.abs(pBottom - spot.surfaceY) < 24;
            });
            if (!occupied) return spot;
        }

        // 4. If all spots in pool are occupied, slightly offset from the first spot
        const fallback = pool[state.placedPlants.length % pool.length];
        return {
            ...fallback,
            xPercent: Math.min(90, Math.max(8, fallback.xPercent + ((state.placedPlants.length % 3) - 1) * 6))
        };
    }

    // Applies one of the 4 curated interior-designer plant layouts tailored to the user's current books
    function applyCuratedPlantPreset(presetKey) {
        const bookcaseEl = document.querySelector('.wooden-bookcase');
        if (!bookcaseEl) return;

        const spots = computeOrganizedPlantSpots(bookcaseEl);
        const shelftopCenter = spots.find(s => s.spotId === 'shelftop-center') || { xPercent: 52, surfaceY: 10 };
        const shelftopRight = spots.find(s => s.spotId === 'shelftop-right') || { xPercent: 83, surfaceY: 10 };
        const shelftopLeft = spots.find(s => s.spotId === 'shelftop-left-mid') || { xPercent: 28, surfaceY: 10 };
        const stackSpots = spots.filter(s => s.category === 'stack');
        const nookSpots = spots.filter(s => s.category === 'nook');

        const newPlants = [];
        const addAtSpot = (spot, file, name, sizeOverride, flipped = false) => {
            if (!spot) return;
            const sz = sizeOverride || spot.defaultSize || 80;
            newPlants.push({
                id: 'plant-' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '-' + newPlants.length,
                file,
                name,
                xPercent: spot.xPercent,
                yPx: spot.surfaceY - sz,
                size: sz,
                flipped
            });
        };

        if (presetKey === 'jungle') {
            addAtSpot(shelftopLeft, '28_string_of_pearls.png', 'String of Pearls', 64, false);
            addAtSpot(shelftopCenter, '02_banana_plant.png', 'Banana Plant', 96, false);
            addAtSpot(shelftopRight, '29_hanging_fern.png', 'Hanging Fern', 80, true);
            if (stackSpots[0]) addAtSpot(stackSpots[0], '05_spider_plant.png', 'Spider Plant', 64, false);
            if (nookSpots[0]) addAtSpot(nookSpots[0], '22_monstera_dark_pot.png', 'Dark Monstera', 80, false);
            if (nookSpots[1]) addAtSpot(nookSpots[1], '25_parlor_palm.png', 'Parlor Palm', 80, true);
        } else if (presetKey === 'zen') {
            addAtSpot(shelftopCenter, '10_bonsai.png', 'Bonsai', 80, false);
            addAtSpot(shelftopRight, '08_lucky_bamboo.png', 'Lucky Bamboo', 80, false);
            if (stackSpots[0]) addAtSpot(stackSpots[0], '11_aloe_vera.png', 'Aloe Vera', 64, false);
            if (nookSpots[0]) addAtSpot(nookSpots[0], '09_boxwood_topiary.png', 'Boxwood Topiary', 80, false);
            if (nookSpots[1]) addAtSpot(nookSpots[1], '24_money_tree.png', 'Money Tree', 80, false);
        } else if (presetKey === 'cottage') {
            addAtSpot(shelftopCenter, '21_window_box.png', 'Window Box', 80, false);
            addAtSpot(shelftopRight, '16_rose_bush.png', 'Rose Bush', 80, false);
            if (stackSpots[0]) addAtSpot(stackSpots[0], '13_african_violet.png', 'African Violet', 64, false);
            if (nookSpots[0]) addAtSpot(nookSpots[0], '15_ranunculus.png', 'Ranunculus', 80, false);
            if (nookSpots[1]) addAtSpot(nookSpots[1], '14_geranium.png', 'Geranium', 80, true);
        } else {
            // 'balanced' default
            addAtSpot(shelftopCenter, '10_bonsai.png', 'Bonsai', 80, false);
            addAtSpot(shelftopRight, '17_hanging_pothos.png', 'Hanging Pothos', 80, false);
            if (stackSpots[0]) addAtSpot(stackSpots[0], '20_teacup_plant.png', 'Teacup Plant', 64, false);
            if (nookSpots[0]) addAtSpot(nookSpots[0], '01_monstera.png', 'Monstera', 80, false);
            if (nookSpots[1]) addAtSpot(nookSpots[1], '12_peace_lily.png', 'Peace Lily', 80, true);
        }

        state.placedPlants = newPlants;
        savePlacedPlants();
        renderPlacedPlants(bookcaseEl);

        // Highlight active preset pill if open
        document.querySelectorAll('.plant-preset-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetKey);
        });

        const presetNames = {
            balanced: 'Balanced Nook',
            jungle: 'Lush Jungle',
            zen: 'Zen Study',
            cottage: 'Cottage Bloom'
        };
        showToast(`Styled shelf with "${presetNames[presetKey] || 'Balanced Nook'}" layout!`, 'success');
    }

    function cycleCuratedPlantPreset() {
        currentPresetIdx = (currentPresetIdx + 1) % PLANT_PRESET_ORDER.length;
        applyCuratedPlantPreset(PLANT_PRESET_ORDER[currentPresetIdx]);
    }

    // Snaps plant bottom (yPx + size) to nearby bookcase surfaces (shelftop crown, shelf planks, or book stacks)
    function snapPlantPosition(bookcaseEl, xPercent, rawYPx, size) {
        if (!bookcaseEl) return rawYPx;
        const bookcaseRect = bookcaseEl.getBoundingClientRect();
        const plantCenterX = bookcaseRect.left + (xPercent / 100) * bookcaseRect.width + (size / 2);
        const plantBottomY = rawYPx + size;
        const SNAP_THRESHOLD = 18;

        // 1. Shelftop crown surface (y = 10px inside bookcase)
        if (Math.abs(plantBottomY - 10) <= SNAP_THRESHOLD) {
            return 10 - size;
        }

        // 2. Any wooden shelf plank (.sketch-shelf)
        const planks = bookcaseEl.querySelectorAll('.sketch-shelf');
        for (const plank of planks) {
            const pRect = plank.getBoundingClientRect();
            const plankSurfaceY = (pRect.top - bookcaseRect.top) + 4;
            if (Math.abs(plantBottomY - plankSurfaceY) <= SNAP_THRESHOLD) {
                return Math.round(plankSurfaceY - size);
            }
        }

        // 3. Top of any horizontal book stack (.stack-group)
        const stackGroups = bookcaseEl.querySelectorAll('.stack-group');
        for (const sg of stackGroups) {
            const sgRect = sg.getBoundingClientRect();
            if (plantCenterX >= sgRect.left - 12 && plantCenterX <= sgRect.right + 12) {
                const stackTopY = (sgRect.top - bookcaseRect.top) + 4;
                if (Math.abs(plantBottomY - stackTopY) <= SNAP_THRESHOLD) {
                    return Math.round(stackTopY - size);
                }
            }
        }

        return Math.round(rawYPx);
    }

    function initPlantGreenhouseTray() {
        const trayDrawer = document.getElementById('plantTrayDrawer');
        const catalogGrid = document.getElementById('plantCatalogGrid');
        const btnCloseTray = document.getElementById('btnClosePlantTray');
        const btnClearPlants = document.getElementById('btnClearPlants');

        updatePlantButtonUI();

        const refreshMarkers = () => {
            const bc = document.querySelector('.wooden-bookcase');
            if (bc) renderPlacedPlants(bc);
        };

        if (btnPlant && trayDrawer) {
            btnPlant.addEventListener('click', () => {
                setMobileSidebarOpen(false);
                trayDrawer.classList.toggle('hidden');
                refreshMarkers();
            });
        }
        if (btnCloseTray && trayDrawer) {
            btnCloseTray.addEventListener('click', () => {
                trayDrawer.classList.add('hidden');
                targetedSpotId = null;
                refreshMarkers();
            });
        }
        if (btnClearPlants) {
            btnClearPlants.addEventListener('click', () => {
                state.placedPlants = [];
                savePlacedPlants();
                refreshMarkers();
                showToast('Cleared all decorations from the shelf', 'success');
            });
        }

        // Category Filter Pills (All / Cats / Knick-Knacks / Toys / Plants)
        document.querySelectorAll('.decor-cat-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeDecorCategory = btn.dataset.cat || 'all';
                document.querySelectorAll('.decor-cat-pill').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                renderCatalogGrid();
            });
        });

        // Target Spot Filter Pills (Best Open Spot / Shelftop / Top of Stack / Shelf Nook)
        document.querySelectorAll('.plant-spot-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                activeSpotFilter = btn.dataset.spot || 'auto';
                targetedSpotId = null;
                document.querySelectorAll('.plant-spot-pill').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                refreshMarkers();
            });
        });

        function renderCatalogGrid() {
            if (!catalogGrid) return;
            catalogGrid.innerHTML = '';

            const filteredItems = state.activeDecorCategory === 'all'
                ? COZY_DECOR_CATALOG
                : COZY_DECOR_CATALOG.filter(item => item.category === state.activeDecorCategory);

            filteredItems.forEach((decorItem) => {
                const card = document.createElement('div');
                card.className = 'plant-tray-item';
                card.title = `Click to place ${decorItem.name} into the selected shelf spot, or drag anywhere`;
                const itemImgSrc = getDecorImgSrc(decorItem);
                card.innerHTML = `
                    <img src="${itemImgSrc}" alt="${escapeHtml(decorItem.name)}">
                    <span class="plant-tray-name">${escapeHtml(decorItem.name)}</span>
                `;

                // Handle placing items cleanly across touch and desktop:
                // Mobile/Touch: Native fluid scrolling; only intentional taps place items (scrolling gestures never generate decor).
                // Desktop/Mouse: Click to place, or drag-and-drop directly onto bookcase.
                const placeInOrganizedSpot = () => {
                    const bookcaseEl = document.querySelector('.wooden-bookcase');
                    if (!bookcaseEl) return;
                    const bestSpot = pickBestOrganizedSpot(bookcaseEl, activeSpotFilter);
                    const sz = decorItem.defaultSize || bestSpot.defaultSize || 80;
                    state.placedPlants.push({
                        id: 'decor-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                        file: decorItem.file,
                        name: decorItem.name,
                        category: decorItem.category,
                        folder: decorItem.folder,
                        xPercent: bestSpot.xPercent,
                        yPx: bestSpot.surfaceY - sz,
                        size: sz,
                        flipped: false
                    });
                    savePlacedPlants();
                    renderPlacedPlants(bookcaseEl);
                    showToast(`Placed ${decorItem.name} in ${bestSpot.label}!`, 'success');
                };

                let touchMoved = false;
                let touchStartX = 0;
                let touchStartY = 0;
                let touchStartTime = 0;
                let mouseJustDragged = false;

                // Track touch gestures to prevent accidental placement while scrolling
                card.addEventListener('pointerdown', (e) => {
                    if (e.pointerType === 'touch') {
                        // DO NOT preventDefault! Allow native touch scrolling.
                        touchMoved = false;
                        touchStartX = e.clientX;
                        touchStartY = e.clientY;
                        touchStartTime = Date.now();

                        const onTouchMove = (moveEv) => {
                            if (Math.hypot(moveEv.clientX - touchStartX, moveEv.clientY - touchStartY) > 8) {
                                touchMoved = true;
                            }
                        };
                        const onTouchEnd = () => {
                            window.removeEventListener('pointermove', onTouchMove);
                            window.removeEventListener('pointerup', onTouchEnd);
                            window.removeEventListener('pointercancel', onTouchCancel);
                        };
                        const onTouchCancel = () => {
                            touchMoved = true;
                            onTouchEnd();
                        };

                        window.addEventListener('pointermove', onTouchMove, { passive: true });
                        window.addEventListener('pointerup', onTouchEnd, { passive: true });
                        window.addEventListener('pointercancel', onTouchCancel, { passive: true });
                        return;
                    }

                    // Mouse drag-and-drop to bookcase
                    if (e.pointerType === 'mouse') {
                        if (e.button !== 0) return;
                        e.preventDefault();

                        const startX = e.clientX;
                        const startY = e.clientY;
                        let isDragging = false;
                        let ghost = null;
                        const defaultSize = decorItem.defaultSize || 80;

                        const onMouseMove = (moveEv) => {
                            const dx = moveEv.clientX - startX;
                            const dy = moveEv.clientY - startY;
                            if (!isDragging && Math.hypot(dx, dy) > 6) {
                                isDragging = true;
                                mouseJustDragged = true;
                                ghost = document.createElement('img');
                                ghost.src = itemImgSrc;
                                ghost.className = 'plant-drag-ghost';
                                ghost.style.width = `${defaultSize}px`;
                                ghost.style.height = `${defaultSize}px`;
                                document.body.appendChild(ghost);
                            }
                            if (isDragging && ghost) {
                                ghost.style.left = `${moveEv.clientX}px`;
                                ghost.style.top = `${moveEv.clientY}px`;
                            }
                        };

                        const onMouseUp = (upEv) => {
                            window.removeEventListener('pointermove', onMouseMove);
                            window.removeEventListener('pointerup', onMouseUp);
                            if (ghost) ghost.remove();

                            if (isDragging) {
                                const bookcaseEl = document.querySelector('.wooden-bookcase');
                                if (bookcaseEl) {
                                    const bcRect = bookcaseEl.getBoundingClientRect();
                                    const inHorizontal = upEv.clientX >= bcRect.left - 30 && upEv.clientX <= bcRect.right + 30;
                                    const inVertical = upEv.clientY >= bcRect.top - 110 && upEv.clientY <= bcRect.bottom + 30;
                                    if (inHorizontal && inVertical) {
                                        const rawX = upEv.clientX - bcRect.left - (defaultSize / 2);
                                        const xPercent = Math.max(0, Math.min(92, (rawX / bcRect.width) * 100));
                                        const rawYPx = upEv.clientY - bcRect.top - (defaultSize * 0.85);
                                        const snappedY = snapPlantPosition(bookcaseEl, xPercent, rawYPx, defaultSize);

                                        state.placedPlants.push({
                                            id: 'decor-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                                            file: decorItem.file,
                                            name: decorItem.name,
                                            category: decorItem.category,
                                            folder: decorItem.folder,
                                            xPercent: Number(xPercent.toFixed(2)),
                                            yPx: snappedY,
                                            size: defaultSize,
                                            flipped: false
                                        });
                                        savePlacedPlants();
                                        renderPlacedPlants(bookcaseEl);
                                        showToast(`Placed ${decorItem.name} on the shelf!`, 'success');
                                    }
                                }
                                setTimeout(() => { mouseJustDragged = false; }, 100);
                            }
                        };

                        window.addEventListener('pointermove', onMouseMove);
                        window.addEventListener('pointerup', onMouseUp);
                    }
                });

                // Click event handles taps and clicks; ignores scrolls and mouse drags
                card.addEventListener('click', (e) => {
                    if (mouseJustDragged) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    if (touchMoved || (touchStartTime && (Date.now() - touchStartTime > 400))) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    placeInOrganizedSpot();
                });

                catalogGrid.appendChild(card);
            });
        }

        renderCatalogGrid();
    }

    // Dismiss pinned plant toolbar when clicking outside any placed plant
    document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.placed-plant')) {
            state.activePlantId = null;
            document.querySelectorAll('.placed-plant.is-active').forEach(el => el.classList.remove('is-active'));
        }
    });

    function renderPlacedPlants(bookcaseEl) {
        if (!bookcaseEl) return;
        bookcaseEl.querySelectorAll('.placed-plant, .shelf-plant-spot-marker').forEach(el => el.remove());

        // When the Cozy Greenhouse drawer is open, display interactive "+ Plant Spot" guide markers on unoccupied spots
        const trayDrawer = document.getElementById('plantTrayDrawer');
        const isGreenhouseOpen = trayDrawer && !trayDrawer.classList.contains('hidden');
        if (isGreenhouseOpen) {
            const spots = computeOrganizedPlantSpots(bookcaseEl);
            spots.forEach((spot) => {
                if (activeSpotFilter !== 'auto' && spot.category !== activeSpotFilter) return;
                const isOccupied = state.placedPlants.some(p => {
                    const pBottom = p.yPx + (p.size || 80);
                    return Math.abs(p.xPercent - spot.xPercent) < 8 && Math.abs(pBottom - spot.surfaceY) < 24;
                });
                if (isOccupied) return;

                const marker = document.createElement('div');
                marker.className = `shelf-plant-spot-marker ${targetedSpotId === spot.spotId ? 'is-targeted' : ''}`;
                marker.style.left = `${spot.xPercent}%`;
                marker.style.top = `${spot.surfaceY - 58}px`;
                marker.title = `Click to target ${spot.label} for your next decoration`;
                marker.innerHTML = `
                    <span class="text-xs leading-none">+</span>
                    <span>${escapeHtml(spot.label)}</span>
                `;
                marker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    targetedSpotId = (targetedSpotId === spot.spotId) ? null : spot.spotId;
                    renderPlacedPlants(bookcaseEl);
                    if (targetedSpotId) {
                        showToast(`Selected "${spot.label}" — click any item above to place it here!`, 'success');
                    }
                });
                bookcaseEl.appendChild(marker);
            });
        }

        state.placedPlants.forEach((p) => {
            const size = p.size || 80;
            const wrap = document.createElement('div');
            wrap.className = `placed-plant ${state.activePlantId === p.id ? 'is-active' : ''}`;
            wrap.style.left = `${p.xPercent}%`;
            wrap.style.top = `${p.yPx}px`;
            wrap.title = `${p.name} (Click for controls, drag to move)`;

            const sizeLabel = size <= 64 ? 'S' : (size >= 96 ? 'L' : 'M');
            const itemImgSrc = getDecorImgSrc(p);

            wrap.innerHTML = `
                <div class="plant-action-bar">
                    <button type="button" class="plant-ctrl-btn btn-flip" title="Flip horizontal">
                        <img src="assets/images/icons/reload.png" alt="Flip" class="w-3 h-3 pixel-art-img inline-block">
                    </button>
                    <button type="button" class="plant-ctrl-btn btn-size" title="Change size (S / M / L)">${sizeLabel}</button>
                    <button type="button" class="plant-ctrl-btn btn-del" title="Remove decoration">
                        <img src="assets/images/icons/close.png" alt="Remove" class="w-2.5 h-2.5 pixel-art-img inline-block">
                    </button>
                </div>
                <img src="${itemImgSrc}" alt="${escapeHtml(p.name)}" 
                     class="placed-plant-sprite ${p.flipped ? 'is-flipped' : ''}" 
                     style="width: ${size}px; height: ${size}px;">
            `;

            // Sticky hover timer (650ms grace period so cursor never loses the bubble)
            let hoverTimer = null;
            wrap.addEventListener('mouseenter', () => {
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                    hoverTimer = null;
                }
                wrap.classList.add('is-hovered');
            });
            wrap.addEventListener('mouseleave', () => {
                hoverTimer = setTimeout(() => {
                    wrap.classList.remove('is-hovered');
                }, 650);
            });

            const spriteImg = wrap.querySelector('.placed-plant-sprite');

            // Flip button (updates in-place so bubble stays open right under cursor)
            const btnFlip = wrap.querySelector('.btn-flip');
            btnFlip.addEventListener('click', (e) => {
                e.stopPropagation();
                p.flipped = !p.flipped;
                state.activePlantId = p.id;
                wrap.classList.add('is-active');
                spriteImg.classList.toggle('is-flipped', p.flipped);
                savePlacedPlants();
            });

            // Size cycle button (64 -> 80 -> 96, updates in-place so you can click repeatedly)
            const btnSize = wrap.querySelector('.btn-size');
            btnSize.addEventListener('click', (e) => {
                e.stopPropagation();
                const oldSize = p.size || 80;
                const nextSize = oldSize === 64 ? 80 : (oldSize === 80 ? 96 : 64);
                // Keep bottom edge anchored at the same surface
                p.yPx = (p.yPx + oldSize) - nextSize;
                p.size = nextSize;
                state.activePlantId = p.id;
                wrap.classList.add('is-active');

                wrap.style.top = `${p.yPx}px`;
                spriteImg.style.width = `${nextSize}px`;
                spriteImg.style.height = `${nextSize}px`;
                btnSize.textContent = nextSize <= 64 ? 'S' : (nextSize >= 96 ? 'L' : 'M');
                savePlacedPlants();
            });

            // Delete button
            const btnDel = wrap.querySelector('.btn-del');
            btnDel.addEventListener('click', (e) => {
                e.stopPropagation();
                if (hoverTimer) clearTimeout(hoverTimer);
                state.placedPlants = state.placedPlants.filter(item => item.id !== p.id);
                if (state.activePlantId === p.id) state.activePlantId = null;
                savePlacedPlants();
                renderPlacedPlants(bookcaseEl);
            });

            // Dragging placed plant around the bookcase (or click to pin toolbar open)
            wrap.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.plant-ctrl-btn')) return;
                if (e.button !== 0 && e.pointerType === 'mouse') return;
                e.preventDefault();
                e.stopPropagation();

                // Pin this plant's adjustment bubble open
                document.querySelectorAll('.placed-plant.is-active').forEach(el => {
                    if (el !== wrap) el.classList.remove('is-active');
                });
                state.activePlantId = p.id;
                wrap.classList.add('is-active');

                const startX = e.clientX;
                const startY = e.clientY;
                let hasMoved = false;

                const wrapRect = wrap.getBoundingClientRect();
                const offsetX = e.clientX - wrapRect.left;
                const offsetY = e.clientY - wrapRect.top;
                const curSize = p.size || 80;

                const onPointerMove = (moveEv) => {
                    if (!hasMoved && Math.hypot(moveEv.clientX - startX, moveEv.clientY - startY) > 4) {
                        hasMoved = true;
                        wrap.classList.add('is-dragging');
                    }
                    if (!hasMoved) return;

                    const freshBcRect = bookcaseEl.getBoundingClientRect();
                    const rawX = moveEv.clientX - freshBcRect.left - offsetX;
                    const xPercent = Math.max(-2, Math.min(94, (rawX / freshBcRect.width) * 100));
                    const rawYPx = moveEv.clientY - freshBcRect.top - offsetY;
                    const snappedY = snapPlantPosition(bookcaseEl, xPercent, rawYPx, curSize);

                    p.xPercent = Number(xPercent.toFixed(2));
                    p.yPx = snappedY;
                    wrap.style.left = `${p.xPercent}%`;
                    wrap.style.top = `${p.yPx}px`;
                };

                const onPointerUp = () => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);
                    wrap.classList.remove('is-dragging');
                    if (hasMoved) savePlacedPlants();
                };

                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
            });

            bookcaseEl.appendChild(wrap);
        });
    }

    function getRibbonClass(book) {
        const prog = Math.round(book.reading_progress || 0);
        if (prog >= 100) return 'dangle-ribbon is-completed';
        if (prog > 0) return 'dangle-ribbon in-progress';
        return 'dangle-ribbon';
    }

    function computeBookSeed(book) {
        const seedStr = `${book.title || ''}-${book.author || ''}-${book.id || 0}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    // Refinement #1: Smart Title Wrapping & Automatic Font Scaling for Long Book Titles (Desktop, Tablet & Phone)
    function getSmartSpineTitleStyle(title, spineWidth, spineHeight) {
        const len = (title || '').length;
        const isCompact = spineHeight < 210;
        const isMobileSpine = spineWidth < 52;
        let fontSize = isMobileSpine ? '8.8px' : '10.2px';
        let lineClamp = isCompact ? 3 : 4;
        let letterSpacing = isMobileSpine ? '0.015em' : '0.025em';

        if (len <= 11) {
            fontSize = isMobileSpine ? '9.1px' : (spineWidth >= 60 ? '10.8px' : '10.2px');
            lineClamp = 3;
            letterSpacing = isMobileSpine ? '0.02em' : '0.03em';
        } else if (len <= 20) {
            fontSize = isMobileSpine ? '8.3px' : '9.4px';
            lineClamp = isCompact ? 3 : 4;
            letterSpacing = isMobileSpine ? '0.01em' : '0.02em';
        } else if (len <= 32) {
            fontSize = isMobileSpine ? '7.6px' : '8.5px';
            lineClamp = isCompact ? 4 : 5;
            letterSpacing = '0.005em';
        } else {
            fontSize = isMobileSpine ? '7.1px' : '7.8px';
            lineClamp = isCompact ? 4 : 5;
            letterSpacing = '0em';
        }

        return `font-size: ${fontSize}; -webkit-line-clamp: ${lineClamp}; letter-spacing: ${letterSpacing};`;
    }

    // Refinement #2 & #3: 10 Non-Stretched Fixed-Aspect SVG Vector Spine Ornament Archetypes
    function getVectorSpineMotifParts(motifIdx, palette, isCompact = false) {
        const s = palette.accent || '#78222b';
        const inner = palette.plaqueInnerStroke || s;
        const dot = palette.text || '#fffdf7';
        const m = ((motifIdx % 10) + 10) % 10;

        if (isCompact) {
            // Compact fixed-aspect caps for shorter spines standing on top of 1-2 book horizontal stacks
            const compactTop = `
                <svg viewBox="0 0 52 26" fill="none" preserveAspectRatio="xMidYMid meet">
                    <line x1="4" y1="4" x2="48" y2="4" stroke="${s}" stroke-width="1.6"/>
                    <polygon points="26,7 36,14 26,21 16,14" fill="none" stroke="${s}" stroke-width="1.5"/>
                    <circle cx="26" cy="14" r="1.6" fill="${dot}"/>
                    <line x1="4" y1="24" x2="48" y2="24" stroke="${s}" stroke-width="1.4"/>
                </svg>`;
            const compactBottom = `
                <svg viewBox="0 0 52 26" fill="none" preserveAspectRatio="xMidYMid meet">
                    <line x1="4" y1="2" x2="48" y2="2" stroke="${s}" stroke-width="1.4"/>
                    <polygon points="26,5 36,12 26,19 16,12" fill="none" stroke="${s}" stroke-width="1.5"/>
                    <circle cx="26" cy="12" r="1.6" fill="${dot}"/>
                    <line x1="4" y1="22" x2="48" y2="22" stroke="${s}" stroke-width="1.6"/>
                </svg>`;
            return {
                topSvg: compactTop,
                bottomSvg: compactBottom,
                plaqueClass: m % 2 === 0 ? 'plaque-rect' : 'plaque-medallion',
                lowerOrnamentSvg: ''
            };
        }

        switch (m) {
            case 0: // Archetype 1: Aztec Folk Cross & Framed Plaque
                return {
                    plaqueClass: 'plaque-rect',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 46" fill="none" preserveAspectRatio="xMidYMid meet">
                            <line x1="4" y1="5" x2="48" y2="5" stroke="${s}" stroke-width="1.8"/>
                            <line x1="4" y1="9" x2="48" y2="9" stroke="${s}" stroke-width="1.8"/>
                            <polygon points="26,13 40,26 26,39 12,26" fill="none" stroke="${s}" stroke-width="1.8"/>
                            <line x1="17" y1="18" x2="35" y2="34" stroke="${s}" stroke-width="1.3"/>
                            <line x1="35" y1="18" x2="17" y2="34" stroke="${s}" stroke-width="1.3"/>
                            <line x1="4" y1="43" x2="48" y2="43" stroke="${s}" stroke-width="1.8"/>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 46" fill="none" preserveAspectRatio="xMidYMid meet">
                            <line x1="4" y1="3" x2="48" y2="3" stroke="${s}" stroke-width="1.8"/>
                            <polygon points="26,7 40,20 26,33 12,20" fill="none" stroke="${s}" stroke-width="1.8"/>
                            <line x1="17" y1="12" x2="35" y2="28" stroke="${s}" stroke-width="1.3"/>
                            <line x1="35" y1="12" x2="17" y2="28" stroke="${s}" stroke-width="1.3"/>
                            <line x1="4" y1="37" x2="48" y2="37" stroke="${s}" stroke-width="1.8"/>
                            <line x1="4" y1="41" x2="48" y2="41" stroke="${s}" stroke-width="1.8"/>
                        </svg>`
                };

            case 1: // Archetype 2: Concentric Diamond Medallion
                return {
                    plaqueClass: 'plaque-medallion',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 44" fill="none" preserveAspectRatio="xMidYMid meet">
                            <polygon points="26,6 43,22 26,38 9,22" fill="none" stroke="${s}" stroke-width="1.6"/>
                            <polygon points="26,12 37,22 26,32 15,22" fill="none" stroke="${inner}" stroke-width="1.2"/>
                            <circle cx="26" cy="22" r="2" fill="${dot}"/>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 44" fill="none" preserveAspectRatio="xMidYMid meet">
                            <polygon points="26,6 43,22 26,38 9,22" fill="none" stroke="${s}" stroke-width="1.6"/>
                            <polygon points="26,12 37,22 26,32 15,22" fill="none" stroke="${inner}" stroke-width="1.2"/>
                            <circle cx="26" cy="22" r="2" fill="${dot}"/>
                        </svg>`
                };

            case 2: // Archetype 3: Vertical Barcode Ribs & Concentric Square Stamp
                return {
                    plaqueClass: 'plaque-double',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 48" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.5">
                                <line x1="6" y1="4" x2="6" y2="22"/><line x1="10" y1="4" x2="10" y2="22"/>
                                <line x1="14" y1="4" x2="14" y2="22"/><line x1="18" y1="4" x2="18" y2="22"/>
                                <line x1="22" y1="4" x2="22" y2="22"/><line x1="26" y1="4" x2="26" y2="22"/>
                                <line x1="30" y1="4" x2="30" y2="22"/><line x1="34" y1="4" x2="34" y2="22"/>
                                <line x1="38" y1="4" x2="38" y2="22"/><line x1="42" y1="4" x2="42" y2="22"/>
                                <line x1="46" y1="4" x2="46" y2="22"/>
                                <line x1="3" y1="25" x2="49" y2="25" stroke-width="1.9"/>
                            </g>
                            <rect x="16" y="29" width="20" height="16" fill="none" stroke="${s}" stroke-width="1.5"/>
                            <rect x="21" y="33" width="10" height="8" fill="${s}"/>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 48" fill="none" preserveAspectRatio="xMidYMid meet">
                            <rect x="16" y="3" width="20" height="16" fill="none" stroke="${s}" stroke-width="1.5"/>
                            <rect x="21" y="7" width="10" height="8" fill="${s}"/>
                            <g stroke="${s}" stroke-width="1.5">
                                <line x1="3" y1="23" x2="49" y2="23" stroke-width="1.9"/>
                                <line x1="6" y1="26" x2="6" y2="44"/><line x1="10" y1="26" x2="10" y2="44"/>
                                <line x1="14" y1="26" x2="14" y2="44"/><line x1="18" y1="26" x2="18" y2="44"/>
                                <line x1="22" y1="26" x2="22" y2="44"/><line x1="26" y1="26" x2="26" y2="44"/>
                                <line x1="30" y1="26" x2="30" y2="44"/><line x1="34" y1="26" x2="34" y2="44"/>
                                <line x1="38" y1="26" x2="38" y2="44"/><line x1="42" y1="26" x2="42" y2="44"/>
                                <line x1="46" y1="26" x2="46" y2="44"/>
                            </g>
                        </svg>`
                };

            case 3: // Archetype 4: Graduated Horizontal Rib Clusters
                return {
                    plaqueClass: 'plaque-open',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 38" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.9" stroke-linecap="round">
                                <line x1="13" y1="8" x2="39" y2="8"/>
                                <line x1="10" y1="14" x2="42" y2="14"/>
                                <line x1="7" y1="20" x2="45" y2="20"/>
                                <line x1="10" y1="26" x2="42" y2="26"/>
                                <line x1="13" y1="32" x2="39" y2="32"/>
                            </g>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 54" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.8" stroke-linecap="round">
                                <line x1="13" y1="5" x2="39" y2="5"/>
                                <line x1="10" y1="10" x2="42" y2="10"/>
                                <line x1="7" y1="15" x2="45" y2="15"/>
                                <line x1="10" y1="20" x2="42" y2="20"/>
                                <line x1="13" y1="25" x2="39" y2="25"/>
                                <line x1="13" y1="34" x2="39" y2="34"/>
                                <line x1="10" y1="39" x2="42" y2="39"/>
                                <line x1="7" y1="44" x2="45" y2="44"/>
                                <line x1="10" y1="49" x2="42" y2="49"/>
                            </g>
                        </svg>`
                };

            case 4: // Archetype 5: Vintage Oval Cameo & Filigree Scroll
                return {
                    plaqueClass: 'plaque-cameo',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 36" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.6" fill="none">
                                <line x1="6" y1="7" x2="46" y2="7"/>
                                <path d="M12 20 C19 11, 21 25, 26 16 C31 25, 33 11, 40 20"/>
                                <circle cx="26" cy="16" r="1.8" fill="${s}"/>
                                <line x1="6" y1="29" x2="46" y2="29"/>
                            </g>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 36" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.6" fill="none">
                                <line x1="6" y1="7" x2="46" y2="7"/>
                                <path d="M12 20 C19 11, 21 25, 26 16 C31 25, 33 11, 40 20"/>
                                <circle cx="26" cy="16" r="1.8" fill="${s}"/>
                                <line x1="6" y1="28" x2="46" y2="28"/>
                                <line x1="6" y1="32" x2="46" y2="32"/>
                            </g>
                        </svg>`
                };

            case 5: // Archetype 6: Ribbed Header & Diagonal Lattice Cross
                return {
                    plaqueClass: 'plaque-rect',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 50" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.3">
                                <line x1="5" y1="5" x2="47" y2="5"/><line x1="5" y1="9" x2="47" y2="9"/>
                                <line x1="5" y1="13" x2="47" y2="13"/><line x1="5" y1="17" x2="47" y2="17"/>
                                <line x1="3" y1="21" x2="49" y2="21" stroke-width="1.8"/>
                                <line x1="11" y1="25" x2="41" y2="44" stroke-width="1.5"/>
                                <line x1="41" y1="25" x2="11" y2="44" stroke-width="1.5"/>
                                <line x1="3" y1="48" x2="49" y2="48" stroke-width="1.8"/>
                            </g>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 50" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.3">
                                <line x1="3" y1="2" x2="49" y2="2" stroke-width="1.8"/>
                                <line x1="11" y1="6" x2="41" y2="25" stroke-width="1.5"/>
                                <line x1="41" y1="6" x2="11" y2="25" stroke-width="1.5"/>
                                <line x1="3" y1="29" x2="49" y2="29" stroke-width="1.8"/>
                                <line x1="5" y1="33" x2="47" y2="33"/><line x1="5" y1="37" x2="47" y2="37"/>
                                <line x1="5" y1="41" x2="47" y2="41"/><line x1="5" y1="45" x2="47" y2="45"/>
                            </g>
                        </svg>`
                };

            case 6: // Archetype 7: Radiating Folk Rhombus
                return {
                    plaqueClass: 'plaque-medallion',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 46" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.5" fill="none">
                                <polygon points="26,9 41,23 26,37 11,23"/>
                                <polygon points="26,14 35,23 26,32 17,23"/>
                                <line x1="26" y1="3" x2="26" y2="9"/>
                                <line x1="26" y1="37" x2="26" y2="43"/>
                                <line x1="4" y1="23" x2="11" y2="23"/>
                                <line x1="41" y1="23" x2="48" y2="23"/>
                            </g>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 46" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.5" fill="none">
                                <polygon points="26,9 41,23 26,37 11,23"/>
                                <polygon points="26,14 35,23 26,32 17,23"/>
                                <line x1="26" y1="3" x2="26" y2="9"/>
                                <line x1="26" y1="37" x2="26" y2="43"/>
                                <line x1="4" y1="23" x2="11" y2="23"/>
                                <line x1="41" y1="23" x2="48" y2="23"/>
                            </g>
                        </svg>`
                };

            case 7: // Archetype 8: Stamp Block & Calligraphic Teardrop Loop Knot
                return {
                    plaqueClass: 'plaque-stamp',
                    topSvg: `
                        <svg viewBox="0 0 52 20" fill="none" preserveAspectRatio="xMidYMid meet">
                            <line x1="6" y1="8" x2="46" y2="8" stroke="${s}" stroke-width="1.8"/>
                            <circle cx="26" cy="14" r="2" fill="${s}"/>
                        </svg>`,
                    lowerOrnamentSvg: `
                        <div class="vector-cap mt-1">
                            <svg viewBox="0 0 52 54" fill="none" preserveAspectRatio="xMidYMid meet">
                                <g stroke="${s}" stroke-width="2" fill="none" stroke-linecap="round">
                                    <path d="M26 8 C14 22, 14 36, 26 46 C38 36, 38 22, 26 8 Z"/>
                                    <path d="M26 19 C19 28, 19 37, 26 46 C33 37, 33 28, 26 19 Z"/>
                                    <line x1="26" y1="3" x2="26" y2="8"/>
                                    <line x1="26" y1="46" x2="26" y2="51"/>
                                </g>
                            </svg>
                        </div>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 20" fill="none" preserveAspectRatio="xMidYMid meet">
                            <circle cx="26" cy="6" r="2" fill="${s}"/>
                            <line x1="6" y1="13" x2="46" y2="13" stroke="${s}" stroke-width="1.8"/>
                        </svg>`
                };

            case 8: // Archetype 9: Recessed Arch Plaque & Celtic Figure-8 Braid
                return {
                    plaqueClass: 'plaque-arch',
                    topSvg: `
                        <svg viewBox="0 0 52 20" fill="none" preserveAspectRatio="xMidYMid meet">
                            <line x1="5" y1="7" x2="47" y2="7" stroke="${s}" stroke-width="1.8"/>
                            <line x1="9" y1="12" x2="43" y2="12" stroke="${s}" stroke-width="1.3"/>
                        </svg>`,
                    lowerOrnamentSvg: `
                        <div class="vector-cap mt-1">
                            <svg viewBox="0 0 52 52" fill="none" preserveAspectRatio="xMidYMid meet">
                                <g stroke="${s}" stroke-width="2" fill="none">
                                    <path d="M18 8 C13 19, 39 29, 34 40 C30 48, 22 48, 18 40 C13 29, 39 19, 34 8 Z"/>
                                    <path d="M34 8 C39 19, 13 29, 18 40 C22 48, 30 48, 34 40 C39 29, 13 19, 18 8 Z"/>
                                </g>
                            </svg>
                        </div>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 20" fill="none" preserveAspectRatio="xMidYMid meet">
                            <line x1="9" y1="8" x2="43" y2="8" stroke="${s}" stroke-width="1.3"/>
                            <line x1="5" y1="13" x2="47" y2="13" stroke="${s}" stroke-width="1.8"/>
                        </svg>`
                };

            default: // Archetype 10: Quatrefoil Floral Clover & Recessed Frame
                return {
                    plaqueClass: 'plaque-rect',
                    lowerOrnamentSvg: '',
                    topSvg: `
                        <svg viewBox="0 0 52 44" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.6" fill="none">
                                <circle cx="26" cy="19" r="7"/>
                                <circle cx="20.5" cy="19" r="4.5"/>
                                <circle cx="31.5" cy="19" r="4.5"/>
                                <circle cx="26" cy="13.5" r="4.5"/>
                                <circle cx="26" cy="24.5" r="4.5"/>
                                <line x1="5" y1="38" x2="47" y2="38"/>
                            </g>
                        </svg>`,
                    bottomSvg: `
                        <svg viewBox="0 0 52 44" fill="none" preserveAspectRatio="xMidYMid meet">
                            <g stroke="${s}" stroke-width="1.6" fill="none">
                                <line x1="5" y1="6" x2="47" y2="6"/>
                                <circle cx="26" cy="25" r="7"/>
                                <circle cx="20.5" cy="25" r="4.5"/>
                                <circle cx="31.5" cy="25" r="4.5"/>
                                <circle cx="26" cy="19.5" r="4.5"/>
                                <circle cx="26" cy="30.5" r="4.5"/>
                            </g>
                        </svg>`
                };
        }
    }

    // Refinement #4: Matching Vector Ornament End-Caps for Horizontal Stacked Books
    function getHorizontalStackEndcapSvg(motifIdx, palette) {
        const s = palette.accent || '#78222b';
        const inner = palette.plaqueInnerStroke || s;
        const dot = palette.text || '#fffdf7';
        const m = ((motifIdx % 5) + 5) % 5;

        if (m === 0) {
            // Folk Cross Diamond
            const svg = `
                <svg viewBox="0 0 24 24" fill="none">
                    <line x1="3" y1="3" x2="3" y2="21" stroke="${s}" stroke-width="1.6"/>
                    <polygon points="14,4 21,12 14,20 7,12" fill="none" stroke="${s}" stroke-width="1.5"/>
                    <line x1="10" y1="8" x2="18" y2="16" stroke="${s}" stroke-width="1.2"/>
                    <line x1="18" y1="8" x2="10" y2="16" stroke="${s}" stroke-width="1.2"/>
                </svg>`;
            return { leftSvg: svg, rightSvg: svg };
        } else if (m === 1) {
            // Concentric Diamond with Pearl Dot
            const svg = `
                <svg viewBox="0 0 24 24" fill="none">
                    <polygon points="12,3 21,12 12,21 3,12" fill="none" stroke="${s}" stroke-width="1.5"/>
                    <polygon points="12,7 17,12 12,17 7,12" fill="none" stroke="${inner}" stroke-width="1.1"/>
                    <circle cx="12" cy="12" r="1.6" fill="${dot}"/>
                </svg>`;
            return { leftSvg: svg, rightSvg: svg };
        } else if (m === 2) {
            // Concentric Squares
            const svg = `
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" fill="none" stroke="${s}" stroke-width="1.5"/>
                    <rect x="7.5" y="7.5" width="9" height="9" fill="none" stroke="${s}" stroke-width="1.2"/>
                    <rect x="10" y="10" width="4" height="4" fill="${s}"/>
                </svg>`;
            return { leftSvg: svg, rightSvg: svg };
        } else if (m === 3) {
            // Vintage Oval Cameo Medallion
            const svg = `
                <svg viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="12" rx="7" ry="9" fill="${palette.plaqueSolid || s}" stroke="${s}" stroke-width="1.5"/>
                    <ellipse cx="12" cy="12" rx="4.5" ry="6.5" fill="none" stroke="${inner}" stroke-width="1"/>
                </svg>`;
            return { leftSvg: svg, rightSvg: svg };
        } else {
            // Quatrefoil Clover
            const svg = `
                <svg viewBox="0 0 24 24" fill="none">
                    <g stroke="${s}" stroke-width="1.4" fill="none">
                        <circle cx="12" cy="12" r="4.5"/>
                        <circle cx="8.5" cy="12" r="3"/>
                        <circle cx="15.5" cy="12" r="3"/>
                        <circle cx="12" cy="8.5" r="3"/>
                        <circle cx="12" cy="15.5" r="3"/>
                    </g>
                </svg>`;
            return { leftSvg: svg, rightSvg: svg };
        }
    }

    // Creates an individual book item on the shelf (or standing on top of a 1-2 book bottom stack)
    function createDoodleBook(book, theme, customDimensions = null, slotIdx = 0) {
        const item = document.createElement('div');
        const rawStyle = book.spine_style || 'spine';
        const style = customDimensions ? 'spine' : (rawStyle === 'top-spine' ? 'spine' : rawStyle);
        const palette = theme || coverThemes[0];
        const color = palette.bg;
        const displayTitle = cleanTitle(book.title);
        const displayAuthor = cleanAuthor(book.author);
        const ribbonClass = getRibbonClass(book);

        item.className = `doodle-book ${style === 'leaning' ? 'is-leaning' : ''}`;

        if (style === 'front') {
            // Front-Facing Cover
            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-front-cover">
                    <div class="${ribbonClass}" style="background-color: ${palette.ribbon};"></div>
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
                frontCoverEl.style.color = palette.text;
            }
        } else {
            // Vector Book Spine (Standing, Leaning, or Standing on top of a 1-2 book stack)
            const metrics = getBookSpineMetrics(book);
            const spineWidth = customDimensions ? customDimensions.width : metrics.width;
            const height = customDimensions ? customDimensions.height : metrics.height;
            const isCompact = height < 218;

            // Mix-and-match motif index so adjacent books never duplicate color OR ornament archetype
            const seed = computeBookSeed(book);
            const motifIdx = (slotIdx * 3 + (seed % 3)) % 10;
            const motifParts = getVectorSpineMotifParts(motifIdx, palette, isCompact);
            const titleStyle = getSmartSpineTitleStyle(displayTitle, spineWidth, height);

            // For solid contrast stamp/cameo plaques, ensure text color contrasts against plaqueBg
            const plaqueTextColor = (motifParts.plaqueClass === 'plaque-stamp')
                ? '#fffdf7'
                : palette.text;
            const plaqueSubTextColor = (motifParts.plaqueClass === 'plaque-stamp')
                ? '#fde68a'
                : (palette.subText || palette.text);

            item.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="book-body select-none" style="
                    width: ${spineWidth}px;
                    height: ${height}px;
                    background-color: ${color};
                    color: ${palette.text};
                    --spine-bg: ${color};
                    --plaque-bg: ${palette.plaqueBg};
                    --plaque-stroke: ${palette.plaqueStroke || palette.accent};
                    --plaque-inner-stroke: ${palette.plaqueInnerStroke || palette.accent};
                ">
                    <div class="${ribbonClass}" style="background: ${palette.ribbon};"></div>
                    <div class="vector-cap vector-cap-top">${motifParts.topSvg}</div>
                    <div class="vector-center-zone">
                        <div class="vector-plaque ${motifParts.plaqueClass}" style="color: ${plaqueTextColor};">
                            <span class="spine-title-text" style="${titleStyle}">${escapeHtml(displayTitle)}</span>
                            <div class="spine-divider" style="background: ${palette.plaqueStroke || palette.accent};"></div>
                            <div class="spine-author-frame">
                                <span class="spine-author-text" style="color: ${plaqueSubTextColor};">${escapeHtml(displayAuthor)}</span>
                            </div>
                        </div>
                        ${motifParts.lowerOrnamentSvg || ''}
                    </div>
                    <div class="vector-cap vector-cap-bottom">${motifParts.bottomSvg}</div>
                </div>
            `;
        }

        item.addEventListener('click', () => openBookModal(book, palette));
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
            const vm = getViewportShelfMetrics();
            const topRow = document.createElement('div');
            topRow.className = 'stack-top-spines';
            const maxTopSpineHeight = vm.maxTopSpineBaseH - (bottomBooks.length * vm.stackLayerPitch);

            topSpines.forEach((tb, idx) => {
                const slotIdx = baseThemeIdx + bottomBooks.length + idx;
                const theme = getBookStyle(slotIdx, tb);
                const naturalMetrics = getBookSpineMetrics(tb);
                const topSpineWidth = Math.min(vm.topSpineMaxW, Math.max(vm.topSpineMinW, naturalMetrics.width - 8));
                const topSpineHeight = Math.min(maxTopSpineHeight, maxTopSpineHeight - ((idx * 6) % 12));
                topRow.appendChild(createDoodleBook(tb, theme, { width: topSpineWidth, height: topSpineHeight }, slotIdx));
            });

            wrap.appendChild(topRow);
        }

        // Render the horizontal stacked books at the bottom (with matching Vector Colors & Ornament End-Caps)
        bottomBooks.forEach((b, i) => {
            const slotIdx = baseThemeIdx + i;
            const palette = getBookStyle(slotIdx, b);
            const color = palette.bg;
            const displayTitle = cleanTitle(b.title);
            const displayAuthor = cleanAuthor(b.author);
            const offsetX = offsets[i % offsets.length];
            const endcaps = getHorizontalStackEndcapSvg(slotIdx, palette);

            const layer = document.createElement('div');
            layer.className = 'doodle-book';
            layer.innerHTML = `
                <div class="hover-tooltip">Take out</div>
                <div class="stack-layer select-none" style="background-color: ${color}; color: ${palette.text}; transform: translateX(${offsetX}px);">
                    <div class="stack-vector-endcap">${endcaps.leftSvg}</div>
                    <div class="flex-1 px-1.5 text-center overflow-hidden">
                        <div class="font-lora font-bold text-[10px] sm:text-[10.5px] leading-tight truncate" style="color: ${palette.text};">${escapeHtml(displayTitle)}</div>
                        <div class="font-lora italic text-[8px] sm:text-[8.5px] leading-tight truncate" style="color: ${palette.subText || palette.text};">${escapeHtml(displayAuthor)}</div>
                    </div>
                    <div class="stack-vector-endcap">${endcaps.rightSvg}</div>
                </div>
            `;
            layer.addEventListener('click', () => openBookModal(b, palette));
            wrap.appendChild(layer);
        });

        return wrap;
    }

    // --- Pop-Out Book Modal ---

    function updateFavoriteButtonUI(isFav) {
        if (!btnToggleFavorite || !favoriteBtnText) return;
        const favIconImg = document.getElementById('modalFavoriteIconImg');
        if (isFav) {
            btnToggleFavorite.className = 'hand-btn hand-btn-sm bg-[#f2cc8f] text-[#2c221e] text-xs font-bold py-1 px-3 flex items-center gap-1.5';
            favoriteBtnText.innerText = 'Favorited';
            if (favIconImg) favIconImg.src = 'assets/images/icons/star_large.png';
            if (modalShelfBadge) modalShelfBadge.innerText = 'In Favorites';
        } else {
            btnToggleFavorite.className = 'hand-btn hand-btn-sm bg-white text-[#2c221e] text-xs font-bold py-1 px-3 flex items-center gap-1.5 hover:bg-[#fff9e6] transition-colors';
            favoriteBtnText.innerText = 'Mark as Favorite';
            if (favIconImg) favIconImg.src = 'assets/images/icons/star.png';
            if (modalShelfBadge) modalShelfBadge.innerText = 'Shelf: Currently Reading';
        }
    }

    function renderSpineColorSwatches(book, currentTheme) {
        const swatchContainer = document.getElementById('spineColorSwatches');
        const labelEl = document.getElementById('selectedPaletteLabel');
        if (!swatchContainer) return;

        swatchContainer.innerHTML = '';
        const activePaletteName = book.palette_name || '';

        if (labelEl) {
            labelEl.innerText = activePaletteName ? `${activePaletteName}` : `Auto Varied (${currentTheme ? currentTheme.name : 'Default'})`;
        }

        // "Auto" pill button so user can reset to automatic varied shelf rotation
        const autoBtn = document.createElement('button');
        autoBtn.type = 'button';
        autoBtn.className = `px-2.5 py-1 md:px-2 md:py-0.5 text-[11px] md:text-[10px] font-bold rounded-full border-2 border-[#2c221e] transition-transform ${
            !activePaletteName ? 'bg-[#2c221e] text-[#fffdf7] scale-105' : 'bg-[#fffdf7] text-[#2c221e] hover:bg-[#f4e8d6]'
        }`;
        autoBtn.innerText = 'Auto';
        autoBtn.title = 'Automatically vary spine color across the shelf';
        autoBtn.addEventListener('click', async () => {
            book.palette_name = '';
            book.custom_spine_color = false;
            await window.storageEngine.updateBook(book.id, {
                palette_name: '',
                custom_spine_color: false
            });
            renderShelves();
            renderSpineColorSwatches(book, currentTheme);
            showToast('Set spine color to Auto Varied', 'success');
        });
        swatchContainer.appendChild(autoBtn);

        // Render a swatch circle for every color in bookPalette
        bookPalette.forEach((pal) => {
            const isSelected = activePaletteName === pal.name;
            const sw = document.createElement('button');
            sw.type = 'button';
            sw.title = pal.name;
            sw.style.backgroundColor = pal.bg;
            sw.className = `w-6 h-6 md:w-5 md:h-5 rounded-full border-2 border-[#2c221e] transition-transform ${
                isSelected ? 'ring-2 ring-offset-1 ring-[#2c221e] scale-115' : 'hover:scale-110'
            }`;
            sw.addEventListener('click', async () => {
                book.palette_name = pal.name;
                book.spine_color = pal.bg;
                book.custom_spine_color = true;
                if (!book.cover_url && modalCover) {
                    modalCover.style.backgroundColor = pal.bg;
                }
                await window.storageEngine.updateBook(book.id, {
                    palette_name: pal.name,
                    spine_color: pal.bg,
                    custom_spine_color: true
                });
                renderShelves();
                renderSpineColorSwatches(book, pal);
                showToast(`Spine color set to ${pal.name}!`, 'success');
            });
            swatchContainer.appendChild(sw);
        });
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
            modalCover.style.backgroundColor = theme ? theme.bg : (book.spine_color || '#E5A93C');
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

        renderSpineColorSwatches(book, theme);

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
