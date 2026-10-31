# 📖 Lumina Bookshelf (Vercel + Supabase + IndexedDB Edition)

A modern, fast, and elegant personal cloud library and in-browser e-reader designed to run on **Vercel** with **$0 hosting cost forever**.

## ✨ Features
- **Dual Storage Engine**:
  - **IndexedDB**: Works offline and out-of-the-box in any browser with zero configuration or keys.
  - **Supabase Cloud Sync**: Connect your free Supabase account to sync your books, shelves, and reading progress across all your devices.
- **In-Browser EPUB & PDF Reader**: Powered by `ePub.js` with:
  - 4 Reading Themes (Light, Warm Sepia, Dark Slate, OLED Pitch Black)
  - Font size controls and typography switcher
  - Table of Contents navigation drawer
  - Reading progress percentage & location (CFI) memory
- **3D Wooden Bookshelf & Grid View**: Realistic wooden shelf rails with 3D spine depth effect, hover tilt, and view toggling.
- **Custom Shelves**: Organize books into shelves with custom colors and live book counts.

---

## 🚀 How to Deploy on Vercel via GitHub Cloud (3 Minutes)

### Step 1: Initialize Git & Push to GitHub
1. Open PowerShell or Terminal in this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Lumina Bookshelf"
   ```
2. Go to [github.com/new](https://github.com/new) and create a new repository named `lumina-bookshelf`.
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lumina-bookshelf.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import your `lumina-bookshelf` GitHub repository.
4. Framework Preset: Leave as **Other** (Static HTML).
5. Click **"Deploy"**.
6. In ~15 seconds, your bookshelf will be live at `https://lumina-bookshelf.vercel.app`!

---

## ☁️ Optional: Setting up Free Supabase Cloud Sync
If you want to sync books across your laptop, phone, and tablet:
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy and paste the contents of [`supabase_schema.sql`](supabase_schema.sql) and click **Run**.
5. Go to **Project Settings -> API** to copy:
   - **Project URL**
   - **Anon Public Key**
6. Open your live Vercel bookshelf, click **"Browser Storage / Supabase Cloud"** in the sidebar, paste your keys, and click **Connect**!
