let chartTerminales = null;
let chartEstatus = null;

function clasificarEstatus(d){
  const e = String(d.Estatus || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .trim();

  const p = pct(d.PorcentajeCumplimiento);

  if(e.includes('correg') || e.includes('cerrad') || e.includes('finaliz') || e.includes('complet')){
    return 'corregido';
  }

  if(e.includes('proceso') || e.includes('revision') || e.includes('seguimiento') || e.includes('avance')){
    return 'proceso';
  }

  if(e.includes('pend') || e.includes('sin realizar') || e.includes('abierto') || e.includes('no iniciado')){
    return 'pendiente';
  }

  // Respaldo por porcentaje si el estatus viene vacío o diferente.
  if(p >= 100) return 'corregido';
  if(p > 0) return 'proceso';
  return 'pendiente';
}

function actualizarDonut(kpi){
  const total = kpi.corregidos + kpi.proceso + kpi.pendientes;
  const valor = document.getElementById('donutValue');
  if(valor) valor.textContent = kpi.cumplimiento + '%';

  const donut = document.querySelector('.donut');
  if(!donut) return;

  if(total === 0){
    donut.style.background = 'conic-gradient(#E5E7EB 0deg,#E5E7EB 360deg)';
    return;
  }

  const verde = (kpi.corregidos / total) * 360;
  const amarillo = (kpi.proceso / total) * 360;

  donut.style.background = `conic-gradient(
    #22C55E 0deg,
    #22C55E ${verde}deg,
    #F59E0B ${verde}deg,
    #F59E0B ${verde + amarillo}deg,
    #EF4444 ${verde + amarillo}deg,
    #EF4444 360deg
  )`;
}

function resumenEstatusGrafica(datos){
  const r = { corregidos:0, proceso:0, pendientes:0 };
  datos.forEach(d => {
    const tipo = clasificarEstatus(d);
    if(tipo === 'corregido') r.corregidos++;
    else if(tipo === 'proceso') r.proceso++;
    else r.pendientes++;
  });
  return r;
}

function renderCharts(datos){
  if(!window.Chart) return;

  const canvasTerminales = document.getElementById('graficaTerminales');
  const canvasEstatus = document.getElementById('graficaEstatus');
  if(!canvasTerminales || !canvasEstatus) return;

  const terminales = {};
  datos.forEach(d => {
    const t = d.Terminal || d.Region || 'Sin terminal';
    terminales[t] = (terminales[t] || 0) + 1;
  });

  const labels = Object.keys(terminales);
  const values = Object.values(terminales);

  if(chartTerminales) chartTerminales.destroy();
  chartTerminales = new Chart(canvasTerminales, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Hallazgos',
        data: values,
        backgroundColor: '#5A1F73',
        borderRadius: 8,
        maxBarThickness: 42
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
        x: { ticks: { maxRotation: 30, minRotation: 0 } }
      }
    }
  });

  const k = resumenEstatusGrafica(datos);
  const total = k.corregidos + k.proceso + k.pendientes;
  const data = total ? [k.corregidos, k.proceso, k.pendientes] : [1,0,0];
  const colors = total ? ['#22C55E','#F59E0B','#EF4444'] : ['#E5E7EB','#E5E7EB','#E5E7EB'];

  if(chartEstatus) chartEstatus.destroy();
  chartEstatus = new Chart(canvasEstatus, {
    type: 'doughnut',
    data: {
      labels: ['Corregidos','En proceso','Pendientes'],
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, boxWidth: 10, padding: 16 }
        },
        tooltip: {
          callbacks: {
            label: function(ctx){
              if(!total) return 'Sin registros';
              const valor = ctx.raw || 0;
              const porcentaje = Math.round((valor / total) * 100);
              return `${ctx.label}: ${valor} (${porcentaje}%)`;
            }
          }
        }
      }
    }
  });
}
