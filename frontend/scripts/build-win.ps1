$ErrorActionPreference = 'Stop'

$drive = 'Z:'
$frontendRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
$nodeModules = Join-Path $frontendRoot 'node_modules'
$ignoredNodeModules = Join-Path $nodeModules '.ignored'
$createdLinks = @()

function Ensure-PackageLink {
    param(
        [Parameter(Mandatory = $true)][string]$RelativePath
    )

    $target = Join-Path $nodeModules $RelativePath
    $source = Join-Path $ignoredNodeModules $RelativePath

    if ((Test-Path -LiteralPath $target) -or -not (Test-Path -LiteralPath $source)) {
        return
    }

    $parent = Split-Path -Parent $target
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent | Out-Null
    }

    New-Item -ItemType Junction -Path $target -Target $source | Out-Null
    $script:createdLinks += $target
}

if (Test-Path -LiteralPath $ignoredNodeModules) {
    @(
        'vite',
        '@vitejs\plugin-vue',
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'echarts',
        'three',
        'socket.io-client',
        'axios'
    ) | ForEach-Object { Ensure-PackageLink $_ }
}

cmd.exe /c "subst $drive /D 2>nul" | Out-Null
cmd.exe /c "subst $drive `"$frontendRoot`""

try {
    Push-Location "$drive\"
    node .\node_modules\vite\bin\vite.js build
}
finally {
    Pop-Location
    cmd.exe /c "subst $drive /D 2>nul" | Out-Null
    foreach ($link in $createdLinks) {
        if (Test-Path -LiteralPath $link) {
            [System.IO.Directory]::Delete($link, $false)
        }
    }
}
