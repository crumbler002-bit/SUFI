from app.database import SessionLocal
from app.models.restaurant import Restaurant
import uuid

db = SessionLocal()

# Check if restaurants already exist
existing_count = db.query(Restaurant).count()
if existing_count > 0:
    print(f"Found {existing_count} existing restaurants. Skipping seed data.")
    db.close()
    exit()

restaurants = [
    Restaurant(
        name="La Bella Italia",
        description="Authentic Italian cuisine with a romantic atmosphere. Perfect for dates and special occasions.",
        cuisine="Italian",
        city="Bhubaneswar",
        address="Patia, Bhubaneswar",
        rating=4.5,
        price_range="₹₹₹",
        total_reviews=128,
        reservation_count=89,
        popularity_score=4.2,
        is_featured=True,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Dragon Palace",
        description="Traditional Chinese restaurant with modern ambiance. Specializes in Szechuan and Cantonese cuisine.",
        cuisine="Chinese",
        city="Bhubaneswar",
        address="Saheed Nagar, Bhubaneswar",
        rating=4.3,
        price_range="₹₹",
        total_reviews=95,
        reservation_count=67,
        popularity_score=3.8,
        is_featured=False,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Royal Tandoor",
        description="Fine dining Indian restaurant known for its tandoori specialties and Mughlai cuisine.",
        cuisine="Indian",
        city="Bhubaneswar",
        address="Nayapalli, Bhubaneswar",
        rating=4.7,
        price_range="₹₹₹₹",
        total_reviews=203,
        reservation_count=156,
        popularity_score=4.6,
        is_featured=True,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Sushi Master",
        description="Authentic Japanese sushi bar with fresh ingredients and traditional preparation methods.",
        cuisine="Japanese",
        city="Bhubaneswar",
        address="Forum Mall, Bhubaneswar",
        rating=4.4,
        price_range="₹₹₹₹",
        total_reviews=76,
        reservation_count=45,
        popularity_score=3.9,
        is_featured=False,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="The Quiet Corner",
        description="A peaceful cafe perfect for reading, working, or intimate conversations. Known for excellent coffee.",
        cuisine="Cafe",
        city="Bhubaneswar",
        address="Unit 3, Bhubaneswar",
        rating=4.1,
        price_range="₹₹",
        total_reviews=54,
        reservation_count=23,
        popularity_score=3.2,
        is_featured=False,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Mexican Fiesta",
        description="Vibrant Mexican restaurant with authentic flavors and festive atmosphere. Great for groups.",
        cuisine="Mexican",
        city="Bhubaneswar",
        address="Khandagiri, Bhubaneswar",
        rating=4.2,
        price_range="₹₹",
        total_reviews=82,
        reservation_count=61,
        popularity_score=3.7,
        is_featured=False,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Thai Orchid",
        description="Elegant Thai restaurant with authentic dishes and serene ambiance. Perfect for romantic dinners.",
        cuisine="Thai",
        city="Bhubaneswar",
        address="Rasulgarh, Bhubaneswar",
        rating=4.6,
        price_range="₹₹₹₹",
        total_reviews=91,
        reservation_count=78,
        popularity_score=4.3,
        is_featured=True,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Family Kitchen",
        description="Casual family-friendly restaurant with diverse menu options and kids' play area.",
        cuisine="Continental",
        city="Bhubaneswar",
        address="Patia, Bhubaneswar",
        rating=3.9,
        price_range="₹₹",
        total_reviews=67,
        reservation_count=89,
        popularity_score=3.5,
        is_featured=False,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="Rooftop Romance",
        description="Beautiful rooftop restaurant with city views, perfect for romantic dinners and special occasions.",
        cuisine="Italian",
        city="Bhubaneswar",
        address="Esplanade One, Bhubaneswar",
        rating=4.8,
        price_range="₹₹₹₹",
        total_reviews=145,
        reservation_count=112,
        popularity_score=4.7,
        is_featured=True,
        owner_id=uuid.uuid4()
    ),
    Restaurant(
        name="BBQ Nation",
        description="Lively barbecue restaurant with unlimited grills and festive atmosphere. Great for groups.",
        cuisine="American",
        city="Bhubaneswar",
        address="DN Regalia, Bhubaneswar",
        rating=4.4,
        price_range="₹₹₹",
        total_reviews=189,
        reservation_count=201,
        popularity_score=4.4,
        is_featured=False,
        owner_id=uuid.uuid4()
    )
]

print("Adding seed restaurants...")
for r in restaurants:
    db.add(r)

db.commit()
db.close()

print(f"✅ {len(restaurants)} seed restaurants added successfully!")
print("Database is now ready for testing all endpoints.")
