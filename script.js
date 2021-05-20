let canvas = document.getElementById("canvas");
let canvasContext = canvas.getContext("2d");

let canvas1 = document.getElementById("canvas1");
let canvasContext1 = canvas1.getContext("2d");
canvasContext1.translate(canvas1.width / 2, 0);

document.querySelector(".hideParameter").classList.add("hidden");
document.querySelector(".input-container1").classList.add("hidden");

//
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

const outputSwitch = document.getElementById("output-switch");

function switchPar() {
  if (outputSwitch.checked == true) {
    outputSwitch.value = 1599;
  } else {
    outputSwitch.value = 799;
  }
}

// const singleDrawButton = document.getElementById('singleDraw-button');
// do this writible at the main page
//const LatticeType = document.mainForm.check.value;

var LatticeType;
const rotateButton = document.getElementById("rotate-button");
const singleResultButton = document.getElementById("singleResult-button");
const resultButton = document.getElementById("result-button");
const electronEnergy = document.getElementById("field1");
const circleRadius = document.getElementById("field2");
const columnsTilt = document.getElementById("field3");
const rowsTilt = document.getElementById("field4");
const rowsTiltScope = document.getElementById("replaceParameter");
const TreshAngle = document.getElementById("field5");
const TreshAngleInput = document.getElementById("field6");
const inputAngle = document.getElementById("field7");
const rangeInput = document.getElementById("field8");
const latticeContainer = document.querySelector(".modal-body-container");

const electronRestEnergy = 511.0034 * Math.pow(10, 3);

let context;
let niceArray = [];
let recLineArray = [];
let FinalResult = [];

function LatticeCase(x, y) {
  switch (LatticeType) {
    case 1:
      h =
        (30 * (4 * Math.PI)) /
        (Math.sqrt(3) * checkParameter(rowsTilt.value, 1, 4));
      a =
        (Math.PI * checkParameter(parseFloat(TreshAngle.value), 30, 90)) / 180;
      x = Math.sin(a) * h;
      koef = 0;
      koef2 = Math.sqrt(Math.pow(h, 2) - Math.pow(x, 2));
      return x;
    case 2:
      x =
        (30 * (4 * Math.PI)) /
        (Math.sqrt(3) * checkParameter(rowsTilt.value, 1, 4));
      koef = 2;
      koef2 = 0;
      return x;
    case 3:
      x =
        (30 * (4 * Math.PI)) /
        ((Math.sqrt(3) * checkParameter(rowsTilt.value, 2, 8)) / 2); //change this for /2
      koef = 1;
      koef2 = 0;
      rowsTiltScope.innerText = rowsTiltScope.innerText.replace("1-4", "2-8");
      return x;
    default:
      x = (y * Math.sqrt(3)) / 2;
      koef = 1;
      koef2 = 0;
      return x;
    case 5:
      x = y;
      koef = 2;
      koef2 = 0;
      return x;
  }
}
//single time drawing for getting image when started
function singleTimeDraw() {
  let angle = parseInt(inputAngle.value);
  drawAll(angle);
}

// rotating whole image for geting results at different angles
function rotate() {
  for (let i = 0; i <= 360; i++) {
    let j = i % 360;
    setTimeout(function () {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      drawAll(j);
      FinalResult.splice(
        i,
        0,
        `Angle ${i}:${i < 10 ? "   " : i < 100 ? "  " : " "}` +
          angleSpectreString
      );
      if (i === 360) {
        rotateButton.disabled = false;
        resultButton.disabled = false;
        singleResultButton.disabled = false;
      }
    }, i * 50);
  }
}

// Circle Constructor
class Circle {
  constructor(x, y, r, fill, color = "black") {
    this.x = x;
    this.y = y;
    this.r = r;
    this.fill = fill;
    this.color = color;
  }

  // drawing code to the actual circle
  // they can draw themselves.
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    context.closePath();
    if (this.fill) {
      context.fillStyle = this.color;
      context.fill();
    } else {
      context.strokeStyle = this.color;
      context.stroke();
    }
  }
}

function checkParameter(x, min, max) {
  if (x < min || x > max || isNaN(x)) {
    x = min;
    return x;
  } else {
    return x;
  }
}

