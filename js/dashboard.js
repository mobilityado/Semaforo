let datosGlobal=[];

document.addEventListener('DOMContentLoaded',()=>{
  if(localStorage.getItem('dark')==='1')document.body.classList.add('dark');
  if(localStorage.getItem('region'))mostrarDashboard();
  ['buscar','filtroEstado','filtroTerminal'].forEach(id=>document.addEventListener(id==='buscar'?'input':'change',e=>{if(e.target.id===id)actualizarDashboard()}));
  const form=document.getElementById('formNuevoHallazgo');
  if(form)form.addEventListener('submit',guardarNuevoHallazgo);
});

async function mostrarDashboard(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('dashboard').style.display='block';
  const region=localStorage.getItem('region')||'';
  const lbl=document.getElementById('lblRegion');
  lbl.textContent=region==='GERENCIA'?'Gerencia - Todas las regiones':region;
  lbl.parentElement.classList.toggle('gerencia',region==='GERENCIA');
  await cargarDatos();
}

async function cargarDatos(){
  showLoader(true);
  const region=localStorage.getItem('region');
  const data=await obtenerHallazgos(region);
  datosGlobal=(Array.isArray(data)?data:[]).map(normalizar);
  cargarTerminales();
  actualizarDashboard();
  showLoader(false);
  toast('Dashboard actualizado');
}

function cargarTerminales(){
  const combo=document.getElementById('filtroTerminal');
  const actual=combo.value;
  combo.innerHTML='<option>Todas las terminales</option>';
  terminalesUnicas(datosGlobal).forEach(t=>combo.innerHTML+=`<option>${t}</option>`);
  if([...combo.options].some(o=>o.value===actual))combo.value=actual;
}

function getDatosFiltrados(){
  let datos=[...datosGlobal];
  datos=filtrarTerminal(datos,document.getElementById('filtroTerminal').value);
  datos=filtrarEstado(datos,document.getElementById('filtroEstado').value);
  datos=buscarHallazgos(datos,document.getElementById('buscar').value);
  return datos;
}

function actualizarDashboard(){
  const datos=getDatosFiltrados();
  renderKPIs(datos);
  renderTabla(datos);
  renderCharts(datos);
}

function renderKPIs(datos){
  const k=calcularKPIs(datos);
  contar('kTotal',k.total);
  contar('kCorregidos',k.corregidos);
  contar('kProceso',k.proceso);
  document.getElementById('kCumplimiento').textContent=k.cumplimiento+'%';
  document.getElementById('lCorregidos').textContent=k.corregidos;
  document.getElementById('lProceso').textContent=k.proceso;
  document.getElementById('lPendientes').textContent=k.pendientes;
  document.getElementById('stPromedio').textContent=k.cumplimiento+'%';
  document.getElementById('stPendientes').textContent=k.pendientes;
  document.getElementById('stCorregidos').textContent=k.corregidos;
  document.getElementById('stTerminales').textContent=terminalesUnicas(datos).length;
  actualizarDonut(k);
}

function renderTabla(datos){
  const tbody=document.getElementById('tabla');
  if(!datos.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:35px">Sin registros para mostrar</td></tr>';return}
  tbody.innerHTML=datos.map(d=>`<tr><td><b>${d.Folio}</b></td><td>${d.Terminal||''}</td><td>${d.Area||''}</td><td>${d.Hallazgo||''}</td><td>${d.Responsable||''}</td><td>${formatoFecha(d.Fecha)}</td><td>${barra(d.PorcentajeCumplimiento)}</td><td>${badge(d.Estatus)}</td><td><button class="btn-icon" onclick="abrirEvidencia('${String(d.Evidencia||'').replace(/'/g,'')}')"><i class="fa-solid fa-camera"></i></button></td></tr>`).join('');
}

async function refrescarDashboard(){await cargarDatos()}
function limpiarFiltros(){document.getElementById('buscar').value='';document.getElementById('filtroEstado').value='Todos los estados';document.getElementById('filtroTerminal').value='Todas las terminales';actualizarDashboard()}

function abrirNuevoHallazgo(){
  const modal=document.getElementById('modalNuevo');
  const form=document.getElementById('formNuevoHallazgo');
  form.reset();
  const region=localStorage.getItem('region');
  const nuevoRegion=document.getElementById('nuevoRegion');
  const nuevoTerminal=document.getElementById('nuevoTerminal');
  if(region && region!=='GERENCIA'){
    nuevoRegion.value=region;
    nuevoRegion.disabled=true;
    nuevoTerminal.value=region;
  }else{
    nuevoRegion.disabled=false;
  }
  modal.style.display='flex';
}

function cerrarNuevoHallazgo(){document.getElementById('modalNuevo').style.display='none'}

async function guardarNuevoHallazgo(e){
  e.preventDefault();
  const form=e.target;
  const fd=new FormData(form);
  const region=localStorage.getItem('region');
  const data=Object.fromEntries(fd.entries());
  if(region && region!=='GERENCIA')data.Region=region;
  data.PorcentajeCumplimiento=Number(data.PorcentajeCumplimiento||0)/100;
  showLoader(true);
  const res=await crearHallazgo(data);
  showLoader(false);
  if(res && (res.ok===true || res.status==='ok' || res.resultado==='ok')){
    toast('Hallazgo guardado correctamente');
    cerrarNuevoHallazgo();
    await cargarDatos();
  }else{
    toast('No se pudo confirmar el guardado. Revisa el Apps Script.','warning');
    cerrarNuevoHallazgo();
    await cargarDatos();
  }
}
