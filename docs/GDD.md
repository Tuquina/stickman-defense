# Juramento de Tinta — Documento de Diseño de Juego (GDD / PRD)

> Versión 0.1 · Noviembre 2026 · Estado: **MVP jugable en web**
>
> Género: defensa por oleadas + roguelite + meta-progresión · Orientación: **vertical, a una mano**
> Plataformas: Web (PWA) → Android / iOS (Capacitor) → PC (Tauri/Electron, opcional)

---

## 1. Visión

Un stickman de nivel bajo defiende una barricada contra oleadas de monstruos de tinta. Cada
partida es distinta (eliges mejoras al subir de nivel), y entre partidas te haces
permanentemente más fuerte. El motor emocional es una historia de **hermanos rotos**: el
juramento de nunca abandonarse, la traición y la promesa de venganza: *"Esto no va a quedar así."*

**Pilares**

1. **Números que suben, y se nota.** Poder visible sobre la cabeza (500 → 100.000), armaduras
   que cambian la silueta, daño que explota en pantalla.
2. **No se juega solo.** Ataque automático, pero las decisiones importantes son tuyas:
   marcar objetivos, lanzar habilidades en el momento justo, tocar monedas, activar la Furia
   y elegir sinergias en cada subida de nivel.
3. **Partidas cortas y rejugables.** 8–12 minutos por capítulo. Siempre hay algo que mejorar
   al terminar.
4. **Drama con memes.** Escenas serias, cortadas por humor de internet. Nunca se toma del todo
   en serio, pero el golpe emocional existe.

**Originalidad.** El juego toma como referencia el *género* (stickman defense vertical), pero
todos los nombres, personajes, historia, arte y música son propios.

---

## 2. Historia

### 2.1 Mundo

**Valtinta** es un reino dibujado a mano. Todo ser vivo tiene un **Trazo**: la tinta que lo
compone y que define su poder. Desde **La Mancha**, una grieta en el borde del mundo, brotan
criaturas de tinta corrupta que devoran trazos.

### 2.2 Personajes

| Personaje | Rol | Diseño |
|---|---|---|
| **Lino** | Protagonista, el *hermanito*. Poder 10 → 500 → … | Stickman negro, bufanda **turquesa** de cola larga, ojos blancos decididos. Su ropa cambia con cada armadura. |
| **Dante** | Hermano mayor. El antagonista. Poder 100.000. | De niño: cuello/pañuelo **rojo-naranja** y sonrisa confiada. Corrupto: yelmo y armadura violeta con cuernos cortos, gema roja en el pecho, capa rojo oscuro, contorno violeta brillante y la **Corona Hueca** (rota en dos mitades) flotando sobre la cabeza. Conserva una **bufanda rojo-naranja desgastada**: lo único que queda del niño que fue. |
| **Tío Clip** | Mercader y alivio cómico. Dueño del Taller. | Stickman con lentes de sol, un clip doblado como antena y cadena dorada. Habla en memes. |
| **Reina Telaraña** | Jefa del Capítulo 1 | Araña gigante carmesí con corona de espinas. |
| **Pluma** | Aliada desde el Cap. 3. Copista de mapas de la Ciudadela: precisa, seca y con su cuaderno siempre a mano. Contrapeso del parloteo de Clip. Poder **1** (la Corona se lo quitó todo). | Stickman con coleta, lentes redondos, cuello azul y una pluma de escribir detrás de la oreja. |
| **La Corona Hueca** | La verdadera villana. Habla con su propia voz (placa violeta "La Corona Hueca"). | Sin cuerpo: aparece como voz en las escenas y como "radio" en las batallas. |
| **Sir Hueco** | Jefe del Capítulo 2 | Caballero gigante con el yelmo vacío. Guardián de la Corona y su primera víctima. |
| **Eco de Dante** | Jefe del Capítulo 3 | **Un disfraz de tinta de la Corona con la cara de Dante**: cuerpo violeta, la misma corona, **sin bufanda** (la pista de que no es él). Adentro está Pluma, poseída. Repite "100.000" como disco rayado. |

### 2.3 ¿Por qué Dante se volvió tan fuerte?

De niños, una Mancha atacó su aldea. Dante no pudo proteger a Lino y casi lo pierde. Obsesionado
con no volver a ser débil, encontró en las ruinas del castillo la **Corona Hueca**: un artefacto que
**absorbe el Trazo de quien derrotas**. El precio, que Dante no conoce, es que cada vez que la
usa, la Corona **borra uno de sus vínculos**. Al llegar a 100.000 ya no recuerda el juramento.

Esto le da a la venganza un giro trágico: Lino quiere hacerle pagar, pero cada capítulo revela que
el Dante que lo humilló *ya no es del todo Dante*. El arco termina en el Capítulo 6 con una
decisión del jugador: **derrotarlo o liberarlo**.

**Regla de la Corona (para que la posesión se entienda):** la Corona le roba el Trazo a todo el que
su dueño vence, y a los vencidos los deja "vaciados". Después **usa sus cuerpos como muñecos**:
Sir Hueco se movía con su tinta, el Eco de Dante es Pluma metida en un disfraz con la cara de
Dante y el Recuerdo Roto son los recuerdos de Dante tomados por la Corona. Todos sus títeres
están conectados, por eso Pluma oyó a Dante resistirse desde adentro. Dante **no** está poseído
del todo: lleva la Corona y pelea con ella (en el Prólogo II no pudo borrar a Lino).

**Hilo conductor (cómo se conecta cada capítulo con el siguiente):** cada jefe deja una pista que
lleva al próximo escenario. La marca violeta de la Reina Telaraña → la Corona estaba guardada en las
**Ruinas** → Sir Hueco vio a Dante irse a la **Ciudadela** → Pluma, liberada del Eco, explica que el
Trono flota sobre La Mancha y que la única escalera es la Torre, cruzando la **Marisma** → la marca del Kraken prueba que la Corona planeó el ataque, y
lo borrado termina en la **Torre del Olvido** → la escalera de la Torre sube al **Trono**. La
**página del juramento** ("Lo que se escribe con tinta no se borra") aparece en el Prólogo, se
recupera en el Cap. 5 y es la llave del final.

### Guía de voz de los personajes

Para que los diálogos suenen humanos y no a fórmula: el humor sale de **quién es cada personaje y
de la situación**, no de remates armados ("X. Y tú eres X."), refranes ni memes de internet.
Detalles concretos del mundo (el pan dulce, el palo de escoba, la carreta, el cuaderno) en lugar
de frases épicas genéricas.

- **Lino**: frases cortas, terco, se avergüenza fácil ("…Siguiente pregunta."). No da discursos.
- **Dante**: de niño, burlón y protector. Con la Corona, frío y de pocas palabras; se le escapa el niño ("cabía en una cuchara").
- **Tío Clip**: comerciante ambulante que siempre está vendiendo algo; tacaño, exagerado y cariñoso a su manera.
- **Pluma**: precisa y seca, corrige a los demás y no suelta su cuaderno; perdió un año de su vida y lo resiente.
- **Sir Hueco**: solemne y cansado. Habla de lo que perdió con cosas concretas ("la cara de mi esposa").
- **La Corona**: no grita como villana de manual; habla suave y usa los miedos de Dante ("¿Te acuerdas de esa noche? Del miedo."). Solo pierde la calma al final.

