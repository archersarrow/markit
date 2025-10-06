// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Manager, State, Window, CustomMenuItem, Menu, Submenu, MenuItem};

#[derive(Debug, Serialize, Deserialize)]
struct FileEntry {
    name: String,
    path: String,
    #[serde(rename = "isDirectory")]
    is_directory: bool,
    #[serde(rename = "isFile")]
    is_file: bool,
    extension: String,
    size: u64,
    modified: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Globals {
    content: String,
    theme: String,
    #[serde(rename = "allowHtml")]
    allow_html: bool,
    #[serde(rename = "workspacePath")]
    workspace_path: Option<String>,
}

// Store management
struct AppState {
    content: std::sync::Mutex<String>,
    theme: std::sync::Mutex<String>,
    allow_html: std::sync::Mutex<bool>,
    workspace_path: std::sync::Mutex<Option<String>>,
    github_token: std::sync::Mutex<String>,
}

impl AppState {
    fn new() -> Self {
        Self {
            content: std::sync::Mutex::new(String::new()),
            theme: std::sync::Mutex::new("yonce".to_string()),
            allow_html: std::sync::Mutex::new(false),
            workspace_path: std::sync::Mutex::new(None),
            github_token: std::sync::Mutex::new(String::new()),
        }
    }
}

#[tauri::command]
fn get_globals(state: State<AppState>) -> Globals {
    Globals {
        content: state.content.lock().unwrap().clone(),
        theme: state.theme.lock().unwrap().clone(),
        allow_html: *state.allow_html.lock().unwrap(),
        workspace_path: state.workspace_path.lock().unwrap().clone(),
    }
}

#[tauri::command]
fn save_content_in_store(content: String, state: State<AppState>) {
    *state.content.lock().unwrap() = content;
}

#[tauri::command]
fn set_theme(theme: String, state: State<AppState>) {
    *state.theme.lock().unwrap() = theme;
}

#[tauri::command]
fn set_allow_html(allow: bool, state: State<AppState>) {
    *state.allow_html.lock().unwrap() = allow;
}

#[tauri::command]
fn set_workspace_path(path: String, state: State<AppState>) {
    *state.workspace_path.lock().unwrap() = Some(path);
}

#[tauri::command]
fn get_github_token(state: State<AppState>) -> String {
    state.github_token.lock().unwrap().clone()
}

#[tauri::command]
fn set_github_token(token: String, state: State<AppState>) -> Result<bool, String> {
    *state.github_token.lock().unwrap() = token;
    Ok(true)
}

#[tauri::command]
async fn fs_list_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;

    let mut result = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();

        let extension = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_string();

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs().to_string())
            .unwrap_or_default();

        result.push(FileEntry {
            name: file_name,
            path: file_path.to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
            is_file: metadata.is_file(),
            extension,
            size: metadata.len(),
            modified,
        });
    }

    Ok(result)
}

