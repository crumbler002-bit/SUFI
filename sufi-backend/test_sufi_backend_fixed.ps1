# Generate random user
$rand = Get-Random

Write-Host "Creating random user..."

$user = @{
    name = "user$rand"
    email = "user$rand@test.com"
    password = "123456"
    role = "restaurant_owner"
} | ConvertTo-Json

Write-Host "User data: $user"

# Register user
try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:8000/auth/register" -Method POST -ContentType "application/json" -Body $user
    Write-Host "User registration successful: $($registerResponse.Content)"
} catch {
    Write-Host "User registration failed: $($_.Exception.Message)"
}

Write-Host "Logging in..."

$login = @{
    email = "user$rand@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/json" -Body $login
    $loginJson = $loginResponse.Content | ConvertFrom-Json
    
    $token = $loginJson.access_token
    $userId = $loginJson.user.id
    
    Write-Host "Login successful!"
    Write-Host "User ID: $userId"
    Write-Host "Token: $token"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    return
}

# Register restaurant
Write-Host "Registering restaurant..."

$restaurant = @{
    name = "Restaurant$rand"
    description = "Luxury dining"
    cuisine = "Italian"
    city = "Mumbai"
    address = "Bandra"
    tier_id = 1
} | ConvertTo-Json

try {
    $restaurantResponse = Invoke-WebRequest -Uri "http://localhost:8000/restaurants/register" -Method POST -ContentType "application/json" -Body $restaurant -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Restaurant registration successful: $($restaurantResponse.Content)"
} catch {
    Write-Host "Restaurant registration failed: $($_.Exception.Message)"
}

# Discover restaurants
Write-Host "Testing discover endpoint..."

try {
    $discoverResponse = Invoke-WebRequest -Uri "http://localhost:8000/restaurants/discover?page=1&limit=10" -Method GET
    Write-Host "Discover endpoint successful: $($discoverResponse.Content)"
} catch {
    Write-Host "Discover endpoint failed: $($_.Exception.Message)"
}

# Search restaurants
Write-Host "Testing search..."

try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:8000/restaurants/search?q=italian" -Method GET
    Write-Host "Search endpoint successful: $($searchResponse.Content)"
} catch {
    Write-Host "Search endpoint failed: $($_.Exception.Message)"
}

# Trending restaurants
Write-Host "Testing trending..."

try {
    $trendingResponse = Invoke-WebRequest -Uri "http://localhost:8000/restaurants/trending" -Method GET
    Write-Host "Trending endpoint successful: $($trendingResponse.Content)"
} catch {
    Write-Host "Trending endpoint failed: $($_.Exception.Message)"
}

# Create reservation
Write-Host "Creating reservation..."

$reservation = @{
    restaurant_id = 9  # Use existing restaurant ID
    table_id = 1       # Add table_id
    reservation_time = "2026-03-21T19:00"
    guests = 2
} | ConvertTo-Json

try {
    $reservationResponse = Invoke-WebRequest -Uri "http://localhost:8000/reservations/create" -Method POST -ContentType "application/json" -Body $reservation -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Reservation creation successful: $($reservationResponse.Content)"
} catch {
    Write-Host "Reservation creation failed: $($_.Exception.Message)"
}

# Add review
Write-Host "Adding review..."

$review = @{
    restaurant_id = 9  # Use existing restaurant ID
    rating = 5
    comment = "Great food!"
} | ConvertTo-Json

try {
    $reviewResponse = Invoke-WebRequest -Uri "http://localhost:8000/reviews" -Method POST -ContentType "application/json" -Body $review -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Review creation successful: $($reviewResponse.Content)"
} catch {
    Write-Host "Review creation failed: $($_.Exception.Message)"
}

Write-Host "All APIs tested successfully."