### 2.4 Estructura narrativa

| Escena | Cuándo | Contenido |
|---|---|---|
| **Prólogo I · El Juramento** | Primera vez que abres el juego | Valtinta, hace 5 años. Se presenta el **Trazo**. Lino y Dante niños (Poder **10**): "¿Otra vez saliste corriendo por una araña?" / "Era una araña muy grande." / "Lino, cabe en una cuchara." Dante promete "mientras yo esté, nadie te toca". Lino teme que se vaya "como se fue papá" y lo hacen **firmar en una hoja de cuaderno**. **El ataque, animado**: de noche la aldea arde, una marea de monstruos de tinta cruza las calles y del río sale la bestia con la marca violeta. Dante se pone delante ("¡Mientras yo esté… nadie te toca!") armado con un palo de escoba; un tentáculo derriba a Lino, Dante llora de rabia ("¡Pelea conmigo, cobarde!") y la escoba se parte en dos. La bestia se va como si nada. Lino pasa tres días inconsciente ("casi no la cuenta"); Dante, a su lado, se odia por débil y una voz le susurra que en las Ruinas hay algo que lo puede hacer fuerte. Se va de madrugada sin despedirse y Lino solo encuentra su nota: "Nunca más voy a ser débil." |
| **Prólogo II · Cinco años después** | Sigue al anterior | Lino, orgulloso de sus 500, ve volver a Dante con la Corona (**100.000**). "Los juramentos son para los de nivel bajo." / "Eres basura, Lino." Lo derriba. **La Corona habla por primera vez**: "Tómalo. Bórralo." Dante duda: "…No." y se va. Lino: "Esto… no va a quedar así." |
| Intro Cap. 1 | Antes de la 1ª partida | Las arañas marchan hacia la aldea ("Tenían que ser arañas"). Aparece el Tío Clip (comerciante ambulante: "¿Eres tío de alguien?" / "De nadie, que yo sepa. Pero así la gente me compra con más confianza.") y ofrece su trato. Tutorial. |
| Final Cap. 1 | Al vencer a la Reina Telaraña | Marca violeta en la Reina. Clip explica la Corona Hueca: roba el Trazo y **manda a los monstruos que marca**. Estaba guardada en las Ruinas por un caballero. Desbloquea **Capucha de Vigía** y la **Escopeta**. |
| Intro/Final Cap. 2 | Ruinas del Castillo | "Dante era el caballero; yo, el dragón. O la princesa." **Sir Hueco**, el guardián: un Dante niño vino llorando a pedirle la Corona "para no volver a ser débil". Fue su primera víctima: la Corona **cobra en recuerdos** y **usa a los vencidos como muñecos**. Lo vio irse a la Ciudadela. Desbloquea **Armadura de Caballero** y el **Shuriken**. |
| Intro Cap. 3 | Ciudadela de Ceniza | Aparece "Dante", pero **no tiene su bufanda**: es un **Eco**. Clip: "Un Eco es un disfraz de tinta de la Corona. Adentro siempre hay alguien." |
| Final Cap. 3 | Al vencer al Eco | La tinta se escurre y adentro está **Pluma** (Poder 1, sin saber qué día es ni dónde está su cuaderno). Revela que la Corona le ordenó a Dante borrar a Lino y **no pudo**. Da la ruta: Marisma → Torre → Trono. La Corona habla: "Sube. Te estoy esperando." Pluma se une al equipo. Desbloquea el **Abismo** y el Cap. 4. |
| Intro/Final Cap. 4 | Marisma de Tinta | Pluma y Clip se pelean el puesto de gracioso. El **Kraken** lleva la marca de la Corona desde hace 5 años: **la Corona planeó el ataque** para que Dante, desesperado, fuera a buscarla. "¡Nos usó a los dos!" Desbloquea la **Lanza de Tinta**. |
| Intro/Final Cap. 5 | Torre del Olvido | Pluma lee recuerdos robados ("Lino llora por una araña" / "¡Eso es privado!"). **El Recuerdo Roto**: los recuerdos de Dante tomados por la Corona. Al liberarlos queda **la página del juramento**. Clip regala el set **Heredero del Juramento** (gratis: "Si se lo cuentas a alguien, te la cobro a ti"). |
| Intro Cap. 6 | Trono de la Corona | "Llegaste lejos para ser basura." La Corona: "Bórralo y serás completo." Lino: "Sé que peleas con ella." Dante: "¡MENTIRA!" |
| Final Cap. 6 | Tras vencer a Dante | La página: "Esa letra… es mía." Dante recuerda la araña ("cabía en una cuchara"). La Corona grita "¡Es mío! ¡Me costó cinco años!". Dante explica el dilema: si la rompes, me voy con ella; si la arrancas, te quema. **Decisión del jugador:** |
| Final **Venganza** | Elección | "Lo sé. Hazlo." Lino parte la Corona y Dante desaparece; queda su bufanda roja. Pluma: "No querías ganarle. Querías que volviera." Clip: "Hoy no te cobro el viaje." Gancho: la tinta de la bufanda todavía se mueve. |
| Final **Liberación** | Elección | Lino arranca la Corona con las manos. La Corona: "¡Eres un nivel bajo!" / Lino: "Seré de nivel bajo… ¡pero soy su hermano!". Días después, en el patio donde lo firmaron, Dante (Poder **10**) pide perdón ("Tú solo llegaste tarde. Cinco años tarde."). Ahora es Lino quien dice "mientras yo esté, nadie te toca". |
| Créditos | Tras el final | "Fin de la Temporada 1". El menú cambia según el final (Dante a tu lado o "Venganza cumplida"). |

Frases de derrota (Tío Clip, al azar): *"Skill issue, hermano." · "F en el chat." · "La barricada
era de cartón. Literal." · "Tranqui, todos empezamos siendo basura. Bueno, tú un poquito más."*

---

## 3. Gameplay

### 3.1 Pantalla de batalla (vertical, 720×1280 lógicos)

```
┌──────────────────────────────┐
│ [retrato] ▓▓▓▓ Barricada  ⏸  │  HUD superior: vida, nivel/XP, oleada, pausa, x2
│ Lv.12 ▓▓▓▓▓░░░  Oleada 7/20  │
│ Hitos:  ◆Lv10  ◆Lv25  ◆Lv40  │
│                              │
│  (fondo del capítulo)        │
│  🧍 ✕         🕷  🕷   🕷     │  Campo: héroe a la izquierda, estacas,
│  🪨 ✕     🕷🕷   🪲     🕷    │  los enemigos entran por la derecha
│     ✕        🕷     🍄        │
│                              │
├──────────────────────────────┤
│  [Hab.1] [Hab.2] [Hab.3]     │  Zona del pulgar: habilidades
│        [ FURIA ▓▓▓░ ]   💰   │  y Furia
└──────────────────────────────┘
```

