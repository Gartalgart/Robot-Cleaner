/**
 * Render the grid of the house and robot.
 * @param {House} house - The house object containing the layout.
 * @param {Robot} robot - The robot object with its position.
 */
export function renderGrid(house, robot) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 0; i < house.layout.length; i++) {
    for (let j = 0; j < house.layout[i].length; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const piece = house.layout[i][j];
      if (robot.position[0] === i && robot.position[1] === j) {
        cell.classList.add("robot");
        cell.textContent = "🤖";
      } else if (piece.state === "dirty") {
        cell.classList.add("dirty");
        cell.textContent = "💩";
      } else if (piece.state === "clean_by_robot") {
        cell.classList.add("clean_by_robot");
        cell.textContent = "🧽";
      } else {
        cell.classList.add("clean");
        cell.textContent = "🧼";
      }
      grid.appendChild(cell);
    }
  }
}

/**
 * Render the robot's battery status.
 * @param {Robot} robot - The robot object with its battery property.
 */
export function renderBattery(robot) {
  const batteryStatus = document.getElementById("battery-status");
  let batteryCopy = robot.battery;
  let battery = [];
  for (let i = 0; i < 10; i++) {
    battery.push(batteryCopy > 0 ? "🟩" : "🟥");
    batteryCopy -= 10;
  }
  batteryStatus.innerHTML = `
    <span class="battery-percent">${robot.battery}%</span>
    <div class="battery-bar">
      ${battery.map((b) => `<div>${b}</div>`).join("")}
    </div>
  `;
}

/**
 * Render all UI elements related to the house and robot.
 * @param {House} house
 * @param {Robot} robot
 */
export function renderAll(house, robot) {
  renderBattery(robot);
  renderGrid(house, robot);
}
