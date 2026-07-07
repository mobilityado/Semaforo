/*
  Pega este código en tu Google Apps Script o integra las partes accion=nuevo
  en tu script actual. Ajusta NOMBRE_HOJA si tu pestaña se llama distinto.
*/

const NOMBRE_HOJA = 'Hoja1';

function doGet(e) {
  const accion = (e.parameter.accion || '').toLowerCase();

  if (accion === 'consultar') {
    return consultarHallazgos(e);
  }

  if (accion === 'nuevo') {
    return guardarHallazgo(e);
  }

  return json({ ok:false, mensaje:'Acción no válida' });
}

function consultarHallazgos(e) {
  const region = e.parameter.region || '';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(NOMBRE_HOJA);
  const values = sh.getDataRange().getValues();
  const headers = values.shift();

  const datos = values.map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i]);
    return obj;
  }).filter(r => {
    if (!region || region === 'GERENCIA' || region === 'TODAS') return true;
    return String(r.Region || r.region || r.Terminal || '').toLowerCase() === String(region).toLowerCase();
  });

  return json(datos);
}

function guardarHallazgo(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(NOMBRE_HOJA);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];

  const folio = e.parameter.Folio || crearFolio();

  const registro = {
    Folio: folio,
    Region: e.parameter.Region || '',
    Terminal: e.parameter.Terminal || e.parameter.Region || '',
    Area: e.parameter.Area || '',
    Hallazgo: e.parameter.Hallazgo || '',
    Responsable: e.parameter.Responsable || '',
    Fecha: e.parameter.Fecha || new Date(),
    Estatus: e.parameter.Estatus || 'Pendiente',
    PorcentajeCumplimiento: e.parameter.PorcentajeCumplimiento || 0,
    Evidencia: e.parameter.Evidencia || '',
    FechaRegistro: new Date()
  };

  const row = headers.map(h => registro[h] !== undefined ? registro[h] : '');
  sh.appendRow(row);

  return json({ ok:true, mensaje:'Hallazgo guardado', folio:folio });
}

function crearFolio() {
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  return 'ADO-' + fecha;
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
