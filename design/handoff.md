# Bitácora CS50P — Handoff de UI v1.1

Stack: `index.html` + `styles.css` + `app.js` (vanilla). Importa `tokens.css` antes de `styles.css`. Los JSON no cambian.
Referencia visual: `pantallas/*.html` (export del lienzo, estilos inline con los mismos valores). Todos los colores de este documento son tokens de `tokens.css`.

### Cambios v1.1
- **8 secciones.** Shorts entra como 04; las demás se corren: 05 Quiz · 06 Practica aquí · 07 Problem set · 08 Proyecto. Donde las pantallas 1a–1h muestran la numeración de 7, manda este documento.
- Si `shorts[]` falta o está vacío, la sección 04 no se pinta y la numeración visible se recalcula (01–07). Usa siempre el índice visible, nunca un número fijo en el HTML.
- Datos nuevos usados (ya en los JSON): `transcriptUrl`, `tips[]`, `shorts[{title,url,confirmed}]`. Sin duración (`min`): no se muestra ninguna; si en el futuro llega `min`, va como `500 13px mono --ink-2` a la derecha de cada fila.
- Nuevos bloques: §14 Flujo CS50 · §15 Shorts · §16 Consejos de David · §17 Transcript · §18 Antes de empezar · §19 Consola de Ejecutar · §20 Fin de semana · §21 Copiar.

---

## 0. Reglas generales

- **Sin sombras ni degradados.** Jerarquía con borde (1px `--line`; 1.5px `--accent` = "actual"; 1.5px `--ink` = "continuar") y con tamaño.
- **Un acento.** `--accent` = lo que toca ahora (sección actual, botón primario, pestaña en curso). `--ok`/`--bad` solo para resultados y estados hechos.
- **Foco visible** en todo lo interactivo: `outline: var(--focus-outline); outline-offset: var(--focus-offset)` (3px en el botón primario). Usar `:focus-visible`.
- **Tap mínimo** 44px en móvil.
- **Markdown mínimo** (`código`, **negrita**): `` `x` `` → `<code>`, `**x**` → `<strong>`. Escapar HTML antes.
- `<code>` inline: `font: 500 0.9em var(--font-mono); background: var(--surface-2); padding: 1px 5px; border-radius: var(--radius-code)`.
- Etiquetas tipo "05 · EL CENTRO DE LA SEMANA": `font: 500 13px var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase`.
- Numeración 01–07: `font: 500 12px var(--font-mono); color: var(--ink-2)`.

### Breakpoints

| Nombre | Rango | Layout |
|---|---|---|
| desktop | ≥ 1024px (diseño a 1280, probado a 1440) | header + pestañas + índice lateral sticky 240px + columna 860px. Contenedor `max-width: 1280px; margin-inline: auto` — a 1440 sobran 80px por lado. |
| tablet | 640–1023px | sin índice lateral; barra de secciones sticky (como móvil) y columna única `max-width: 860px`. |
| móvil | < 640px (diseño a 390, debe funcionar a 400 y 360) | padding lateral 16px, barra de secciones sticky, barra de acciones del editor fija abajo. |

### Estado y persistencia (`localStorage`, clave única `cs50p:v1`)

```json
{
  "theme": "system|light|dark",
  "last": { "week": 1, "section": 5, "item": 1 },
  "weeks": {
    "1": {
      "done": { "summary": true, "jsToPy": true, "examples": true, "project": false },
      "quiz": { "0": 1, "1": 2 },
      "practice": { "0": { "passed": true, "code": "..." }, "1": { "passed": false, "code": "..." } },
      "pset": { "deep": true },
      "shorts": { "0": true, "1": true },
      "hintsOpen": { "bank": 1 }
    }
  },
  "setup": [true, true, false, false],
  "setupHidden": false,
  "studyDays": ["2026-10-12", "2026-10-13", "2026-10-15"],
  "editorHeight": 7
}
```

**Cuándo una sección está hecha**
- 01 `summary`(+`tips`), 02 `jsToPy`, 03 `examples`+`traps`, 08 `project` → botón "Marcar como hecho".
- 04 `shorts` → todos los shorts con `confirmed: true` marcados como vistos. Los `confirmed: false` no bloquean; si se marcan, cuentan en el contador. Si todos son `confirmed: false`, la sección se da por hecha al marcar uno o con "Marcar como hecho".
- 05 `quiz` → todas las preguntas respondidas (acertadas o no).
- 06 `practice` → todos los ejercicios aprobados.
- 07 `pset` → todos los checkboxes marcados.

Avance de la semana = secciones hechas / secciones visibles (8, o 7 sin shorts), redondeo hacia abajo.
Progreso global = (ejercicios aprobados + psets marcados) / (total de ejercicios + total de psets en las semanas cargadas).
Estado de la semana: `sin cargar` (no hay JSON), `cargada` (JSON, 0 hechas), `en curso` (≥1), `completa` (todas las visibles).

---

## 1. Componentes compartidos

### 1.1 Header de la app `.app-header`
```html
<header class="app-header">
  <a class="app-logo" href="#/">Bitácora <span>CS50P</span></a>
  <nav class="app-nav"><a aria-current="page">Inicio</a><a>Semanas</a></nav>
  <div class="global-progress" role="progressbar" aria-valuenow="13" aria-valuemax="80" aria-label="Progreso global">
    <span class="global-progress__label">Progreso global</span>
    <span class="global-progress__track"><span class="global-progress__fill" style="width:16%"></span></span>
    <span class="global-progress__value">13/80</span>
  </div>
  <button class="theme-toggle">Modo oscuro</button>
</header>
```
- `height: 60px; padding: 0 32px; gap: 24px; border-bottom: 1px solid var(--line)`; flex, align center. No es sticky.
- Logo: `700 19px var(--font-display)`, `letter-spacing: -0.01em`; "CS50P" en `--accent`.
- Nav: gap 4px; enlace `padding: 6px 12px; 15px`; activo `background: --surface-2; radius 6px; 700`; inactivo `--ink-2`.
- Progreso: `margin-left: auto; gap: 12px; 14px --ink-2`; pista 160×6, radius 3, `--surface-2`; relleno `--ink`; valor `500 13px mono --ink`.
- Toggle: `14px; padding 6px 12px; border 1px --line; radius 6; transparent`. Rota system→light→dark; texto = el modo al que cambiará.
- Móvil: logo 18px + valor "13/80" solo; padding `20px 20px 14px`; sin nav (inicio/semana se navega con "← W1 ▾").

### 1.2 Barra de segmentos `.segments`
Uso: avance de semana (8, o 7 sin shorts), casos de test (n), shorts vistos (n), pasos de preparación (4), pasos de foco (8).
- flex, `gap: 3px` (4px en tarjeta continuar). Segmento: `flex: 1; height: 6px; radius: 2px` (5px en móvil, 4px en foco).
- Colores: hecho `--ok` · actual `--accent` · pendiente `--line` · test fallido `--bad`.
- En foco desktop: segmentos fijos de 28×4, el actual 44×4.

