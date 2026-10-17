# Bitácora CS50P

Guía semanal de **CS50P (Harvard)** en español: resumen, JavaScript → Python, quiz, ejercicios con corrección automática en el navegador, pistas para cada problem set y la tarea del proyecto (finanzas tracker).

El contenido de cada semana se verificó contra las notas oficiales (`cs50.harvard.edu/python/notes/N`) y los enunciados de los problem sets. Las URLs revisadas están en el campo `sources` de cada JSON.

## Correrlo en tu compu

Necesitas Node.js instalado.

```bash
cd bitacora-cs50p
npm run dev
```

Abre http://localhost:3000

> No lo abras con doble clic en `index.html`: el navegador bloquea la carga de los JSON. Siempre usa `npm run dev`.

## Subirlo a Vercel

Es un sitio estático, no necesita build.

**Opción 1 — desde la terminal**

```bash
npm i -g vercel
vercel          # primera vez: login y preguntas (acepta los valores por defecto)
vercel --prod   # publica la versión final
```

**Opción 2 — desde GitHub**

1. Sube la carpeta a un repo nuevo en GitHub.
2. En vercel.com → **Add New → Project** → importa el repo.
3. Framework Preset: **Other**. Build Command: vacío. Output Directory: `.`
4. **Deploy**. Cada `git push` lo vuelve a publicar.

## Estructura

```
index.html           página
design/tokens.css    colores, tipografía y espaciados (claro/oscuro); única fuente de colores
styles.css           estilos; solo usa variables de tokens.css
app.js               lógica: Inicio, semanas, modo foco, quiz, editor y corrector de Python
data/w0.json …       contenido de cada semana  ← lo que editas
vendor/              Skulpt (Python en el navegador)
tools/check-data.js  valida los JSON antes de subir
design/handoff.md    especificación del diseño (referencia, no se carga en la página)
```

## Cómo se usa

- **Inicio** (`#/`): "Continuar donde lo dejé", días hasta el 31 dic con el ritmo necesario, los días que estudiaste esta semana y la lista de las 10 semanas con su avance.
- **Antes de empezar** (Inicio, una sola vez): los 4 pasos para preparar tu cuenta de CS50 (formulario, GitHub, cs50.dev, `update50`). Se marcan a mano; "Ya lo completé" marca los 4. Si ya tenías progreso guardado se dan por hechos. Después queda en W0 → 07 Problem set como "Preparación · 4/4".
- **Semana** (`#/w/1`): 8 secciones — 01 En corto (con "Consejos de David") · 02 De JS a Python · 03 Código clave y trampas · 04 Shorts · 05 Quiz · 06 Práctica · 07 Problem set · 08 Proyecto. Si una semana no trae shorts, son 7 y la numeración se recalcula.
  - Bajo el título, el flujo oficial de CS50: **Clase → Shorts → Problem set**, con el paso en el que vas.
  - Índice lateral fijo (en móvil, barra de secciones arriba) con Notas de la clase, Video, Transcript y Fuentes oficiales.
  - Las secciones hechas se pliegan; ábrelas con "abrir". El quiz hecho tiene "revisar" (solo lectura) y "repetir" (borra tus respuestas).
  - Al final: qué te falta (o "Siguiente semana →") y el pie anterior / siguiente.
- **Hecha**: 01, 02, 03 y 08 con "Marcar como hecho"; 04 Shorts cuando ves todos los confirmados (si ninguno está confirmado, al marcar uno o con "Marcar como hecho"); 05 al responder todas; 06 al aprobar todos los ejercicios; 07 al marcar todos los problemas.
- **Modo foco** (botón "Modo foco" o tecla **F**): un paso a la vez (una pregunta del quiz o un ejercicio por paso). En las secciones que se marcan a mano, "Marcar hecho y seguir" marca la sección; "Saltar" avanza sin marcar.
- **Práctica**: escribe y pulsa **Comprobar**. Si falla, ves qué caso, lo que pide el test, lo esperado frente a lo obtenido y la línea del error marcada en el editor.
- **Ejecutar** abre una consola: cada `input()` te pide el valor en línea (lo que escribes va en azul). **Detener** corta el programa, incluso un bucle infinito. "Usar entrada de: caso n" corre el programa con las entradas de ese test.
- **Ejemplos** (03): botón **Copiar** y, después, "Probar en el editor" para llevarlo al ejercicio activo.

## Atajos de teclado

