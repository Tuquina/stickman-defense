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
| **Sir Hueco** | Jefe del Capítulo 2 | Caballero gigante con el yelmo vacío. Fue la primera víctima de Dante. |
| **Eco de Dante** | Jefe del Capítulo 3 | Sombra de Dante creada por la Corona: cuerpo de tinta violeta, sin capa ni bufanda, ojos brillantes y la misma corona. Repite "100.000" como un disco rayado. |

### 2.3 ¿Por qué Dante se volvió tan fuerte?

De niños, una Mancha atacó su aldea. Dante no pudo proteger a Lino y casi lo pierde. Obsesionado
con no volver a ser débil, encontró en las ruinas del castillo la **Corona Hueca**: un artefacto que
**absorbe el Trazo de quien derrotas**. El precio, que Dante no conoce, es que cada vez que la
usa, la Corona **borra uno de sus vínculos**. Al llegar a 100.000 ya no recuerda el juramento.

Esto le da a la venganza un giro trágico: Lino quiere hacerle pagar, pero cada capítulo revela que
el Dante que lo humilló *ya no es del todo Dante*. Queda abierto para el arco final (fuera del
MVP): **derrotarlo o liberarlo**.

### 2.4 Estructura narrativa (MVP)

| Escena | Cuándo | Contenido |
|---|---|---|
| **Prólogo I — El Juramento** | Primera vez que abres el juego | Lino y Dante niños, ambos con Poder **10**. "Prometamos que nunca nos vamos a abandonar." "No importa quién sea más fuerte. Siempre vamos a ser hermanos." |
| **Prólogo II — 5 años después** | Sigue al anterior | Lino **500**, Dante **100.000** con aura morada. "Hey, hermanito." / "Mi poder ya es de **¡CIEN MIL!**" / "¿Y el juramento?" / "Los juramentos son para los de nivel bajo." / "Eres basura, Lino." Lino en el suelo: "Esto… no va a quedar así." |
| Intro Cap. 1 | Antes de la 1ª partida | Tío Clip aparece: "Ese tipo te dejó en visto emocional. Te vendo poder. Cash. Bueno, oro." |
| Final Cap. 1 | Al vencer a la Reina Telaraña | Lino encuentra rastros de la Corona. Desbloquea **Capucha de Vigía** y la **Escopeta**. |
| Intro/Final Cap. 2 | Ruinas del Castillo | Sir Hueco revela que la Corona absorbe trazos y *borra vínculos*. Desbloquea **Armadura de Caballero** y el **Shuriken**. |
| Intro/Final Cap. 3 | Ciudadela de Ceniza | Duelo contra el Eco de Dante. Al caer: "¿Juramento…? No recuerdo ningún juramento." **Cliffhanger.** Desbloquea el **Abismo** (modo infinito). |

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

### 3.3 Partida (roguelite)

1. **Seleccionar arma**: se elige 1 de las armas desbloqueadas.
2. **20 oleadas** por capítulo. Cada oleada dura unos 18–25 s y la siguiente empieza aunque
   queden enemigos (presión). La **oleada 10** trae un **mini-jefe** y la **20** al **jefe**.
3. Los enemigos sueltan **gotas de XP**. Al subir de nivel el juego se pausa y eliges **1 de 3 cartas**.
4. **Hitos de nivel (Lv.10, Lv.25, Lv.40)**: aparece un **Cofre de Hito** con 3 cartas
   **Legendarias** (incluida la **Evolución** del arma si está en 5★).
5. Ganas al derrotar al jefe. Pierdes si la barricada llega a 0. **Siempre te quedas con el oro**
   ganado, así que perder también hace avanzar.

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

### 3.5 Armas

| Arma | Estilo | Extra por ★ | Evolución |
|---|---|---|---|
| **Arco** | Flecha rápida, 10 % combo | +1 perforación en 3★ y 5★ | **Arco del Alba**: cada flecha se divide en 3 al impactar |
| **Pistola** | Cadencia muy alta, daño bajo, 15 % combo | +5 % combo | **Pistolas Gemelas**: ×2 cadencia |
| **Bastón Oráculo** | Orbe teledirigido que explota en área, +15 % daño de habilidades | +área | **Bastón Supremo**: el orbe encadena 3 rayos |
| **Escopeta** (se desbloquea en Cap. 1) | 5 perdigones en abanico | +1 perdigón | **Cañón Borrón**: perdigones explosivos |
| **Shuriken** (se desbloquea en Cap. 2) | Rebota entre 2 enemigos | +1 rebote | **Estrella Infinita**: 6 rebotes, regresa |

