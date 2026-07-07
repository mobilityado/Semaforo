# Gestión ADO v2.5

Dashboard operativo conectado a Google Sheets mediante Google Apps Script.

## Incluye

- Login por región.
- Módulo Gerencia con contraseña `X485218x`.
- Gerencia puede consultar todas las pestañas/regiones.
- Filtros por región, terminal, estatus y búsqueda.
- Nuevo hallazgo desde la web.
- Edición de estatus desde la tabla con botón de lápiz.
- Cambio de porcentaje y observaciones.
- Exportación CSV y PDF mediante impresión.

## Importante para que guarde y actualice

1. Abre tu proyecto de Google Apps Script.
2. Copia y pega el contenido de `APPS_SCRIPT_NUEVO_HALLAZGO.gs`.
3. Guarda los cambios.
4. Implementa de nuevo como Web App.
5. Copia la URL nueva si cambió y reemplázala en `js/api.js`.

## Columnas recomendadas en cada pestaña/región

Folio, Region, Terminal, Area, Hallazgo, Responsable, Fecha, Estatus, PorcentajeCumplimiento, Evidencia, FechaRegistro, Observaciones, FechaActualizacion

Si faltan `Observaciones` o `FechaActualizacion`, el Apps Script las crea automáticamente al actualizar.
