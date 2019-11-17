const canvas = document.getElementById('canvas');
const  ctx= canvas.getContext('2d');
N = 50;
const drawN = 1000
Sx=new Array(N);
h=drawN/N;
const table  = document.getElementById("table");


window.onload = function() {

    //------------draw field---------------------------
    ctx.strokeStyle = "silver";

    for (i = 0; i < canvas.width; i += 25) {
        for (j = 0; j < canvas.height; j += 25) {
        ctx.strokeRect(i, j, 25, 25);
        }
    }
    ctx.fillText('0', canvas.width / 2, canvas.height/2);
    ctx.fillText('1', canvas.width / 2+100, canvas.height/2);
    ctx.fillText('-1', canvas.width / 2-100, canvas.height/2);
    ctx.fillText('2', canvas.width / 2+200, canvas.height/2);
    ctx.fillText('-2', canvas.width / 2-200, canvas.height/2);

    ctx.fillText('0', canvas.width / 2, canvas.height/2);
    ctx.fillText('0.1', canvas.width / 2, canvas.height/2-100);
    ctx.fillText('-0.1', canvas.width / 2, canvas.height/2+100);
    ctx.fillText('0.2', canvas.width / 2, canvas.height/2-200);
    ctx.fillText('-0.2', canvas.width / 2, canvas.height/2+200);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke();

 };

class Spline {
    constructor(a=0, b=0, c=0, d=0, x=0, s=0){
        this.a=a;
        this.b=b;
        this.c=c;
        this.d=d;
        this.x=x;
        this.s=s;
    }
}

function init(){

    Sx=new Array(N);
    h=drawN/N;
    for(i=0;i<N+1;i++){
        x=-drawN/2+i*h;
        Sx[i]=new Spline(0,0,0,0,x,0);
    }
}

function sourceFunction(x, draw=0) {
    
    x=x/100;
    y=-1000*(Math.sin(x*x*x)+Math.cos(x*x))/7;

    if(draw===1 && (x===parseInt(x)|| -x===parseInt(x))){
        div = document.createElement("div");
        div.textContent=`x=${x} y=${(-y/1000).toFixed(2)}`;
        table.appendChild(div);
        }
    return y;
}

function findSpline(SxArr, Sx) {
    for(x=-drawN/2; x< drawN/2;x++) {
       xi=parseInt((x+drawN/2)/(h)) +1 ;
        SxArr[x]=Sx[xi].a+Sx[xi].b*(x-Sx[xi].x) + Sx[xi].c*Math.pow((x-Sx[xi].x), 2)/2 + Sx[xi].d*Math.pow((x-Sx[xi].x), 3)/6;
    }
}

function findA() {
    for(i=0;i<N;i++) {
        Sx[i].a=sourceFunction(Sx[i].x);
    }
}

function findC(){
    alpha=new Array(N);
    beta=new Array(N);
    alpha[0]=0;
    beta[0]=0;
    Sx[N-1].c=0;
    Sx[0].c=0;
  
    for(i=1;i<N-1;++i) {
        y = 4 + 1* alpha[i - 1];//4,1,1 - это коэффициенты )
        alpha[i] = -1/ y;
        beta[i] = ( 1 / y*(6/(h*h)*(sourceFunction(Sx[i+1].x)-2*sourceFunction(Sx[i].x)+sourceFunction(Sx[i-1].x)) - 1 * beta[i - 1]));
    }
    for(i=N-2;i>0;i--) {
        Sx[i].c=alpha[i]*Sx[i+1].c+beta[i];
    }
}

function findBD(){
    for(i=N;i>0;--i){
        Sx[i].d=(Sx[i].c-Sx[i-1].c)/h;
        Sx[i].b=h/2*Sx[i].c-(h*h)/6*Sx[i].d+(sourceFunction(Sx[i].x)-sourceFunction(Sx[i-1].x))/h;
    }
}


function drawSpline() {

    input=document.getElementById("input");
    if(parseInt(input.value)) {
        N=input.value;
    } else {
        input.value=`DEFAULT: N = ${N}`;
    }
    init();
    findA();
    findC();
    findBD();
    SxArr=new Array(drawN+1);
    for(i=0; i<=drawN;i++){
        SxArr[i]=0;
    }
    findSpline(SxArr,Sx);
    if (ctx) {
//----------------------spline------------------------------

//+
    ctx.strokeStyle = "red";
    ctx.beginPath();
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    ctx.moveTo(cx, cy);
    for (i = 0; i<drawN/2; i++) {
        x = i;
        y = SxArr[x];
        ctx.lineTo(cx+x, cy+y);
    }
    ctx.stroke();

//-
    ctx.beginPath();
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    ctx.moveTo(cx, cy);
    for (i = 0; i>-drawN/2; i--) {
        x = i;
        y = SxArr[x];
        ctx.lineTo(cx+x, cy+y);
    }
    ctx.stroke();

//----------------------source-function------------------------------

//+
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    ctx.moveTo(cx, cy);
    for (i = 0; i<drawN/2; i++) {
        x = i;
        y = sourceFunction(x,1);
        ctx.lineTo(cx+x, cy+y);
    }
    ctx.stroke();

//-
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    for (i = 0; i>-drawN/2; i--) {
        x = i;
        y = sourceFunction(x,1);
        ctx.lineTo(cx+x, cy+y);
    }
    
    ctx.stroke()
    }
}