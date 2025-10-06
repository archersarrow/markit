// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Manager, State, Window};

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
    tauri::Builder::default()
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
