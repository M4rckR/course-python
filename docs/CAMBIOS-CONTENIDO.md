# Cambios: contenido fiel a las clases de CS50P


# Cambios semana 0 (Functions, Variables)

Fuente: transcript completo `lecture0.txt` (110,867 caracteres, leídos en 2 tramos).

- **summary**: reordenado según la clase: editor/terminal → funciones como verbos y argumentos → side effects vs return values → variables y `=` como asignación → comentarios/pseudocódigo → str, `sep`/`end`, f-strings → métodos (`strip`, `title`, `capitalize`, `split`) → int/float, `round`, `:,` y `:.2f` → `def`, defaults, `main`, scope, `return`.
- **examples**: ahora salen de `hello.py` y `calculator.py` de clase (versión comentada, bug `12`, división `.2f`, `square()` final).
- **traps**: solo bugs que David muestra: paréntesis sin cerrar, `"hello, name"`, concatenar `"1"+"2"`, comillas sin escapar, `capitalize` vs `title`, `NameError` por llamar antes de definir, no llamar `main()`, scope. Saqué "tabs vs espacios" y "check50", que no salen en la clase.
- **jsToPy**: agregué `print(a, b)`/`sep`, `split` con asignación múltiple, `float`, `:,`, `**`/`pow`, y default en `def`. Saqué `replace` y `//` (no se enseñan en la clase 0).
- **quiz**: nuevas preguntas sobre side effect vs return, `sep` por defecto, scope y `capitalize` vs `title`.
- **lectureNotes**: legibilidad vs one-liners, comentarios/pseudocódigo, justificar decisiones de estilo, `main` arriba.
- **shorts**: los 5 confirmados (`shortsConfirmed: true`). Agregué **transcriptUrl** y **sources**.

## Cosas de la clase que antes faltaban
- Funciones como "verbos", argumentos vs parámetros, **side effects** vs **return values**.
- Pseudocódigo y comentarios como hábito.
- `sep`, `end` y caracteres de escape (`\"`).
- `capitalize()`, `split()` y `first, last = ...`.
- `f"{z:,}"`, `round(x, 2)`, y que los int de Python no tienen límite.
- **Scope** (`NameError` al usar `name` fuera de `main`).
- `n ** 2` y `pow(n, 2)` como alternativas a `n * n`.

# Cambios semana 1 (Conditionals)

Fuente: `lecture1.txt` **no se pudo leer** (el CDN la bloquea por robots). Usé `lecture1.srt`, que también se corta en 00:43:51 (74,883 caracteres). La parte final (pythonic `is_even` y `house.py` con `match`) la saqué de las notas oficiales `notes/1`, que siguen la clase paso a paso.

- **summary**: sigue el orden de la clase: compare.py (`if` sueltos → `elif` → `else` → `or` → `!=`/`==`) → `and` y comparación encadenada en grade.py → simplificación a `>=` → `%` en parity.py → bool e `is_even` → pythonic → `match` en house.py. Agregué los diagramas de flujo y la idea de "hacer menos preguntas".
- **examples**: compare.py final, grade.py con menos preguntas, parity.py pythonic, house.py con `match`.
- **traps**: `if x = y` (David lo corrige en vivo), `if` sueltos que preguntan de más, el 95 con varias notas, falta de `:`/indentación, llamar `is_even` antes de definirla. Saqué `"5" == 5` y `x == "a" or "b"`, que no salen en la clase.
- **jsToPy**: agregué `%` y el paso intermedio `True if ... else False`. Saqué `not` (no se usa en clase).
- **quiz**: rehecho sobre compare.py, `!=` vs `or`, la lógica de `elif` en grade.py y el pythonic.
- **lectureNotes**: correctness vs design, menos preguntas, menos líneas, pythonic.
- **shorts**: Conditionals, Boolean Expressions (`shortsConfirmed: false`).

## Cosas de la clase que antes faltaban
- Toda la progresión de `compare.py` (antes no estaba).
- Diagramas de flujo y control flow.
- `!=` como mejor diseño que `x < y or x > y`.
- grade.py simplificado a `score >= 90` / `>= 80` (antes solo estaba la versión con rangos).
- La versión intermedia `if/else` → `True if ... else False` → `return n % 2 == 0`.
- El tip de David: llamar primero una función que todavía no escribiste.