### 1.3 Punto de estado `.status-dot`
9×9 (8×8 dentro de pestañas), `border-radius: 50%`.
- completa: fill `--ok` · en curso: fill `--accent` · cargada: `border 1.5px solid --ink-2` · sin cargar: `border 1.5px dashed --ink-3`.
- Siempre acompañado de texto o `aria-label` (no solo color).

### 1.4 Botones
| Clase | Estilo |
|---|---|
| `.btn--primary` | `700 16px body; padding 11px 20px (12px 22px en inicio, 13px 26px en foco); border 0; radius 8; bg --accent; color --on-accent`. Hover: `filter: brightness(1.08)` (claro: `brightness(.92)`). Atajo en `<kbd>` `500 12px mono; opacity .8`. |
| `.btn--secondary` | `700 16px; padding 10px 18px; border 1px --line; radius 8; transparent; --ink`. Hover: `bg --surface-2`. |
| `.btn--ghost` | `16px; padding 10px 12px; sin borde; --ink-2; underline offset 3px`. |
| `.btn--small` | `14–15px; padding 6px 10–12px; border 1px --line; radius 6`. |
Móvil: botones de acción ≥ 48px de alto (`padding: 14px`).

---

## 2. Pestaña de semana `.week-tab` (1g, fila 1)

```html
<nav class="week-tabs" aria-label="Semanas">
  <a class="week-tab" href="#/w/1" aria-current="page" data-state="progress">
    <span class="status-dot" aria-hidden="true"></span>W1
    <span class="visually-hidden">Condicionales, en curso</span>
  </a>
</nav>
```
- Contenedor: flex, `gap: 2px; padding: 0 24px; border-bottom: 1px solid --line`. Overflow-x auto en < 1024.
- Pestaña: `padding: 14px 14px 12px; gap: 8px; font: 500 15px mono; border-bottom: 2px solid transparent; margin-bottom: -1px`.

| Estado | Texto | Punto |
|---|---|---|
| sin cargar | `--ink-3`, `aria-disabled="true"`, no navegable | dashed `--ink-3` |
| cargada | `--ink-2` | borde `--ink-2` |
| en curso | `--ink` | `--accent` |
| completa | `--ink` | `--ok` |
| activa (`aria-current`) | `700 --ink`, `border-bottom-color: --ink` (en hoja: bg `--surface-2`, radius 6 6 0 0) | según estado |
| hover | `--ink`, bg `--surface-2` | — |
| foco | `outline 2px --accent; offset 2px; radius 6` | — |

---

## 3. Pantalla 1a — Inicio (desktop)

```html
<main class="home">
  <div class="home__top">
    <article class="continue-card">…</article>
    <aside class="home__aside">
      <section class="countdown">…</section>
      <section class="study-week">…</section>
    </aside>
  </div>
  <section class="weeks-list">…</section>
</main>
```
- `.home__top`: grid `minmax(0,1fr) 340px; gap 24px; padding: 40px 32px 48px`. < 1024 → una columna.

**Continuar `.continue-card`**: `border: 1.5px solid --ink; radius 10; padding 28px 32px; bg --surface`; flex column, gap 14px.
- Etiqueta "CONTINUAR DONDE LO DEJÉ": label mono, `--accent`.
- Título `700 34px/1.1 display; ls -0.02em` → `W{week} · {title}`.
- Subtítulo `17px --ink-2`: "05 Practica aquí — ejercicio 2 de 3: `name`" (nombre en mono `--ink`).
- Segmentos de la semana (gap 4px, `margin-top: 4px`).
- Fila: botón primario "Continuar →" + `14px --ink-2` tiempo estimado (derivado de `time` restante, opcional).
- Datos: `state.last`. Si no hay `last`, primera sección incompleta de la primera semana no completa.

**Cuenta atrás `.countdown`**: `border 1px --line; radius 10; padding 22px 24px; bg --surface`.
- Cifra `700 52px/1 display; ls -0.03em` + "días hasta el 31 dic" `16px --ink-2`, baseline, gap 10.
- Ritmo `15px/1.45 --ink-2; margin-top 10px`: "Quedan X semanas → **1 semana cada N días**".
- `días = ceil((31-dic 23:59 − hoy) / 86400000)`; `N = round(días / semanas restantes)`.

**Semana de estudio `.study-week`**: `padding 18px 24px`; cabecera `15px` "Esta semana" (700) / "3 de 5 días" `--ink-2`.
- Grid 7 columnas, gap 6, `margin-top 12`; círculo 26×26; letra `500 12px mono`.
- Estudiado: fill `--ink` · no: `border 1.5px --line` · hoy: `border 2px --accent`, letra `--accent 700` · futuro: `1.5px dashed --line`.
- Un día cuenta como estudiado al marcar/aprobar cualquier cosa. Objetivo fijo 5.

**Lista de semanas `.weeks-list`**: `padding: 0 32px 40px`.
- Cabecera: h2 `700 22px display` + leyenda de puntos `13px --ink-2`, gap 16.
- Fila `.week-row` (es un `<a>`): grid `20px 52px minmax(0,1fr) 260px 56px 100px; gap 16; padding 14px 8px; border-bottom 1px --line`. Contenedor con `border-top`.
  - id `500 15px mono` · título `17px` · segmentos (gap 3, alto 6) · % `500 14px mono` derecha · estado `14px` derecha, color: completa `--ok`, en curso `--accent 700`, cargada `--ink-2`, sin cargar `--ink-3`.
  - Hover: bg `--surface`. Sin cargar: no clicable.

## 4. Pantalla 1d — Inicio (móvil)
- Padding 0 16px; gap 12.
- Continuar: `padding 18; radius 10; gap 10`; título 24px; botón ancho completo `padding 13px`.
- Cuenta atrás en una fila: cifra `700 32px` + "días al 31 dic" 14px; a la derecha "3/5 días" 14px `--ink-2`.
- Filas de semana: grid `14px 34px minmax(0,1fr) 44px; gap 10; padding 12px 4px`; título 15px con ellipsis; sin segmentos ni etiqueta de estado (el punto lo dice).

---

## 5. Pantalla 1b — Vista de semana (desktop)