### 3.2 Controles (una mano)

| Acción | Gesto | Por qué es divertido |
|---|---|---|
| Ataque básico | Automático, al enemigo más cercano a la barricada | Ritmo constante sin cansar el pulgar |
| **Marcar objetivo** | Tocar un enemigo o una zona del campo | El objetivo marcado recibe **+30 % de daño** y es prioritario. Clave contra sanadores, arqueros y jefes. |
| **Habilidades** (3 ranuras) | Botones grandes abajo | Se lanzan sobre el grupo más denso. Elegir el momento es lo que da habilidad. |
| **Furia** | Botón al llenarse la barra (se carga con eliminaciones) | 7 s de **¡MODO TRAZO!**: ×2 velocidad, +50 % daño, +2 perforación |
| **Monedas** | Tocar monedas que caen | Si las tocas antes de que vuelen solas, valen **×2** |
| Elegir mejora | Tocar 1 de 3 cartas | La decisión estratégica central |
| Velocidad ×1/×2 | Botón en el HUD | Para grindear más rápido capítulos ya dominados |

### 3.2.1 Capa de "jugo" y decisiones (revisión de jugabilidad v0.2)

| Mecánica | Qué hace | Por qué |
|---|---|---|
| **Habilidad inicial** | Cada partida empieza eligiendo 1 de 3 habilidades | Hay una decisión desde el segundo uno y el inicio deja de ser pasivo |
| **Combo** | Matar en cadena (menos de 2,2 s entre bajas) suma combo: más carga de Furia (hasta ×2), y cada 25 de combo da oro extra y un aviso ("¡EN RACHA!", "¡MASACRE!", "¡IMPARABLE!") | Premia usar las habilidades de área en el momento justo |
| **Cambiar cartas** | 1 cambio gratis por partida, +1 en cada cofre de hito | Evita sentirse "estafado" por malas cartas |
| **Sinergias** | Congelado = +25 % de daño recibido. La Cadena de Rayos hace ×2 al marcado. El Tornado agrupa enemigos para las bombas. | Las habilidades se combinan entre sí, no solo suman números |
| **Impacto** | Micro-pausa en críticos a jefes, empuje en críticos, enemigos que estallan en blanco y dejan una mancha de tinta | Cada golpe se siente |
| **Presentación de jefes** | Cámara lenta, franjas de cine, nombre, título y frase | Los jefes se sienten como eventos |
| **Peligro** | Viñeta roja que late y latido de corazón con la barricada bajo 35 % | Tensión y aviso claro |
| **Tutorial en batalla** | Una mano guía enseña, de a una cosa por vez: marcar, usar habilidades y activar la Furia (solo la primera vez) | Onboarding sin pantallas de texto |
| **Calidad visual** | Ajustes → Efectos visuales: desactiva partículas, manchas y animaciones extra | Celulares de gama baja |

### 3.3 Partida (roguelite)

1. **Seleccionar arma**: se elige 1 de las armas desbloqueadas.
2. **20 oleadas** por capítulo. Cada oleada dura unos 18–25 s y la siguiente empieza aunque
   queden enemigos (presión). La **oleada 10** trae un **mini-jefe** y la **20** al **jefe**.
3. Los enemigos sueltan **gotas de XP**. Al subir de nivel el juego se pausa y eliges **1 de 3 cartas**.
4. **Hitos de nivel (Lv.10, Lv.25, Lv.40)**: aparece un **Cofre de Hito** con 3 cartas
   **Legendarias** (incluida la **Evolución** del arma si está en 5★).
5. Ganas al derrotar al jefe. Pierdes si la barricada llega a 0. **Siempre te quedas con el oro**
   ganado, así que perder también hace avanzar.


**Modo de mejoras** (Ajustes y Pausa):

| Modo | Comportamiento |
|---|---|
| **Fin de oleada** (por defecto) | Las subidas de nivel se acumulan (▲N en el HUD) y se eligen al terminar la oleada. No hay pausas en mitad del combate. |
| **Al instante** | La elección aparece apenas subes de nivel (el comportamiento clásico). |
| **Automático** | El juego elige sin pausar según la prioridad elegida (equilibrado, ataque, defensa o habilidades) y muestra un aviso de cada elección. Las legendarias se anuncian siempre. |

La pantalla de cartas tiene además el botón **ELEGIR AUTOMÁTICO**, que resuelve esa elección y todas las
pendientes de una vez. Cuando ya no queda nada por mejorar (solo Reparación o Botín), se toma solo, sin pausa.

### 3.3.1 Puestos de defensa y Tinta (la decisión en combate, v1.2)

Detrás de la barricada hay **3 puestos** (arriba, centro y abajo). Durante la partida se junta **Tinta**:
1 por enemigo, 12 por jefe o mini-jefe y 6 por oleada, y se empieza con 40. Al tocar un puesto el tiempo
se pone lento (15 %) y se elige qué construir. Después, cada puesto se mejora hasta el Nv.3.

| Defensa | Nv.1 / Nv.2 / Nv.3 | Para qué sirve |
|---|---|---|
| **Torre** | 30 % / 45 % / 65 % de tu daño, 1,2 disparos/s | Enemigos a distancia (arqueros, Escudados ya rotos, jefes) |
| **Pinchos** | 0,6 / 1 / 1,5× tu daño por segundo a quien golpea **su carril** | Enjambres que llegan a la barricada (arañas, sanguijuelas) |
| **Tintero** | Repara 0,2 % / 0,35 % / 0,5 % de la barricada por segundo | Capítulos con mucho daño constante (Marisma, Trono) |

Costos: **50 / 110 / 200** de Tinta (alcanza para dejar los 3 puestos al máximo cerca del final de la
partida, no antes). La radio de Clip y Pluma da en la oleada 3 de cada capítulo la pista de qué conviene.
Reemplaza a la antigua carta de Torreta.

### 3.3.2 Enemigos que piden reaccionar (v1.2)

- **Bombita de Tinta**: corre rápido y, si llega a la barricada, quita el **7 %** de su vida. **Tócala** y
  explota donde está, con daño 3× a los de alrededor. Si la derriban los disparos, revienta más débil y
  puede encadenar con otras.
- **Escudado**: una burbuja de tinta **bloquea todo el daño**, incluso habilidades. **Tócalo** (marcarlo) y el
  escudo se rompe. El héroe prioriza otros objetivos mientras siga cubierto, así que nunca traba la partida.

Aparecen desde el Cap. 1 (Bombita) y el Cap. 2 (Escudado), con más frecuencia en los capítulos finales.
La primera vez que aparece cada uno, el juego hace una cámara lenta y muestra un tutorial.

### 3.3.3 Animaciones del héroe (v1.2)

- Festeja al terminar cada oleada.
- Retrocede con los golpes fuertes.
- Levanta el brazo al lanzar una habilidad.
- Salta al subir de nivel.
- Celebra al ganar y cae de rodillas al perder.

