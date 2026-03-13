$BASE_URL = "http://localhost:8000"

Write-Host "======================================="
Write-Host "SUFI Backend API Test Suite"
Write-Host "======================================="

# -----------------------------------
# Health Check
# -----------------------------------

Write-Host "`nTesting Root Endpoint..."
Invoke-RestMethod -Uri "$BASE_URL/" -Method GET

# -----------------------------------
# Restaurants - Discover
# -----------------------------------

Write-Host "`nTesting Discover Restaurants..."
Invoke-RestMethod -Uri "$BASE_URL/restaurants/discover" -Method GET

# -----------------------------------
# Restaurants - Trending
# -----------------------------------

Write-Host "`nTesting Trending Restaurants..."
Invoke-RestMethod -Uri "$BASE_URL/restaurants/trending" -Method GET

# -----------------------------------
# Restaurant Details
# -----------------------------------

Write-Host "`nTesting Restaurant Details..."
Invoke-RestMethod -Uri "$BASE_URL/restaurants/1" -Method GET

# -----------------------------------
# Reviews
# -----------------------------------

Write-Host "`nTesting Restaurant Reviews..."
Invoke-RestMethod -Uri "$BASE_URL/restaurants/1/reviews" -Method GET

# -----------------------------------
# Reservation Create
# -----------------------------------

Write-Host "`nTesting Reservation Creation..."

$reservationBody = @{
    restaurant_id = 1
    user_id = 1
    reservation_time = "2026-03-14T19:00:00"
    guests = 2
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "$BASE_URL/reservations" `
    -Method POST `
    -ContentType "application/json" `
    -Body $reservationBody

# -----------------------------------
# Owner Dashboard
# -----------------------------------

Write-Host "`nTesting Owner Dashboard..."
Invoke-RestMethod -Uri "$BASE_URL/owner/dashboard" -Method GET

# -----------------------------------
# AI Recommendations
# -----------------------------------

Write-Host "`nTesting AI Recommendations..."

$aiBody = @{
    query = "Find italian restaurant for date under 1500"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "$BASE_URL/restaurants/ai-concierge" `
    -Method POST `
    -ContentType "application/json" `
    -Body $aiBody

# -----------------------------------
# Intelligent Recommendations
# -----------------------------------

Write-Host "`nTesting Intelligent Ranking AI..."
Invoke-RestMethod `
    -Uri "$BASE_URL/restaurants/recommendations/intelligent?limit=5" `
    -Method GET

Write-Host "`n======================================="
Write-Host "ALL API TESTS COMPLETED"
Write-Host "======================================="
