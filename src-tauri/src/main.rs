#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};

struct CalculatorState {
    current_input: String,
    previous_input: String,
    result_input: String,
    operator: String,
    is_decimal_added: bool,
}

impl CalculatorState {
    fn new() -> Self {
        CalculatorState {
            current_input: "0".to_string(),
            previous_input: "".to_string(),
            result_input: "".to_string(),
            operator: "".to_string(),
            is_decimal_added: false,
        }
    }

    fn clear(&mut self) {
        self.current_input = "0".to_string();
        self.previous_input = "".to_string();
        self.result_input = "".to_string();
        self.operator = "".to_string();
        self.is_decimal_added = false;
    }
}

#[tauri::command]
fn update_display(state: tauri::State<Arc<Mutex<CalculatorState>>>) -> String {
    let state = state.lock().unwrap();
    state.current_input.clone()
}

#[tauri::command]
fn update_result(state: tauri::State<Arc<Mutex<CalculatorState>>>) -> String {
    let state = state.lock().unwrap();
    state.result_input.clone()
}

#[tauri::command]
fn update_prevdisplay(state: tauri::State<Arc<Mutex<CalculatorState>>>) -> String {
    let state = state.lock().unwrap();
    state.previous_input.clone()
}

#[tauri::command]
fn clear(state: tauri::State<Arc<Mutex<CalculatorState>>>) {
    let mut state = state.lock().unwrap();
    state.current_input = "0".to_string();
    state.previous_input = "".to_string();
    state.operator = "".to_string();
    state.is_decimal_added = false;
}

#[tauri::command]
fn handle_number(state: tauri::State<Arc<Mutex<CalculatorState>>>, num: String) {
    let mut state = state.lock().unwrap();
    if state.current_input == "0" && num != "." {
        state.current_input = num;
    } else {
        state.current_input.push_str(&num);
    }
}

#[tauri::command]
fn handle_operator(state: tauri::State<Arc<Mutex<CalculatorState>>>, op: String) {
    let mut state = state.lock().unwrap();
    if !state.operator.is_empty() && !state.previous_input.is_empty() {
        calculate(&mut state);
    }
    state.operator = op;
    state.previous_input = state.current_input.clone();
    state.current_input = "0".to_string();
    state.is_decimal_added = false;
}

fn calculate(state: &mut CalculatorState) {
    let prev = state.previous_input.parse::<f64>().unwrap_or(0.0);
    let current = state.current_input.parse::<f64>().unwrap_or(0.0);
    let result = match state.operator.as_str() {
        "+" => prev + current,
        "-" => prev - current,
        "⨉" => prev * current,
        "÷" => prev / current,
        _ => return,
    };
    state.result_input = result.to_string();
    state.operator.clear();
    state.previous_input = state.current_input.clone();
    state.is_decimal_added = false;
}

#[tauri::command]
fn handle_special_functions(state: tauri::State<Arc<Mutex<CalculatorState>>>, func: String) {
    let mut state = state.lock().unwrap();
    match func.as_str() {
        "C" => state.clear(),
        "+/-" => {
            state.current_input = (-state.current_input.parse::<f64>().unwrap_or(0.0)).to_string();
        }
        "%" => {
            state.current_input = (state.current_input.parse::<f64>().unwrap_or(0.0) / 100.0).to_string();
        }
        "." => {
            if !state.is_decimal_added {
                state.current_input.push('.');
                state.is_decimal_added = true;
            }
        }
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(CalculatorState::new())))
        .invoke_handler(tauri::generate_handler![
            update_display,
            clear,
            handle_number,
            handle_operator,
            handle_special_functions,
            update_result,
            update_prevdisplay,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