### 3.4 Cartas de subida de nivel

**Mejora de arma** (hasta 5★): +25 % de daño por estrella y un extra según el arma.

**Pasivas** (hasta 5 niveles cada una)

| Carta | Efecto por nivel |
|---|---|
| Filo de Tinta | +15 % daño |
| Prisa | +12 % velocidad de ataque |
| Ojo Crítico | +6 % prob. de crítico (×2) |
| Combo | +6 % prob. de disparo doble |
| Estacas Reforzadas | +20 % vida máx. de la barricada (y la cura) |
| Savia | Regenera 0,4 % de la barricada por segundo |
| Mente Rápida | −8 % tiempo de recarga de habilidades |
| Perforación | +1 enemigo atravesado |
| Sabiduría | +15 % XP |
| Bolsillos Hondos | +20 % oro |
| Furia Creciente | +20 % carga de Furia |

**Habilidades activas** (3 ranuras, hasta 5 niveles: +30 % daño y −8 % recarga por nivel)

| Habilidad | Efecto | Recarga |
|---|---|---|
| Lluvia de Flechas | 12 impactos en área sobre el grupo más denso | 10 s |
| Cadena de Rayos | Rayo que salta entre 6 enemigos | 7 s |
| Bomba de Borrón | Gran explosión con empuje | 12 s |
| Muro de Tinta | Cura el 15 % de la barricada y empuja a todos | 15 s |
| Escarcha de Grafito | Congela a todos 2,5 s (los jefes, ralentizados) | 18 s |
| Tornado de Papel | Tornado que cruza el campo y arrastra enemigos | 12 s |

**Aliados**: *Torreta Lápiz*, un mini-stickman en la barricada que dispara (40 % del daño del
héroe). Hasta 3.

**Legendarias (Cofre de Hito)**

| Carta | Efecto |
|---|---|
| Doble Trazo | +1 proyectil por disparo |
| Vampiro de Tinta | Cada eliminación cura 0,5 % de la barricada |
| Eco Arcano | Las habilidades se repiten al 50 % |
| Tormenta Crítica | +10 % crítico y los críticos hacen ×3 |
| Corazón de Hermano | +60 % daño con la barricada por debajo del 35 % |
| Ejecutor | Los enemigos normales por debajo del 12 % de vida mueren al instante |
| Furia Eterna | La Furia dura el doble y carga un 50 % más rápido |
| Estallido de Tinta | Los enemigos explotan al morir y dañan a los que están cerca |
| **Evolución** (arma en 5★) | Transforma el arma (ver 3.5) |

### 3.4.1 Juramentos de Tinta (niveles altos, v1.2)

Desde el **Lv.30**, cada subida ofrece al menos un **Juramento**. Hay 3 grupos de 3 y solo puede haber
**uno activo por grupo** (Nv.1–3). Elegir otro del mismo grupo aparece como **CAMBIAR**: reemplaza al
actual **conservando el nivel**. Así, el final de la partida es para definir la build y no para apilar más
de lo mismo.

| Grupo | Opciones (Nv.1 → Nv.3) |
|---|---|
| **Tinta** | Ardiente (quema 30→60 % del golpe) · Helada (30→60 % de ralentizar) · Eléctrica (12→24 % de rayo en cadena) |
| **Barricada** | Espinas (quien golpea se hiere) · Raíces (regenera 0,6→1,4 %/s si no la golpean 2 s) · Muro Vivo (+25→60 % de vida) |
| **Héroe** | Francotirador (+30→70 % a enemigos lejanos) · Berserker (hasta +40→80 % de velocidad según el daño de la barricada) · Cazador (+40→100 % al marcado) |

### 3.5 Armas

| Arma | Estilo | Extra por ★ | Evolución |
|---|---|---|---|
| **Arco** | Flecha rápida, 10 % combo | +1 perforación en 3★ y 5★ | **Arco del Alba**: cada flecha se divide en 3 al impactar |
| **Pistola** | Cadencia muy alta, daño bajo, 15 % combo | +5 % combo | **Pistolas Gemelas**: ×2 cadencia |
| **Bastón Oráculo** | Orbe teledirigido que explota en área, +15 % daño de habilidades | +área | **Bastón Supremo**: el orbe encadena 3 rayos |
| **Escopeta** (se desbloquea en Cap. 1) | 5 perdigones en abanico | +1 perdigón | **Cañón Borrón**: perdigones explosivos |
| **Shuriken** (se desbloquea en Cap. 2) | Rebota entre 2 enemigos | +1 rebote | **Estrella Infinita**: 6 rebotes, regresa |
| **Lanza de Tinta** (se desbloquea en Cap. 4) | Lenta, mucho daño, atraviesa 2 | +1 perforación en 3★ y 5★ | **Lanza del Juramento**: cada impacto estalla |

### 3.6 Enemigos y escenarios

| Capítulo | Escenario | Enemigos | Mini-jefe (oleada 10) | Jefe (oleada 20) |
|---|---|---|---|---|
| **1 · Bosque Sombrío** | Bosque verde azulado, troncos gigantes, rayos de luz y lianas | Araña Carmesí (rápida, enjambre), Escarabajo Acorazado (tanque con armadura), Seta Saltarina (avanza a saltos) | Araña Madre (pone arañitas) | **Reina Telaraña**: telarañas que ralentizan tu ataque e invocaciones |
| **2 · Ruinas del Castillo** | Murallas de piedra al atardecer, torres rotas | Esqueleto de Tinta, Murciélago (zigzag), Caballero Hueco (armadura 50 %), Arquero (se para y dispara a la barricada) | Gárgola (vuela) | **Sir Hueco**: embiste e invoca esqueletos |
| **3 · Ciudadela de Ceniza** | Desierto morado-anaranjado, pilares rotos, cristales violetas | Mancha (se divide al morir), Sombra (embestidas veloces), Brujo Vacío (cura a sus aliados), Gólem de Ceniza (tanque) | Guardián de la Corona | **Eco de Dante**: se teletransporta, 3 fases, invoca sombras |
| **4 · Marisma de Tinta** | Pantano nocturno, luna entre niebla, árboles muertos, fuegos fatuos | Renacuajo de Tinta (a saltos), Sanguijuela (rápida, mucho daño en la barricada), Pescador Hueco (arpones a distancia), Tortuga de Lodo (tanque 45 %) | Hidra de Charco (genera renacuajos) | **Kraken de Borrón**: golpes de tentáculo, tinta a la barricada, "tinta ciega" que ralentiza al héroe |
| **5 · Torre del Olvido** | Biblioteca infinita, estanterías, ventana violeta, páginas flotando | Página Errante (vuela), Tintero Vivo (dispara), Escriba Hueco (cura), Guardia de la Corona (escudo 50 %) | Gólem de Libros (genera páginas) | **El Recuerdo Roto**: Dante de niño corrompido, se teletransporta, 3 fases |
| **6 · Trono de la Corona** | Vacío violeta, corona gigante partida, alfombra roja, vetas de oro | Sombra Coronada (embestidas) más élites de capítulos anteriores | **Eco de Dante** | **Dante** (3 fases: embestidas y ráfagas → "La Corona despierta" con escudos y coronados → "¡CIEN MIL!" enfurecido) |
| **∞ · El Abismo** | Tinta violeta y gotas que caen | Mezcla de todos, escalado infinito | Jefe cada 10 oleadas | Récord de oleada |