# Cambios semana 2 (Loops)

Fuente: `lecture2.txt` **no se pudo leer** (el CDN la bloquea por robots). Usé `lecture2.srt`, que se corta en 00:45:49 (75,342 caracteres), justo antes de diccionarios. La parte de dicts, `None` y `mario.py` la saqué de las notas oficiales `notes/2`.

- **summary**: orden de la clase: copiar/pegar → `while` con contador → bucle infinito y Ctrl+C → contar desde 0, `+=` → `for` con lista → `range` y `_` → `"meow" * 3` y `end=""` → `while True`/`continue`/`break` → `get_number`/`meow` con `return` → listas e índices → `len` e `i + 1` → dicts → lista de dicts con `None` → mario.py con bucles anidados y abstracción.
- **examples**: cat.py final, hogwarts.py con `range(len())`, lista de dicts (ahora con los 4 estudiantes de clase), mario.py final.
- **traps**: bucle infinito sin decremento (David lo demuestra), off-by-one al cambiar el inicio a 0, `range(students)`, línea en blanco extra con `"meow\n" * 3`, el puesto 0. Saqué el `KeyError` y el `int(input())` con texto, que no se demuestran en la clase.
- **jsToPy**: agregué el índice `lista[0]` y `continue`.
- **quiz**: bucle infinito, `range`, `return` vs `break` en `get_number`, dicts, `end=""`.
- **lectureNotes**: evitar copiar/pegar y pensar en el caso extremo, `_` vs nombres descriptivos, abstracción con funciones, legibilidad.
- **shorts**: While Loops, For Loops, Lists, Dictionaries (`shortsConfirmed: false`).

## Cosas de la clase que antes faltaban
- Diagramas de flujo del `while` y la progresión `i = 3` decrementando → contar hacia arriba → desde 0.
- El bug off-by-one y "sumar en vez de restar".
- `for i in [0, 1, 2]` como paso previo a `range`, y por qué no escala.
- `"meow\n" * 3` con `end=""`.
- `continue` en la primera versión de validación.
- `range(len(students))` con `i + 1`.
- `print_column` / `print_row` y la versión con bucles anidados antes de abstraer.

# Cambios semana 3 (Exceptions)

Fuente: transcript completo `lecture3.txt` (45,961 caracteres, leído entero en una pasada más una verificación del final).

- **summary**: sigue la progresión de clase: excepciones → `SyntaxError` en hello.py → pruebas de number.py con 50/0/-1/cat → `ValueError` → `try/except` → achicar el `try` y el `NameError` → `else` → `while True` + `break` → `get_int()` con `return` → `pass` → `get_int(prompt)`, más `isnumeric()` y `raise`, que se mencionan.
- **examples**: los tres pasos clave de `number.py` (labels con nombre de archivo).
- **traps**: comilla sin cerrar, `NameError` al sacar el print del `try`, bucle infinito sin `break`, `except` genérico (David lo llama "lazy"), `try` muy grande. Saqué `int("3.5")` y "con NameError no uses except", que no salen así en la clase.
- **jsToPy**: agregué `pass`, `isnumeric()` y `raise` (mencionado).
- **quiz**: reemplacé la de sintaxis genérica por la del `NameError` de clase, y agregué una sobre `pass`.
- **lectureNotes**: solo lo riesgoso en el `try`, errores específicos, `break` en `else` o en `try` (justificar), abstraer en función con parámetros.
- **shorts**: Handing Exceptions (`shortsConfirmed: false`).

## Cosas de la clase que antes faltaban
- Probar casos límite (0, negativos, texto) antes de manejar errores.
- La explicación del `NameError`: el error a la derecha del `=` impide la asignación.
- La variante con `break` dentro del `try` (sin `else`).
- La versión intermedia de `get_int()` sin parámetro y con variable `x` + `return x`.
- La pregunta sobre `isnumeric()`: chequear antes vs intentar y atrapar (estilo Python).
- `raise` mencionado para más adelante.

# Cambios semana 4 (Librerías)

