/*
  Apps Script actualizado para GestionADO v2.3

  Funciona con pestañas separadas por región:
  Villahermosa, Coatzacoalcos, Cárdenas, Veracruz, Xalapa, Teapa y Tuxtla.

  Acciones:
  - accion=consultar&region=Villahermosa  -> lee solo esa pestaña
  - accion=consultar&region=TODAS         -> lee todas las pestañas
  - accion=nuevo&Region=Villahermosa      -> guarda en la pestaña de esa región
  - accion=actualizar&Folio=XXX&Region=Villahermosa&Estatus=Corregido&PorcentajeCumplimiento=1 -> actualiza estatus
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

  if (accion === 'actualizar') {
    return actualizarHallazgo(e);
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


function actualizarHallazgo(e) {
  const folio = String(e.parameter.Folio || e.parameter.folio || '').trim();
  const regionParam = String(e.parameter.Region || e.parameter.region || '').trim();

  if (!folio) {
    return json({ ok:false, mensaje:'Falta indicar el folio' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regionesBuscar = regionParam && regionParam.toUpperCase() !== 'GERENCIA'
    ? [regionParam]
    : REGIONES_GESTION_ADO;

  for (let r = 0; r < regionesBuscar.length; r++) {
    const region = regionesBuscar[r];
    const sh = ss.getSheetByName(region);
    if (!sh) continue;

    const values = sh.getDataRange().getValues();
    if (values.length < 2) continue;

    const headers = values[0];
    const idxFolio = headers.indexOf('Folio');
    if (idxFolio === -1) continue;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idxFolio]).trim() === folio) {
        actualizarCeldaPorEncabezado_(sh, headers, i + 1, 'Estatus', e.parameter.Estatus || 'Pendiente');
        actualizarCeldaPorEncabezado_(sh, headers, i + 1, 'PorcentajeCumplimiento', e.parameter.PorcentajeCumplimiento || 0);

        if (e.parameter.Observaciones !== undefined) {
          asegurarEncabezado_(sh, 'Observaciones');
          const headers2 = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
          actualizarCeldaPorEncabezado_(sh, headers2, i + 1, 'Observaciones', e.parameter.Observaciones || '');
        }

        asegurarEncabezado_(sh, 'FechaActualizacion');
        const headers3 = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
        actualizarCeldaPorEncabezado_(sh, headers3, i + 1, 'FechaActualizacion', new Date());

        return json({ ok:true, mensaje:'Hallazgo actualizado', folio:folio, region:region });
      }
    }
  }

  return json({ ok:false, mensaje:'No se encontró el folio para actualizar' });
}

function actualizarCeldaPorEncabezado_(sh, headers, row, header, value) {
  let idx = headers.indexOf(header);
  if (idx === -1) {
    asegurarEncabezado_(sh, header);
    headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    idx = headers.indexOf(header);
  }
  sh.getRange(row, idx + 1).setValue(value);
}

function asegurarEncabezado_(sh, header) {
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1,1,1,lastCol).getValues()[0];
  if (headers.indexOf(header) === -1) {
    sh.getRange(1, lastCol + 1).setValue(header);
  }
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