```html
<div class="week-layout">
  <aside class="section-index" aria-label="Secciones de la semana">
    <div class="week-progress">…</div>
    <nav><ol>
      <li><a href="#s-summary" class="section-index__item" data-state="done">…</a></li>
    </ol></nav>
    <button class="btn--secondary focus-toggle">Modo foco <kbd>F</kbd></button>
    <div class="week-links"><a href="{notesUrl}">Notas de la clase ↗</a><a href="{videoUrl}">Video ↗</a></div>
  </aside>
  <main class="week-main">
    <header class="week-head"><p class="week-head__meta">SEMANA 1 · ≈ 3 h</p><h1>Condicionales</h1></header>
    <section id="s-summary" class="section-card" data-state="done">…</section>
    …
  </main>
</div>
```
- `.week-layout`: grid `240px minmax(0,860px); gap 48px; padding 32px 32px 56px`.
- **Índice sticky**: `position: sticky; top: 24px; align-self: start`; flex column gap 20.
  - Avance: label mono `12px --ink-2` "W1 · AVANCE", segmentos `margin-top 10`, "4 de 7 secciones" `14px --ink-2 margin-top 8`.
  - Item: grid `22px 26px 1fr auto; padding 8px 10px; radius 6; 15px`.
    - hecho: ✓ `--ok`, texto `--ink-2` · pendiente: punto borde `--ink-2`, texto `--ink`, contador mono 12 `--ink-2` · actual: `bg --accent-soft; padding 10px; 700 --ink`, número y contador `--accent`, punto fill `--accent`. Hover: bg `--surface-2`.
  - El item actual se actualiza con `IntersectionObserver` (rootMargin `-40% 0px -55% 0px`) y pone `aria-current="true"`.
  - Clic → scroll suave (`window.scrollTo({top, behavior})`, `auto` con reduced-motion) y foco al `<h2>` de la sección (`tabindex="-1"`).
- **Cabecera de semana**: meta `500 13px mono --ink-2`; h1 `700 44px/1.05 display; ls -0.025em; margin-top 6`; `margin-bottom 12`.
- `.week-main`: flex column, gap 12.

### 5.1 Tarjeta de sección `.section-card` (1g, fila 2)
Se pinta desde el JSON: 01 `summary[]`+`tips[]`, 02 `jsToPy[]`, 03 `examples[]`+`traps[]`, 04 `shorts[]`, 05 `quiz[]`, 06 `practice[]`, 07 `pset[]`+`submit`, 08 `project`.

| Estado | Aspecto |
|---|---|
| `pending` (expandida) | `border 1px --line; radius 10; padding 22px 24px` (18 en tarjeta compacta); bg `--surface` solo en claro. Cabecera: número + h2 `700 22px display`. Al final, "Marcar como hecho" `.btn--small 700 14px` (01, 02, 03, 07). |
| `current` | `border 1.5px --accent`; label "04 · AHORA" en `--accent`; contador derecha. |
| `done` (plegada) | Una fila: grid `28px 1fr auto; gap 12; padding 14px 18px; border 1px --line; radius 8`. Título `16px` + resumen `--ink-2` ("· 7 puntos", "· 4 de 5 correctas"); derecha `14px --ok` "✓ Hecho · abrir" (abrir/repetir subrayado `--ink-2`). |
| `upcoming` (07 al final) | igual que plegada pero `border: 1px dashed --line`. |

- **Colapsar**: la fila plegada es un `<button aria-expanded="false" aria-controls="s-…">`. Al abrir, la sección se muestra completa con su estado hecho; al marcar "hecho" se pliega (transición `--dur-base` en opacity; sin animar altura). Al cargar la semana, las hechas aparecen plegadas y se hace scroll a la primera no hecha solo si se viene de "Continuar".
- Contenido interno (no dibujado en detalle en el lienzo, mantener el actual con estos estilos):
  - 01 lista `17px/1.55`, max 70ch.
  - 02 tabla `JS | Python | Ojo`: cabecera label mono 12 `--ink-2`; celdas código `mono 14px`; `border-bottom 1px --line`; en < 640 cada fila se apila en 3 líneas.
  - 03 ejemplos = bloque de código de solo lectura (mismo editor sin textarea); trampas = lista con etiqueta mono "TRAMPA" `500 12px --bad` antes de cada punto, texto `--ink` (sin emoji).

### 5.2 Sección Práctica `.practice` (centro de la semana)
```html
<section id="s-practice" class="practice" aria-labelledby="practice-title">
  <header class="practice__head">
    <p class="label">05 · El centro de la semana</p>
    <h2 id="practice-title">Practica aquí</h2>
    <span class="practice__count">1 de 3 aprobados</span>
  </header>
  <div class="ex-tabs" role="tablist">…</div>
  <div class="practice__body" role="tabpanel">
    <p class="ex-prompt">…</p>
    <div class="editor">…</div>
    <div class="ex-actions">…</div>
    <div class="results" aria-live="polite">…</div>
  </div>
</section>
```
- Contenedor: `margin: 20px 0 8px; border 1.5px --accent; radius 12; bg --surface; overflow hidden`. Es la única sección con borde de acento permanente.
- Head: `padding 24px 28px 0`; flex space-between align end. h2 `700 32px/1.1 display; ls -0.02em; margin-top 6`. Contador `500 14px mono --ink-2`.
- **Tabs de ejercicio** `.ex-tab`: contenedor `padding 18px 28px 0; gap 4; border-bottom 1px --line`. Tab `padding 10px 14px; 15px; gap 8`. Aprobado: ✓ `--ok` + texto `--ink-2`. Actual: `700`, `border-bottom 2px --accent; margin-bottom -1px`, punto `--accent`. Pendiente: punto borde `--ink-2`, `--ink-2`. Flechas ←/→ mueven entre tabs (patrón ARIA tabs).
- Body: `padding 22px 28px 28px`; flex column gap 16.
- Prompt: `17px/1.55`, `text-wrap: pretty`, markdown mínimo.
- Acciones: flex gap 10. "Comprobar ⌘↵" primario · "Ejecutar" secundario · "Volver al inicio" ghost con `margin-left: auto` (pide confirmación inline: "¿Borrar tu código? Sí / No").

### 5.3 Editor `.editor` (1b, 1e, 1g)
```html
<div class="editor" style="--rows:7">
  <div class="editor__bar"><span class="editor__file">mayor.py</span><span>· modificado</span><span class="editor__runtime">Python 3 · Skulpt</span></div>
  <div class="editor__body">
    <ol class="editor__gutter" aria-hidden="true"><li>1</li>…</ol>
    <pre class="editor__hl" aria-hidden="true"><code>…spans…</code></pre>
    <textarea class="editor__input" spellcheck="false" autocapitalize="off" aria-label="Código Python"></textarea>
  </div>
  <div class="editor__resize" role="separator" aria-orientation="horizontal" aria-label="Ajustar alto" tabindex="0"></div>
</div>
```
- Caja: `border 1px --line; radius 10; overflow hidden`.
- Barra: `padding 8px 14px; gap 12; border-bottom 1px --line; bg --surface-2; 500 13px mono --ink-2`; nombre en `--ink`; "Python 3 · Skulpt" `margin-left: auto`. "· modificado" solo si código ≠ `starter`. Nombre de archivo = `practice[i].name` en snake_case + `.py`.
- Cuerpo: `padding 12px 0; font: 400 15px/24px mono`. Fondo: gutter `--surface-2` (48px) + código `--bg` → `background: linear-gradient(to right, var(--surface-2) var(--gutter-w), var(--bg) var(--gutter-w))`.
  - Gutter: números a la derecha, `padding-right 14px; --ink-3`; línea activa → número `--ink`.
  - Código: `padding-left 18px; white-space: pre; tab-size: 4`.
  - Técnica: `<pre>` resaltado debajo + `<textarea>` transparente encima (`color: transparent; caret-color: var(--ink); background: transparent`), misma fuente/padding/line-height; sincronizar scroll. Re-resaltar en `input` (requestAnimationFrame).
  - Línea activa: `bg --accent-soft` a todo el ancho (gutter incluido).
  - Teclas: Tab = 4 espacios, Shift+Tab des-indenta, Enter conserva sangría (+4 tras `:`), ⌘/Ctrl+Enter = Comprobar, Esc saca el foco del textarea (para no atrapar el teclado).
