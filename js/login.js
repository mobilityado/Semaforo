function entrar(){
  const region=document.getElementById('region').value;
  if(!region){alert('Seleccione una región.');return}
  localStorage.setItem('region',region);
  localStorage.removeItem('gerencia');
  mostrarDashboard();
}

function entrarGerencia(){
  const pass=prompt('Contraseña del módulo Gerencia:');
  if(pass===null)return;
  if(pass!=='X485218x'){
    alert('Contraseña incorrecta.');
    return;
  }
  localStorage.setItem('region','GERENCIA');
  localStorage.setItem('gerencia','1');
  mostrarDashboard();
}

function cerrarSesion(){
  if(!confirm('¿Desea cerrar la sesión?'))return;
  localStorage.removeItem('region');
  localStorage.removeItem('gerencia');
  document.getElementById('dashboard').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
}

document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.getElementById('loginScreen').style.display!=='none')entrar();
});
