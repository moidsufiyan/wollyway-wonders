$srcPath = "src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.tsx","*.ts"

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "<Link\s+to=") {
        $content = $content -replace '<Link\s+to=', '<Link href='
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Updated Link props in: $($file.Name)"
    }
}
Write-Host "Done. $count files processed."
