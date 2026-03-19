$BASE_URL = "http://localhost:8000"
$pass = 0
$fail = 0
$TOKEN = ""

Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  SUFI API Health Check" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor DarkGray

# Backend reachability
try {
    Invoke-WebRequest "$BASE_URL/" -TimeoutSec 3 -UseBasicParsing | Out-Null
    Write-Host "  [OK] Backend is running at $BASE_URL" -ForegroundColor Green
} catch {
    Write-Host "  [!!] Backend is NOT running at $BASE_URL" -ForegroundColor Red
    exit 1
}
Write-Host ""

function Test-Endpoint {
    param (
        [string]$label,
        [string]$url,
        [string]$method = "GET",
        [hashtable]$body = $null,
        [string]$token = ""
    )

    $headers = @{ "Content-Type" = "application/json" }
    if ($token -ne "") { $headers["Authorization"] = "Bearer $token" }

    try {
        $params = @{
            Uri         = $url
            Method      = $method
            Headers     = $headers
            TimeoutSec  = 8
            ErrorAction = "Stop"
        }
        if ($null -ne $body) {
            $params["Body"] = ($body | ConvertTo-Json -Compress)
        }

        $response = Invoke-RestMethod @params
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:pass++
        return $response
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status) {
            Write-Host "  [FAIL] $label  ->  HTTP $status" -ForegroundColor Red
        } else {
            Write-Host "  [FAIL] $label  ->  $($_.Exception.Message)" -ForegroundColor Red
        }
        $script:fail++
        return $null
    }
}

# 1. Auth
Write-Host "  [AUTH]" -ForegroundColor Yellow

$loginRes = Test-Endpoint "POST /auth/login (demo user)" `
    "$BASE_URL/auth/login" "POST" `
    @{ email = "demo@sufi.ai"; password = "demo1234" }

if ($loginRes -and $loginRes.access_token) {
    $TOKEN = $loginRes.access_token
    Write-Host "       Token acquired OK" -ForegroundColor DarkGray
} else {
    Write-Host "       No token - protected routes will show 401" -ForegroundColor DarkYellow
}

$randEmail = "testuser_$(Get-Random)@sufi.ai"
Test-Endpoint "POST /auth/register (new user)" `
    "$BASE_URL/auth/register" "POST" `
    @{ name = "Test User"; email = $randEmail; password = "test1234"; role = "owner" }

Write-Host ""

# 2. Restaurants
Write-Host "  [RESTAURANTS]" -ForegroundColor Yellow
Test-Endpoint "GET /restaurants/trending"       "$BASE_URL/restaurants/trending"
Test-Endpoint "GET /restaurants/discover"       "$BASE_URL/restaurants/discover"
Test-Endpoint "GET /restaurants/search?q=pizza" "$BASE_URL/restaurants/search?q=pizza"
Test-Endpoint "GET /restaurants/1"              "$BASE_URL/restaurants/1"
Write-Host ""

# 3. Intelligence
Write-Host "  [INTELLIGENCE]" -ForegroundColor Yellow
Test-Endpoint "GET /owner/intelligence/dashboard/1"          "$BASE_URL/owner/intelligence/dashboard/1?avg_spend=500"      "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/demand/1"             "$BASE_URL/owner/intelligence/demand/1"                       "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/noshow/1"             "$BASE_URL/owner/intelligence/noshow/1"                       "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/tables/1"             "$BASE_URL/owner/intelligence/tables/1"                       "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/waitlist/1"           "$BASE_URL/owner/intelligence/waitlist/1"                     "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/priority/1"           "$BASE_URL/owner/intelligence/priority/1"                     "GET" $null $TOKEN
Test-Endpoint "GET /owner/intelligence/automation/history/1" "$BASE_URL/owner/intelligence/automation/history/1?limit=10"  "GET" $null $TOKEN
Test-Endpoint "POST /owner/intelligence/automation/run/1"    "$BASE_URL/owner/intelligence/automation/run/1"               "POST" @{} $TOKEN
Write-Host ""

# 4. Automation stubs
Write-Host "  [AUTOMATION]" -ForegroundColor Yellow
Test-Endpoint "GET /automation/status"   "$BASE_URL/automation/status"  "GET"  $null $TOKEN
Test-Endpoint "GET /automation/active"   "$BASE_URL/automation/active"  "GET"  $null $TOKEN
Test-Endpoint "GET /automation/planned"  "$BASE_URL/automation/planned" "GET"  $null $TOKEN
Test-Endpoint "POST /automation/approve" "$BASE_URL/automation/approve" "POST" @{}   $TOKEN
Test-Endpoint "POST /automation/apply"   "$BASE_URL/automation/apply"   "POST" @{}   $TOKEN
Write-Host ""

# 5. Analytics
Write-Host "  [ANALYTICS]" -ForegroundColor Yellow
Test-Endpoint "GET /analytics/restaurant/1"               "$BASE_URL/analytics/restaurant/1"                  "GET" $null $TOKEN
Test-Endpoint "GET /analytics/restaurant/1/timeline"      "$BASE_URL/analytics/restaurant/1/timeline?days=30" "GET" $null $TOKEN
Test-Endpoint "GET /analytics/restaurant/1/popular-hours" "$BASE_URL/analytics/restaurant/1/popular-hours"    "GET" $null $TOKEN
Test-Endpoint "GET /reviews/analytics/1"                  "$BASE_URL/reviews/analytics/1"                     "GET" $null $TOKEN
Write-Host ""

# 6. Reservations
Write-Host "  [RESERVATIONS]" -ForegroundColor Yellow
Test-Endpoint "GET /owner/reservations" "$BASE_URL/owner/reservations" "GET" $null $TOKEN
Test-Endpoint "GET /user/dashboard/"    "$BASE_URL/user/dashboard/"    "GET" $null $TOKEN
Write-Host ""

# 7. Waitlist
Write-Host "  [WAITLIST]" -ForegroundColor Yellow
Test-Endpoint "GET /waitlist/restaurant/1" "$BASE_URL/waitlist/restaurant/1" "GET" $null $TOKEN
Write-Host ""

# 8. Concierge
Write-Host "  [CONCIERGE]" -ForegroundColor Yellow
Test-Endpoint "POST /concierge/chat" "$BASE_URL/concierge/chat" "POST" @{ query = "book a table for 2 tonight" } $TOKEN
Write-Host ""

# 9. Notifications
Write-Host "  [NOTIFICATIONS]" -ForegroundColor Yellow
Test-Endpoint "GET /owner/notifications/1"              "$BASE_URL/owner/notifications/1"               "GET" $null $TOKEN
Test-Endpoint "GET /owner/notifications/1/unread-count" "$BASE_URL/owner/notifications/1/unread-count"  "GET" $null $TOKEN
Write-Host ""

# 10. ML
Write-Host "  [ML]" -ForegroundColor Yellow
$mlUrl = "$BASE_URL/owner/intelligence/ml/recommend/1?hour=19&day_of_week=5&party_size=4"
Test-Endpoint "GET /owner/intelligence/ml/recommend/1" $mlUrl "GET" $null $TOKEN
Write-Host ""

# Summary
$total = $pass + $fail
Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
if ($fail -eq 0) {
    Write-Host "  Results: $pass/$total passed - All endpoints healthy!" -ForegroundColor Green
} else {
    Write-Host "  Results: $pass/$total passed  ($fail failed)" -ForegroundColor Yellow
    Write-Host "  Check backend logs for details on failures." -ForegroundColor Red
}
Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""