### 3.6 Enemigos y escenarios

| Capítulo | Escenario | Enemigos | Mini-jefe (oleada 10) | Jefe (oleada 20) |
|---|---|---|---|---|
| **1 · Bosque Sombrío** | Bosque verde azulado, troncos gigantes, rayos de luz y lianas | Araña Carmesí (rápida, enjambre), Escarabajo Acorazado (tanque con armadura), Seta Saltarina (avanza a saltos) | Araña Madre (pone arañitas) | **Reina Telaraña**: telarañas que ralentizan tu ataque e invocaciones |
| **2 · Ruinas del Castillo** | Murallas de piedra al atardecer, torres rotas | Esqueleto de Tinta, Murciélago (zigzag), Caballero Hueco (armadura 50 %), Arquero (se para y dispara a la barricada) | Gárgola (vuela) | **Sir Hueco**: embiste e invoca esqueletos |
| **3 · Ciudadela de Ceniza** | Desierto morado-anaranjado, pilares rotos, cristales violetas | Mancha (se divide al morir), Sombra (embestidas veloces), Brujo Vacío (cura a sus aliados), Gólem de Ceniza (tanque) | Guardián de la Corona | **Eco de Dante**: se teletransporta, 3 fases, invoca sombras |
| **∞ · El Abismo** | Tinta violeta y gotas que caen | Mezcla de todos, escalado infinito | Jefe cada 10 oleadas | Récord de oleada |

**Escalado**: vida = base × (1 + 0,14·(oleada−1)) × multiplicador del capítulo (1 / 2,3 / 4,4).
Jefes: base × (1 + 0,05·(oleada−1)) × capítulo. En el Abismo: multiplicador 2,2 y además ×1,35 cada 5
oleadas (crecimiento exponencial, para que haya un techo de récord).

**Oro**: monedas = (1 + 0,1·oleada) × multiplicador de oro (Cap. 1/2/3/Abismo = 1 / 1,6 / 2,4 / 1,5),
más 2·oleada por oleada superada y un bonus de victoria. A partir de la oleada 20 el valor deja de crecer
(para que el Abismo no rompa la economía).

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

**Mejoras permanentes** (costo = base × 1,3^nivel)

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

### 4.3 Armaduras (cambian la silueta del personaje)

| Tier | Nombre | Cómo se desbloquea | Bonus | Aspecto |
|---|---|---|---|---|
| 0 | Bufanda del Juramento | Inicio | — | Bufanda turquesa |
| 1 | Capucha de Vigía | Vencer el Cap. 1 | +10 % daño, +15 % vida | Capucha azul, cuello de piel, brazaletes de cuero |
| 2 | Armadura de Caballero | Vencer el Cap. 2 | +25 % daño, +30 % vida | Yelmo plateado con visera, hombreras con filo dorado, capa azul |
| 3 | Paladín de Tinta | Vencer el Cap. 3 + Rango 10 | +45 % daño, +50 % vida | Armadura dorada, cresta con alas, aura celeste |
| 4 | Heredero del Juramento | Llegar a la oleada 25 del Abismo | +80 % daño, +80 % vida | Blanco y oro, bufanda luminosa, aura intensa |

---

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

### MVP (esta versión)
- [x] Prólogo de dos partes y escenas de intro y final por capítulo
- [x] 3 capítulos de 20 oleadas con mini-jefe y jefe, más el Abismo infinito
- [x] 5 armas con evolución, 6 habilidades, 11 pasivas, 8 legendarias y torretas
- [x] Taller: 7 mejoras permanentes, niveles de arma y 5 armaduras visibles
- [x] Poder, Rango y guardado local
- [x] Audio y música procedurales
- [x] Ajustes (música, efectos, vibración) y borrado de progreso

### Próximas versiones
1. **Cap. 4–6** y el duelo final contra Dante (Poder 100.000) con decisión: venganza o liberación.
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
