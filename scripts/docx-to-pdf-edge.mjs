// DOCX -> HTML (mammoth) -> PDF (Edge headless --print-to-pdf)
// Lightweight fallback when Word COM hangs and LibreOffice isn't available.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, stat, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";

const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const cowork = "C:\\Users\\Jesus\\Desktop\\En Escritorio\\IA\\Cowork";
const srcMain = path.join(cowork, "outputs", "v2_servicios_completos");
const srcKodak = path.join(cowork, "outputs");
const outDir = path.join(repoRoot, "public", "muestras");

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const edge = edgeCandidates.find((p) => existsSync(p));
if (!edge) {
  console.error("Edge no encontrado en rutas estándar.");
  process.exit(1);
}

const mappings = [
  { docx: path.join(srcMain, "Muestra_Articulo_SEO_Cafe_Frio.docx"), pdf: "articulo-cafe-frio.pdf", titulo: "Café frío en casa: 5 métodos que sí funcionan" },
  { docx: path.join(srcMain, "Muestra_Articulo_SEO_Regla_2_Minutos.docx"), pdf: "articulo-regla-2-minutos.pdf", titulo: "La regla de los 2 minutos para vencer la procrastinación" },
  { docx: path.join(srcMain, "Muestra_Copys_Redes_Molino_Cafe.docx"), pdf: "copys-molino-cafe.pdf", titulo: "Molino de Café · lote para Instagram" },
  { docx: path.join(srcKodak, "Muestra_Guion_Kodak.docx"), pdf: "guion-kodak.pdf", titulo: "Kodak: el gigante que no supo ver el futuro digital" },
  { docx: path.join(srcKodak, "Muestra_Guion_Torre_Eiffel.docx"), pdf: "guion-torre-eiffel.pdf", titulo: "La Torre Eiffel: la construcción que París odió antes de amar" },
];

const tmpDir = path.join(repoRoot, ".tmp-pdf-build");
await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });
await mkdir(outDir, { recursive: true });

function wrap(html, titulo) {
  // Tipografía alineada con la landing (Editorial Scientific) sin requests externas:
  // Edge headless tiene fuentes del sistema; usamos Georgia (display) + system-ui (sans).
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(titulo)}</title>
<style>
  @page { size: A4; margin: 22mm 20mm 22mm 20mm; }
  html, body { background: #fff; color: #1a1a1a; }
  body {
    font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 11.5pt;
    line-height: 1.55;
    margin: 0;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: "Playfair Display", "Cambria", "Georgia", serif;
    color: #1a1a1a;
    line-height: 1.2;
    margin: 1.4em 0 0.5em;
    page-break-after: avoid;
  }
  h1 { font-size: 22pt; margin-top: 0; }
  h2 { font-size: 16pt; }
  h3 { font-size: 13pt; }
  h4 { font-size: 12pt; }
  p { margin: 0 0 0.7em; }
  ul, ol { margin: 0 0 0.9em 1.4em; padding: 0; }
  li { margin-bottom: 0.25em; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  blockquote {
    border-left: 3px solid #d4916e;
    margin: 1em 0;
    padding: 0.2em 0 0.2em 1em;
    color: #3d3d3d;
  }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  td, th { border: 1px solid #d8d2c9; padding: 6px 9px; vertical-align: top; }
  hr { border: none; border-top: 1px solid #d8d2c9; margin: 1.6em 0; }
  a { color: #1a1a1a; text-decoration: underline; }
  .doc-header {
    border-bottom: 1px solid #d8d2c9;
    padding-bottom: 10mm;
    margin-bottom: 8mm;
  }
  .doc-header .caption {
    font-family: "IBM Plex Mono", "Consolas", monospace;
    font-size: 9pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b6b6b;
    margin: 0 0 6mm;
  }
  .doc-header h1 { margin: 0; font-size: 22pt; }
</style>
</head>
<body>
  <header class="doc-header">
    <p class="caption">Muestra · jmredactor.pages.dev</p>
    <h1>${escapeHtml(titulo)}</h1>
  </header>
  <main>${html}</main>
</body>
</html>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

let sequenceCounter = 0;
async function convertOne(m) {
  const label = path.basename(m.docx);
  console.log(`Convirtiendo: ${label}`);

  const { value: rawHtml, messages } = await mammoth.convertToHtml({ path: m.docx });
  if (messages?.length) {
    const warnings = messages.filter((x) => x.type === "warning").length;
    if (warnings) console.log(`  · mammoth warnings: ${warnings}`);
  }
  const fullHtml = wrap(rawHtml, m.titulo);
  const htmlPath = path.join(tmpDir, m.pdf.replace(/\.pdf$/, ".html"));
  await writeFile(htmlPath, fullHtml, "utf8");

  // Edge headless --print-to-pdf. Usamos --user-data-dir único por archivo para evitar
  // conflictos si hay otra instancia de Edge abierta (sin esto se queja).
  const userData = path.join(tmpDir, `udata-${Date.now()}-${++sequenceCounter}`);
  const pdfPath = path.join(outDir, m.pdf);
  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "$1:");

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    `--user-data-dir=${userData}`,
    `--print-to-pdf=${pdfPath}`,
    "--print-to-pdf-no-header",
    fileUrl,
  ];

  const start = Date.now();
  await execFileP(edge, args, { timeout: 90_000, windowsHide: true });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const st = await stat(pdfPath);
  console.log(`  OK: ${m.pdf}  (${(st.size / 1024).toFixed(1)} KB, ${elapsed}s)`);
}

const t0 = Date.now();
let okCount = 0;
const fails = [];
for (const m of mappings) {
  try {
    await convertOne(m);
    okCount++;
  } catch (err) {
    console.error(`  FAIL ${m.pdf}: ${err.message}`);
    fails.push({ pdf: m.pdf, error: err.message });
  }
}

await rm(tmpDir, { recursive: true, force: true });

const total = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nTotal: ${okCount}/${mappings.length} OK en ${total}s`);
if (fails.length) {
  console.log("FAILS:", JSON.stringify(fails, null, 2));
  process.exit(1);
}
