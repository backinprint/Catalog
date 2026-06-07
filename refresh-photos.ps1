$ErrorActionPreference = "Stop"

$photoDir = Join-Path $PSScriptRoot "01_ITEM_PHOTOS"
$manifestPath = Join-Path $PSScriptRoot "public\js\photo-manifest.js"
$csvPath = Join-Path $PSScriptRoot "products.csv"
$productDataPath = Join-Path $PSScriptRoot "public\js\products-data.js"
$extensions = @(".jpg", ".jpeg", ".png", ".webp")

function CsvEscape($value) {
  $text = [string]$value
  if ($text -match '[",\r\n]') {
    return '"' + $text.Replace('"', '""') + '"'
  }
  return $text
}

function JsEscape($value) {
  return ([string]$value).Replace("\", "\\").Replace('"', '\"')
}

$photos = Get-ChildItem -Path $photoDir -File |
  Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
  Sort-Object Name |
  Select-Object -ExpandProperty Name

$manifest = "window.PRODUCT_PHOTOS = @(" + [Environment]::NewLine
$manifest += ($photos | ForEach-Object { "  ""$($_.Replace('"', '\"'))""" }) -join ("," + [Environment]::NewLine)
$manifest += [Environment]::NewLine + ");" + [Environment]::NewLine
$manifest = $manifest.Replace("@(", "[")
$manifest = $manifest.Replace(");", "];")
Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8

$existing = @{}
if (Test-Path $csvPath) {
  Import-Csv -Path $csvPath | ForEach-Object {
    if ($_.filename) {
      $existing[$_.filename] = $_
    }
  }
}

$rows = @("filename,item_name,item_number,item_price")
$dataLines = @("window.PRODUCT_DATA = {")
$index = 0
foreach ($photo in $photos) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($photo)
  $parts = $base -split "_"
  $fallbackNumber = $parts[0]
  $fallbackName = ($parts | Select-Object -Skip 1) -join " "
  $record = $existing[$photo]
  $name = if ($record -and $record.item_name) { $record.item_name } else { $fallbackName }
  $number = if ($record -and $record.item_number) { $record.item_number } else { $fallbackNumber }
  $price = if ($record -and $record.item_price) { $record.item_price } else { "" }

  $rows += "$(CsvEscape $photo),$(CsvEscape $name),$(CsvEscape $number),$(CsvEscape $price)"

  $suffix = if ($index -lt ($photos.Count - 1)) { "," } else { "" }
  $dataLines += "  ""$(JsEscape $photo)"": {"
  $dataLines += "    ""itemName"": ""$(JsEscape $name)"","
  $dataLines += "    ""itemNumber"": ""$(JsEscape $number)"","
  $dataLines += "    ""itemPrice"": ""$(JsEscape $price)"""
  $dataLines += "  }$suffix"
  $index += 1
}
$dataLines += "};"

Set-Content -Path $csvPath -Value $rows -Encoding UTF8
Set-Content -Path $productDataPath -Value $dataLines -Encoding UTF8

Write-Host "Updated $($photos.Count) photos."