- **Resaltado** (tokenizer regex, en este orden): comentario `#…` `--com` · string `"…"`/`'…'`/f-strings `--str` · número `--num` · keywords (`False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case`) `--kw` · builtins/llamada `nombre(` `--fn` · resto `--ink`.
- **Alto ajustable**: tirador `height 14px; border-top 1px --line; bg --surface-2; cursor ns-resize`, barra centrada 36×3 radius 2 `--ink-3`. Arrastre con pointer events en saltos de 24px; teclado ↑/↓. Mín. 6 filas, máx. 30. Guardar `editorHeight`. Por defecto: `max(6, líneas del starter + 2)`.
- Móvil: `14px/22px`, gutter 34px, `padding-right 9 / padding-left 10`, sin barra de archivo, sin tirador (alto = contenido, máx. 14 filas).

### 5.4 Resultados `.results` (1b, 1e, 1g fila 4)
Tests: `tests[{stdin[] | code, expect}]`. Un test pasa si la salida (trim final) **termina con** `expect`.

- Caja: `border 1px --line; radius 10; overflow hidden`.
- Cabecera: `padding 12px 16px; gap 12; border-bottom 1px --line`: "2 de 3 casos" `700 16px` + segmentos 28×6 por caso (gap 3) + nota `14px --ink-2` "Un test pasa si la salida termina con lo esperado" (`margin-left:auto`; ocultar < 640).
- **Caso aprobado** (plegado): grid `24px 80px 1fr; gap 12; padding 10px 16px; border-bottom 1px --line; 15px`. ✓ `700 --ok` · "Caso n" `--ink-2` · `mono 14px --ink-2` "entrada 25 → mayor".
- **Caso fallido** (expandido, solo el primero; los demás plegados con ✗): `padding 12px 16px 16px; bg --bad-soft`. Fila igual con ✗ `--bad`, "Caso 3" 700, entrada como chip `bg --surface-2; padding 1px 6px; radius 4`.
  - **Diff**: grid 2 columnas, gap 10, `margin: 12px 0 0 36px; font 400 15px/1.5 mono`. Cada panel `border 1px --line; radius 6; bg --bg`; cabecera `500 12px mono --ink-2; padding 6px 10px; border-bottom 1px --line` "ESPERADO" / "OBTENIDO" (este con borde `--bad` y título `--bad`); contenido `padding 8px 10px`.
  - Mostrar en "Esperado" las últimas líneas de la salida real con `expect` en lugar del final, para comparar en contexto.
  - Marcado: calcular prefijo y sufijo comunes por carácter entre `expect` y el final de la salida; el tramo distinto se envuelve en `<mark>`: en esperado `bg --ok-soft; color --ok; radius 3; padding 0 2px`; en obtenido `bg --bad-soft; color --bad; text-decoration: underline wavy; text-underline-offset: 4px`. Espacios/saltos finales se muestran como `·` / `↵` en `--ink-3`.
  - Móvil: grid `76px 1fr` con filas "esperado / obtenido" en vez de dos paneles.
- **Aprobado (todos)**: caja `border 1px --ok`; franja `padding 14px 16px; bg --ok-soft; gap 10`: círculo 26 `--ok` con ✓ `--on-ok`, "Aprobado · 3 de 3" 700 + "Guardado en tu progreso" `14px --ink-2`. Debajo `padding 12px 16px`: "Siguiente: 3 · Semáforo" `14px --ink-2` + "Ir →" `700 14px --accent`. Dispara toast (§8).
- **Error de ejecución**: caja `border 1px --bad`. Arriba, fragmento del editor (línea anterior, línea del error, posterior). Línea del error: `bg --bad-soft; box-shadow: var(--shadow-error-line)`; número `--bad 700`; si hay columna/nombre (NameError: extraer `'nombre'`), subrayado `wavy --bad` en ese token. Pie `padding 10px 14px; border-top 1px --line; 14px mono`: tipo `--bad 700` ("NameError") + "· línea 3"; mensaje en `14px body --ink-2`. **Además** la misma línea queda marcada en el editor principal hasta el siguiente cambio de esa línea. Línea: `err.traceback[0].lineno` de Skulpt.
- "Ejecutar" muestra solo la salida (bloque `mono 14px`, `bg --bg`, `border 1px --line`, radius 8, `padding 10px 14px`) pidiendo `input()` con `prompt()` o con un campo inline; no evalúa tests.

### 5.5 Problem set `.pset` (1b, 1g fila 5)
- Sección normal (§5.1) con contador "1/5 resueltos" `500 14px mono --ink-2`.
- Item `.pset-item`: grid `28px 1fr auto; gap 12; padding 12px 0; border-top 1px --line; align start`.
  - Checkbox nativo estilizado 20×20, `radius 5; border 1.5px --ink-2; margin-top 2`. Marcado: `bg --ok; ✓ 700 14px --on-ok`. `<label>` asociado al nombre.
  - Nombre: enlace a `url`, `700 15px mono --accent` + "↗" (target _blank, rel noopener). Resuelto: `500 --ink-2; line-through`.
  - `task`: `15px --ink-2; margin-top 2`.
  - Toggle derecho "Pistas (n)" `14px --ink-2` → `<button aria-expanded>`; abierto "Pistas ▴" `--ink`.
  - **Pistas progresivas**: caja `margin-top 10; padding 10px 14px; bg --surface-2; radius 6; 15px/1.5; gap 6`. Se muestra la pista 1; las siguientes como botón "Mostrar pista n" subrayado `--ink-2`. Número `500 12px mono --ink-2 margin-right 8`. Guardar cuántas abiertas.
- Al final, `submit` como enlace normal.

