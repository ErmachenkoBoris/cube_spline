const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const drawN = 1000
const table = document.getElementById("table");
const halfWidth = canvas.width / 2;
const halfHeight = canvas.height / 2;
let N = 50;
let Sx = null;
let h = null;


window.onload = () => {

  //------------draw field---------------------------
  ctx.strokeStyle = "silver";

  for (let i = 0; i < canvas.width; i += 25) {
    for (let j = 0; j < canvas.height; j += 25) {
      ctx.strokeRect(i, j, 25, 25);
    }
  }

  for (let i = -2; i <= 2; i++) {
    ctx.fillText(i, halfWidth + i * 100, halfHeight);
    ctx.fillText(i * 0.1, halfWidth, halfHeight + i * 100);
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath()
  ctx.moveTo(halfWidth, 0)
  ctx.lineTo(halfWidth, canvas.height)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, halfHeight)
  ctx.lineTo(canvas.width, halfHeight)
  ctx.stroke();

};

class Spline {
  constructor(a = 0, b = 0, c = 0, d = 0, x = 0, s = 0) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.x = x;
    this.s = s;
  }
}

function init() {
  Sx = new Array(N);
  h = drawN / N;
  for (let i = 0; i < N + 1; i++) {
    const x = -drawN / 2 + i * h;
    Sx[i] = new Spline(0, 0, 0, 0, x, 0);
  }
}

function sourceFunction(x, draw = 0) {

  x /= 100;
  const y = -1000 * (Math.sin(Math.pow(x, 3)) + Math.cos(Math.pow(x, 2))) / 7;

  if (draw && x === Math.round(x)) {
    div = document.createElement("div");
    div.textContent = `x=${x} y=${(-y / 1000).toFixed(2)}`;
    table.appendChild(div);
  }
  return y;
}

function findSpline(SxArr, Sx) {
  for (let x = -drawN / 2; x < drawN / 2; x++) {
    xi = parseInt((x + drawN / 2) / (h)) + 1;
    SxArr[x] = Sx[xi].a + Sx[xi].b * (x - Sx[xi].x) + Sx[xi].c * Math.pow((x - Sx[xi].x), 2) / 2 + Sx[xi].d * Math.pow((x - Sx[xi].x), 3) / 6;
  }
}

function findA() {
  for (let i = 0; i < N; i++) {
    Sx[i].a = sourceFunction(Sx[i].x);
  }
}

function findC() {
  let alpha = new Array(N);
  let beta = new Array(N);
  alpha[0] = 0;
  beta[0] = 0;
  Sx[N - 1].c = 0;
  Sx[0].c = 0;

  for (let i = 1; i < N - 1; i++) {
    const y = 4 + 1 * alpha[i - 1]; // 4,1,1 - это коэффициенты )
    alpha[i] = -1 / y;
    beta[i] = (1 / y * (6 / (h * h) * (sourceFunction(Sx[i + 1].x) - 2 * sourceFunction(Sx[i].x) + sourceFunction(Sx[i - 1].x)) - 1 * beta[i - 1]));
  }
  for (let i = N - 2; i > 0; i--) {
    Sx[i].c = alpha[i] * Sx[i + 1].c + beta[i];
  }
}

function findBD() {
  for (let i = N; i > 0; i--) {
    Sx[i].d = (Sx[i].c - Sx[i - 1].c) / h;
    Sx[i].b = h / 2 * Sx[i].c - (Math.pow(h, 2)) / 6 * Sx[i].d + (sourceFunction(Sx[i].x) - sourceFunction(Sx[i - 1].x)) / h;
  }
}


function drawSpline() {
  input = document.getElementById("input");
  if (parseInt(input.value)) {
    N = input.value;
  } else {
    input.value = `DEFAULT: N = ${N}`;
  }
  init();
  findA();
  findC();
  findBD();
  let SxArr = new Array(drawN + 1);

  findSpline(SxArr, Sx);

  //----------------------spline------------------------------
  const cx = halfWidth;
  const cy = halfHeight;
  // - to =
  ctx.strokeStyle = "red";

  ctx.moveTo(cx, cy);

  ctx.beginPath();
  for (let i = -drawN; i < drawN; i++) {
    const x = i;
    const y = SxArr[x];
    ctx.lineTo(cx + x, cy + y);
  }
  ctx.stroke();

  //----------------------source-function------------------------------

  // - to +
  ctx.strokeStyle = 'blue';

  ctx.moveTo(cx, cy);
  ctx.beginPath();
  for (let i = -drawN; i < drawN; i++) {
    const x = i;
    const y = sourceFunction(x, 1);
    ctx.lineTo(cx + x, cy + y);
  }
  ctx.stroke();
}