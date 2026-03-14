import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Star, MapPin, Clock, Phone, Globe, Heart, Share2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar } from "../components/ui/avatar";

const restaurantDetails = {
  1: {
    name: "Le Bernardin",
    cuisine: "French Fine Dining",
    description: "An elegant French seafood restaurant offering exquisite dishes in a sophisticated setting. Chef Eric Ripert's masterful approach to seafood has earned us three Michelin stars and countless accolades.",
    mainImage: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    rating: 4.8,
    reviews: 2400,
    priceRange: "$$$",
    address: "155 W 51st St, New York, NY 10019",
    phone: "(212) 554-1515",
    website: "www.le-bernardin.com",
    hours: "Mon-Sat: 5:00 PM - 10:30 PM, Sun: Closed",
    features: ["Fine Dining", "Michelin Star", "Full Bar", "Private Dining", "Outdoor Seating"],
    images: [
      "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    ],
  },
};

const reviews = [
  {
    name: "Sarah Johnson",
    rating: 5,
    date: "March 8, 2026",
    text: "Absolutely phenomenal experience! The food was exquisite and the service was impeccable. Every dish was a work of art. Highly recommend the tasting menu.",
    helpful: 45,
  },
  {
    name: "Michael Chen",
    rating: 5,
    date: "March 5, 2026",
    text: "One of the best dining experiences I've ever had. The atmosphere is elegant without being stuffy, and the staff is incredibly knowledgeable about the menu.",
    helpful: 32,
  },
  {
    name: "Emily Davis",
    rating: 4,
    date: "March 2, 2026",
    text: "Beautiful restaurant with amazing food. The seafood was incredibly fresh. Only minor complaint was that service was a bit slow, but the quality made up for it.",
    helpful: 18,
  },
  {
    name: "James Wilson",
    rating: 5,
    date: "February 28, 2026",
    text: "Worth every penny! The chef's attention to detail is evident in every bite. Perfect for special occasions.",
    helpful: 28,
  },
];

export function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurantDetails[1]; // Default to first restaurant

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="text-2xl font-bold">
              SUFI
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" onClick={() => navigate('/discover')} className="text-gray-600 hover:text-gray-900">Discover</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Reservations</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[500px]"
      >
        <img
          src={restaurant.mainImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          variant="ghost"
          className="absolute top-6 left-6 text-white hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="absolute bottom-8 left-8 right-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
            <p className="text-xl text-white/90">{restaurant.cuisine}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <Card className="p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{restaurant.rating}</span>
                  </div>
                  <span className="text-gray-600">({restaurant.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {restaurant.description}
                  </p>

                  <h3 className="text-xl font-bold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {restaurant.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1">
                        <Check className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-3">Location & Hours</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-gray-600">{restaurant.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Hours</p>
                        <p className="text-gray-600">{restaurant.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">{restaurant.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a href={`https://${restaurant.website}`} className="text-blue-600 hover:underline">
                          {restaurant.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Reviews</h2>
                    <Button>Write a Review</Button>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="pb-6 border-b last:border-b-0"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.name}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.text}</p>
                            <button className="text-sm text-gray-500 hover:text-gray-700">
                              Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {restaurant.images.map((image, i) => (
                      <motion.img
                        key={i}
                        src={image}
                        alt={`${restaurant.name} photo ${i + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      />
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Reservation Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Make a Reservation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="2026-03-15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>5:00 PM</option>
                    <option>5:30 PM</option>
                    <option>6:00 PM</option>
                    <option>6:30 PM</option>
                    <option>7:00 PM</option>
                    <option>7:30 PM</option>
                    <option>8:00 PM</option>
                    <option>8:30 PM</option>
                    <option>9:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Party Size</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>1 guest</option>
                    <option>2 guests</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                    <option>5 guests</option>
                    <option>6 guests</option>
                    <option>7+ guests</option>
                  </select>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => navigate(`/reservation/${id}`)}
                >
                  Reserve Now
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  You can modify or cancel your reservation anytime
                </p>
              </div>
            </Card>

            {/* Map */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Location</h3>
              <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center text-gray-500">
                Map Preview
              </div>
              <p className="text-sm text-gray-600 mt-3">{restaurant.address}</p>
              <Button variant="outline" className="w-full mt-3">
                Get Directions
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