## 6. Pantalla 1e — Semana (móvil)
- Header `padding 18px 16px 12px; gap 10`: fila "← W1 ▾" (`500 13px mono --ink-2`, abre selector de semana nativo `<select>`) + botón "Foco"; h1 `700 26px/1 display`; segmentos alto 5.
- **Barra de secciones sticky** `.section-bar`: `position: sticky; top: 0; z-index: 10; bg --bg; padding 8px 16px; gap 6; border-top/bottom 1px --line; overflow-x: auto; scroll-snap-type: x mandatory`; ocultar scrollbar. Chip `500 14px mono; padding 8px 10px; radius 6; min-height 44px`: hecho "✓01" `--ok`; actual "05 Práctica" `bg --accent-soft; --accent 700`; pendiente `--ink-2`. El chip actual se centra con `scrollLeft` al cambiar.
- Contenido `padding 16px; gap 12`. Práctica sin caja de acento (la pantalla entera es la práctica): título `700 22px`, contador `13px mono`.
- **Barra de acciones fija** (solo mientras la sección 05 está visible): `position: sticky; bottom: 0; grid 1fr auto; gap 8; padding 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top 1px --line; bg --surface`. Comprobar (primario) + Ejecutar. "Volver al inicio" pasa a menú "⋯" o debajo del editor.

---

## 7. Modo foco — 1c (desktop) y 1f (móvil)

Entrar: botón "Modo foco" / tecla **F** (fuera de inputs). Salir: "Salir del foco" / **Esc** (si el foco no está en el editor). Estado en `<html data-mode="focus">`; persistir en `last`.

- Oculta header, pestañas e índice. Un solo **paso** visible.
- Pasos: 01, 02, 03, 04 = 1 paso cada uno · 05 Quiz = 1 paso por pregunta · 06 Practica = 1 paso por ejercicio · 07 Problem set = 1 paso (lista completa) · 08 = 1 paso. La barra superior muestra un segmento por sección visible (8); el sub-progreso va en la etiqueta ("PREGUNTA 2 DE 5") y en los puntos del pie.
- **Desktop 1c**: alto viewport, flex column.
  - Header: grid `1fr auto 1fr; height 60; padding 0 32px`. Izq: "Salir del foco `Esc`" `.btn--small 15px`. Centro: segmentos 28×4 (actual 44×4), gap 6. Der: `500 13px mono --ink-2` "W1 · 04 de 07".
  - Contenido: `flex 1; padding 48px 32px 0`; columna `max-width: 680px` centrada, gap 22.
  - Footer: `padding 24px 32px 36px`, misma columna 680: "← Anterior" (ghost, `--ink-2`) · puntos 8×8 del sub-paso (hecho `--ok`, pendiente borde `--ink-2`) · "Siguiente →" primario `700 17px; padding 13px 26px`.
- **Móvil 1f**: header `padding 20px 16px 8px` "✕ Salir" + `500 13px mono` "04/07 · 3 de 5"; segmentos alto 4 gap 4 `padding 8px 16px`; contenido `padding 24px 16px; gap 16`; pregunta `700 23px/1.25`; botón "Siguiente →" ancho completo `padding 15px; 700 17px`, fijo abajo.
- **Siguiente**:
  - Siempre activo (no bloquea): en quiz sin responder, el primer clic muestra "Responde o pulsa otra vez para saltar" `14px --ink-2` encima del botón.
  - En 01/02/03/08, avanzar marca la sección como hecha. En 04 Shorts no: solo los checkboxes cuentan.
  - Al pasar de paso: foco al título del nuevo paso; scroll a top; transición `opacity` + `translateY(8px→0)` en `--dur-base` (nada con reduced-motion).
  - Teclas: → / ← (fuera del editor), 1–4 para opciones de quiz.
- Anterior desactivado en el primer paso (`aria-disabled`, `--ink-3`).

## 8. Pregunta de quiz `.quiz-q` (1c, 1f, 1g fila 3)
```html
<fieldset class="quiz-q">
  <legend class="quiz-q__text">¿Qué escribes…?</legend>
  <button class="quiz-opt" data-state="idle"><span class="quiz-opt__key">A</span><span class="quiz-opt__text">else if</span><span class="quiz-opt__flag"></span></button>
  …
  <p class="quiz-why" hidden><strong>Por qué:</strong> …</p>
</fieldset>
```
- Pregunta: en vista semana `700 22px/1.25 display`; en foco `30px` (desktop) / `23px` (móvil); `text-wrap: pretty`; código inline a 0.87em.
- Opciones: flex column gap 8. Opción: grid `32px 1fr auto; padding 14px 16px; border 1px --line; radius 8; bg --surface; color --ink-2`. Letra `500 13px mono`. Texto: `mono 17px` si la opción es código (detectar: sin espacios o con backticks), si no `body 17px`.
- Estados:
  - idle `--ink` · hover `border-color --ink-2; bg --surface-2` · foco `outline 2px --accent offset 2`.
  - correcta (elegida o revelada) `border 2px --ok; bg --ok-soft`; letra `700 --ok`; flag "✓ Correcta" `700 15px --ok`.
  - incorrecta elegida `border 2px --bad; bg --bad-soft`; flag "✗ Tu respuesta" `--bad`. La correcta se revela en verde a la vez.
  - resto tras responder: `--ink-2`, sin hover; todas `disabled`.
- Explicación `why`: `padding 14px 18px; border-left 3px (--ok si acertó, --bad si no); 17px/1.55`. Aparece inmediatamente, `aria-live="polite"`.
- No hay reintento por pregunta; "repetir" en la fila plegada reinicia todo el quiz.

## 9. Celebración ligera (1b con `showToast`, 1g fila 6)

**Toast de ejercicio aprobado `.toast`**
- Dónde: desktop `position: fixed; right: 32px; bottom: 32px; min-width: 300px`. Móvil: `left/right 16px; bottom: 16px` + alto de la barra de acciones.
- Aspecto: flex gap 14, `padding 14px 18px; border 1px --ok; radius 10; bg --surface`. Círculo 28 `--ok` con ✓ `--on-ok 700`. Título "Ejercicio aprobado" `700 16px`; sub "Par o impar · 2 de 3 en la semana" `14px --ink-2`. Acción "Siguiente" `14px --accent underline` (va al siguiente ejercicio). Barra de tiempo `position absolute; bottom 0; left 0; height 2px; bg --ok` que se encoge de 100% a 0.
- Duración **4 s** (`--dur-toast`); pausa con hover o foco dentro; cierre con Esc. Entrada `opacity 0→1 + translateY(8px→0)` en 160ms; salida 120ms. Uno a la vez (el nuevo reemplaza). `role="status"`. No mueve el foco. Sin sonido ni confeti.
- Además el segmento del caso/ejercicio pasa a `--ok` y el tab del ejercicio muestra ✓.

**Banner de semana completa `.week-complete`**
- Dónde: sustituye a la cabecera de la semana (debajo del h1) y se muestra también en la tarjeta de la semana en Inicio. Persiste (no es temporal) hasta abrir la siguiente semana.
- `padding 18px 20px; border 1.5px --ok; radius 10; bg --ok-soft`. Título `700 22px display` "Semana 1 completa" + `500 13px mono --ok` "8/8". Segmentos alto 6 en `--ok` con `margin 12px 0`. Pie `15px`: ritmo `--ink-2` ("Vas 2 días por delante del ritmo.") + "Abrir W2 →" `700 --accent`.
- Animación única al completarse: los segmentos se llenan uno a uno (stagger 60ms, 160ms cada uno). Con reduced-motion aparecen llenos.

