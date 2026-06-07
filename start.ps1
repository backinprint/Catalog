$ErrorActionPreference = "Stop"

$node = "C:\Users\lizwa\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (!(Test-Path $node)) {
  $node = "node"
}

& $node --no-warnings "$PSScriptRoot\server.js"
