Reemplacé data/w0.json … data/w9.json con una versión revisada contra los transcripts y las notas oficiales de CS50P. El esquema anterior no cambia: solo hay campos nuevos opcionales. Detalle en CAMBIOS-CONTENIDO.md.

Campos nuevos por semana:
- `transcriptUrl`: string, link al transcript oficial de la clase.
- `tips`: string[], consejos de diseño que da David Malan en esa clase (2–4).
- `shorts`: [{ title, url, confirmed }], videos cortos oficiales de esa semana. `url` apunta a la playlist oficial; `confirmed` indica si la asignación del short a la semana está confirmada (hoy solo los de W0).

Implementa, respetando tokens.css y el diseño actual:

1. Flujo oficial de CS50 visible en la cabecera de cada semana: "Clase → Shorts → Problem set", como pasos pequeños (no un componente nuevo grande).
2. En el índice lateral, junto a "Notas de la clase" y "Video", agrega "Transcript ↗" (usa `transcriptUrl`).
3. Nueva sección "Shorts", entre 03 y 04 (renumera las secciones y el modo foco):
   - Lista de `shorts` con checkbox "visto" por short. Guárdalo en cs50p:v1 → `weeks["1"].shorts: { "0": true }` (handoff v1.1).
   - Cada título enlaza a su `url` (hoy, la playlist oficial: https://www.youtube.com/playlist?list=PLhQjrBD2T381eWtNm274cXo8zxUFX-lyn).
   - Shorts con `confirmed: false`: chip "sin confirmar" y nota junto al título (handoff §15).
   - La sección cuenta como hecha cuando todos los shorts con `confirmed: true` están vistos; los no confirmados no bloquean. Si ninguno está confirmado, se da por hecha al marcar uno o con "Marcar como hecho".
4. Muestra `tips` dentro de "En corto", al final, como el bloque "Consejos de David" del handoff §16 (línea discontinua arriba, índice a/b/c, fuente display). No uses emojis.
5. Actualiza el progreso de la semana y el de Inicio para incluir la sección nueva. No cambies las 4 claves antiguas de localStorage.
6. `npm run check`: agrega la validación de los campos nuevos (opcionales).

Verificación: capturas de W0 y W8 a 1440 claro y 390 oscuro, recorre el modo foco completo de W0 y aprueba un ejercicio. Commit: "contenido fiel a las clases + sección Shorts".
