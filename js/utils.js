/**
 * Show a message in the UI for a short duration.
 * @param {string} msg - The message to display.
 * @returns {Promise<void>}
 */
export function showMessage(msg) {
  let msgDiv = document.getElementById("message");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "message";
    msgDiv.style.textAlign = "center";
    msgDiv.style.margin = "1em 0";
    msgDiv.style.fontWeight = "bold";
    document
      .querySelector("main")
      .insertBefore(msgDiv, document.getElementById("house-layout"));
  }
  msgDiv.textContent = msg;
  return new Promise((resolve) => setTimeout(resolve, 600));
}

/**
 * Clear the message from the UI.
 */
export function clearMessage() {
  let msgDiv = document.getElementById("message");
  if (msgDiv) msgDiv.textContent = "";
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
