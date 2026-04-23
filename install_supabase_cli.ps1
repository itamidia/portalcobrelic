# Script para instalar Supabase CLI
Write-Host "Baixando Supabase CLI..."
$url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
$output = "supabase.exe"

try {
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host "Supabase CLI baixado com sucesso!"
    Write-Host "Para usar: .\supabase.exe"
} catch {
    Write-Host "Erro ao baixar: $_"
    Write-Host "Use a Solução 1 (Dashboard) para deploy manual"
}