- **summary**: reordenado al orden de la clase (reusar código → random → statistics → sys.argv → IndexError → sys.exit/slice → pip/cowsay → requests/JSON → módulo propio). Se agregó el encuadre de David: "copiar y pegar = señal de librería", scope de `import random` vs `from random import choice` ("depende").
- **examples**: ahora son programas de clase con sus nombres: `generate.py`, `name.py` (versión final con `sys.exit` + slice), `itunes.py`, `sayings.py` + `say.py` (con `main()` y la guarda `__name__`, como en clase).
- **traps**: solo errores que David muestra: `IndexError` (y que `[0]` no lo arregla), perder la protección al desindentar sin `sys.exit`, etiqueta de más sin `[1:]`, `main()` corriendo al importar `sayings`, `shuffle` que no retorna.
- Se quitó la trampa de "pip install va en la terminal" (no la muestra como error).
- **jsToPy**: se agregó `sys.exit` y la guarda `__name__`; `pip install cowsay` en vez de requests.
- **quiz**: rehecho sobre escenas de la clase (IndexError, por qué `sys.exit`, scope del import, `json.dumps` para explorar, `main()` al importar).
- Nuevos: `lectureNotes`, `shorts` (random, API Calls, Creating Modules and Packages; `shortsConfirmed: false`), `transcriptUrl`.

## Cosas de la clase que antes faltaban
- El argumento de **scope/colisión de nombres** entre los dos estilos de import.
- `cowsay` (`cow`, `trex`) como el ejemplo de paquete de PyPI.
- La exploración del API con `limit=1` y `json.dumps(indent=2)` antes de pasar a `limit=50`.
- La progresión `try/except IndexError` → `if/elif/else` → `sys.exit`, y el consejo de chequear errores arriba.
- `sayings.py` con su propio `main()` y el bug de importarlo sin guarda.

# Cambios semana 5 (Unit Tests)

- **summary**: ahora sigue la narrativa de la clase: guarda `__name__` → test a mano con `if/print` → bug a propósito `n + n` → `assert` → `try/except AssertionError` (31 líneas) → pytest → separar por categorías → `pytest.raises` → refactor de `hello` (side effects) → carpeta `test/` con `__init__.py`.
- **examples**: se agregó la primera versión a mano de `test_calculator.py` (de clase); el final con pytest; `hello.py` ya refactorizado a `return`; `test/test_hello.py` con el loop Hermione/Harry/Ron.
- **traps**: se agregó el bug `n + n` que pasa con 2 y 0; que en una sola función de test el primer assert fallido corta (por eso separa en funciones).
- **jsToPy**: se agregó la guarda `__name__`; se ajustó `toThrow`.
- **quiz**: nuevas preguntas sobre el bug `n + n`, por qué separar tests, side effects de `hello`.
- Nuevos: `lectureNotes` ("no necesitamos tests para nuestros tests", evitar side effects), `shorts` (pytest), `transcriptUrl`.

## Cosas de la clase que antes faltaban
- La motivación paso a paso (test a mano → assert → try/except → pytest) y que el test acaba más largo que el código.
- El bug deliberado `n + n` y por qué `square(2)` y `square(0)` no lo detectan.
- La salida de pytest: `F` + traceback vs punto verde.
- El término **side effect** y la consigna de evitarlos para que el código sea testeable.
- El loop sobre varios nombres dentro de un test.

# Cambios semana 6 (File I/O)

- **summary**: reordenado al hilo de la clase: memoria vs persistencia → `"w"` (borra) → `"a"` sin `\n` → `with` → leer + `rstrip` + `sorted`/`reverse` → CSV con `split` y desempaquetado → dicts → `key=get_name` → `lambda` → coma en "Number Four, Privet Drive" → `csv.reader` → `DictReader`/`writer`/`DictWriter` → Pillow.
- **examples**: programas de clase con nombre: `names.py` (append y lectura), `students.py` con `get_name` como `key` (antes solo estaba la lambda), `students.py` con `DictReader` y `costumes.py` (antes solo descrito en el summary).
- **traps**: se agregaron los que David demuestra: nombres pegados sin `\n`, ordenar oraciones "por suerte", `key=get_name()` con paréntesis, `ValueError: too many values to unpack`, comillas simples dentro del f-string. Se quitaron los no mostrados en clase ("todo es str, usa float", "sys.exit en los problemas").
- **jsToPy**: se agregaron `"w"`, desempaquetado con `split` y aclaración de `reverse=True`.
- **quiz**: nuevas preguntas con escenas de clase (`"w"` deja solo el último nombre, líneas en blanco, `key` sin paréntesis, el `ValueError`).
- Nuevos: `lectureNotes`, `shorts` (Reading and Writing Files, Reading and Writing CSVs, Pillow), `transcriptUrl`.

