## DOCX -> PDF using LibreOffice headless (fallback when Word COM hangs).
## Usage: powershell -File scripts/docx-to-pdf-soffice.ps1

$ErrorActionPreference = "Stop"

$soffice = $null
foreach ($p in @(
    "C:\Program Files\LibreOffice\program\soffice.exe",
    "C:\Program Files (x86)\LibreOffice\program\soffice.exe"
)) {
    if (Test-Path -LiteralPath $p) { $soffice = $p; break }
}
if (-not $soffice) { throw "soffice.exe no encontrado" }

$cowork   = "C:\Users\Jesus\Desktop\En Escritorio\IA\Cowork"
$src      = Join-Path $cowork "outputs\v2_servicios_completos"
$srcKodak = Join-Path $cowork "outputs"

$out = Join-Path $PSScriptRoot "..\public\muestras"
$out = (Resolve-Path -LiteralPath $out).Path

$tmp = Join-Path $env:TEMP ("soffice-pdf-" + [guid]::NewGuid().ToString())
New-Item -Path $tmp -ItemType Directory -Force | Out-Null

$mappings = @(
    @{ docx = (Join-Path $src "Muestra_Articulo_SEO_Cafe_Frio.docx");      pdf = "articulo-cafe-frio.pdf" },
    @{ docx = (Join-Path $src "Muestra_Articulo_SEO_Regla_2_Minutos.docx"); pdf = "articulo-regla-2-minutos.pdf" },
    @{ docx = (Join-Path $src "Muestra_Copys_Redes_Molino_Cafe.docx");     pdf = "copys-molino-cafe.pdf" },
    @{ docx = (Join-Path $srcKodak "Muestra_Guion_Kodak.docx");            pdf = "guion-kodak.pdf" },
    @{ docx = (Join-Path $srcKodak "Muestra_Guion_Torre_Eiffel.docx");     pdf = "guion-torre-eiffel.pdf" }
)

try {
    foreach ($m in $mappings) {
        if (-not (Test-Path -LiteralPath $m.docx)) {
            Write-Output ("SKIP: " + $m.docx)
            continue
        }
        Write-Output ("Convirtiendo: " + (Split-Path $m.docx -Leaf))

        & $soffice --headless --convert-to "pdf:writer_pdf_Export" --outdir $tmp $m.docx | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "soffice exit $LASTEXITCODE en $($m.docx)" }

        $base = [System.IO.Path]::GetFileNameWithoutExtension($m.docx)
        $generated = Join-Path $tmp ($base + ".pdf")
        if (-not (Test-Path -LiteralPath $generated)) {
            throw "PDF generado no encontrado: $generated"
        }
        $finalPath = Join-Path $out $m.pdf
        Move-Item -LiteralPath $generated -Destination $finalPath -Force
        Write-Output ("OK: " + $m.pdf)
    }
} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "Listo."
