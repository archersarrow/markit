# Quick Start - Tauri MarkIt

## 🚀 Get Started in 3 Steps

### 1. Install Rust (One-Time Setup)

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Windows - Download from: https://win.rustup.rs/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npm run dev
```

That's it! The app will open automatically.

## 📦 Build for Distribution

```bash
npm run build
```

Output in `src-tauri/target/release/bundle/`

## ⚡ App Size

- **Before (Electron)**: ~500MB
- **After (Tauri)**: ~10-20MB

**50x smaller!** 🎉

## 📚 Full Documentation

See [TAURI_MIGRATION.md](./TAURI_MIGRATION.md) for complete details.