## Cosas de la clase que antes faltaban
- La idea inicial de memoria vs almacenamiento persistente.
- La versión con función nombrada `get_name` antes de la `lambda`, y el pasar funciones como argumento.
- El error exacto `too many values to unpack` y la solución con `csv.reader` que entiende comillas.
- `csv.writer` (además de `DictWriter`) y la ventaja del encabezado para no depender del orden de columnas.
- `costumes.py` completo con `sys.argv[1:]` + Pillow.

# Cambios semana 7 (Expresiones regulares)

- **summary**: reordenado según la clase. Arranca con `validate.py` hecho a mano (`in`, `split("@")`, `endswith`), que la versión anterior no tenía. Sigue con search y la máquina de estados finitos, los metacaracteres `* + ? {m,n}`, las anclas, `[^@]` y las clases `\w\d\s`, `|` y los grupos, `format.py` (grupos y walrus) y por último `twitter.py` (`re.sub`, luego `re.search` con `(?:...)`).
- **examples**: ahora tienen los nombres de archivo de la clase (`validate.py`, `format.py`, `twitter.py`). Se agregó el paso intermedio `^[^@]+@[^@]+\.edu$`, que es con el que David rechaza `malan@@@harvard.edu`.
- **traps**: reemplazadas por los errores que David muestra en vivo: `*` acepta `malan@`, `.edu` sin escapar, oraciones que pasan sin `^$`, `\w` demasiado estricto, el grupo extra que movió el usuario a `group(2)` y el `ValueError` de `split(", ")` con `Malan,David`.
- **quiz**: todas las preguntas salen de casos de la clase (`.*` vs `.+`, `[^@]`, `group(1)` en format.py, `(?:www\.)?`, la limitación de `re.sub`).
- **jsToPy**: se agregaron filas para el walrus y `(?:...)`.
- Nuevos campos: `lectureNotes` (armar la regex de a pocos, usar librerías para emails, raw strings y escapes, IGNORECASE), `shorts` (Patterns, Capture Groups), `shortsConfirmed: false`, `transcriptUrl`.

## Cosas de la clase que antes faltaban
- La validación "a mano" previa a regex y por qué escala mal.
- La máquina de estados finitos como modelo de `re.search`.
- `str.removeprefix` y `re.sub` como intentos de limpieza en `twitter.py`, y por qué no validan.
- La mención de `re.split` y `re.findall`.
- El consejo de usar una librería para validar emails (que conecta con el pset Response Validation).

# Cambios semana 8 (Programación orientada a objetos)

- **summary**: reescrito en el orden de la clase. Primero la versión procedural de `student.py` y el `return name, house` (la "white lie" de la tupla), luego la tupla inmutable (caso Padma) → lista → dict, después la clase, `__init__` y `self`, `raise` + `__str__` (y `__repr__`), los métodos propios (`charm`), las properties y su motivo (`"Number Four, Privet Drive"`), la convención `_`, los tipos built-in como clases (`type(...)`), `hat.py` con variable de clase y `@classmethod`, `Student.get()`, la herencia en `wizard.py`, la jerarquía de excepciones y `vault.py`.
- **examples**: 4 programas de la clase: `student.py` final con las dos properties, `hat.py`, `wizard.py` (ahora incluye `Professor`) y `vault.py` (`__add__`, que antes solo se mencionaba).
- **traps**: solo errores mostrados en clase: el `TypeError` de la tupla, las comillas dobles dentro del f-string, `print` sin `__str__`, la asignación que se salta la validación, el choque de nombres property/atributo, `_house` saltándose el setter y el `NameError` por no importar `random`.
- **quiz**: preguntas sobre la white lie, la tupla, el setter en `__init__`, `hat.py` como singleton y `vault.py`.
- **jsToPy**: se agregaron `_x` (privado por convención) y tupla ↔ `Object.freeze`. La fila de static ahora incluye las variables de clase.
- Nuevos campos: `lectureNotes`, `shorts` (Classes, Instance Variables, Instance Methods, Class Methods and Class Variables, Tuples), `shortsConfirmed: false`, `transcriptUrl`.