---

## 10. Pantalla 1g — Hoja de componentes
Referencia de estados de §2, §5.1, §8, §5.4, §5.5 y §9. Layout de la hoja: `padding 40px; gap 40px`; cada fila grid `200px 1fr; gap 24`; título `700 18px display` + descripción `14px --ink-2`; columnas de estados `repeat(3, minmax(0,1fr)); gap 16`; pie de cada estado `13px --ink-2`.

## 11. Pantalla 1h — Tokens
Ver `tokens.css`. Escala tipográfica de referencia:
- Títulos Bricolage Grotesque 700: h1 44/1.05 −2.5% · h2 32/1.1 −2% · h3 22 · cifra 52/1 −3%.
- Texto Atkinson Hyperlegible: cuerpo 17/1.55 · UI 15 · meta 13–14 · línea máx. 70ch.
- Código JetBrains Mono: editor 15/24 (móvil 14/22) · inline 0.9em · etiquetas 12–13 (500).

## 12. Accesibilidad (checklist)
- Contraste: `--ink-2` sobre `--bg`/`--surface` ≥ 4.5:1 en ambos temas. `--ink-3` solo para números de línea y "sin cargar" (va acompañado de texto).
- Estado nunca solo por color: ✓/✗, texto "Hecho", `aria-label` en puntos.
- `aria-live="polite"` en resultados, explicación de quiz y toast.
- Atajos (F, Esc, ←/→, 1–4, ⌘↵) desactivados mientras el foco está en el textarea, salvo ⌘↵ y Esc.
- Orden de tab: header → pestañas → índice → contenido. Enlace "Saltar al contenido" al inicio.
- Probar a 360/400px, zoom 200% y modo oscuro.

## 13. Archivos
- `tokens.css` — variables.
- `pantallas/1a-inicio-desktop.html`, `1b-semana-desktop-oscuro.html`, `1c-foco-desktop.html`, `1d-inicio-movil.html`, `1e-semana-movil-oscuro.html`, `1f-foco-movil.html`, `1g-componentes.html`, `1h-tokens.html` — turno 1 (numeración de 7 secciones; ver Cambios v1.1).
- `pantallas/2a-semana-flujo-shorts-desktop.html`, `2b-shorts-movil-oscuro.html`, `2c-estados-flujo-shorts.html`, `2d-inicio-antes-de-empezar-desktop.html`, `2e-antes-de-empezar-movil.html`, `2f-ciclo-checklist.html`, `2g-extras-consola-fin-copiar.html` — turno 2 (8 secciones).
- Todo es export estático del lienzo (estilos inline, referencia visual; no es el código final).

---

## 14. Flujo CS50 `.cs50-flow` (2a, 2b, 2c)
```html
<nav class="cs50-flow" aria-label="Flujo de la semana">
  <a class="cs50-flow__step" href="#s-summary" data-state="done">✓ Clase</a>
  <span class="cs50-flow__sep" aria-hidden="true">→</span>
  <a class="cs50-flow__step" href="#s-shorts" data-state="current" aria-current="step">Shorts 2/4</a>
  <span class="cs50-flow__sep" aria-hidden="true">→</span>
  <a class="cs50-flow__step" href="#s-pset" data-state="pending">Problem set</a>
</nav>
```
- Va en la cabecera de semana, debajo del h1 (`gap 14px` con el bloque de título). Desktop y móvil.
- Contenedor flex, `gap 8px` (6 en móvil), `font: 500 13px mono` (12 en móvil). Separador "→" `--ink-3`.
- Paso: `padding 5px 11px` (5px 9px móvil); `border-radius: var(--radius-pill)`; altura táctil en móvil vía `min-height: 44px` en el `<a>` con `display:inline-flex; align-items:center` y padding vertical transparente.
  - done: `border 1px --line; color --ok`; texto "✓ Clase".
  - current: `border 1px --accent; bg --accent-soft; color --accent; 700`; con contador ("Clase 1/3", "Shorts 2/4", "Problem set 1/5").
  - pending: `border: var(--border-dashed); color --ink-2`.
  - todo hecho: un único chip `border 1px --ok; bg --ok-soft; --ok` "✓ Clase → ✓ Shorts → ✓ Problem set".
- Reglas: Clase = secciones 01–03 (contador = cuántas de las 3 hechas) · Shorts = 04 · Problem set = 07. Paso actual = el primero no hecho. Quiz, Practica y Proyecto no aparecen (son de la app, no del flujo oficial).
- Sin `shorts[]`: el paso Shorts y su flecha no se pintan.
- Móvil: "Problem set" se abrevia "Pset".
- Clic: igual que el índice (scroll + foco al h2).

## 15. Sección Shorts `#s-shorts` (2a, 2b, 2c)
```html
<section id="s-shorts" class="section-card" data-state="current">
  <header class="section-card__head">
    <span class="section-card__num">04 · Ahora</span><h2>Shorts</h2>
    <div class="segments" aria-hidden="true">…</div><span class="section-card__count">2/4 vistos</span>
  </header>
  <p class="section-card__lead">Videos cortos de un solo tema. Míralos después de la clase y antes del problem set.</p>
  <ul class="shorts">
    <li class="short" data-seen="true">
      <input type="checkbox" id="short-1-0" checked><label for="short-1-0" class="visually-hidden">Visto</label>
      <a class="short__title" href="{url}" target="_blank" rel="noopener">Conditionals ↗</a>
    </li>
    <li class="short" data-confirmed="false">
      …<span class="chip chip--unconfirmed">sin confirmar</span>
      <p class="short__note">No sé si este short es oficialmente de W1. Cuenta para el avance solo si lo marcas.</p>
    </li>
  </ul>
</section>
```
- Tarjeta = §5.1 (pending / current / done). Cabecera: segmentos de 22×6 (uno por short, gap 3) + contador `500 14px mono --ink-2` "2/4 vistos" (`gap 10`).
- Lead `15px --ink-2; margin-top 8`.
- Lista `margin-top 14`. Fila `.short`: grid `28px minmax(0,1fr) auto; gap 12; padding 12px 0; border-top 1px --line; align center` (`start` si hay nota).
  - Checkbox 20×20 igual que pset (§5.5). Visto: `bg --ok` ✓.
  - Título: enlace `16px`. Sin ver: `700 --accent` + "↗". Visto: `400 --ink-2; line-through`.
  - Columna `auto` reservada para `min` (hoy vacía).
