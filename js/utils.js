function toNumber(v){if(v===null||v===undefined||v==='')return 0;const n=Number(v);return isNaN(n)?0:n}
function pct(v){let n=toNumber(v);if(n<=1)n=n*100;return Math.round(n)}
function formatoFecha(f){if(!f)return'';const d=new Date(f);return isNaN(d)?f:d.toLocaleDateString('es-MX')}
function badge(estatus){const e=String(estatus||'');const t=e.toLowerCase();let c='pendiente';if(t.includes('correg')||t.includes('cerrad'))c='ok';else if(t.includes('revision')||t.includes('revisión')||t.includes('proceso'))c='proceso';return `<span class="badge ${c}">${e||'Pendiente'}</span>`}
function barra(valor){const p=pct(valor);return `<div class="percent"><div class="progress"><div class="progress-bar" style="width:${p}%"></div></div><span>${p}%</span></div>`}
function contar(id,valor,sufijo=''){const el=document.getElementById(id);if(!el)return;let a=0;const paso=Math.max(1,Math.ceil(valor/28));const timer=setInterval(()=>{a+=paso;if(a>=valor){a=valor;clearInterval(timer)}el.textContent=a+sufijo},18)}
function toast(msg,tipo='success'){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.style.background=tipo==='error'?'#EF4444':tipo==='warning'?'#F59E0B':'#22C55E';t.style.display='block';setTimeout(()=>t.style.display='none',2800)}
function showLoader(show){const l=document.getElementById('loader');if(l)l.style.display=show?'flex':'none'}
function toggleDarkMode(){document.body.classList.toggle('dark');localStorage.setItem('dark',document.body.classList.contains('dark')?'1':'0')}
function exportarCSV(){const rows=[...document.querySelectorAll('table tr')].map(tr=>[...tr.querySelectorAll('th,td')].slice(0,8).map(td=>'"'+td.innerText.replace(/"/g,'""').replace(/\n/g,' ')+'"').join(','));const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hallazgos_ado.csv';a.click()}
function abrirEvidencia(url){if(!url){toast('Este registro no tiene evidencia','warning');return}document.getElementById('imagenEvidencia').src=url;document.getElementById('modalEvidencia').style.display='flex'}
function cerrarModal(){document.getElementById('modalEvidencia').style.display='none'}