## Cosas de la clase que antes faltaban
- El recorrido tupla → lista → dict antes de llegar a clases (y por qué la inmutabilidad ayuda).
- `hat.py` (Sorting Hat): variables de clase, `random.choice` y el caso "solo hay un objeto".
- Los tipos built-in son clases (`type(50)`, `list()` == `[]`).
- `Professor` en `wizard.py` y el código completo de `vault.py`.
- La advertencia de que `_` y `__` son solo convenciones.

> Nota: el `.txt` (y el `.srt`) del CDN se cortan a ~128 KB, a mitad de la frase "let's have a class fo". Lo que va después (Student.get, herencia, excepciones, vault) se tomó de las notas oficiales (cs50.harvard.edu/python/notes/8), que reproducen el código de la clase.

# Cambios semana 9 (Et cetera)

- **summary**: cada bullet ahora va atado al archivo de la clase y en su orden: `houses.py` (de lista con `not in` a `set`), `bank.py` (`UnboundLocalError`, luego `global`, luego clase `Account`), `meows.py` (constantes, luego type hints + mypy, luego `return` en vez de print, luego docstrings, luego `sys.argv` y por último argparse), `unpack.py` (`*`, `**`, `*args`/`**kwargs`), `yell.py` y `gryffindors.py` (map, comprehensions, filter/lambda, dict comprehension, enumerate), `sleep.py` (yield) y `say.py` de cierre.
- **examples**: reemplazados por versiones de clase: `meows.py` con hints y docstring en formato Sphinx (`:param:`, `:type:`, `:raise:`, `:rtype:`), `meows.py` con argparse, `gryffindors.py` con su lista de dicts (incluye a Draco) y `sleep.py`.
- **traps**: ahora son los errores que David provoca: `UnboundLocalError`, pasar `balance` por argumento, `str` a `range`, `-> str` sin return, `**coins` con la clave `pennies`, `print(lista)` vs `print(*lista)`, y el `n` gigante sin `yield`. Se sacó "comprensión muy larga" porque no la dice así (sí menciona que Black reformatea).
- **quiz**: preguntas sobre `bank.py`, mypy, `**coins`, `map(str.upper, ...)` y `sheep`.
- **jsToPy**: se agregaron global, constantes, type hints (vs TS), docstring (vs JSDoc) y `**dict`.
- Nuevos campos: `lectureNotes` (evitar globales, constantes en vez de números mágicos, preferir funciones que devuelven valores, argparse/enumerate), `shorts` (List and Dictionary Comprehensions), `shortsConfirmed: false`, `transcriptUrl`.

## Cosas de la clase que antes faltaban
- La versión con lista + `not in` antes del `set` en `houses.py`.
- La clase `Account` como alternativa a `global`.
- El refactor de `meow` de imprimir a devolver (`"meow\n" * n` + `end=""`), motivado por mypy.
- `first, _ = ...split(" ")` y el cálculo de knuts (`total(*coins)` y `total(**coins)`).
- `yell.py` con `print(*uppercased)`.
- `say.py` (cowsay + pyttsx3) como cierre del curso.

> Nota: el `.txt` del CDN se corta a ~128 KB ("Allow us t"), justo antes de generadores y del cierre. `sleep.py` y `say.py` se tomaron de las notas oficiales (cs50.harvard.edu/python/notes/9).

---

# Verificación de ejemplos contra las notas oficiales de CS50P (semanas 1 a 9)

Fuente: https://cs50.harvard.edu/python/notes/N/ (WebFetch). Las notas de las semanas 5 y 8 en la URL actual solo se pudieron citar por partes; la semana 8 completa se obtuvo de /python/2022/notes/8/ y se confirmó contra la URL actual (que tiene "Invalid name", los comentarios de getter/setter, la línea en blanco en Hat, `print(potter)`/`print(weasley)` y los `...`). Los snippets en línea se revisaron contra las notas y, cuando no aparecían ahí, contra la transcripción de la clase (transcriptUrl).

## Semana 1
- compare.py (versión final): OK verbatim
- grade.py (menos preguntas): OK verbatim
- parity.py (pythonic final): OK verbatim
- house.py (match con | y _): OK verbatim (las notas no nombran el archivo de este bloque)
- Snippets en línea: OK