**Escalado**: vida = base × (1 + 0,14·(oleada−1)) × multiplicador del capítulo (1 / 2,3 / 4,4).
Jefes: base × (1 + 0,05·(oleada−1)) × capítulo. En el Abismo: multiplicador 2,2 y además ×1,35 cada 5
oleadas (crecimiento exponencial, para que haya un techo de récord).

**Oro (economía proporcional, v0.5)**: cada moneda vale (1 + 0,1·oleada) × multiplicador del capítulo, así que dentro de una partida las oleadas avanzadas pagan hasta ×3. El tope está en la oleada 20 en capítulos y en la 60 en el Abismo. Cada oleada superada da 10 × lo mismo, y la victoria suma un bonus. Los multiplicadores por capítulo son **×1 / ×2,5 / ×3,5 / ×7 / ×20 / ×28** (Abismo ×6, que crece con la oleada) y se ven en la tarjeta de cada capítulo. Las mejoras cuestan base × **1,22**^nivel. Resultado medido con el bot: hacen falta unas **3–5 partidas** por capítulo para conseguir las mejoras del siguiente (antes iban de 5 a más de 100).

### 3.6.1 QA de cartas y mecánicas (v0.10)

- **Perforación se adapta al arma**: con el shuriken se convierte en "Rebote Extra" (+1 rebote) y con el bastón en "Onda Expansiva" (+14 de área), porque esas armas no perforan. Con la lanza, el arco, la pistola y la escopeta suma perforación (la lanza pasa de 2 a 3, 4…).
- **Combo** ahora se describe como "probabilidad de volver a disparar al instante" y funciona con todas las armas, incluido el shuriken (que vuelve a lanzar una estrella con todos sus rebotes).
- **Doble Trazo** (+1 proyectil) funciona con todas las armas: con el shuriken lanza dos estrellas y cada una rebota por su cuenta.
- **Estrella Infinita** (shuriken evolucionado): antes daba los mismos 6 rebotes que el shuriken a 5★. Ahora suma **+4 rebotes**, más alcance de rebote y cada rebote pega un 15 % más fuerte.
- **Curanderos** (Brujo Vacío, Escriba Hueco) **ya no curan a jefes ni mini-jefes**. Varios escribas junto al Recuerdo Roto lo curaban más rápido de lo que se le podía hacer daño y el combate no terminaba.

Verificado con una prueba automática que juega batallas reales:
- golpes de la lanza en fila;
- rebotes reales de cada estrella;
- disparos con Combo al 100 %;
- vida del Recuerdo junto a tres escribas.

### 3.7 Balance verificado (simulaciones con el bot)

| Simulación | Resultado |
|---|---|
| Cap. 1, sin mejoras, Arco / Bastón | Victoria (Lv.32–35, ~1.700 de oro) |
| Cap. 1, sin mejoras, Pistola | Derrota en la oleada 12 |
| Cap. 2, mejoras nv.6, Capucha | Derrota en la oleada 11 (mini-jefe) |
| Cap. 2, mejoras nv.8–10, Capucha | Victoria (~3.600 de oro) |
| Cap. 3, mejoras nv.15, Caballero | Derrota en la oleada 12 |
| Cap. 3, mejoras nv.16–22, Caballero | Victoria |
| Abismo, mejoras nv.14–20, Paladín | Récord en las oleadas 36–40 |
| Cap. 4 (Bastón), mejoras nv.17 / nv.19 | Derrota ante el Kraken / Victoria |
| Cap. 5 (Bastón), mejoras nv.20 / nv.23 | Derrota en la oleada 12 / Victoria |
| Cap. 6 (Bastón), mejoras nv.27 / nv.30 | Derrota ante Dante / Victoria |

**v1.2 (con puestos, Bombitas, Escudados y Juramentos; bot "perfecto" con el Bastón):**

| Simulación | Resultado |
|---|---|
| Cap. 1, sin mejoras | Victoria, barricada intacta |
| Cap. 3, mejoras nv.16, Caballero | Victoria |
| Cap. 6, mejoras nv.30, Heredero | Victoria con el 74 % de la barricada |

Para compensar los puestos, la vida de los enemigos de los capítulos 2 a 6 y del Abismo subió alrededor de un 13 %.
El bot detona todas las Bombitas y rompe todos los escudos al instante; una persona se deja algunas
(7 % de barricada cada una), así que el margen real es menor. Hay que confirmarlo con jugadores. Las
perillas de ajuste rápido son el `hpMult` de cada capítulo y los costos y valores de los puestos.

Curva buscada: el Cap. 1 se puede ganar en la primera partida jugando bien. Los capítulos 2 y 3 exigen
varias partidas de grindeo en el Taller, y el Abismo es el techo para el récord.

---

## 4. Meta-progresión

### 4.1 Recursos

- **Oro**: se gana en batalla (monedas, oleadas superadas, jefes). Se gasta en el Taller.
- **Rango**: nivel de cuenta. Se gana con oleadas y jefes. Cada rango da +1 % a todo y desbloquea contenido.
- **Poder**: un número calculado a partir de todas tus estadísticas. Es la cifra "500 vs 100.000"
  que se muestra sobre la cabeza en el menú. **La meta a largo plazo es superar a Dante.**

### 4.2 Taller del Tío Clip

**Mejoras permanentes** (costo = base × 1,22^nivel)

| Mejora | Efecto por nivel | Costo base | Nivel máx. |
|---|---|---|---|
| Fuerza | +6 % daño | 40 | 50 |
| Barricada | +8 % vida | 40 | 50 |
| Agilidad | +3 % velocidad de ataque | 60 | 30 |
| Precisión | +1 % crítico | 60 | 25 |
| Codicia | +5 % oro | 80 | 30 |
| Sabiduría | +4 % XP | 80 | 25 |
| Furia | +5 % carga de Furia | 70 | 20 |

**Armas**: cada arma sube de nivel con oro (hasta 10, +10 % de daño por nivel).

**Topes por progreso (anti-farmeo)**: el Taller de Clip "repone stock" a medida que avanza la historia.
El nivel máximo que se puede comprar depende de cuántos capítulos venciste, con un margen de 4–6
niveles sobre lo que pide cada capítulo, para que farmear un capítulo temprano no rompa el resto.

| Capítulos vencidos | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Tope de mejoras | 6 | 14 | 20 | 25 | 29 | 36 | 50 (máx.) |
| Tope de armas | 3 | 5 | 7 | 9 | 10 | 10 | 10 |
| Nivel que pide el siguiente capítulo (bot) | — | ~10 | ~16 | ~19 | ~23 | ~30 | — |

