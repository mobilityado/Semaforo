function entrar(){const region=document.getElementById('region').value;if(!region){alert('Seleccione una región.');return}localStorage.setItem('region',region);mostrarDashboard()}
function cerrarSesion(){if(!confirm('¿Desea cerrar la sesión?'))return;localStorage.removeItem('region');document.getElementById('dashboard').style.display='none';document.getElementById('loginScreen').style.display='flex'}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('loginScreen').style.display!=='none')entrar()});