## Semana 2
- cat.py (versión final con funciones): OK verbatim
- hogwarts.py (range(len())): OK verbatim
- hogwarts.py (lista de dicts con None): OK verbatim
- mario.py (abstracción): OK verbatim (las notas no nombran el archivo)
- Snippets en línea: OK

## Semana 3
- number.py try/except/else: REEMPLAZADO: el prompt oficial es `"What's x?"`, sin espacio al final
- number.py repetir hasta que sea válido: REEMPLAZADO: mismo motivo (`"What's x?"`)
- number.py get_int(prompt): OK verbatim
- Snippets en línea: OK (`isnumeric`, `raise` y las pruebas con 0 y -1 aparecen en la clase; `NameError` aparece en las notas)

## Semana 4
- generate.py (moneda y cartas): REEMPLAZADO: las cartas oficiales van en minúscula (`"jack", "queen", "king"`) y son dos programas separados (ahora se muestran como dos bloques oficiales)
- name.py (sys.exit + slice): REEMPLAZADO: el oficial dice `"hello, my name is"` en minúscula; la variante del slice se cambió por el bloque oficial completo
- itunes.py: REEMPLAZADO: se quitó la línea comentada `# print(json.dumps(...))`, que no forma parte de la versión final oficial
- sayings.py + say.py: REEMPLAZADO: el sayings.py oficial solo tiene `hello` y `goodbye`, sin `main()` ni guarda `if __name__`
- Snippets en línea: OK. El resumen y una trampa mencionan la guarda `if __name__ == "__main__":` en sayings.py. Las notas no la muestran, pero la transcripción confirma que David agrega `main()`, muestra que se ejecuta al importar y lo arregla con la guarda. Se dejó tal cual.

## Semana 5
- test_calculator.py (versión a mano): OK verbatim
- test_calculator.py (pytest final): OK verbatim
- hello.py (de print a return): OK verbatim (verificado por partes)
- test/test_hello.py: REEMPLAZADO: el `test_argument` oficial es `assert hello("David") == "hello, David"`; no hay un bucle sobre Hermione/Harry/Ron
- Snippets en línea: OK

## Semana 6
- names.py (append + with): OK verbatim
- names.py (leer, limpiar, ordenar): OK verbatim
- students.py (key con función y lambda): REEMPLAZADO: el oficial con `get_name` usa `students.append({"name": name, "house": house})` directamente; la versión lambda ahora es el bloque oficial completo
- students.py (csv) + costumes.py: REEMPLAZADO: el print oficial de DictReader dice `is in`, no `is from`; costumes.py usa `append_images=[images[1]]`
- Snippets en línea: CORREGIDO en el resumen: `append_images=images[1:]` pasó a `append_images=[images[1]]`

## Semana 7
- validate.py (IGNORECASE + subdominio): OK verbatim
- validate.py ([^@]): OK verbatim
- format.py (walrus): OK verbatim
- twitter.py: REEMPLAZADO: el oficial es `print(f"Username:", matches.group(1))`
- Snippets en línea: OK (`re.match` y `re.fullmatch` están en las notas; `re.split`, `re.findall` y la máquina de estados finitos están en la clase)

## Semana 8
- student.py (@property): REEMPLAZADO: el setter oficial lanza `"Invalid name"` y tiene los comentarios `# Getter for name` / `# Setter for name`
- hat.py (@classmethod): REEMPLAZADO: falta la línea en blanco después de `class Hat:`
- wizard.py: REEMPLAZADO: faltan las líneas `...` oficiales
- vault.py: REEMPLAZADO: faltan `print(potter)` y `print(weasley)`
- Snippets en línea: OK (`__repr__`/"repr" y el `NameError` de random en hat.py aparecen en la clase; `@staticmethod` y `type(50)` están en las notas)

## Semana 9
- meows.py (type hints + docstring): REEMPLAZADO: este programa no existe en las notas (combinaba main, type hints y docstring). Se usa el bloque oficial de docstring y se ajustó la etiqueta
- meows.py (argparse): OK verbatim
- gryffindors.py: OK verbatim
- sleep.py (yield): OK verbatim
- Snippets en línea: OK (`houses.py`, `bank.py` y `unpack.py` están en la clase; `mypy`, `Sphinx`, `UnboundLocalError` y "This was CS50" están en las notas)