**Fuentes de oro**:
- monedas de los enemigos;
- oleadas superadas;
- jefes;
- carta de Botín;
- bono de combo;
- bono de victoria: **250 × multiplicador del capítulo la primera vez**; las repeticiones pagan solo 60 ×.

En **El Abismo** el oro sigue al progreso: paga **la mitad del multiplicador del mejor capítulo
vencido** (mínimo ×2). Así no conviene farmearlo apenas se desbloquea, pero sigue siendo útil en todo el juego.

Ritmo esperado (modelo calibrado con el bot): entre 4 y 8 victorias del capítulo anterior para
juntar las mejoras del siguiente.

### 4.3 Armaduras (cambian la silueta del personaje)

| Tier | Nombre | Cómo se desbloquea | Bonus | Aspecto |
|---|---|---|---|---|
| 0 | Bufanda del Juramento | Inicio | — | Bufanda turquesa |
| 1 | Capucha de Vigía | Vencer el Cap. 1 | +10 % daño, +15 % vida | Capucha azul, cuello de piel, brazaletes de cuero |
| 2 | Armadura de Caballero | Vencer el Cap. 2 | +25 % daño, +30 % vida | Yelmo plateado con visera, hombreras con filo dorado, capa azul |
| 3 | Paladín de Tinta | Vencer el Cap. 3 | +45 % daño, +50 % vida | Armadura dorada, cresta con alas, aura celeste |
| 4 | Heredero del Juramento | Vencer el Cap. 5 (regalo del Tío Clip en la historia) | +80 % daño, +80 % vida | Blanco y oro, bufanda luminosa, aura intensa |

Cada armadura se desbloquea con un capítulo de la historia y siempre en orden. Antes, la 3.ª pedía
además Rango 10 (unas 20 partidas) y la 4.ª tenía un atajo por El Abismo, así que se podía conseguir
la 4.ª antes que la 3.ª. Ahora no hay atajos: la progresión de poder la marcan los capítulos.

---

### 4.4 Logros (v1.2)

**27 logros** en tres categorías:
- **Historia**: capítulos y los dos finales.
- **Combate**: bajas, jefes, combos, Bombitas, escudos, defensas y Juramentos.
- **Progreso**: evolucionar armas, ganar con distintas armas, el Abismo, el Taller, las armaduras y el Rango.

Cada logro tiene una barra de progreso y una **recompensa en oro**: de 300 a 35.000, en proporción a la
etapa del juego. El progreso se lee del guardado, así que cuentan las partidas anteriores. El menú muestra
un trofeo con la cantidad de logros por reclamar, y la pantalla de resultados anuncia los que se completan.

## 5. Dirección de arte y audio

- **Estilo**: stickmen de tinta negra con miembros gruesos y ojos blancos angulares. Escenarios
  pintados con colores planos por capas. El rojo es para enemigos, el turquesa/azul para el héroe y
  el violeta para la Corona y Dante.
- **Técnica (MVP)**: **todo vectorial y generado por código** (esqueleto con poses + piezas de
  armadura en capas). No hace falta ningún archivo de arte. Las texturas de los enemigos y los
  fondos se generan al arrancar. Más adelante se pueden reemplazar por sprites o Spine sin tocar la lógica.
- **Tipografía**: *Lilita One* (OFL), redondeada y gruesa, con contorno negro.
- **Feedback**: números de daño (los críticos en amarillo y más grandes), sacudida de cámara en
  explosiones, destello blanco al recibir daño, partículas de tinta y vibración en el móvil.
- **Audio**: **todo sintetizado con WebAudio**, sin archivos y por lo tanto sin problemas de licencias.
  - Efectos: disparo por arma, impacto, muerte, moneda, subida de nivel, habilidades,
    explosiones, golpes a la barricada, rugido de jefe e interfaz.
  - Música procedural por secuenciador: menú (tranquila), un tema por capítulo, jefe (rápida) e
    historia (melancólica).

---

### 5.0 Armas, efectos y habilidades (v0.4)

Todo pintado con Canvas 2D al arrancar (degradados, brillos, contornos) en `src/gfx/fx.ts`. Durante la partida solo se usan sprites con mezcla aditiva y *pools*, así que el rendimiento no cambia.

| Elemento | Tratamiento |
|---|---|
| Armas en mano | Contorno de tinta y piezas con detalle: arco con empuñadura y puntas doradas, pistola con corredera y grip, bastón con cristal y garra, escopeta con bombeo, lanza con hoja de dos tonos. Las evoluciones brillan en dorado. |
| Íconos | Marco con degradado y brillo (naranja para armas, color propio para cada habilidad), dibujo con contorno y luces. |
| Proyectiles | Flechas con punta metálica y plumas, trazadoras con núcleo blanco, orbes con anillo y destello, shuriken metálico, lanza con hoja brillante. **Estela de luz** detrás de cada proyectil. |
| Disparo e impacto | Destello en la boca del arma en cada disparo; chispas del color del arma al impactar (astillas de madera en flechas, onda en orbes y lanza); destello extra en críticos. |
| Habilidades | **Lluvia:** marcador rojo en el suelo y flechas en diagonal con polvo. **Rayos:** triple capa (brillo, color y núcleo blanco) con ramas y parpadeo. **Bomba:** mecha con chispas, sombra en el suelo, destello, doble onda expansiva, humo y manchas. **Muro:** ola de tinta turquesa con espuma y chispas curativas en las estacas. **Escarcha:** nova helada desde el héroe y **bloques de hielo** sobre cada enemigo, que estallan en esquirlas al descongelarse. **Tornado:** 4 cuadros de animación con papeles girando, polvo y anillo en la base. |
| Furia | Aura de llamas turquesa sobre el héroe y proyectiles más grandes y teñidos. |
| Calidad baja | Desactiva estelas, destellos de disparo, chispas, humo y manchas. |

### 5.0.1 Personajes, portada y rendimiento (v0.6)

- **Personajes**: torso ancho que se estrecha en la cintura, extremidades más gruesas en la raíz, puños cuadrados alineados con el antebrazo, botas con talón y un brillo suave en la cabeza. Aplica a todos los personajes y enemigos humanoides.
- **Portada**: logo pintado (degradado, contorno, brillo y pincelada), rayos de luz girando, Lino y Dante enfrentados con sus números de Poder y un "VS" (tras el final Liberación: "JUNTOS"), un rayo violeta entre ellos, partículas de tinta y un botón "TOCA PARA EMPEZAR" con mano guía.
- **Menú**: logo, pedestal brillante bajo el héroe, botones con íconos y una pista del siguiente objetivo.
- **Precisión**: el golpe se calcula donde se dibuja el enemigo (incluida la altura de los que vuelan o saltan), los disparos rectos se adelantan al movimiento del objetivo, los números de daño siempre aparecen (se reciclan los más viejos) y las micro-pausas por crítico tienen un tiempo de espera.
- **Rendimiento**: reutilización de imágenes (enemigos, gemas y monedas), descarte rápido en colisiones, menos partículas con multitudes y el retrato del HUD a 10 fps. Medido con más de 200 enemigos: unos 0,9 ms de lógica por frame y 58 fps con renderizado por CPU.

