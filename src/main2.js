const { invoke } = window.__TAURI__.tauri;

document.addEventListener("DOMContentLoaded", function () {
  const display = document.getElementById("display");
  const buttons = document.querySelectorAll("button");
  let currentInput = "0";
  let previousInput = "";
  let operator = "";
  let isDecimalAdded = false;

  function updateDisplay() {
    display.innerText = currentInput;
  }

  function clear() {
    currentInput = "0";
    previousInput = "";
    operator = "";
    isDecimalAdded = false;
    updateDisplay();
  }

  function handleNumber(num) {
    if (currentInput === "0" && num !== ".") {
      currentInput = num;
    } else {
      currentInput += num;
    }
  }

  function handleOperator(op) {
    if (operator && previousInput) {
      calculate();
    }
    operator = op;
    previousInput = currentInput;
    currentInput = "0";
    isDecimalAdded = false;
  }

  function calculate() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    switch (operator) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "⨉":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
      default:
        return;
    }

    currentInput = result.toString();
    operator = "";
    previousInput = "";
    isDecimalAdded = false;
    updateDisplay();
  }

  function handleSpecialFunctions(func) {
    switch (func) {
      case "C":
        clear();
        break;
      case "+/-":
        currentInput = (parseFloat(currentInput) * -1).toString();
        break;
      case "%":
        currentInput = (parseFloat(currentInput) / 100).toString();
        break;
      case ".":
        if (!isDecimalAdded) {
          currentInput += ".";
          isDecimalAdded = true;
        }
        break;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.innerText;

      if (button.classList.contains("number")) {
        handleNumber(value);
      } else if (button.classList.contains("operator")) {
        handleOperator(value);
      } else {
        handleSpecialFunctions(value);
      }

      if (value === "=") {
        calculate();
      }

      updateDisplay();
    });
  });

  document.getElementById("clear").addEventListener("click", clear);
});
