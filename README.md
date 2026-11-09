# Juramento de Tinta

Juego de **defensa por oleadas + roguelite** con stickmen, vertical y para jugar con una mano. Se juega
directo en el navegador y está preparado para portarse a Android/iOS con Capacitor.

> Lino (Poder 500) contra su hermano Dante (Poder 100.000), que lo traicionó por la Corona Hueca.
> *"Esto no va a quedar así."*

📄 **Diseño completo:** [`docs/GDD.md`](docs/GDD.md)

## Jugar en local

```bash
npm install
npm run dev        # http://localhost:5173 (también accesible desde el celular en la misma red)
npm run build      # build estático en dist/
npm run preview    # sirve dist/
```

## Stack

- **Phaser 3.90** + **TypeScript** + **Vite**
- Todo el arte es **vectorial y generado por código** (stickmen por poses, armaduras en capas,
  fondos y enemigos generados al arrancar). La música y los efectos se **sintetizan con WebAudio**.
  No hay archivos de assets.
- Guardado en `localStorage`.

## Estructura

```
src/
  core/    save, audio (sintetizador + secuenciador), stats, format, debug
  data/    armas, enemigos, capítulos, cartas, armaduras, mejoras, historia  ← balance aquí
  gfx/     stickman.ts (render por poses), textures.ts, backgrounds.ts, characters.ts
  ui/      widgets (botones, paneles)
  scenes/  Boot, Menu, Chapters, WeaponSelect, Story, Battle, Results, Workshop, Settings
```

## Despliegue

- **Vercel**: importa el repo; `vercel.json` ya define `npm run build` → `dist/`.
- **Android/iOS**: ver la sección 6.1 del GDD (Capacitor).

## Pruebas de balance (bot)

```
http://localhost:4173/?bot=1&canvas=1&ch=c1&w=arco&meta=0&speed=60
```

`ch` = c1|c2|c3|abismo · `w` = arco|pistola|baston|escopeta|shuriken · `meta` = nivel simulado de
mejoras · `armor` = tier · `speed` = pasos de simulación por frame. El resultado queda en `window.__bot`.
