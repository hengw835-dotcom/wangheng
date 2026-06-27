$env:SPRING_PROFILES_ACTIVE = 'dev'
$env:SERVER_PORT = '8086'
$env:JWT_SECRET = 'dev-smart-harvester-jwt-secret-2026-minimum-32-chars'
$env:METRICS_TOKEN = 'dev-metrics-token-2026-local'
$env:ADMIN_USERNAME = 'admin'
$env:ADMIN_PASSWORD = '20031107'
$env:DISPATCHER_USERNAME = 'dispatcher'
$env:DISPATCHER_PASSWORD = 'Dispatcher2026!'
$env:DRIVER_USERNAME = 'driver'
$env:DRIVER_PASSWORD = 'DriverPass2026!'
$env:VIEWER_USERNAME = 'viewer'
$env:VIEWER_PASSWORD = 'ViewerPass2026!'
$env:MQTT_USERNAME = 'admin'
$env:MQTT_PASSWORD = 'public'

Set-Location -LiteralPath $PSScriptRoot\backend
mvn spring-boot:run
