function renderKPIs(datos){

    let corregidos = 0;
    let proceso = 0;
    let pendiente = 0;
    let suma = 0;

    datos.forEach(d=>{

        const estatus =
        String(d.Estatus || "")
        .toLowerCase();

        if(estatus.includes("correg")){
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

        const valor =
        Number(
        d.PorcentajeCumplimiento || 0
        );

        suma += valor <= 1
            ? valor * 100
            : valor;

    });

    const total = datos.length;

    const cumplimiento =
    total
    ? Math.round(suma / total)
    : 0;

    kTotal.innerText=total;
    kCorregidos.innerText=corregidos;
    kProceso.innerText=proceso;
    kCumplimiento.innerText=
    cumplimiento + "%";

    donutValue.innerText =
    cumplimiento + "%";

    lCorregidos.innerText=
    corregidos;

    lProceso.innerText=
    proceso;

    lPendiente.innerText=
    pendiente;

    const pCorregido =
    total
    ? (corregidos/total)*100
    : 0;

    const pProceso =
    total
    ? (proceso/total)*100
    : 0;

    donutChart.style.background =
    `conic-gradient(
        #22c55e 0% ${pCorregido}%,
        #f59e0b ${pCorregido}% ${pCorregido+pProceso}%,
        #ef4444 ${pCorregido+pProceso}% 100%
    )`;

}
