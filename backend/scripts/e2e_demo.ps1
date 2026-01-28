# Lakehouse Pro Simulator (v6 - ASCII Only)

$API = "http://localhost:8087/v1/events"
$CH = "http://localhost:8125"
$USER = "admin"
$PASS = "admin_pass"

Write-Host "-----------------------------------------------"
Write-Host "TELEMETRY LAKEHOUSE: E2E SIMULATION"
Write-Host "-----------------------------------------------"

function Query-CH($sql) {
    $h = @{ "X-ClickHouse-User"=$USER; "X-ClickHouse-Key"=$PASS }
    return Invoke-RestMethod -Uri "$CH/" -Method Post -Body $sql -Headers $h
}

Write-Host "Step 1: Init Database..."
$q1 = @'
CREATE TABLE IF NOT EXISTS telemetry_bronze (event_timestamp DateTime64, source_id String, raw_payload String) ENGINE = MergeTree() PARTITION BY toYYYYMMDD(event_timestamp) ORDER BY (source_id, event_timestamp)
'@
$q2 = @'
CREATE TABLE IF NOT EXISTS telemetry_queue (eventId String, timestamp String, source String, metricName String, value Float64, tags Map(String, String)) ENGINE = Kafka SETTINGS kafka_broker_list = 'kafka:29092', kafka_topic_list = 'telemetry_bronze', kafka_group_name = 'ch_sink_v6', kafka_format = 'JSONEachRow'
'@
$q3 = @'
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_bronze_mv TO telemetry_bronze AS SELECT parseDateTime64BestEffort(timestamp) as event_timestamp, source as source_id, toJSONString(tags) as raw_payload FROM telemetry_queue
'@

try {
    Query-CH $q1 | Out-Null
    Query-CH $q2 | Out-Null
    Query-CH $q3 | Out-Null
    Write-Host "[OK] Database Ready"
} catch {
    Write-Host "[INFO] Database check skipped or already exists."
}

Write-Host "Step 2: Traffic Simulation..."
$devices = @("DEV-A", "DEV-B", "DEV-C")

for ($i=1; $i -le 10; $i++) {
    $d = $devices | Get-Random
    $v = [math]::Round((20.0 + (Get-Random -Minimum 1 -Maximum 50)), 2)
    
    $payload = @{
        source = $d
        metricName = "test"
        value = $v
        tags = @{ iteration = "$i" }
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $API -Method Post -ContentType "application/json" -Body $payload
        Write-Host "Sent data from $d"
    } catch {
        Write-Host "Failed to send: $_"
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "Step 3: Verification (Waiting 12s)..."
Start-Sleep -Seconds 12

try {
    $res = Query-CH 'SELECT count() FROM telemetry_bronze'
    Write-Host "Total Rows: $res"
} catch {
    Write-Host "DB Check Failed"
}

Write-Host "-----------------------------------------------"
