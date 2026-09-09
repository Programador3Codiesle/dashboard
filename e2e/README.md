# Pruebas E2E (Playwright)

Pruebas de navegador de la intranet Postventa. Cubren smoke, login, rutas
protegidas y dashboard. Requieren frontend y backend levantados, y un
**usuario de laboratorio** — nunca cuentas ni datos de producción.

## Requisitos

- Frontend en `E2E_BASE_URL` (por defecto `http://localhost:3000`)
- Backend en `E2E_API_URL` (por defecto `http://localhost:4000`)
- Chromium de Playwright (`npx playwright install chromium`)

Variables: copie `e2e/env.example` a `e2e/.env.e2e.local`.

| Variable | Uso |
|----------|-----|
| `E2E_ENV` | `local`, `staging` o `production` |
| `E2E_BASE_URL` | Origen del frontend |
| `E2E_API_URL` | Origen del API Nest |
| `E2E_NIT` / `E2E_PASSWORD` | Usuario de prueba |
| `E2E_ALLOW_DESTRUCTIVE` | Mutaciones (crear/editar). Bloqueado en producción |
| `E2E_START_FRONT` | `1` para que Playwright arranque `npm run dev` |

En `E2E_ENV=production` o si la URL apunta a `intranet.codiesel.co` solo
corren smoke de lectura. Las pruebas que mutan datos se omiten.

## Comandos

Desde la **raíz del repo** (`NuevaPostventa`) o desde `Frontend/intranet-postventa`.
Si pega varios comandos a la vez, Git Bash los lanza en paralelo y fallan.

```bash
# Todas las pruebas (headless)
npm run test:e2e

# Una prueba o archivo (siempre desde Frontend/intranet-postventa)
cd Frontend/intranet-postventa
npx playwright test e2e/auth/login.spec.ts
npx playwright test -g "inicia sesión"

# Un módulo (API + pantalla)
npm run test:e2e:tickets
npm run test:e2e:taller
npm run test:e2e:informes
npm run test:e2e:usuarios
npm run test:e2e:contact-center
npm run test:e2e:encuestas
npm run test:e2e:checklist
npm run test:e2e:cotizar
npm run test:e2e:nomina
npm run test:e2e:mantenimiento
npm run test:e2e:repuestos
npm run test:e2e:auditoria
npm run test:e2e:indicadores
npm run test:e2e:ordenes-tot
npm run test:e2e:administracion

# Navegador visible
npm run test:e2e:headed

# Modo UI (inspector)
npm run test:e2e:ui

# Reporte HTML de la última corrida
npm run test:e2e:report
```

No use `npx playwright` en la raíz del repo: instala otro Playwright y choca con `@playwright/test`.

## Depurar un fallo

1. Abrir el reporte: `npm run test:e2e:report`.
2. En el caso fallido: screenshot, video (si hubo retry) y trace.
3. Trace: `npx playwright show-trace test-results/**/trace.zip`
4. Re-ejecutar con inspector:

```bash
cd Frontend/intranet-postventa
npx playwright test e2e/auth/login.spec.ts --debug
```

No cambie expectativas para “hacer pasar” el test. Si el producto está mal,
es un bug de la aplicación.

## Estructura

```
e2e/
  auth/          login, logout, rutas protegidas
  smoke/         carga de app, health, dashboard
  modules/       un folder por módulo: *.ui.spec.ts (pantalla) y *.api.spec.ts (Nest)
  helpers/       env, login UI, API, protecciones de entorno
  setup/         storageState reutilizable
  fixtures/
```

Cómo avanzar módulo a módulo:

1. Elegir un módulo (Tickets, Taller, Informes…).
2. Primero **API** (`*.api.spec.ts`): GET con sesión, 401 sin sesión.
3. Luego **UI** (`*.ui.spec.ts`): entra a la ruta, espera la llamada HTTP, valida título/tabla.
4. Crear/editar/borrar solo con `E2E_ALLOW_DESTRUCTIVE=true` y `assertDestructiveAllowed()`.
5. Correr solo ese folder: `npm run test:e2e:tickets` (o `taller` / `informes` / `usuarios` / `contact-center` / `encuestas` / `checklist` / `cotizar` / `nomina` / `mantenimiento` / `repuestos` / `auditoria` / `indicadores` / `ordenes-tot` / `administracion`).

Flujos de lectura ya cubiertos: tickets, estado taller, entrada de vehículo, informe OT abiertas, posibles retornos, informe posibles retornos, PQR/NPS, usuarios, Contact Center (hub, distribución, leads, bases de datos), encuestas (hub, satisfacción), checklist (hub, formulario alineadores sin guardar), cotizar (hub, informe, livianos sin crear), nómina (hub y consultas del mes anterior; sin Excel ni actualizar valores de jefes), mantenimiento (hub, equipos, correctivo, preventivo, informes; sin crear/iniciar/eliminar ni links públicos de retiro), repuestos (hub, EV/SV del día, inventario, obsoletos, OC del mes; sin crear/autorizar/entregar), auditoría (hub y consultas GET; PQR reutiliza Informes), indicadores (hub y presupuesto posventa con drilldown), órdenes TOT (hub, portería, listados; sin crear, confirmar salida, reingreso ni PDF), administración (hub, listas del día, compras, vehículos, informes, calendarios, ajustes contables, orden de salida y autoevaluación; sin crear/guardar/Excel ni responder autorización pública).

El flujo completo de login vive en `auth/login.spec.ts`. El resto de pruebas
autenticadas reutilizan `e2e/.auth/user.json` (no se versiona).

## Agregar un módulo

1. Crear `e2e/modules/<modulo>/<flujo>.ui.spec.ts` y `<flujo>.api.spec.ts`.
2. Lectura: no hace falta tocar `playwright.config.ts` (ya incluye esos globs).
3. Crear/editar/borrar: `assertDestructiveAllowed()` al inicio.
4. Selectores: `getByRole` / `getByLabel` / `getByTestId`.
5. Esperas: URL, respuesta de API o elemento visible. Sin `waitForTimeout`.
6. Si el usuario de prueba no tiene el menú, la UI hace `test.skip` (no es un fallo).
