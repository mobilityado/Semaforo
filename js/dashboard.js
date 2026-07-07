let datosGlobal=[];

document.addEventListener('DOMContentLoaded',()=>{
  if(localStorage.getItem('dark')==='1')document.body.classList.add('dark');
  if(localStorage.getItem('region'))mostrarDashboard();
  ['buscar','filtroEstado','filtroTerminal','filtroRegion'].forEach(id=>document.addEventListener(id==='buscar'?'input':'change',e=>{if(e.target.id===id)actualizarDashboard()}));
  const form=document.getElementById('formNuevoHallazgo');
  if(form)form.addEventListener('submit',guardarNuevoHallazgo);
  const formEdit=document.getElementById('formEditarHallazgo');
  if(formEdit)formEdit.addEventListener('submit',guardarEditarHallazgo);
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
  prepararFiltroGerencia();
  cargarTerminales();
  actualizarDashboard();
  showLoader(false);
  toast('Dashboard actualizado');
}

function prepararFiltroGerencia(){
  const esGerencia=localStorage.getItem('region')==='GERENCIA';
  const combo=document.getElementById('filtroRegion');
  if(!combo)return;
  combo.style.display=esGerencia?'block':'none';
  combo.innerHTML='<option>-- Mostrar Todas --</option>';
  REGIONES.forEach(r=>combo.innerHTML+=`<option>${r}</option>`);
  if(!esGerencia)combo.value='-- Mostrar Todas --';
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
  datos=filtrarRegion(datos,document.getElementById('filtroRegion')?.value);
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
  tbody.innerHTML=datos.map(d=>`<tr><td><b>${d.Folio}</b></td><td>${d.Terminal||''}</td><td>${d.Area||''}</td><td>${d.Hallazgo||''}</td><td>${d.Responsable||''}</td><td>${formatoFecha(d.Fecha)}</td><td>${barra(d.PorcentajeCumplimiento)}</td><td>${badge(d.Estatus)}</td><td class="acciones"><button class="btn-icon" title="Editar estatus" onclick="abrirEditarHallazgo('${encodeURIComponent(d.Folio)}')"><i class="fa-solid fa-pen"></i></button><button class="btn-icon" title="Ver evidencia" onclick="abrirEvidencia('${String(d.Evidencia||'').replace(/'/g,'')}')"><i class="fa-solid fa-camera"></i></button></td></tr>`).join('');
}

async function refrescarDashboard(){await cargarDatos()}
function limpiarFiltros(){document.getElementById('buscar').value='';document.getElementById('filtroEstado').value='Todos los estados';document.getElementById('filtroTerminal').value='Todas las terminales';const fr=document.getElementById('filtroRegion');if(fr)fr.value='-- Mostrar Todas --';actualizarDashboard()}

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


function abrirEditarHallazgo(folioCodificado){
  const folio=decodeURIComponent(folioCodificado||'');
  const item=datosGlobal.find(d=>String(d.Folio)===String(folio));
  if(!item){toast('No se encontró el hallazgo para editar','error');return}

  document.getElementById('editFolio').value=item.Folio||'';
  document.getElementById('editRegion').value=item.Region||localStorage.getItem('region')||'';
  document.getElementById('editFolioTexto').value=item.Folio||'';
  document.getElementById('editRegionTexto').value=item.Region||localStorage.getItem('region')||'';
  document.getElementById('editHallazgoTexto').value=item.Hallazgo||'';
  document.getElementById('editEstatus').value=item.Estatus||'Pendiente';
  let p=Number(item.PorcentajeCumplimiento||0);
  if(p<=1)p=p*100;
  document.getElementById('editPorcentaje').value=Math.round(p);
  document.getElementById('editObservaciones').value='';
  document.getElementById('modalEditar').style.display='flex';
}

function cerrarEditarHallazgo(){
  document.getElementById('modalEditar').style.display='none';
}

function sincronizarPorcentajePorEstatus(){
  const estatus=document.getElementById('editEstatus');
  const porcentaje=document.getElementById('editPorcentaje');
  if(!estatus||!porcentaje)return;
  const e=estatus.value.toLowerCase();
  if(e.includes('pendiente'))porcentaje.value=0;
  if(e.includes('corregido'))porcentaje.value=100;
  if(e.includes('revisión')||e.includes('revision')||e.includes('proceso')){
    const actual=Number(porcentaje.value||0);
    if(actual===0||actual===100)porcentaje.value=50;
  }
}

document.addEventListener('change',e=>{
  if(e.target && e.target.id==='editEstatus')sincronizarPorcentajePorEstatus();
});

async function guardarEditarHallazgo(e){
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());
  data.PorcentajeCumplimiento=Number(data.PorcentajeCumplimiento||0)/100;
  showLoader(true);
  const res=await actualizarHallazgo(data);
  showLoader(false);
  if(res && (res.ok===true || res.status==='ok' || res.resultado==='ok')){
    toast('Estatus actualizado correctamente');
    cerrarEditarHallazgo();
    await cargarDatos();
  }else{
    toast((res&&res.mensaje)||'No se pudo actualizar. Revisa el Apps Script.','warning');
  }
}
