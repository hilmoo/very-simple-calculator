document.addEventListener("DOMContentLoaded", function () {
  const display = document.getElementById("display");
  const prevdisplay = document.getElementById("prevdisplay");
  const buttons = document.querySelectorAll("button");

  async function updateDisplay() {
    const currentInput = await window.__TAURI__.invoke("update_display");
    display.innerText = currentInput;
  }

  async function updateprevDisplay() {
    const currentInput = await window.__TAURI__.invoke("update_prevdisplay");
    prevdisplay.innerText = currentInput;
  }

  async function updateResult() {
    const currentInput = await window.__TAURI__.invoke("update_result");
    display.innerText = currentInput;
  }

  async function clear() {
    await window.__TAURI__.invoke("clear");
    await updateDisplay();
  }

  async function handleNumber(num) {
    await window.__TAURI__.invoke("handle_number", { num });
    await updateDisplay();
  }

  async function handleOperator(op) {
    await window.__TAURI__.invoke("handle_operator", { op });
    await updateDisplay();
  }

  async function handleSpecialFunctions(func) {
    await window.__TAURI__.invoke("handle_special_functions", { func });
    await updateDisplay();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.innerText;
      const isNumber = button.classList.contains("number");
      const isOperator = button.classList.contains("operator");

      if (isNumber) {
        await handleNumber(value);
      } else if (isOperator) {
        await handleOperator(value);
      } else {
        await handleSpecialFunctions(value);
      }

      await updateDisplay();

      if (value === "=") {
        await window.__TAURI__.invoke("handle_operator", { op: "" });
        await updateResult();
      }

      await updateprevDisplay();
    });
  });

  document.getElementById("clear").addEventListener("click", clear);

  // Initialize display on load
  updateDisplay();
});