### 5.0.2 Portada, tipografía y música (v0.7)

- **Tipografías**: *Luckiest Guy* (Apache 2.0) para el logo y todos los títulos grandes (pantallas, Pausa, Victoria/Derrota, carteles y jefes) y *Lilita One* (OFL) para el resto. Se cargan con la API FontFace y el juego espera a que estén listas (en iPhone arrancaba antes con una fuente del sistema, más ancha, y el título se cortaba).
- **Logo**: letras sobre un arco con extrusión 3D, contorno grueso, degradado y brillo; banda violeta con "DE TINTA" y la Corona rota detrás. Se ajusta solo a su espacio.
- **Portada**: avance de la historia que va rotando ("Juraron no abandonarse nunca…", "Tú tienes {tu Poder}…", "¿Venganza… o liberación?"), siluetas de enemigos avanzando, Lino contra Dante con su Poder, **ficha del jugador** (rango, armadura y capítulo actual) y arranque en dos toques: el primero activa el sonido y la música del título, el segundo entra a jugar.
- **Música**: el audio se desbloquea con cualquier toque, clic o tecla (iOS solo lo permite al soltar el dedo). Se intenta arrancar al cargar la página donde el navegador lo permite, y los temas cambian con fundido. Temas por pantalla: título, menú, taller, victoria, derrota, historia, uno por capítulo, jefe de los actos 1–3, jefe de los actos 4–6 y el Abismo, y el duelo final contra Dante.

### 5.0.3 Presentación de la historia (v0.8–v0.9)

- **Cuadro de diálogo tipo novela visual**: el nombre de cada personaje aparece en una placa con su color (Lino turquesa, Dante violeta o rojo de niño, Clip dorado, Sir Hueco rojo, Eco y Recuerdo violeta) del lado de quien habla, y una flecha de "continuar" parpadea al terminar de escribirse la frase.
- **Tarjeta de título** al abrir cada escena (capítulo y nombre, con franjas de cine). Se salta con un toque.
- **Entradas y salidas**: los personajes que llegan entran deslizándose desde su lado y los que se van se desvanecen, en lugar de aparecer de golpe.
- **La página del juramento** es un objeto en pantalla (hoja de papel con la frase y las huellas de los dos hermanos) que aparece cuando se firma, cuando se recupera y cuando Lino se la muestra a Dante.
- **Voces fuera de escena**: la Corona (placa violeta, texto lila) y la voz misteriosa de las Ruinas (placa "???").
- **Efectos de impacto**: golpe de cámara en las frases fuertes, estallido de tinta cuando alguien se libera o se deshace, y aparición "desde la tinta" (Pluma sale del Eco y Dante queda libre).
- **Radio en batalla** (estilo Hades): en oleadas fijas de cada capítulo aparece un mensaje corto con retrato de Clip, Pluma, Lino o la Corona ("Pisa donde hay pasto. Donde no hay, te hundes."). No aparece en oleadas de jefe.
- **Escenas animadas** (ataque del Prólogo I): iluminación que persiste entre momentos (noche con luna, aldea en llamas con llamas, humo y brasas, amanecer), monstruos de tinta corriendo detrás de los personajes, la bestia que emerge del río y se hunde al irse, el golpe de tentáculo que derriba a Lino, la escoba que se rompe y la nota de Dante como objeto en pantalla.
- **Expresiones nuevas**: lágrimas (Dante y Lino), venda en la cabeza (Lino herido) y el palo de escoba entero y partido.
- **Rótulos** de lugar y tiempo ("VALTINTA · HACE 5 AÑOS", "CINCO AÑOS DESPUÉS…", "DÍAS DESPUÉS") para que el salto temporal se entienda.

### 5.0.4 Cinemáticas pulidas (v1.0)

- **Dos cámaras en las escenas de historia**:
  - la cámara del mundo hace zoom, paneos lentos hacia quien habla y temblores;
  - la de la interfaz deja quietos los textos y botones.
- **Aldea de noche pintada** (cielo estrellado, luna con halo, montañas, castillo, río) y una **fila de casas en una capa aparte**, para que la bestia salga *detrás* de los techos.
- **Fuego pintado**: llamas con degradé y núcleo caliente, animadas por cuadros con mezcla aditiva y un brillo que parpadea. Se encienden techo por techo. Hay humo y brasas.
- **La bestia del ataque**, rediseñada:
  - manto de tinta con brillo violeta, ojos furiosos que laten, boca con dientes y la marca de la Corona en la frente;
  - seis **tentáculos animados en vivo** con ventosas;
  - emerge detrás de las casas mientras la cámara se aleja, y al golpear hay un tentáculo, zoom y una breve congelación.
- **Casa de la curandera** (fondo nuevo): ventana redonda con la noche y luego el amanecer, estantes con frascos, hierbas colgando, el dibujo de los dos hermanos en la pared, una vela animada y una alfombra. Lino vendado en la cama con un edredón.
- **Lino despierta**: se sienta en la cama, la cámara recorre el cuarto vacío (la escoba rota en el piso) y aparece la nota de Dante.
- **En todas las escenas**:
  - viñeta cinematográfica y partículas de ambiente según el lugar (polvo, luciérnagas, ceniza, chispas violetas);
  - empujes de cámara en los momentos emotivos;
  - la narración baja al cuadro inferior cuando la bestia está en escena, para no taparla.
- **Rendimiento**: todo el arte se pinta una sola vez (Canvas 2D). En el momento más pesado (fuego, horda, bestia y partículas) se mantienen 60 fps con el renderizado por CPU.

### 5.0.5 QA de armas × mejoras (v1.0)

Prueba automática que, para cada una de las 6 armas, aplica todas las cartas al máximo:
- 5★ y evolución;
- las 11 pasivas;
- 3 torretas;
- las 8 legendarias;
- las 6 habilidades.

Después juega una batalla real. **102 de 102 controles bien**:
- el daño, la velocidad, el crítico, el combo, la vida y la recarga suben;
- la perforación, los rebotes, el área y los perdigones aplican según el arma;
- las 6 evoluciones tienen efecto;
- Doble Trazo dispara 2 proyectiles (2 abanicos con la escopeta, 2 orbes con el bastón);
- las torretas disparan, Vampiro cura y Ejecutor remata;
- no hay errores.

### 5.1 Reglas de consistencia visual

