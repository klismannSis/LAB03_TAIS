# Informe del Proyecto: Weather Forecast App

**Fecha:** 20 de octubre de 2026  
**Estado:** Implementado y verificado  
**Tipo de aplicación:** SPA estática en el navegador, sin backend propio

## 1. Resumen ejecutivo

Weather Forecast App permite consultar las condiciones meteorológicas actuales de una ciudad. El usuario introduce un nombre, la aplicación obtiene sus coordenadas mediante la Geocoding API de Open-Meteo y consulta la Forecast API para presentar temperatura, humedad relativa y precipitación.

La implementación sigue la arquitectura por capas definida en `design.md`: interfaz de usuario, controlador, servicios de dominio y clientes HTTP. La solución usa HTML, CSS y TypeScript vanilla, sin framework de frontend ni servidor de aplicación propio. Las llamadas se realizan desde el navegador a servicios públicos de Open-Meteo.

El checklist de `tasks.md` está completado. En la verificación documentada para este informe, `npm test` finalizó con **36 pruebas aprobadas en 4 archivos**, `npm run build` compiló correctamente y el analizador de VS Code no detectó errores en `src`.

## 2. Objetivos y alcance

El proyecto implementa los siguientes flujos y comportamientos:

- Permite introducir el nombre de una ciudad con un máximo de 100 caracteres.
- Valida entradas vacías o compuestas únicamente por espacios, sin iniciar llamadas de red.
- Recorta los espacios periféricos antes de geocodificar.
- Solicita como máximo un resultado a la Geocoding API.
- Usa la latitud y longitud del primer resultado válido.
- Solicita los valores actuales de temperatura, humedad relativa y precipitación.
- Presenta el nombre de la ciudad, las métricas y sus unidades.
- Informa estados de carga, errores de red, timeout, respuestas HTTP no exitosas, datos incompletos y respuestas no válidas.
- Limpia los resultados anteriores al iniciar una búsqueda nueva.
- Mantiene el campo disponible para nuevos intentos después de un error.

Quedan fuera de alcance un backend propio, almacenamiento de búsquedas, autenticación, claves privadas y pronósticos por hora o varios días. La app consulta las condiciones actuales indicadas por los documentos del proyecto.

## 3. Especificaciones de referencia

La implementación se contrastó con:

- `requirements.md`: historias de usuario y criterios de aceptación para búsqueda, geocodificación, pronóstico, presentación y corrección de datos.
- `design.md`: arquitectura, interfaces, estados, clasificación de errores, propiedades de corrección y reglas de formato.
- `tasks.md`: plan de implementación, pruebas unitarias, propiedades y pruebas de integración.

`tasks.md` refleja todas sus tareas como completadas. Las pruebas opcionales marcadas con asterisco también se implementaron.

## 4. Arquitectura

El flujo de ejecución es:

1. `CitySearchForm` recoge y valida el nombre de la ciudad.
2. `WeatherController` limpia errores y resultados anteriores y activa la indicación de carga.
3. `GeocodingService` usa `GeocodingClient` para resolver el nombre a coordenadas.
4. `ForecastService` usa `ForecastClient` para obtener los valores actuales.
5. `WeatherDisplay` presenta los datos usando las utilidades de formato.
6. `ErrorMessage` o `LoadingIndicator` actualizan el estado visible según corresponda.

### Capas y responsabilidades

- **Presentación:** `CitySearchForm`, `WeatherDisplay`, `LoadingIndicator` y `ErrorMessage` crean y actualizan elementos del DOM.
- **Aplicación:** `WeatherController` coordina validación posterior al envío, servicios y estado de la interfaz.
- **Servicios:** `GeocodingService` y `ForecastService` parsean y validan respuestas y convierten errores en resultados discriminados.
- **Clientes HTTP:** `GeocodingClient` y `ForecastClient` forman las URLs, ejecutan `fetch` y aplican timeout de 10 segundos con `AbortController`.
- **Dominio/utilidades:** `src/types/index.ts` define los contratos y `src/utils/formatters.ts` contiene el formateo de las métricas.

## 5. Integraciones externas

### Geocoding API

Endpoint: `https://geocoding-api.open-meteo.com/v1/search`  
Parámetros principales: `name` (recortado y codificado como URL) y `count=1`.

La aplicación utiliza el primer resultado. Si no hay resultados o faltan latitud/longitud, se informa que la ciudad no fue encontrada. Los errores de red, timeout, HTTP no exitoso y JSON inválido se clasifican por separado.

### Forecast API

Endpoint: `https://api.open-meteo.com/v1/forecast`  
Parámetros principales: `latitude`, `longitude` y `current=temperature_2m,relative_humidity_2m,precipitation`.

