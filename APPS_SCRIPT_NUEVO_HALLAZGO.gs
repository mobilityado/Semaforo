/*
  Apps Script actualizado para GestionADO v2.3

  Funciona con pestañas separadas por región:
  Villahermosa, Coatzacoalcos, Cárdenas, Veracruz, Xalapa, Teapa y Tuxtla.

  Acciones:
  - accion=consultar&region=Villahermosa  -> lee solo esa pestaña
  - accion=consultar&region=TODAS         -> lee todas las pestañas
  - accion=nuevo&Region=Villahermosa      -> guarda en la pestaña de esa región
*/

const REGIONES_GESTION_ADO = [
  'Villahermosa',
  'Coatzacoalcos',
  'Cárdenas',
  'Veracruz',
  'Xalapa',
  'Teapa',
  'Tuxtla'
];

const ENCABEZADOS_GESTION_ADO = [
  'Folio',
  'Region',
  'Terminal',
  'Area',
  'Hallazgo',
  'Responsable',
  'Fecha',
  'Estatus',
  'PorcentajeCumplimiento',
  'Evidencia',
  'FechaRegistro'
];

function doGet(e) {
  const accion = String(e.parameter.accion || '').toLowerCase();

  if (accion === 'consultar') {
    return consultarHallazgos(e);
  }

  if (accion === 'nuevo') {
    return guardarHallazgo(e);
  }

  return json({ ok:false, mensaje:'Acción no válida' });
}

function consultarHallazgos(e) {
  const region = String(e.parameter.region || '').trim();

  if (!region || region.toUpperCase() === 'TODAS' || region.toUpperCase() === 'GERENCIA') {
    return json(consultarTodasLasRegiones_());
  }

  return json(consultarHojaRegion_(region));
}

function consultarTodasLasRegiones_() {
  let salida = [];

  REGIONES_GESTION_ADO.forEach(region => {
    const datos = consultarHojaRegion_(region);
    salida = salida.concat(datos);
  });

  return salida;
}

function consultarHojaRegion_(region) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(region);

  if (!sh) {
    return [];
  }

  const values = sh.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values.shift();

  return values
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h,i) => obj[h] = row[i]);

      // Importante para Gerencia: identifica de qué pestaña viene el registro.
      obj.Region = obj.Region || region;
      obj.__Hoja = region;

      return obj;
    });
}

function guardarHallazgo(e) {
  const region = String(e.parameter.Region || e.parameter.region || '').trim();

  if (!region) {
    return json({ ok:false, mensaje:'Falta indicar la región' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = obtenerOCrearHojaRegion_(ss, region);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];

  const folio = e.parameter.Folio || crearFolio_(region);

  const registro = {
    Folio: folio,
    Region: region,
    Terminal: e.parameter.Terminal || region,
    Area: e.parameter.Area || '',
    Hallazgo: e.parameter.Hallazgo || '',
    Responsable: e.parameter.Responsable || '',
    Fecha: e.parameter.Fecha || '',
    Estatus: e.parameter.Estatus || 'Pendiente',
    PorcentajeCumplimiento: e.parameter.PorcentajeCumplimiento || 0,
    Evidencia: e.parameter.Evidencia || '',
    FechaRegistro: new Date()
  };

  const row = headers.map(h => registro[h] !== undefined ? registro[h] : '');
  sh.appendRow(row);

  return json({ ok:true, mensaje:'Hallazgo guardado', folio:folio, region:region });
}

function obtenerOCrearHojaRegion_(ss, region) {
  let sh = ss.getSheetByName(region);

  if (!sh) {
    sh = ss.insertSheet(region);
    sh.getRange(1,1,1,ENCABEZADOS_GESTION_ADO.length).setValues([ENCABEZADOS_GESTION_ADO]);
    sh.setFrozenRows(1);
  }

  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,ENCABEZADOS_GESTION_ADO.length).setValues([ENCABEZADOS_GESTION_ADO]);
    sh.setFrozenRows(1);
  }

  return sh;
}

function crearFolio_(region) {
  const prefijo = region.substring(0,3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  return prefijo + '-' + fecha;
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