- **Sin confirmar** (`confirmed: false`): chip `500 12px mono --ink-2; padding 2px 7px; border: var(--border-unconfirmed); radius pill`, junto al título (`gap 10`, flex-wrap). Nota `14px/1.45 --ink-2; margin-top 4`. Texto fijo en `app.js`.
- Estados de la sección:
  - **sin ver** (0/n): tarjeta pending, todos los segmentos `--line`.
  - **parcial**: tarjeta current (`border 1.5px --accent`, "04 · AHORA").
  - **completo**: fila plegada "04 Shorts · 4 vistos — ✓ Hecho · abrir".
- Marcar es instantáneo (sin toast). Al completar la sección: el paso Shorts del flujo pasa a done y el índice muestra ✓.
- **Móvil (2b)**: sin caja; título `700 22px` + contador `500 13px mono`. Fila: grid `32px minmax(0,1fr) auto; gap 8; min-height 52px`; toda la fila es `<label>` (tap ≥ 44px) salvo el enlace. Checkbox 22×22. Nota sin confirmar: chip + "Puede no ser de W1." en una línea. Barra fija inferior con botón secundario "Ir al quiz →" (ancho completo, `padding 14px`).
- Índice lateral y chips móviles: item "04 Shorts" con contador `2/4`.

## 16. Consejos de David `.tips` (2a, 2c)
```html
<aside class="tips" aria-labelledby="tips-t">
  <div class="tips__label"><p id="tips-t">Consejos de David</p><p>dichos en la clase</p></div>
  <ol class="tips__list"><li><span class="tips__key">a</span><span class="tips__text">Legibilidad antes que una sola línea…</span></li></ol>
</aside>
```
- Dentro de 01 En corto, después de la lista `summary`. `margin-top 22px; padding-top 18px; border-top: var(--border-dashed)`.
- Desktop: grid `150px minmax(0,1fr); gap 20`. Etiqueta: label mono `12px --ink-2; ls 0.05em` "CONSEJOS DE DAVID" + `13px --ink-2` "dichos en la clase" (`margin-top 4`).
- Lista sin viñetas, `gap 12`. Item grid `22px 1fr; gap 6`. Índice a/b/c/d `500 13px/26px mono --ink-3`. Texto `500 18px/1.4 var(--font-display)`, `text-wrap: pretty`, `--ink`. Código inline `500 16px mono` (sin fondo).
- Lo que lo distingue del resumen: fuente display en vez de body, índice en letras, línea discontinua. Sin color, fondo ni borde lateral.
- Máximo 4 (`tips.slice(0,4)`). Vacío o ausente → no se pinta.
- < 640px: una columna (etiqueta encima, `gap 10`); texto 17px.
- Markdown mínimo igual que el resto.

## 17. Enlaces de clase (2a, 2b)
- Índice lateral: bloque bajo la nav, `padding-top 16; border-top 1px --line; gap 8`. Label mono 12 "CLASE {n}" + enlaces `15px --accent`: "Notas de la clase ↗" (`notesUrl`), "Video ↗" (`videoUrl`), "Transcript ↗" (`transcriptUrl`). Cada uno se omite si falta su URL. `target="_blank" rel="noopener"`.
- El botón "Modo foco" pasa encima de este bloque (o al header de semana); en 2a se omitió por espacio.
- Móvil: fila bajo el flujo, `gap 16; 14px`: "Notas ↗ · Video ↗ · Transcript ↗".

## 18. Antes de empezar `.setup` (2d, 2e, 2f)
Pasos fijos en `app.js` (no vienen del JSON):
1. Llenar el formulario — "Registro en el curso con tu nombre y correo." → enlace al formulario.
2. Autorizar GitHub — "Permite que submit50 envíe tus problemas." → enlace a la autorización.
3. Entrar a cs50.dev — "Abre tu VS Code en la nube con tu cuenta de GitHub." → `https://cs50.dev`.
4. Ejecutar update50 — "En la terminal de cs50.dev:" + comando copiable `update50`.
(Las URLs exactas de 1 y 2 salen de las instrucciones de W0; hoy viven al final del pset de W0. Moverlas a una constante `SETUP_STEPS`.)

```html
<section class="setup" aria-labelledby="setup-t">
  <header class="setup__head"><p class="label">Antes de empezar · una sola vez</p><h2 id="setup-t">Prepara tu cuenta de CS50</h2>
    <div class="segments">…</div><span>2 de 4 · ≈ 10 min</span></header>
  <ol class="setup__steps">
    <li class="setup-step" data-state="done|current|pending">
      <input type="checkbox" id="setup-0"><label for="setup-0">Paso 1</label>
      <h3>Llenar el formulario</h3><p>…</p><a class="btn--primary">Abrir formulario ↗</a>
    </li>
  </ol>
</section>
```
- **Dónde**: primer bloque de Inicio, encima de todo, mientras `setup` tenga algún `false` y `!setupHidden`.
- Caja: `border 1.5px --accent; radius 12; bg --surface; overflow hidden`.
- Head: `padding 24px 28px 18px`; flex space-between align end. Label `13px mono --accent`; h2 `700 30px/1.1 display; ls -0.02em; margin-top 6`. Derecha: 4 segmentos 28×6 + `500 14px mono --ink-2`.
- Pasos desktop: `ol` grid `repeat(4, minmax(0,1fr)); border-top 1px --line`; cada `li` `padding 20px 22px; gap 10; border-right 1px --line` (no el último).
  - Cabecera: checkbox 22×22 radius 5 + label `500 12px mono --ink-2` "PASO n".
  - Título `700 17px`; descripción `15px/1.45 --ink-2`.
  - done: check `--ok`, título `--ink-2` tachado, sin botón.
  - current (primer pendiente): `bg --accent-soft`; checkbox `border 1.5px --accent; bg --surface`; label "PASO n · AHORA" `--accent`; botón primario `700 15px; padding 9px 14px; radius 8` con el enlace externo.
  - pending: checkbox `border 1.5px --ink-2`; enlace como texto `--accent` (no botón).
  - Paso 4: caja de comando `padding 6px 6px 6px 12px; border 1px --line; radius 6; bg --bg; 500 14px mono`, prompt "$ " `--ink-3`, botón "Copiar" (§21) a la derecha.
- Marcar es manual (la app no puede verificar). Abrir el enlace **no** marca el paso.
- Mientras está incompleto, "Continuar" baja a secundario: caja `border 1px --line; radius 10; padding 22px 28px`, label "DESPUÉS" + `700 24px display` "W0 · Funciones y variables" + botón secundario "Empezar W0 →". La cuenta atrás se compacta (cifra 40px, una fila).
- **4/4**: la caja se sustituye por la fila "Preparación lista" (`padding 14px 18px; border 1.5px --ok; radius 10; bg --ok-soft`; círculo ✓ 26; sub "Ya puedes enviar problemas con submit50."; "ocultar" subrayado `--ink-2`). Se mantiene esa sesión. Con "ocultar" o en la siguiente carga → `setupHidden = true` y desaparece de Inicio.
- Después vive en W0 → 07 Problem set como fila plegada "Preparación · 4/4 ✓ · abrir" (desde ahí se puede desmarcar; si se desmarca, `setupHidden = false` y vuelve a Inicio).
- **Móvil (2e)**: `padding 18`; h2 `700 22px` + "2/4" a la derecha. Pasos en lista vertical: done/pending como `<label>` grid `34px 1fr; min-height 52px; padding 0 18px; border-top 1px --line`. El paso current se expande (`padding 14px 18px 16px; bg --accent-soft`) con descripción y botón (`padding 11px 14px`). Para cs50.dev se añade: "Mejor en la laptop: el editor en la nube no es cómodo en el celular."