Se emplea `relative_humidity_2m`, el nombre actual aceptado por Open-Meteo y señalado en `design.md` como alternativa al identificador legacy citado en `requirements.md`.

## 6. Reglas de datos y presentación

- Las coordenadas y los valores meteorológicos se conservan sin formato al mapearlos al modelo interno.
- Temperatura: un decimal y unidad `°C`.
- Humedad: redondeada a entero y unidad `%`.
- Precipitación: un decimal y unidad `mm`.
- Si la API no devuelve un nombre de ciudad utilizable, se utiliza el nombre escrito por el usuario.
- La interfaz anuncia errores con una región accesible y muestra un indicador de carga mientras se procesan las solicitudes.

## 7. Organización del proyecto

```text
SDD Project/
├── design.md
├── requirements.md
├── tasks.md
├── informe-proyecto.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── WeatherController.ts
│   ├── clients/
│   ├── components/
│   ├── services/
│   ├── tests/
│   ├── types/
│   ├── utils/
│   └── styles.css
└── dist/                   # salida generada por TypeScript
```

## 8. Estrategia y resultados de pruebas

El proyecto usa Vitest para ejecutar pruebas, fast-check para pruebas basadas en propiedades, jsdom para proporcionar DOM durante las pruebas y `@testing-library/dom` para sincronización con cambios de interfaz.

Cobertura organizada en cuatro archivos:

- `clients-services.test.ts`: construcción de URLs, timeout, clasificación de errores HTTP/red/JSON, extracción de coordenadas, campos incompletos y round-trip de datos.
- `formatters.test.ts`: formato de temperatura, humedad y precipitación, incluidos valores numéricos extremos.
- `ui-controller.test.ts`: formulario, rechazo de whitespace, trim, display, fallback del nombre, estado de carga, errores y orquestación del controlador.
- `app.e2e.test.ts`: recorrido integrado desde el formulario y controlador hasta clientes HTTP reales con `fetch` simulado; verifica flujo correcto y ciudad no encontrada.

### Verificación registrada

| Comando | Resultado |
|---|---|
| `npm test` | 4 archivos aprobados, 36 pruebas aprobadas |
| `npm run build` | Compilación TypeScript correcta |
| Diagnósticos de VS Code en `src` | Sin errores reportados |

Las pruebas de integración simulan las respuestas HTTP para ser repetibles y no depender de la disponibilidad de Open-Meteo. No representan una prueba automatizada de navegador contra las APIs en vivo.

## 9. Instalación, compilación y ejecución

Ejecutar desde la carpeta `SDD Project`:

```powershell
npm install
npm test
npm run build
```

`npm run build` genera JavaScript en `dist/`. La app es una SPA y debe abrirse en un navegador mediante un servidor estático o una extensión de servidor local de VS Code. Por ejemplo, se puede usar Live Server y abrir `index.html` en el navegador.

No ejecutar `node .\dist\main.js` para iniciar la aplicación: ese archivo accede al objeto `document`, disponible en el navegador, no en Node.js. En Node aparecerá el error `ReferenceError: document is not defined`.

También se necesitan conexión a Internet para consultar Open-Meteo y, en la configuración actual, para cargar las fuentes e iconos vinculados mediante CDN.

## 10. Dependencias principales

- TypeScript: compilación estática del código de la aplicación.
- Vitest: pruebas unitarias y de integración.
- fast-check: generación de casos para propiedades de corrección.
- jsdom: simulación de un entorno DOM en pruebas.
- `@testing-library/dom`: utilidades DOM usadas por la suite.

La aplicación en ejecución no requiere un framework ni dependencias JavaScript de dominio adicionales; sus solicitudes HTTP usan `fetch` del navegador.

## 11. Riesgos y consideraciones operativas

- La consulta depende de la conectividad y disponibilidad de las APIs públicas de Open-Meteo.
- El timeout es de 10 segundos por solicitud, conforme al diseño.
- Los nombres ambiguos se resuelven usando el primer resultado, de acuerdo con el requisito de máximo un resultado.
- El formato de valores negativos o de magnitud extrema sigue las reglas numéricas de JavaScript; la humedad se normaliza a una cadena entera.
- Las fuentes e iconos remotos pueden no mostrarse si sus CDN están bloqueados; esto no afecta a las llamadas de datos de Open-Meteo.
- `dist/` es salida compilada y puede regenerarse con `npm run build`; el código fuente se mantiene en `src/`.

## 12. Conclusión

La entrega implementa el flujo especificado de búsqueda de clima como SPA estática, con separación por capas, estados de carga y error, validación, parseo, formateo y cobertura de pruebas unitarias, generativas y de integración. En la última ejecución registrada, las 36 pruebas aprobaron y la compilación TypeScript finalizó correctamente. Para utilizarla, se debe servir `index.html` en el navegador y no ejecutar el módulo compilado directamente con Node.
