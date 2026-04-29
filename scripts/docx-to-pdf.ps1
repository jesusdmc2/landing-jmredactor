## DOCX -> PDF using Microsoft Word COM
## Usage: powershell -File scripts/docx-to-pdf.ps1

$ErrorActionPreference = "Stop"

$cowork = "C:\Users\Jesus\Desktop\En Escritorio\IA\Cowork"
$src    = Join-Path $cowork "outputs\v2_servicios_completos"
$srcKodak = Join-Path $cowork "outputs"

$out    = Join-Path $PSScriptRoot "..\public\muestras"
$out    = (Resolve-Path -LiteralPath $out -ErrorAction SilentlyContinue).Path
if (-not $out) {
    $out = Join-Path $PSScriptRoot "..\public\muestras"
    New-Item -Path $out -ItemType Directory -Force | Out-Null
    $out = (Resolve-Path -LiteralPath $out).Path
}

$mappings = @(
    @{ docx = (Join-Path $src "Muestra_Articulo_SEO_Cafe_Frio.docx"); pdf = "articulo-cafe-frio.pdf" },
    @{ docx = (Join-Path $src "Muestra_Articulo_SEO_Regla_2_Minutos.docx"); pdf = "articulo-regla-2-minutos.pdf" },
    @{ docx = (Join-Path $src "Muestra_Copys_Redes_Molino_Cafe.docx"); pdf = "copys-molino-cafe.pdf" },
    @{ docx = (Join-Path $srcKodak "Muestra_Guion_Kodak.docx"); pdf = "guion-kodak.pdf" },
    @{ docx = (Join-Path $srcKodak "Muestra_Guion_Torre_Eiffel.docx"); pdf = "guion-torre-eiffel.pdf" }
)

Write-Output "Iniciando Word..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0  # wdAlertsNone

try {
    foreach ($m in $mappings) {
        $docxPath = $m.docx
        $pdfPath  = Join-Path $out $m.pdf

        if (-not (Test-Path -LiteralPath $docxPath)) {
            Write-Output ("SKIP: " + $docxPath)
            continue
        }

        Write-Output ("Convirtiendo: " + (Split-Path $docxPath -Leaf))

        $doc = $word.Documents.Open($docxPath, $false, $true)  # ReadOnly = true
        try {
            # 17 = wdFormatPDF
            $doc.ExportAsFixedFormat($pdfPath, 17)  # wdExportFormatPDF
        } finally {
            $doc.Close([ref]$false)  # SaveChanges = false
        }
        Write-Output ("OK: " + $m.pdf)
    }
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Output "Listo."
