# Import all models here in dependency order so SQLAlchemy
# can resolve all relationships before any query runs.

from app.models.user import User
from app.models.user_preference import UserPreference
from app.models.restaurant_tier import RestaurantTier
from app.models.restaurant_brand import RestaurantBrand
from app.models.restaurant import Restaurant
from app.models.restaurant_image import RestaurantImage
from app.models.restaurant_tag import RestaurantTag
from app.models.restaurant_subscription import RestaurantSubscription
from app.models.restaurant_analytics import RestaurantAnalytics
from app.models.restaurant_promotion import RestaurantPromotion
from app.models.menu_category import MenuCategory
from app.models.menu_item import MenuItem
from app.models.restaurant_table import RestaurantTable
from app.models.reservation import Reservation
from app.models.reservation_payment import ReservationPayment
from app.models.review import Review
from app.models.waitlist_entry import WaitlistEntry
from app.models.dynamic_pricing_rule import DynamicPricingRule
from app.models.automation_action import AutomationAction
from app.models.notification import Notification
