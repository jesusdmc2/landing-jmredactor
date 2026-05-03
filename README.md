# Landing — Jesús Montalvo (redactor freelance)

Landing personal estática construida con Astro 5 + Tailwind v4 y desplegada en Cloudflare Pages. URL pública: **https://jmredactor.pages.dev**.

## Stack

- **Astro 6** (static, cero JS por defecto).
- **Tailwind CSS v4** (utility-first vía vite plugin).
- **Fontsource** (Playfair Display, Inter Variable, IBM Plex Mono — self-hosted, sin requests a Google Fonts).
- **Sharp** (optimización de imágenes a webp).
- **@astrojs/sitemap** (sitemap.xml automático).

Cero costo recurrente. Cero cookies. Cero analytics invasivo.

## Estructura

```
src/
├── layouts/Base.astro         # html/head/og/meta
├── pages/index.astro          # composición de las 7 secciones
├── components/
│   ├── Hero.astro             # 1. Hero con banner + 2 CTAs
│   ├── Sobre.astro            # 2. Sobre mí (texto verbatim del Kit V2)
│   ├── Servicios.astro        # 3. Wrapper de los 3 servicios
│   ├── ServicioCard.astro     #    Card reutilizable
│   ├── Muestras.astro         # 4. Wrapper de las 5 muestras
│   ├── MuestraCard.astro      #    Card reutilizable
│   ├── ComoTrabajo.astro      # 5. 4 pasos del proceso
│   ├── CtaFinal.astro         # 6. CTA final oscuro
│   └── Footer.astro           # 7. Footer con avatar + contacto
└── styles/global.css          # Tokens Editorial Scientific + utilities

public/
├── img/                       # webp optimizados de banner, avatar, portadas
├── muestras/                  # 5 .pdf descargables (regenerados con scripts/docx-to-pdf-edge.mjs)
├── og-image.png               # 1200×630 para WhatsApp/LinkedIn
├── favicon.svg / .ico
└── robots.txt
```

## Comandos

```sh
npm install            # instala deps
npm run dev            # dev server en http://localhost:4321
npm run build          # build estático a ./dist
npm run preview        # preview del build local
node scripts/optimize-assets.mjs   # regenera webp/og/favicons desde Cowork
```

## Sistema visual: Editorial Scientific

Tokens en `src/styles/global.css` heredados del diseño Pencil:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | `#f3ebe2` | Fondo Warm Linen |
| `--color-surface-inverse` | `#1a1a1a` | Cards oscuras, footer |
| `--color-fg` | `#1a1a1a` | Texto principal |
| `--color-fg-secondary` | `#3d3d3d` | Texto cuerpo |
| `--color-fg-muted` | `#6b6b6b` | Captions, metadata |
| `--color-accent` | `#d4916e` | CTAs y `FIG. 0XX` (úsalo poco) |
| `--font-display` | Playfair Display | Headings |
| `--font-sans` | Inter Variable | Cuerpo |
| `--font-mono` | IBM Plex Mono | Captions, metadatos |

## Cómo editar el copy

Toda la copia vive en los componentes `src/components/*.astro`. El texto crítico (frente a clientes) está en:

- **Sobre mí**: `src/components/Sobre.astro` — 3 párrafos. Pre-aprobado por humanizalo (cero em-dashes, cero corporate). Si cambias, pasa los párrafos por la skill humanizalo antes.
- **Servicios**: `src/components/Servicios.astro` — array `servicios` con título, descripción, entregables, nichos.
- **Muestras**: `src/components/Muestras.astro` — array `muestras` con título, descripción, longitud, imagen, archivo.
- **Cómo trabajo**: `src/components/ComoTrabajo.astro` — array `pasos`.

## Cómo desplegar un cambio

```sh
git add .
git commit -m "fix(copy): ajusto bullet en servicio 02"
git push origin main
```

Cloudflare Pages detecta el push y rebuilda automáticamente. La URL `https://jmredactor.pages.dev` se actualiza en ~1-2 minutos.

## Cómo añadir muestra nueva

1. Mantén el `.docx` fuente en Cowork (no lo subas a `public/muestras/`).
2. Añádelo al array `mappings` en `scripts/docx-to-pdf-edge.mjs` y corre `node scripts/docx-to-pdf-edge.mjs` desde la raíz del repo. Genera el `.pdf` directo en `public/muestras/`.
3. Pon la portada en `public/img/portada-<slug>.webp` (usa `sharp` para optimizar; ver `scripts/optimize-assets.mjs`).
4. Añade un objeto al array `muestras` en `src/components/Muestras.astro`:

```js
{
  numero: "M.06",
  tipo: "GUION YOUTUBE",
  titulo: "Tu título",
  descripcion: "Descripción de 1-2 líneas.",
  longitud: "≈ 1.500 palabras",
  imagen: "/img/portada-tu-slug.webp",
  archivo: "/muestras/tu-slug.pdf",
}
```

5. Commit + push.

### Conversión DOCX → PDF (notas operativas)

El script `scripts/docx-to-pdf-edge.mjs` usa `mammoth` (DOCX → HTML) + Microsoft Edge headless (`--headless=new --print-to-pdf`). Tarda ~8s para los 5 archivos y no requiere instalar Chromium ni LibreOffice. Mantiene la tipografía Editorial Scientific en el PDF.

Si Edge no está disponible o quieres reusar Word, `scripts/docx-to-pdf.ps1` aplica `Unblock-File` + `AutomationSecurity = msoAutomationSecurityForceDisable` para evitar el cuelgue por Vista Protegida — pero en este equipo Word seguía colgando, así que la ruta confiable es la de Edge.

## REGLA DE ORO (no negociable)

Antes de añadir cualquier copy nuevo a la landing:

1. Cero invención de experiencia, métricas o testimonios.
2. Cero em-dashes (`—`).
3. Cero frases corporate ("reto aceptado", "quedo atento", "estimado", "fundamental destacar", "en el dinámico", "rápido claro y efectivo").
4. Cero referencias al método interno ("humanizalo", "procesado con IA", "Claude").
5. Si una muestra no tiene archivo descargable real, no aparece.

## Pendientes conocidos

- [ ] **Cloudflare Web Analytics token** en `src/layouts/Base.astro` (placeholder marcado con `TODO:`). Configurar tras primer deploy.
- [ ] **Custom domain** (`jesusmontalvo.com` u similar) cuando haya runway para el registro (~USD 10/año).

## Referencias internas (sistema operativo Cowork)

- Plan completo: `~/.claude/plans/glimmering-frolicking-narwhal.md`.
- Reglas de estilo y REGLA DE ORO: `Cowork/CLAUDE.md`.
- Texto base "Sobre mí": `Cowork/outputs/Soyfreelancer_Acerca_de_mi.md`.
- Assets fuente: `Cowork/v2_servicios_completos/landing_assets/` y `Cowork/outputs/v2_servicios_completos/`.
