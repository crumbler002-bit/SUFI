import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, MapPin, Star, Clock, DollarSign, Heart, Map } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";

const restaurants = [
  {
    id: 1,
    name: "Le Bernardin",
    cuisine: "French Fine Dining",
    image: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.8,
    reviews: 2400,
    priceRange: "$$$",
    distance: "2.3 miles",
    availableToday: true,
    nextAvailable: "6:00 PM",
  },
  {
    id: 2,
    name: "Osteria Mozza",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.6,
    reviews: 1850,
    priceRange: "$$",
    distance: "1.8 miles",
    availableToday: true,
    nextAvailable: "7:30 PM",
  },
  {
    id: 3,
    name: "Nobu",
    cuisine: "Japanese",
    image: "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.9,
    reviews: 3200,
    priceRange: "$$$$",
    distance: "3.1 miles",
    availableToday: true,
    nextAvailable: "8:00 PM",
  },
  {
    id: 4,
    name: "Taqueria Del Sol",
    cuisine: "Mexican",
    image: "https://images.unsplash.com/photo-1688845465690-e5ea24774fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.5,
    reviews: 980,
    priceRange: "$",
    distance: "0.9 miles",
    availableToday: true,
    nextAvailable: "5:30 PM",
  },
  {
    id: 5,
    name: "Le Comptoir",
    cuisine: "French Bistro",
    image: "https://images.unsplash.com/photo-1577056922428-a511301a562d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.7,
    reviews: 1560,
    priceRange: "$$",
    distance: "1.5 miles",
    availableToday: false,
    nextAvailable: "Tomorrow",
  },
  {
    id: 6,
    name: "The Burger Joint",
    cuisine: "American",
    image: "https://images.unsplash.com/photo-1632898657999-ae6920976661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.4,
    reviews: 756,
    priceRange: "$",
    distance: "2.1 miles",
    availableToday: true,
    nextAvailable: "6:30 PM",
  },
  {
    id: 7,
    name: "Prime Cut",
    cuisine: "Steakhouse",
    image: "https://images.unsplash.com/photo-1772285466464-8ccda2c3be92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.8,
    reviews: 2100,
    priceRange: "$$$$",
    distance: "4.2 miles",
    availableToday: true,
    nextAvailable: "7:00 PM",
  },
  {
    id: 8,
    name: "Thai Orchid",
    cuisine: "Thai",
    image: "https://images.unsplash.com/photo-1665917152889-b170c7b8b5fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rating: 4.6,
    reviews: 1320,
    priceRange: "$$",
    distance: "1.2 miles",
    availableToday: true,
    nextAvailable: "6:00 PM",
  },
];

export function DiscoverPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

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
              <a href="#" className="text-gray-600 hover:text-gray-900">Discover</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Reservations</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Profile</a>
              <Button onClick={() => navigate('/owner/dashboard')}>For Owners</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-6">Discover Restaurants</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search restaurants, cuisines, or dishes..."
                  className="pl-12 h-12 text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="h-12">
                  <Map className="w-5 h-5 mr-2" />
                  Map View
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 shrink-0"
            >
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                
                {/* Cuisine Type */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Cuisine Type</h3>
                  <div className="space-y-2">
                    {["Italian", "Japanese", "French", "Mexican", "American", "Thai"].map((cuisine) => (
                      <div key={cuisine} className="flex items-center gap-2">
                        <Checkbox id={cuisine} />
                        <Label htmlFor={cuisine} className="cursor-pointer">{cuisine}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {["$", "$$", "$$$", "$$$$"].map((price) => (
                      <div key={price} className="flex items-center gap-2">
                        <Checkbox id={price} />
                        <Label htmlFor={price} className="cursor-pointer">{price}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Minimum Rating</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.0">4.0+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="3.0">3.0+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Distance</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Within 1 mile</SelectItem>
                      <SelectItem value="2">Within 2 miles</SelectItem>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <Checkbox id="available-today" />
                    <Label htmlFor="available-today" className="cursor-pointer">
                      Available Today
                    </Label>
                  </div>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </Card>
            </motion.aside>
          )}

          {/* Restaurant Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{restaurants.length} restaurants found</p>
              <Select defaultValue="recommended">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
                    <div 
                      className="relative h-48 overflow-hidden"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(restaurant.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(restaurant.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                      {restaurant.availableToday && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0">
                          Available Today
                        </Badge>
                      )}
                    </div>
                    <div 
                      className="p-4 flex-1 flex flex-col"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{restaurant.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        ({restaurant.reviews.toLocaleString()} reviews)
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-auto">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{restaurant.priceRange}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.distance}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-blue-600 mt-3">
                        <Clock className="w-4 h-4" />
                        <span>Next: {restaurant.nextAvailable}</span>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reservation/${restaurant.id}`);
                        }}
                      >
                        Reserve Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
