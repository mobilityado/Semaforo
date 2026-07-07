const API_URL="https://script.google.com/macros/s/AKfycbzqvMLALL51yOTtIc9eqJCrasFYYMRRz3Br8ElYCfQjke-S2f2GHhXkIiONrGV0VltX/exec";
const REGIONES=['Villahermosa','Coatzacoalcos','Cárdenas','Veracruz','Xalapa','Teapa','Tuxtla'];

async function apiRequest(params={}){
  try{
    const query=new URLSearchParams(params);
    const response=await fetch(`${API_URL}?${query}`);
    if(!response.ok)throw new Error('Error de conexión');
    return await response.json();
  }catch(e){
    console.error(e);
    toast('No fue posible conectar con Google Sheets','error');
    return [];
  }
}

async function obtenerHallazgos(region){
  if(region==='GERENCIA'){
    // Primero intenta pedir TODAS las pestañas en una sola consulta.
    // Si tu Apps Script no tiene todavía esa mejora, usa el respaldo por región.
    const todas=await apiRequest({accion:'consultar',region:'TODAS'});
    if(Array.isArray(todas) && todas.length){
      return todas.map(x=>({...x,Region:x.Region||x.region||x.__Hoja||''}));
    }

    const resultados=await Promise.all(
      REGIONES.map(async r=>{
        const lista=await apiRequest({accion:'consultar',region:r});
        return (Array.isArray(lista)?lista:[]).map(x=>({...x,Region:x.Region||x.region||r}));
      })
    );
    return resultados.flat();
  }

  return await apiRequest({accion:'consultar',region});
}

async function crearHallazgo(data){
  const payload={accion:'nuevo',...data};
  return await apiRequest(payload);
}

async function actualizarHallazgo(data){
  const payload={accion:'actualizar',...data};
  return await apiRequest(payload);
}

function normalizar(item){return{
  Folio:item.Folio||item.folio||'',
  Region:item.Region||item.region||item.__Hoja||'',
  Terminal:item.Terminal||item.terminal||item.Region||item.region||item.__Hoja||'',
  Area:item.Area||item.Área||item.area||'',
  Hallazgo:item.Hallazgo||item.hallazgo||item.Descripcion||item.Descripción||'',
  Responsable:item.Responsable||item.responsable||'',
  Fecha:item.Fecha||item.fecha||item.FechaCompromiso||'',
  Estatus:item.Estatus||item.estatus||'',
  PorcentajeCumplimiento:item.PorcentajeCumplimiento??item.porcentajeCumplimiento??item.Porcentaje??item.porcentaje??0,
  Evidencia:item.Evidencia||item.evidencia||item.Foto||item.Imagen||''
}}

function calcularKPIs(datos){let corregidos=0,proceso=0,pendientes=0,suma=0;datos.forEach(d=>{let p=Number(d.PorcentajeCumplimiento||0);if(p>1)p=p/100;suma+=p;const e=String(d.Estatus||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();if(e.includes('correg')||e.includes('cerrad')||e.includes('finaliz')||e.includes('complet'))corregidos++;else if(e.includes('revision')||e.includes('proceso')||e.includes('seguimiento')||e.includes('avance'))proceso++;else if(e.includes('pend')||e.includes('sin realizar')||e.includes('abierto')||e.includes('no iniciado'))pendientes++;else if(p>=1)corregidos++;else if(p>0)proceso++;else pendientes++});const total=datos.length;return{total,corregidos,proceso,pendientes,cumplimiento:total?Math.round((suma/total)*100):0}}
function terminalesUnicas(datos){return[...new Set(datos.map(d=>d.Terminal||'Sin terminal'))].sort()}
function buscarHallazgos(datos,texto){if(!texto)return datos;texto=texto.toLowerCase();return datos.filter(d=>[d.Folio,d.Region,d.Terminal,d.Area,d.Hallazgo,d.Responsable,d.Estatus].some(v=>String(v||'').toLowerCase().includes(texto)))}
function filtrarEstado(datos,estado){if(!estado||estado==='Todos los estados')return datos;return datos.filter(d=>String(d.Estatus||'').toLowerCase().includes(estado.toLowerCase().replace('en ','')))}
function filtrarRegion(datos,region){if(!region||region==='-- Mostrar Todas --')return datos;return datos.filter(d=>String(d.Region||'').toLowerCase()===String(region).toLowerCase())}
function filtrarTerminal(datos,terminal){if(!terminal||terminal==='Todas las terminales')return datos;return datos.filter(d=>(d.Terminal||'Sin terminal')===terminal)}