/**
 * check for circle intersection with ewald's
 * @param {x coordinate of a first circle(ewald for this)} x1
 * @param {y coordinate of a first circle(ewald for this)} y1
 * @param {x coordinate of a second circle(circles for this)} x2
 * @param {y coordinate of a second circle(circles for this)} y2
 * @param {radius of a first circle(ewald for this)} r1
 * @param {radius of a second circle(circles for this)} r2
 */
function checkIfIntersected(r1, r2, L) {
  if (L > r1 + r2 || L < Math.abs(r1 - r2)) {
    return false;
  }
  return true;
}

// finds intersected dots
function intersectedDots(x1, y1, x2, y2, r1, r2, L) {
  let d = (r2 * r2 + L * L - r1 * r1) / (2 * L); //
  let h = Math.sqrt(r2 * r2 - d * d); //
  x3 = ((x2 - x1) * d) / L + ((y2 - y1) * h) / L + x1; // shows the intersection
  y3 = ((y2 - y1) * d) / L - ((x2 - x1) * h) / L + y1;
  x4 = ((x2 - x1) * d) / L - ((y2 - y1) * h) / L + x1;
  y4 = ((y2 - y1) * d) / L + ((x2 - x1) * h) / L + y1;
  return {
    point1: {
      x: x3,
      y: y3,
    },
    point2: {
      x: x4,
      y: y4,
    },
  };
}

/**
 * fill the spectre by...
 * @param {x coordinate of a center circle} x0
 * @param {y coordinate of a center circle} y0
 * @param {x coordinate of a first circle intersect dot} x3
 * @param {y coordinate of a first circle intersect dot} y3
 * @param {x coordinate of a second circle intersect dot} x4
 * @param {y coordinate of a second circle intersect dot} y4
 */
function spectreFill(x0, y0, x3, y3, x4, y4) {
  let L1 = Math.sqrt(Math.pow(x3 - x0, 2) + Math.pow(y3 - y0, 2));
  let L2 = Math.sqrt(Math.pow(x4 - x0, 2) + Math.pow(y4 - y0, 2));
  if (x3 < 0) {
    L1 = -L1;
  }
  if (x4 < 0) {
    L2 = -L2;
  }
  let L3 = L1 - L2;
  // var grd = canvasContext1.createLinearGradient(L2, 0,L3, 0);
  // grd.addColorStop(0,"black");
  // grd.addColorStop(.5,"white");
  // grd.addColorStop(1,"black");
  canvasContext1.fillStyle = "white";
  canvasContext1.fillRect(L2, 0, L3, canvas1.height);
}

function GetDataArray(zeroArray, x3, x4) {
  let modifiedArray;
  x3 = Math.round(x3) + canvas.width / 2;
  x4 = Math.round(x4) + canvas.width / 2;
  // console.log(x3, x4);
  modifiedArray = zeroArray.fill(1, x4, x3);
  return modifiedArray;
}

