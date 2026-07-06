function renderKPIs(datos){

let corregidos=0;
let proceso=0;
let pendiente=0;
let suma=0;

datos.forEach(d=>{

const estatus =
String(d.Estatus || "")
.toLowerCase();

if(estatus.includes("correg")){

corregidos++;

}else if(
estatus.includes("revision") ||
estatus.includes("proceso")
){

proceso++;

}else{

pendiente++;

}

suma += Number(
d.PorcentajeCumplimiento || 0
);

});

const total = datos.length;

const cumplimiento =
total
? Math.round((suma/total))
:0;

document.getElementById("kTotal").textContent=total;
document.getElementById("kCorregidos").textContent=corregidos;
document.getElementById("kProceso").textContent=proceso;
document.getElementById("kCumplimiento").textContent=cumplimiento+"%";

document.getElementById("donutValue").textContent =
cumplimiento+"%";

document.getElementById("lCorregidos").textContent=
corregidos;

document.getElementById("lProceso").textContent=
proceso;

document.getElementById("lPendiente").textContent=
pendiente;

const pc =
total ? corregidos/total*100 : 0;

const pp =
total ? proceso/total*100 : 0;

document.getElementById(
"donutChart"
).style.background=

`conic-gradient(
#22c55e 0% ${pc}%,
#eab308 ${pc}% ${pc+pp}%,
#ef4444 ${pc+pp}% 100%
)`;
}
