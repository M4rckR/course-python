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
index.html        página
styles.css        estilos (colores en :root, modo oscuro automático)
app.js            lógica: semanas, quiz, editor y corrector de Python
data/w0.json …    contenido de cada semana  ← lo que editas
vendor/           Skulpt (Python en el navegador)
tools/check-data.js  valida los JSON antes de subir
```

## Editar contenido

Cada semana es un archivo `data/wN.json`. Campos principales:

| Campo | Qué es |
|---|---|
| `summary` | Lista de puntos clave. Acepta `` `código` `` y `**negrita**` |
| `jsToPy` | Filas `{ js, py, note }` |
| `quiz` | `{ q, options, answer, why }` — `answer` es el índice (empieza en 0) |
| `pset` | Problemas oficiales con `name`, `url`, `task`, `hints` |
| `practice` | Ejercicios del editor: `starter` y `tests` |

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

Tu avance (código, quiz, ejercicios aprobados) se guarda en el navegador. Si cambias de navegador o dispositivo, empieza en cero.