## 19. Consola de Ejecutar `.console` (2g)
Reemplaza el campo de texto con "|".
```html
<div class="console" aria-label="Consola">
  <div class="console__bar"><span>Consola</span><span class="console__status" data-state="waiting">esperando entrada</span><button>Detener</button></div>
  <div class="console__out" role="log" aria-live="polite">
    <div class="console__meta">$ python mayor.py</div>
    <div class="console__line">Edad: <input class="console__input" aria-label="Entrada para input()" autofocus></div>
  </div>
  <div class="console__presets">Usar entrada de: <button>caso 1 · 25</button>…</div>
</div>
```
- Aparece bajo las acciones al pulsar "Ejecutar" (sustituye al panel de resultados mientras está abierta; "Comprobar" vuelve a los resultados).
- Caja: `border 1px --line; radius 10; overflow hidden`. Barra = barra del editor (§5.3): `padding 8px 14px; bg --surface-2; 500 13px mono --ink-2`; "Consola" `--ink`; estado con punto 7×7.
  - running/waiting: punto + texto `--accent` "esperando entrada"; botón "Detener" a la derecha.
  - done: "terminó · 0,03 s" `--ink-2`; acciones "Ejecutar de nuevo" (`--accent` subrayado) y "Limpiar".
  - error: estado "error · línea 3" `--bad`; traceback en `--bad`; la línea se marca en el editor (§5.4).
- Salida: `padding 12px 14px 14px; bg --bg; font 400 15px/24px mono; min-height 120px; max-height 320px; overflow-y auto` (autoscroll al final).
  - Meta (`$ python {archivo}`, `— fin (código 0) —`): `--console-meta`.
  - Salida del programa: `--ink`.
  - Texto introducido (ya enviado): `--console-input; 500`.
- **input()**: Skulpt `inputfun` devuelve una Promise; se pinta el prompt del código (`"Edad: "`) seguido de un `<input>` en línea: `min-width 120px; height 26px; padding 0 6px; border 0; border-bottom 2px solid --console-input; bg --console-input-bg; color --console-input; font heredado`. Foco automático. Enter envía; a la derecha, pista `500 12px mono --ink-2` "↵ enviar". Cada `input()` crea su propia línea.
- **Presets**: fila `padding 10px 14px; border-top 1px --line; gap 6; 14px`: "Usar entrada de:" + un chip por test con `stdin` (`500 13px mono; padding 4px 9px; radius pill; border 1px --line; bg --surface`), etiqueta "caso n · {stdin.join(', ')}" truncada a 24 car. Chip de un caso fallido: `border --bad; bg --bad-soft; --bad`. Clic → reinicia y rellena cada `input()` en orden (se ven escritos en azul, sin pausa).
- Tests con `code` en vez de `stdin` no generan chip.
- Pie informativo (solo primera vez): "Lo que escribiste va en azul; lo que imprime tu programa, en tinta." `14px --ink-2`.
- Móvil: misma consola, `font 14px/22px`; el `<input>` usa `inputmode="text"` y `enterkeyhint="send"`; presets en scroll horizontal.

## 20. Fin de semana (2g)
Después de 08 Proyecto, siempre.
- **Incompleta** `.week-end--pending`: `border: var(--border-dashed); radius 10; padding 20px 22px`. Título `700 20px display` "Te faltan N secciones". Chips enlace a cada sección pendiente (`500 14px mono; padding 6px 10px; radius 6; border 1px --line; --ink`; la primera pendiente con `border --accent; --accent`), texto "06 Practica · 1/3". Pie `14px --ink-2`: "Puedes abrir W2 igual: ir a W2" (subrayado).
- **Completa** `.week-end--done`: `border 1.5px --ok; radius 10; padding 20px 22px; bg --ok-soft`; flex space-between. Izq: `500 13px mono --ok` "W1 · 8/8 ✓" + `700 22px/1.15 display` "Siguiente: {title}". Der: primario "Siguiente semana →" (`padding 12px 20px`). Si la siguiente no está cargada: botón deshabilitado + "W2 aún no está cargada" `14px --ink-2`. W9 completa: "Curso terminado" y sin botón.
- Convive con el banner de semana completa de §9 (ese va arriba; este, abajo).
- **Pie anterior/siguiente** `.week-pager`: `nav` grid `1fr 1fr; border-top/bottom 1px --line; margin-top 32px`. Enlace `padding 18px 4px; gap 4; flex column`: label `500 12px mono --ink-2` "← ANTERIOR · W0" / "SIGUIENTE · W2 →" + título `700 18px display --ink`. Derecho con `text-align right; border-left 1px --line`. Hover: título `--accent`. W0 sin anterior / W9 sin siguiente → celda vacía. Semana sin cargar: textos `--ink-3`, "sin cargar", `aria-disabled`. Teclas `[` y `]` (fuera de inputs). Móvil: se mantiene en 2 columnas, título 16px.

## 21. Botón Copiar (2g, 2d)
- Bloque de código estático (03 `examples[]`): barra `padding 6px 6px 6px 14px; border-bottom 1px --line; bg --surface-2; 500 13px mono --ink-2` con `label` del ejemplo a la izquierda y botón a la derecha. Cuerpo `padding 12px 16px; bg --bg; 400 15px/24px mono; white-space pre; overflow-x auto`; resaltado igual que el editor, **sin** números de línea.
- Botón `.btn-copy`: `700 13px body; padding 6px 10px; border 1px --line; radius 6; bg --surface; --ink`. Siempre visible (también en móvil). Hover `bg --surface-2`; foco outline estándar.
- Clic → `navigator.clipboard.writeText(code)`; estado "✓ Copiado" `border --ok; bg --ok-soft; --ok` durante **2 s** y vuelve. Anunciar con región `aria-live="polite"` oculta. Si falla el portapapeles: seleccionar el texto del bloque y mostrar "Selecciona y copia" `--ink-2`.
- Junto a "Copiado" aparece "Probar en el editor" (secundario, mismo tamaño): pega el código en el editor del ejercicio activo de 06 Practica **solo si** el editor está igual al `starter`; si no, pide confirmación inline.
- El comando `update50` de §18 usa el mismo botón.
