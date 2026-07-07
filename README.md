# GestionADO v2.3

Dashboard operativo conectado a Google Sheets mediante Apps Script.

## Cambios v2.3

- El módulo Gerencia puede consultar todas las pestañas/regiones del archivo de Google Sheets.
- Gerencia puede filtrar por región: Villahermosa, Cárdenas, Tuxtla, etc., o ver todo.
- Nuevo hallazgo guarda directamente en la pestaña de la región seleccionada.

## Importante

Para que Gerencia vea todas las pestañas en una sola consulta, copia el contenido de:

`APPS_SCRIPT_NUEVO_HALLAZGO.gs`

Dentro de tu proyecto de Google Apps Script y vuelve a implementar la Web App.

Si no actualizas el Apps Script, el dashboard intentará consultar región por región como respaldo.
