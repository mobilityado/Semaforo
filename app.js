function renderKPIs(datos){

let corregidos = 0;
let proceso = 0;
let pendiente = 0;
let suma = 0;

datos.forEach(d=>{

const estatus =
String(d.Estatus || "")
.toLowerCase();

if(
estatus.includes("correg")
){
corregidos++;
}
else if(
estatus.includes("revision") ||
estatus.includes("proceso")
){
proceso++;
}
else{
pendiente++;
}

suma += Number(
d.PorcentajeCumplimiento || 0
) * 100;

});

const total = datos.length;

const cumplimiento =
total
?
Math.round(suma / total)
:
0;

document.getElementById(
"kTotal"
).innerText = total;

document.getElementById(
"kCorregidos"
).innerText = corregidos;

document.getElementById(
"kProceso"
).innerText = proceso;

document.getElementById(
"kCumplimiento"
).innerText =
cumplimiento + "%";

document.getElementById(
"donutValue"
).innerText =
cumplimiento + "%";

document.getElementById(
"lCorregidos"
).innerText =
corregidos;

document.getElementById(
"lProceso"
).innerText =
proceso;

document.getElementById(
"lPendiente"
).innerText =
pendiente;

const pCorregido =
total
?
(corregidos / total) * 100
:
0;

const pProceso =
total
?
(proceso / total) * 100
:
0;

document.getElementById(
"donutChart"
).style.background =

`conic-gradient(
 #22c55e 0% ${pCorregido}%,
 #f59e0b ${pCorregido}% ${pCorregido + pProceso}%,
 #ef4444 ${pCorregido + pProceso}% 100%
)`;

}