#[tauri::command]
async fn fs_read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn fs_write_file(path: String, content: String) -> Result<bool, String> {
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
async fn fs_copy_file(src: String, dest: String) -> Result<bool, String> {
    fs::copy(&src, &dest).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
async fn fs_ensure_dir(path: String) -> Result<bool, String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
async fn save_png_file(file_path: String, data: String) -> Result<bool, String> {
    let bytes = base64::decode(&data).map_err(|e| e.to_string())?;
    fs::write(&file_path, bytes).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
fn show_notification(window: Window, title: String, body: String) {
    window.emit("SHOW_TOAST", serde_json::json!({
        "message": body,
        "type": "info"
    })).ok();
}

fn main() {
    // Build native app menu (Tauri v1 API)
    // File
    let m_open_folder = CustomMenuItem::new("open_folder".to_string(), "Open Folder...");
    let m_export_html = CustomMenuItem::new("export_html".to_string(), "Export as HTML");
    let m_export_pdf = CustomMenuItem::new("export_pdf".to_string(), "Export as PDF");
    let m_export_png = CustomMenuItem::new("export_png".to_string(), "Export as PNG");
    let file_menu = Menu::new()
        .add_item(m_open_folder)
        .add_native_item(MenuItem::Separator)
        .add_item(m_export_html)
        .add_item(m_export_pdf)
        .add_item(m_export_png);
    let file_submenu = Submenu::new("File", file_menu);

    // Edit
    let m_undo = CustomMenuItem::new("edit_undo".to_string(), "Undo");
    let m_redo = CustomMenuItem::new("edit_redo".to_string(), "Redo");
    let m_cut = CustomMenuItem::new("edit_cut".to_string(), "Cut");
    let m_copy = CustomMenuItem::new("edit_copy".to_string(), "Copy");
    let m_paste = CustomMenuItem::new("edit_paste".to_string(), "Paste");
    let m_select_all = CustomMenuItem::new("edit_select_all".to_string(), "Select All");
    let edit_menu = Menu::new()
        .add_item(m_undo)
        .add_item(m_redo)
        .add_native_item(MenuItem::Separator)
        .add_item(m_cut)
        .add_item(m_copy)
        .add_item(m_paste)
        .add_item(m_select_all);
    let edit_submenu = Submenu::new("Edit", edit_menu);

    // View
    let m_toggle_preview = CustomMenuItem::new("toggle_preview".to_string(), "Toggle Output").accelerator("CmdOrCtrl+Shift+P");
    let view_menu = Menu::new().add_item(m_toggle_preview);
    let view_submenu = Submenu::new("View", view_menu);

    // Themes
    let theme_yonce = CustomMenuItem::new("theme_yonce".to_string(), "Yonce");
    let theme_ayu_dark = CustomMenuItem::new("theme_ayu_dark".to_string(), "Ayu Dark");
    let theme_darcula = CustomMenuItem::new("theme_darcula".to_string(), "Darcula");
    let theme_material = CustomMenuItem::new("theme_material".to_string(), "Material");
    let theme_monokai = CustomMenuItem::new("theme_monokai".to_string(), "Monokai");
    let themes_menu = Menu::new()
        .add_item(theme_yonce)
        .add_item(theme_ayu_dark)
        .add_item(theme_darcula)
        .add_item(theme_material)
        .add_item(theme_monokai);
    let themes_submenu = Submenu::new("Themes", themes_menu);

    // Share
    let gist_public = CustomMenuItem::new("gist_public".to_string(), "Publish Gist (Public)");
    let gist_secret = CustomMenuItem::new("gist_secret".to_string(), "Publish Gist (Secret)");
    let share_menu = Menu::new().add_item(gist_public).add_item(gist_secret);
    let share_submenu = Submenu::new("Share", share_menu);

    // Settings
    let open_settings = CustomMenuItem::new("open_settings".to_string(), "Preferences...").accelerator("CmdOrCtrl+,");
    let toggle_toc = CustomMenuItem::new("toggle_toc".to_string(), "Toggle Table of Contents").accelerator("CmdOrCtrl+T");
    let settings_menu = Menu::new().add_item(open_settings).add_item(toggle_toc);
    let settings_submenu = Submenu::new("Settings", settings_menu);

    // Help
    let welcome = CustomMenuItem::new("welcome".to_string(), "Welcome");
    let release_notes = CustomMenuItem::new("release_notes".to_string(), "Release Notes");
    let report_issue = CustomMenuItem::new("report_issue".to_string(), "Report Issue");
    let follow_twitter = CustomMenuItem::new("follow_twitter".to_string(), "Follow in Twitter");
    let help_menu = Menu::new()
        .add_item(welcome)
        .add_item(release_notes)
        .add_native_item(MenuItem::Separator)
        .add_item(report_issue)
        .add_item(follow_twitter);
    let help_submenu = Submenu::new("Help", help_menu);

    let app_menu = Menu::new()
        .add_submenu(file_submenu)
        .add_submenu(edit_submenu)
        .add_submenu(view_submenu)
        .add_submenu(themes_submenu)
        .add_submenu(share_submenu)
        .add_submenu(settings_submenu)
        .add_submenu(help_submenu);

    tauri::Builder::default()
        .menu(app_menu)
        .on_menu_event(|event| {
            let id = event.menu_item_id();
            let win = event.window();
            match id {
                "open_folder" => { let _ = win.emit("OPEN_WORKSPACE_FOLDER", ()); }
                "export_html" => { let _ = win.emit("EXPORT_TO_HTML", ()); }
                "export_pdf" => { let _ = win.emit("DO_EXPORT_PDF", ()); }
                "export_png" => { let _ = win.emit("DO_EXPORT_PNG", ()); }
                "toggle_preview" => { let _ = win.emit("TOGGLE_PREVIEW", ()); }
                "open_settings" => { let _ = win.emit("OPEN_SETTINGS", ()); }
                "toggle_toc" => { let _ = win.emit("TOGGLE_TOC", ()); }
                // Themes
                "theme_yonce" => { let _ = win.emit("SET_THEME", "yonce"); }
                "theme_ayu_dark" => { let _ = win.emit("SET_THEME", "ayu-dark"); }
                "theme_darcula" => { let _ = win.emit("SET_THEME", "darcula"); }
                "theme_material" => { let _ = win.emit("SET_THEME", "material"); }
                "theme_monokai" => { let _ = win.emit("SET_THEME", "monokai"); }
                // Share
                "gist_public" => { let _ = win.emit("PUBLISH_GIST", serde_json::json!({"secret": false})); }
                "gist_secret" => { let _ = win.emit("PUBLISH_GIST", serde_json::json!({"secret": true})); }
                // Help (emit URL to renderer; renderer will open via @tauri-apps/api/shell)
                "welcome" => { let _ = win.emit("OPEN_URL", "https://saketh-kowtha.github.io/markit/"); }
                "release_notes" => { let _ = win.emit("OPEN_URL", "https://github.com/saketh-kowtha/markit/releases"); }
                "report_issue" => { let _ = win.emit("OPEN_URL", "https://github.com/saketh-kowtha/markit/issues"); }
                "follow_twitter" => { let _ = win.emit("OPEN_URL", "https://twitter.com/saketh_kowtha"); }
                // Edit routing to renderer to operate CodeMirror
                "edit_undo" => { let _ = win.emit("EDIT_UNDO", ()); }
                "edit_redo" => { let _ = win.emit("EDIT_REDO", ()); }
                "edit_cut" => { let _ = win.emit("EDIT_CUT", ()); }
                "edit_copy" => { let _ = win.emit("EDIT_COPY", ()); }
                "edit_paste" => { let _ = win.emit("EDIT_PASTE", ()); }
                "edit_select_all" => { let _ = win.emit("EDIT_SELECT_ALL", ()); }
                _ => {}
            }
        })
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            get_globals,
            save_content_in_store,
            set_theme,
            set_allow_html,
            set_workspace_path,
            get_github_token,
            set_github_token,
            fs_list_dir,
            fs_read_file,
            fs_write_file,
            fs_copy_file,
            fs_ensure_dir,
            save_png_file,
            show_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
