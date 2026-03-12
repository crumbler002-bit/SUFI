# Test remaining endpoints for complete backend validation

# First, login to get token
Write-Host "Logging in to get authentication token..."

$login = @{
    email = "user1633602971@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/json" -Body $login
    $loginJson = $loginResponse.Content | ConvertFrom-Json
    
    $token = $loginJson.access_token
    
    Write-Host "Login successful!"
    Write-Host "Token: $token"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    return
}

# Test 1: Reservation Search
Write-Host "`n=== Testing Reservation Search ==="

$reservationSearch = @{
    location = "Mumbai"
    date = "2026-03-21T00:00:00"  # Format as datetime
    time = "2026-03-21T19:00:00"  # Format as datetime
    guests = 2
} | ConvertTo-Json

try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:8000/reservations/search" -Method POST -ContentType "application/json" -Body $reservationSearch
    Write-Host "Reservation search successful: $($searchResponse.Content)"
} catch {
    Write-Host "Reservation search failed: $($_.Exception.Message)"
}

# Test 2: Reservation Creation (with table_id)
Write-Host "`n=== Testing Reservation Creation ==="

$reservation = @{
    restaurant_id = 9
    table_id = 1  # Add required table_id
    reservation_time = "2026-03-21T19:00:00"  # Format as datetime
    guests = 2
} | ConvertTo-Json

try {
    $reservationResponse = Invoke-WebRequest -Uri "http://localhost:8000/reservations/create" -Method POST -ContentType "application/json" -Body $reservation -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Reservation creation successful: $($reservationResponse.Content)"
} catch {
    Write-Host "Reservation creation failed: $($_.Exception.Message)"
}

# Test 3: Owner Dashboard - Restaurants
Write-Host "`n=== Testing Owner Restaurants ==="

try {
    $ownerRestaurantsResponse = Invoke-WebRequest -Uri "http://localhost:8000/owner/restaurants" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Owner restaurants successful: $($ownerRestaurantsResponse.Content)"
} catch {
    Write-Host "Owner restaurants failed: $($_.Exception.Message)"
}

# Test 4: Owner Dashboard - Reservations
Write-Host "`n=== Testing Owner Reservations ==="

try {
    $ownerReservationsResponse = Invoke-WebRequest -Uri "http://localhost:8000/owner/reservations" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Owner reservations successful: $($ownerReservationsResponse.Content)"
} catch {
    Write-Host "Owner reservations failed: $($_.Exception.Message)"
}

Write-Host "`n=== All remaining endpoints tested ==="