| Elemento | Regla |
|---|---|
| Colores de identidad | Lino = **turquesa**; Dante = **rojo-naranja** (de niño) que se apaga a rojo oscuro; la Corona y todo lo corrupto = **violeta**; enemigos del bosque = **carmesí**; oro y recompensas = **amarillo**. |
| Números de Poder | Azul (10, la infancia), amarillo (el héroe), violeta con brillo (Dante y la Corona), rojo (otros jefes) y dorado `¿?` (Tío Clip). |
| Siluetas | Todos los personajes salen del mismo esqueleto (`gfx/stickman.ts`), con trazo negro grueso y ojos blancos angulares. Las diferencias están en los accesorios, no en el cuerpo. |
| Armaduras | Cada tier suma piezas sobre el anterior: bufanda → capucha y cuero → yelmo, hombreras y capa → oro, alas y halo → blanco y oro. |
| Jefes | Llevan un contorno brillante del color de su facción (rojo para Sir Hueco, violeta para la Corona). |
| Transparencias | Los personajes semitransparentes (fantasmas, siluetas) se dibujan primero en una textura y después se les aplica el alfa a la figura completa. |
| Texto | Narración y carteles en una caja oscura entre los números de Poder y las cabezas. El diálogo va abajo, con la frase clave en naranja. |

### 5.2 Cómo agregar contenido (escalabilidad)

| Quiero agregar… | Dónde |
|---|---|
| Un enemigo | Datos en `src/data/enemies.ts` y dibujo en `src/gfx/textures.ts` (`enemy()` o `humanoid()`). Para un comportamiento nuevo, un `case` en `BattleScene.updateEnemies`. |
| Un capítulo | `src/data/chapters.ts` (pool de enemigos, mini-jefe, jefe, fondo y música), un fondo en `gfx/backgrounds.ts` y sus escenas en `data/story.ts`. |
| Un personaje de historia | Un `CharId` en `data/story.ts` y su `Look` en `gfx/characters.ts`. |
| Un arma | `src/data/weapons.ts`, su ícono en `textures.ts` y el dibujo en mano en `drawWeapon()`. |
| Una armadura | `src/data/armor.ts` y sus piezas en `drawStickman()` según el `tier`. |
| Una carta o habilidad | `src/data/cards.ts` y su efecto en `BattleScene` (`applyCard` / `castSkill`). |

**Revisión visual**: `?scene=gallery:0` muestra todos los personajes, armaduras y armas, y
`?scene=gallery:1` todos los enemigos. Conviene revisar ahí cada pieza nueva antes de publicarla.

## 6. Arquitectura técnica

| Capa | Elección | Motivo |
|---|---|---|
| Motor | **Phaser 3.90** (estable) | 2D maduro, WebGL con respaldo Canvas, táctil, muy liviano |
| Lenguaje | **TypeScript** | Tipos para datos de balance y refactors seguros |
| Bundler | **Vite** | Arranque instantáneo y build estático |
| Web | **Vercel** (estático) y PWA instalable | Despliegue automático desde GitHub |
| Móvil | **Capacitor** | Envuelve el mismo build en una app nativa de Android/iOS |
| PC | Tauri o Electron (opcional) | Mismo build, para Steam o itch.io |
| Guardado | `localStorage` versionado | Simple. Migrable a Capacitor Preferences o a la nube. |

```
src/
  main.ts            configuración de Phaser (720×1280, Scale.FIT)
  config.ts          constantes, colores, fuentes
  core/              save.ts (guardado), audio.ts (sintetizador y música), format.ts, stats.ts
  data/              weapons, enemies, chapters, cards, armor, upgrades, story (todo el balance va aquí)
  gfx/               stickman.ts (render por poses), textures.ts, backgrounds.ts
  ui/                widgets reutilizables (botones, paneles)
  scenes/            Boot, Menu, Story, WeaponSelect, Battle, Results, Workshop, Settings
```

**Principios**: los datos van separados de la lógica (balancear = editar `src/data/`); el bucle de
juego es propio con `dt` (facilita la pausa, ×2 y un modo bot); no se usa física (colisiones por
distancia); hay *pools* de proyectiles y números de daño.

**Modo bot de pruebas**: `?bot=1&ch=c2&w=arco&meta=8&armor=1&speed=60&canvas=1` juega solo (marca,
usa habilidades, elige cartas) con mejoras simuladas en memoria (nunca toca el guardado) y deja el
resultado en `window.__bot`. Para pruebas solamente; no es una mecánica del juego.

### 6.1 Cómo pasarlo a celular (Capacitor)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Juramento de Tinta" com.tuquina.juramento --web-dir dist
npm run build && npx cap add android && npx cap sync
npx cap open android   # compilar desde Android Studio
```

El juego ya está preparado para eso: entrada solo táctil, escala FIT con letterbox, pausa
automática al perder el foco (`visibilitychange`), vibración con `navigator.vibrate`, sin
dependencias de servidor y con la orientación vertical fijada en el manifest.

---

## 7. Monetización futura (no incluida en el MVP)

Principio: **nunca pay-to-win**. Lo que se pueda comprar acelera o es cosmético.

| Modelo | Detalle |
|---|---|
| Anuncio con recompensa (opcional) | ×2 oro al final de la partida y 1 revivir por partida |
| Cosméticos | Skins de bufanda, colores de tinta, efectos de proyectil, auras |
| Pase del Juramento | Pase de temporada con recompensas cosméticas y de oro |
| Pack sin anuncios | Compra única |

Gancho técnico previsto: una interfaz `RewardService` (`showRewarded(): Promise<boolean>`) con
implementación vacía en web y AdMob/IAP mediante plugins de Capacitor.

---

## 8. Alcance

### Versión 1.0 (primera versión jugable completa)
- [x] Prólogo de dos partes con la noche del ataque animada, y escenas de intro y final por capítulo
- [x] 6 capítulos de 20 oleadas con mini-jefe y jefe, el duelo final contra Dante con dos finales, y el Abismo infinito
- [x] 6 armas con evolución, 6 habilidades, 11 pasivas, 8 legendarias y torretas (todas verificadas con QA automático)
- [x] Economía con topes por progreso (sin farmeo temprano) y aliados con radio en batalla
- [x] Taller: 7 mejoras permanentes, niveles de arma y 5 armaduras visibles
- [x] Poder, Rango y guardado local
- [x] Audio y música procedurales
- [x] Ajustes (música, efectos, vibración) y borrado de progreso

### Próximas versiones
1. ~~Cap. 4–6 y el duelo final contra Dante con decisión~~ ✅ (v0.3). Próximo: Temporada 2 (¿qué hay más allá de La Mancha?).
2. Misiones diarias y logros.
3. Arte refinado (sprites o Spine) y música compuesta.
4. Build de Capacitor publicado en Play Store.
5. Guardado en la nube, ranking del Abismo y PvP asíncrono ("roba el trazo" de fantasmas de otros jugadores).
6. Monetización (sección 7).

### Métricas objetivo (cuando haya analítica)
- Sesión media de 10 min o más; el 60 % termina el Cap. 1 en su primera sesión.
- Retención D1 40 %, D7 15 %.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Rendimiento con muchos enemigos en móviles de gama baja | Texturas pregeneradas, *pools*, sin física, límite de números de daño en pantalla |
| Balance (capítulos 2 y 3 demasiado duros o fáciles) | Datos centralizados en `src/data/` y modo bot para simular |
| Similitud con juegos existentes del género | Nombres, historia, personajes y arte propios, generados desde cero |
| Audio bloqueado por el navegador hasta la primera interacción | El `AudioContext` se desbloquea en el primer toque |
