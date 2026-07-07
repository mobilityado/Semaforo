const API_URL="https://script.google.com/macros/s/AKfycbzqvMLALL51yOTtIc9eqJCrasFYYMRRz3Br8ElYCfQjke-S2f2GHhXkIiONrGV0VltX/exec";
const REGIONES=['Villahermosa','Coatzacoalcos','Cárdenas','Veracruz','Xalapa','Teapa','Tuxtla'];

async function apiRequest(params={}){
  try{
    const query=new URLSearchParams(params);
    const response=await fetch(`${API_URL}?${query}`);
    if(!response.ok)throw new Error('Error de conexión');
    return await response.json();
  }catch(e){console.error(e);toast('No fue posible conectar con Google Sheets','error');return[]}
}

async function obtenerHallazgos(region){
  if(region==='GERENCIA'){
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
  const res=await apiRequest(payload);
  return res;
}

function normalizar(item){return{
  Folio:item.Folio||item.folio||'',
  Region:item.Region||item.region||'',
  Terminal:item.Terminal||item.terminal||item.Region||item.region||'',
  Area:item.Area||item.Área||item.area||'',
  Hallazgo:item.Hallazgo||item.hallazgo||item.Descripcion||item.Descripción||'',
  Responsable:item.Responsable||item.responsable||'',
  Fecha:item.Fecha||item.fecha||item.FechaCompromiso||'',
  Estatus:item.Estatus||item.estatus||'',
  PorcentajeCumplimiento:item.PorcentajeCumplimiento??item.porcentajeCumplimiento??item.Porcentaje??item.porcentaje??0,
  Evidencia:item.Evidencia||item.evidencia||item.Foto||item.Imagen||''
}}

function calcularKPIs(datos){let corregidos=0,proceso=0,pendientes=0,suma=0;datos.forEach(d=>{const e=String(d.Estatus||'').toLowerCase();let p=Number(d.PorcentajeCumplimiento||0);if(p>1)p=p/100;suma+=p;if(e.includes('correg')||e.includes('cerrad'))corregidos++;else if(e.includes('revision')||e.includes('revisión')||e.includes('proceso'))proceso++;else pendientes++});const total=datos.length;return{total,corregidos,proceso,pendientes,cumplimiento:total?Math.round((suma/total)*100):0}}
function terminalesUnicas(datos){return[...new Set(datos.map(d=>d.Terminal||'Sin terminal'))].sort()}
function buscarHallazgos(datos,texto){if(!texto)return datos;texto=texto.toLowerCase();return datos.filter(d=>[d.Folio,d.Region,d.Terminal,d.Area,d.Hallazgo,d.Responsable,d.Estatus].some(v=>String(v||'').toLowerCase().includes(texto)))}
function filtrarEstado(datos,estado){if(!estado||estado==='Todos los estados')return datos;return datos.filter(d=>String(d.Estatus||'').toLowerCase().includes(estado.toLowerCase().replace('en ','')))}
function filtrarRegion(datos,region){if(!region||region==='-- Mostrar Todas --')return datos;return datos.filter(d=>String(d.Region||'')===region)}
function filtrarTerminal(datos,terminal){if(!terminal||terminal==='Todas las terminales')return datos;return datos.filter(d=>(d.Terminal||'Sin terminal')===terminal)}
