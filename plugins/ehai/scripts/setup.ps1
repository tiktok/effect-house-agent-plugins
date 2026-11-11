# Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
# SPDX-License-Identifier: Apache-2.0
# First-time setup on Windows: checks the whole pinned runtime archive, then runs the rest on the Node and code inside it. A failure is left in runtime\.fetch-failed as well as on stdout: the starter that ran this in the background reads the file.
$ehaiHome = if ($env:EHAI_HOME) { $env:EHAI_HOME } else { "$env:USERPROFILE\.ehai" }
function Fail($why) { [Console]::Out.WriteLine("FAILED: $why"); try { New-Item -ItemType Directory -Force -Path "$ehaiHome\runtime" | Out-Null; [IO.File]::WriteAllText("$ehaiHome\runtime\.fetch-failed", $why) } catch {}; if ($tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }; exit 1 }
$env:EHAI_PUBLIC_PLUGIN_ROOT = $root = Split-Path -Parent $PSScriptRoot
$pin = (Get-Content -Raw -LiteralPath "$root\runtime\runtime.json" | ConvertFrom-Json).runtimes.'win32-x64'
$arch = $env:PROCESSOR_ARCHITEW6432; if (-not $arch) { $arch = $env:PROCESSOR_ARCHITECTURE }; if (-not $arch) { $arch = (Get-ItemProperty -LiteralPath 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment' -ErrorAction SilentlyContinue).PROCESSOR_ARCHITECTURE }   # the registry when the environment lacks it: Codex starts MCP servers without PROCESSOR_ARCHITECTURE
if (-not $pin -or $arch -ne 'AMD64') { Fail "this computer is not Windows x64 (architecture '$arch'), or the plugin names no runtime for it." }
$dir = "$ehaiHome\runtime\$($pin.version)\lib\node_modules\ehai"
if (-not (Test-Path -LiteralPath "$dir\bin\node.exe")) {
  $tmp = (New-Item -ItemType Directory -Force -Path "$env:TEMP\ehai-setup-$PID").FullName; $dir = "$tmp\package"
  [Console]::Out.WriteLine('Downloading the EffectHouse AI runtime...')
  & "$env:SystemRoot\System32\curl.exe" -fsSL --proto-redir '=https' --retry 3 --connect-timeout 30 --speed-limit 1024 --speed-time 120 --max-filesize "$($pin.bytes)" -o "$dir.tgz" $pin.urls[0]
  if ($LASTEXITCODE) { Fail "the runtime download failed (curl exit $LASTEXITCODE). Check the network or proxy, then run this again." }
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath "$dir.tgz").Hash -ne $pin.sha256) { Fail 'the runtime download does not match its pinned SHA-256; nothing from it was run.' }
  & "$env:SystemRoot\System32\tar.exe" -xzf "$dir.tgz" -C $tmp package/bin/node.exe package/shell/scripts
  if ($LASTEXITCODE) { Fail 'could not unpack the runtime archive.' }
  $env:EHAI_VERIFIED_RUNTIME = "$dir.tgz"
}
& "$dir\bin\node.exe" "$dir\shell\scripts\setup-runtime.mjs"
$code = $LASTEXITCODE; if ($tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }; exit $code