function writeTofile(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Create array and fill it with Circles
function drawAll(angle) {
  let angleSpectreArray = new Array(canvas1.width).fill(0);
  niceArray = [];
  recLineArray = [];
  let circleArray = [];
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(canvas.width / 2, canvas.height / 2);
  canvasContext1.fillStyle = "black";
  canvasContext1.fillRect(-canvas1.width, 0, canvas1.width * 2, canvas1.height);
  let rHugeTmp =
    1000 * parseFloat(checkParameter(electronEnergy.value, 10, 250));
  let rHuge =
    15 *
    (rHugeTmp / 1000 > 50
      ? 0.512 * Math.sqrt(rHugeTmp * (1 + rHugeTmp / electronRestEnergy))
      : 0.512 * Math.sqrt(rHugeTmp)); // Ewald's radius
  let radius = parseFloat(circleRadius.value); // circle radius
  let columnTilt = parseFloat(columnsTilt.value); // circles in x/y
  angle = checkParameter(angle, 0, 360);
  radius = 15 * checkParameter(radius, 0.2, 1.5);
  // console.log(radius);
  columnTilt =
    (30 * (4 * Math.PI)) / (Math.sqrt(3) * checkParameter(columnTilt, 1, 4));
  // let columnTiltReverse = (2 * Math.PI) / columnTilt;
  let rad = (angle * Math.PI) / 180;
  let threshold = 0;
  let numberPerRow = canvas.width / columnTilt;
  let rowTilt = 0;
  rowsTiltScope.innerText = rowsTiltScope.innerText.replace("2-8", "1-4");
  rowTilt = LatticeCase(rowTilt, columnTilt); //766666666666668fjhvkuyvbg87oto87tbo87t766666666666666666666666666rytfhtbfutfnkyfknfdkyntdtkyndknd
  let gjOleg = numberPerRow % 2;
  let gjOleg2 = (canvas.width / 50) % 2;
  canvasContext.strokeStyle = "black";
  // canvasContext.beginPath(); // centering lines
  // canvasContext.moveTo(0, -canvas.height / 2);
  // canvasContext.lineTo(0, canvas.height / 2);
  // canvasContext.stroke();
  canvasContext.beginPath();
  canvasContext.moveTo(-canvas.width / 2, 0);
  canvasContext.lineTo(canvas.width / 2, 0);
  canvasContext.stroke();

  //Отрисовываем круги
  let redCircle = new Circle(0, 0 + rHuge, rHuge, false, "red");
  circleArray.push(redCircle);
  // circleArray.push(new Circle(0, 0, columnTilt * 4, false)); // for size comparison
  // circleArray.push(new Circle(0, 0, columnTilt * 9, false));

  let yTilt = (canvas.height / 2) * rowTilt - canvas.height / 2; // replace this with case

  for (
    let y = -canvas.height / 2 - yTilt + rowTilt * gjOleg2;
    y <= canvas.height / 2;
    y += rowTilt
  ) {
    for (
      let x = -canvas.width / 2 + (columnTilt / 2) * gjOleg - columnTilt;
      x <= canvas.width / 2;
      x += columnTilt
    ) {
      newX = (x + (threshold % columnTilt)) * Math.cos(rad) - y * Math.sin(rad);
      newY = (x + (threshold % columnTilt)) * Math.sin(rad) + y * Math.cos(rad);
      let fillPoint = new Circle(newX, newY, radius, true);
      let fillPoint1;
      let fillPoint2;
      let pointToEvald = Math.sqrt(
        Math.pow(redCircle.x - newX, 2) + Math.pow(redCircle.y - newY, 2)
      ); // line between center of Ewald and center of points
      let pointTypeStatus = checkIfIntersected(
        redCircle.r,
        radius,
        pointToEvald
      );
      if (
        pointTypeStatus &&
        Math.abs(newX) <= canvas.width / 2 &&
        Math.abs(newY) <= canvas.height / 2
      ) {
        niceArray.push(fillPoint);
        recLineArray.push(
          intersectedDots(
            newX,
            newY,
            redCircle.x,
            redCircle.y,
            redCircle.r,
            radius,
            pointToEvald
          )
        );
        fillPoint = new Circle(newX, newY, radius, false, "red");
        let x0 = 0;
        let y0 = 0;
        spectreFill(x0, y0, x3, y3, x4, y4);
        angleSpectreArray = GetDataArray(angleSpectreArray, x3, x4);
        angleSpectreString = angleSpectreArray
          .join(" ")
          .substring(0, outputSwitch.value);
        fillPoint1 = new Circle(x3, y3, 3, true, "blue");
        fillPoint2 = new Circle(x4, y4, 3, true, "blue");
        circleArray.push(fillPoint1);
        circleArray.push(fillPoint2);
      }
      circleArray.push(fillPoint);
    }
    threshold += (columnTilt * koef) / 2 - koef2; //hjhkjhkjhkjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
  }
  // console.log(angleSpectreArray);
  // loop through and draw all circles in the array
  circleArray.forEach((element) => {
    element.draw(canvasContext);
  });
  canvasContext.translate(-canvas.width / 2, -canvas.height / 2);
}

singleTimeDraw();

// singleDrawButton.addEventListener('click', (ev) => {
//     singleTimeDraw();
//     ev.target.style.display = "none";
// });
rotateButton.addEventListener("click", (ev) => {
  ev.target.disabled = true;
  singleResultButton.disabled = true;
  resultButton.disabled = true;
  rotate();
});

singleResultButton.addEventListener("click", (ev) => {
  let rHugeTmp =
    1000 * parseFloat(checkParameter(electronEnergy.value, 10, 250));
  let rowTiltVal = rowsTiltScope.innerText.includes("1-4")
    ? checkParameter(rowsTilt.value, 1, 4)
    : checkParameter(rowsTilt.value, 2, 8) / 2;
  const tiltB = document
    .querySelector(".hideParameter")
    .classList.contains("hidden")
    ? ""
    : `, Tilt b: ${(4 * Math.PI) / (Math.sqrt(3) * rowTiltVal)} Å^-1`;

  const initialData = `Electron energy: ${
    rHugeTmp / 1000
  } * 10^3 eV, Ewald's Radius: ${
    rHugeTmp / 1000 > 50
      ? 0.512 * Math.sqrt(rHugeTmp * (1 + rHugeTmp / electronRestEnergy))
      : 0.512 * Math.sqrt(rHugeTmp)
  } Å^-1, Circle Radius: ${checkParameter(
    circleRadius.value,
    0.2,
    1.5
  )} Å^-1, Tilt a: ${
    (4 * Math.PI) / (Math.sqrt(3) * checkParameter(columnsTilt.value, 1, 4))
  } Å^-1${tiltB}\n`;

  const singleCorrectData = angleSpectreString;

  writeTofile(
    "singleResult.txt",
    initialData + "Angle " + inputAngle.value + ": " + singleCorrectData
  );
});

resultButton.addEventListener("click", (ev) => {
  ev.target.disabled = true;

  let rHugeTmp =
    1000 * parseFloat(checkParameter(electronEnergy.value, 10, 250));
  let rowTiltVal = rowsTiltScope.innerText.includes("1-4")
    ? checkParameter(rowsTilt.value, 1, 4)
    : checkParameter(rowsTilt.value, 2, 8) / 2;
  const tiltB = document
    .querySelector(".hideParameter")
    .classList.contains("hidden")
    ? ""
    : `, Tilt b: ${(4 * Math.PI) / (Math.sqrt(3) * rowTiltVal)} Å^-1`;

  const initialData = `Electron energy: ${
    rHugeTmp / 1000
  } * 10^3 eV, Ewald's Radius: ${
    rHugeTmp / 1000 > 50
      ? 0.512 * Math.sqrt(rHugeTmp * (1 + rHugeTmp / electronRestEnergy))
      : 0.512 * Math.sqrt(rHugeTmp)
  } Å^-1, Circle Radius: ${checkParameter(
    circleRadius.value,
    0.2,
    1.5
  )} Å^-1, Tilt a: ${
    (4 * Math.PI) / (Math.sqrt(3) * checkParameter(columnsTilt.value, 1, 4))
  } Å^-1${tiltB}\n`;

  const correctData = FinalResult.map((el) => el + "\n").join("");

  writeTofile("RotateResult.txt", initialData + correctData);
  FinalResult = [];
});

electronEnergy.addEventListener("input", (e) => {
  singleTimeDraw();
});

circleRadius.addEventListener("input", (e) => {
  singleTimeDraw();
});

columnsTilt.addEventListener("input", (e) => {
  singleTimeDraw();
});

rowsTilt.addEventListener("input", (e) => {
  singleTimeDraw();
});

TreshAngle.addEventListener("input", (e) => {
  if (e.target.value <= 360) {
    TreshAngleInput.value = e.target.value;
    singleTimeDraw();
  }
});

TreshAngleInput.addEventListener("input", (e) => {
  TreshAngle.value = e.target.value;
  singleTimeDraw();
});

inputAngle.addEventListener("input", (e) => {
  if (e.target.value <= 360) {
    rangeInput.value = e.target.value;
    singleTimeDraw();
  }
});

rangeInput.addEventListener("input", (e) => {
  inputAngle.value = e.target.value;
  singleTimeDraw();
});

function hideParameters(id) {
  switch (id) {
    case "Obq":
      document.querySelector(".input-container1").classList.remove("hidden");
      document.querySelector(".hideParameter").classList.remove("hidden");
      break;
    case "Rec":
    case "Cent":
      document.querySelector(".hideParameter").classList.remove("hidden");
      document.querySelector(".input-container1").classList.add("hidden");
      break;
    case "Hex":
    case "Sqr":
      document.querySelector(".hideParameter").classList.add("hidden");
      document.querySelector(".input-container1").classList.add("hidden");
      break;
  }
}

latticeContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("radio")) {
    // console.log(e.target.value);
    hideParameters(e.target.id);
    LatticeType = Number(e.target.value);
    singleTimeDraw();
  }
});
