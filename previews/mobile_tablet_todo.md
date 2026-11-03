# Pinned To-Do: Tablet & Phone Optimization Roadmap

This checklist is saved for when we are ready to optimize **The Cozy Nook** for phones (`320px–639px`) and tablets (`640px–1024px`).

## 1. Proportional Shelf & Book Scaling on Phones (`assets/js/app.js` + `assets/css/style.css`)
- [ ] **Responsive Shelf Metrics**:
  - **Phones (`< 640px`)**: Scale `.bookcase-bay` height from `292px` to `236px`, upright vector spines to `44px–54px` wide (`178px–205px` tall), and horizontal stacks to `132px` wide (`27px` tall layers) so **5–6 upright books** (or a horizontal stack + 3 upright spines) fit comfortably on every row.
  - **Tablets (`640px–1024px`)**: Scale `.bookcase-bay` height to `268px` and horizontal stacks to `152px` wide.
- [ ] **Mochi Pixel Scaling on Phones**:
  - Use a crisp `3x` integer pixel scale (`96px × 96px`) for `.pixel-cat-sprite` on viewports `< 640px` so Mochi stays razor-sharp and sits flush on `.bookcase-crown`.

## 2. Automatic Shelf Reflow on Device Rotation (`assets/js/app.js`)
- [ ] **Debounced Resize & Orientation Listener**:
  - Add a `150ms` debounced `window.addEventListener('resize', ...)` handler that re-measures `shelvesContainer.clientWidth` and calls `renderShelves()` whenever the viewport width changes (such as rotating an iPad or phone between portrait and landscape).

## 3. Scroll-Safe, Touch-Friendly Modals & Header (`index.html` + `assets/css/style.css`)
- [ ] **Modal Viewport Safety**:
  - Add `max-h-[90dvh] overflow-y-auto cozy-scroll` to `#readModal`, `#uploadModal`, and `#cloudModal` dialog cards so they never clip on shorter phone screens.
- [ ] **Compact Mobile Book Detail Header**:
  - Arrange the book cover thumbnail and title/author side-by-side on mobile inside `#readModal` so the **Shelf Arrangement Style** buttons, **Spine Color Palette** swatches (`28px` touch targets), and **Open & Read** button all fit comfortably without scrolling.
- [ ] **Mobile Header Toolbar**:
  - Tidy the top header buttons (`Wood`, `Cloud Sync`, `+ Slip a Book In`) into a clean, balanced mobile row.

## 4. Mobile & Tablet EPUB Reader Polish (`reader.html` + `assets/css/reader.css`)
- [ ] **Smart Reading Mode Defaults**:
  - Automatically default to **Single Page** (or **Scroll**) on screens `< 768px` and hide the **Two Pages** spread toggle on narrow phone viewports.
- [ ] **Touch Page-Turn Zones & Swipe Gestures**:
  - Add left/right touch-tap zones and horizontal swipe support on `#readerStage` for effortless thumb page-turning on phones and tablets.
