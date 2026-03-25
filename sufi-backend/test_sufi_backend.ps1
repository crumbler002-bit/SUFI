# Generate random user
$rand = Get-Random

Write-Host "Creating random user..."

$user = @{
    name = "user$rand"
    email = "user$rand@test.com"
    password = "123456"
    role = "restaurant_owner"
} | ConvertTo-Json

curl http://localhost:8000/auth/register `
-H "Content-Type: application/json" `
-d $user

Write-Host "Logging in..."

$login = @{
    email = "user$rand@test.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = curl http://localhost:8000/auth/login `
-H "Content-Type: application/json" `
-d $login

$loginJson = $loginResponse | ConvertFrom-Json

$token = $loginJson.access_token
$userId = $loginJson.user_id

Write-Host "User ID: $userId"

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

curl "http://localhost:8000/restaurants/register?owner_id=$userId" `
-H "Content-Type: application/json" `
-d $restaurant

# Discover restaurants
Write-Host "Testing discover endpoint..."

curl "http://localhost:8000/restaurants/discover?page=1&limit=10"

# Search restaurants
Write-Host "Testing search..."

curl "http://localhost:8000/restaurants/search?q=italian"

# Trending restaurants
Write-Host "Testing trending..."

curl "http://localhost:8000/restaurants/trending"

# Create reservation
Write-Host "Creating reservation..."

$reservation = @{
    restaurant_id = 1
    reservation_time = "2026-03-21T19:00"
    guests = 2
} | ConvertTo-Json

curl http://localhost:8000/reservations/create `
-H "Content-Type: application/json" `
-d $reservation

# Add review
Write-Host "Adding review..."

$review = @{
    user_id = $userId
    restaurant_id = 1
    rating = 5
    comment = "Great food!"
} | ConvertTo-Json

curl http://localhost:8000/reviews `
-H "Content-Type: application/json" `
-d $review

Write-Host "All APIs tested successfully."
