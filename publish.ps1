# Публикация портфолио на GitHub Pages. Запуск: двойной клик по publish.cmd
$ErrorActionPreference = 'Continue'
Set-Location -Path $PSScriptRoot
function Step($t) { Write-Host "`n== $t" -ForegroundColor Cyan }
function Fail($t) { Write-Host "`nОШИБКА: $t" -ForegroundColor Red; Read-Host "Нажмите Enter, чтобы закрыть"; exit 1 }

try {
  Step "1/6 Проверяю GitHub CLI"
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI не найден — ставлю через winget (1–2 минуты)..."
    winget install --id GitHub.cli -e --silent --accept-package-agreements --accept-source-agreements | Out-Host
    $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') + ';C:\Program Files\GitHub CLI'
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Fail "GitHub CLI не установился. Перезапустите publish.cmd или поставьте его с cli.github.com." }
  }
  Write-Host "GitHub CLI на месте."

  Step "2/6 Вход в GitHub"
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Сейчас откроется браузер. Скопируйте одноразовый код из этого окна, вставьте на странице GitHub и подтвердите вход." -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { Fail "Вход в GitHub не завершён. Запустите publish.cmd ещё раз." }
  }
  gh auth setup-git | Out-Null
  $u = (gh api user -q .login).Trim()
  Write-Host "Вошли как $u."

  Step "Проверяю сборку сайта"
  if (-not (Test-Path 'node_modules')) { npm install --no-audit --no-fund | Out-Host }
  npm run build | Out-Host
  if ($LASTEXITCODE -ne 0) { Fail "Сайт не собирается. Скопируйте первую ошибку выше и пришлите Claude — публикацию остановил, чтобы не выложить сломанную версию." }

  Step "3/6 Готовлю workflow деплоя и коммит"
  if ((Test-Path 'scripts\deploy.yml') -and -not (Test-Path '.github\workflows\deploy.yml')) {
    New-Item -ItemType Directory '.github\workflows' -Force | Out-Null
    Move-Item 'scripts\deploy.yml' '.github\workflows\deploy.yml'
  }
  if (-not (Test-Path '.git')) { git init -b main | Out-Null }
  git add -A
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { git commit -m "Портфолио: обновление" | Out-Host }

  $repo = "$u.github.io"
  Step "4/6 Репозиторий $repo"
  $hasRemote = (git remote) -contains 'origin'
  gh repo view "$u/$repo" 2>$null | Out-Null
  $exists = ($LASTEXITCODE -eq 0)
  if (-not $exists) {
    gh repo create $repo --public --source . --remote origin --push | Out-Host
    if ($LASTEXITCODE -ne 0) { Fail "Не удалось создать репозиторий $repo." }
  } else {
    if (-not $hasRemote) { git remote add origin "https://github.com/$u/$repo.git" }
    git push -u origin main | Out-Host
    if ($LASTEXITCODE -ne 0) { Fail "Push не прошёл. Если в репозитории на GitHub уже есть файлы, напишите Claude — разберёмся." }
  }

  Step "5/6 Включаю GitHub Pages (источник — GitHub Actions)"
  gh api -X POST "repos/$u/$repo/pages" -f build_type=workflow 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { gh api -X PUT "repos/$u/$repo/pages" -f build_type=workflow 2>$null | Out-Null }
  Write-Host "Pages включён."

  Step "6/6 Жду сборку сайта (обычно 1–3 минуты)"
  Start-Sleep -Seconds 8
  gh workflow run deploy.yml -R "$u/$repo" 2>$null | Out-Null
  Start-Sleep -Seconds 10
  $runId = gh run list -R "$u/$repo" --event workflow_dispatch --limit 1 --json databaseId -q '.[0].databaseId'
  if ($runId) {
    gh run watch $runId -R "$u/$repo" --exit-status | Out-Host
    if ($LASTEXITCODE -ne 0) {
      Write-Host "`nСборка упала. Открываю лог — скопируйте первую красную ошибку и пришлите Claude." -ForegroundColor Red
      Start-Process "https://github.com/$u/$repo/actions"
      Read-Host "Нажмите Enter, чтобы закрыть"; exit 1
    }
  }

  Write-Host "`nГотово! Сайт: https://$u.github.io" -ForegroundColor Green
  Start-Process "https://$u.github.io"
  Read-Host "Нажмите Enter, чтобы закрыть"
}
catch { Fail $_.Exception.Message }