| Dónde | Tecla | Qué hace |
|---|---|---|
| Vista de semana | `F` | Entra al modo foco |
| Vista de semana | `[` / `]` | Semana anterior / siguiente |
| Modo foco | `Esc` | Sale del modo foco |
| Modo foco | `→` / `←` | Paso siguiente / anterior (no marca nada como hecho) |
| Modo foco, quiz | `1`–`4` | Elige la opción A–D |
| Editor | `⌘↵` / `Ctrl+↵` | Comprobar |
| Editor | `Tab` / `Shift+Tab` | Indenta / des-indenta (también varias líneas seleccionadas) |
| Editor | `Enter` | Nueva línea con la misma sangría (+4 tras `:`) |
| Editor | `Esc` | Suelta el editor para seguir navegando con el teclado |
| Consola | `Enter` | Envía lo escrito al `input()` que está esperando |
| Tirador del editor | `↑` / `↓` | Ajusta el alto (también arrastrando) |
| Pestañas de ejercicio | `←` / `→` | Cambia de ejercicio |

Los atajos no se activan mientras escribes en el editor o en un campo, salvo `⌘↵` y `Esc`.

## Editar contenido

Cada semana es un archivo `data/wN.json`. Campos principales:

| Campo | Qué es |
|---|---|
| `summary` | Lista de puntos clave. Acepta `` `código` `` y `**negrita**` |
| `jsToPy` | Filas `{ js, py, note }` |
| `quiz` | `{ q, options, answer, why }` — `answer` es el índice (empieza en 0) |
| `pset` | Problemas oficiales con `name`, `url`, `task`, `hints` |
| `practice` | Ejercicios del editor: `starter` y `tests` |
| `transcriptUrl` | (opcional) Link al transcript oficial de la clase |
| `tips` | (opcional) Consejos de David en la clase; se muestran hasta 4 al final de "En corto" |
| `shorts` | (opcional) Videos cortos: `{ title, url, confirmed }`. `confirmed: false` = asignación a la semana sin confirmar (no bloquea el avance) |

Tests de un ejercicio:

```json
{ "stdin": ["100"], "expect": "Total: S/ 118.00" }      // programa completo con input()
{ "code": "print(format_amount(18.9))", "expect": "S/ 18.90" }  // prueba una función
```

`expect` debe coincidir con el **final** de la salida.

Después de editar:

```bash
npm run check
```

## Limitaciones del editor

El Python del navegador (Skulpt) es simplificado: no tiene archivos, `csv`, `json`, `re.fullmatch` ni `match`. Para eso, y para los problem sets oficiales, usa **cs50.dev**.

## Qué se guarda (localStorage)

Todo vive solo en este navegador. Si cambias de navegador o dispositivo, empiezas en cero.

| Clave | Contenido |
|---|---|
| `cs50p-done` | Problemas del pset marcados: `{"1-0": true}` (semana-índice) |
| `cs50p-quiz` | Respuestas del quiz: `{"1": {"0": 2}}` (semana → pregunta → opción) |
| `cs50p-passed` | Ejercicios aprobados: `{"1-1": true}` |
| `cs50p-code` | Tu código por ejercicio: `{"1-1": "def …"}` |
| `cs50p:v1` | Lo nuevo del rediseño (ver abajo) |

Las cuatro primeras son las de siempre y no cambiaron de formato. `cs50p:v1` guarda:

- `theme`: `"light"` o `"dark"` si elegiste uno; sin valor sigue al sistema.
- `last`: `{ week, section, item }`, a dónde lleva "Continuar". Solo cambia al responder, aprobar o marcar algo.
- `v`: versión del formato (2 = 8 secciones). Al pasar de 1 a 2, `last.section` y `focus.step` se ajustaron una sola vez a la numeración nueva.
- `weeks["1"].done`: secciones marcadas a mano como hechas (`summary`, `jsToPy`, `examples`, `project`, y `shorts` si ninguno está confirmado).
- `weeks["1"].shorts`: shorts vistos por índice: `{ "0": true }`.
- `weeks["1"].hintsOpen`: cuántas pistas abriste por problema.
- `weeks["1"].bannerDone`: el aviso de "semana completa" ya se cerró (al abrir la semana siguiente).
- `studyDays`: días en que marcaste o aprobaste algo (`"2026-10-17"`).
- `startedAt`: primer día de uso, para calcular si vas por delante o por detrás del ritmo.
- `editorHeight`: alto del editor en líneas, si lo ajustaste.
- `focus`: `{ week, step }` mientras estás en modo foco (al recargar vuelves al mismo paso).
- `setup`: los 4 pasos de "Antes de empezar" (`[true, true, false, false]`); `setupHidden`: si el bloque ya no se muestra en Inicio.
- `consoleHintSeen`: la nota de colores de la consola ya se mostró.
