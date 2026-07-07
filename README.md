# Gestión Operativa ADO 2.1

Dashboard conectado a Google Sheets mediante Google Apps Script.

## Novedades

- Nuevo hallazgo desde el dashboard.
- Módulo Gerencia con contraseña `X485218x`.
- Gerencia visualiza todas las regiones combinando consultas por región.
- Modal para capturar hallazgos.
- Exportación CSV y PDF por impresión.

## Importante para guardar nuevos hallazgos

El dashboard ya manda la información con `accion=nuevo`, pero tu Apps Script debe aceptar esa acción.

Incluí el archivo:

`APPS_SCRIPT_NUEVO_HALLAZGO.gs`

Puedes usarlo completo o copiar la función `guardarHallazgo(e)` a tu Apps Script actual.

## Columnas sugeridas en Google Sheets

La fila 1 de la hoja debe tener estos encabezados:

Folio | Region | Terminal | Area | Hallazgo | Responsable | Fecha | Estatus | PorcentajeCumplimiento | Evidencia | FechaRegistro

Si tu hoja usa nombres diferentes, ajusta el Apps Script o dime los encabezados y lo adapto.
