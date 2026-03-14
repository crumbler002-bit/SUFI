import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Clock, Star, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar } from "../components/ui/avatar";

const upcomingReservations = [
  {
    id: 1,
    restaurant: "Le Bernardin",
    cuisine: "French Fine Dining",
    image: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "March 15, 2026",
    time: "7:00 PM",
    guests: 4,
    confirmation: "SUFI-ABC123",
  },
  {
    id: 2,
    restaurant: "Nobu",
    cuisine: "Japanese",
    image: "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "March 20, 2026",
    time: "8:00 PM",
    guests: 2,
    confirmation: "SUFI-XYZ789",
  },
];

const pastReservations = [
  {
    id: 3,
    restaurant: "Osteria Mozza",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "March 5, 2026",
    time: "6:30 PM",
    guests: 3,
    rated: true,
    rating: 5,
  },
  {
    id: 4,
    restaurant: "Thai Orchid",
    cuisine: "Thai",
    image: "https://images.unsplash.com/photo-1665917152889-b170c7b8b5fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "February 28, 2026",
    time: "7:00 PM",
    guests: 2,
    rated: false,
  },
];

const favoriteRestaurants = [
  {
    id: 1,
    name: "Le Bernardin",
    cuisine: "French Fine Dining",
    image: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.8,
    priceRange: "$$$",
  },
  {
    id: 3,
    name: "Nobu",
    cuisine: "Japanese",
    image: "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.9,
    priceRange: "$$$$",
  },
  {
    id: 2,
    name: "Osteria Mozza",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.6,
    priceRange: "$$",
  },
];

export function UserProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="text-2xl font-bold">
              SUFI
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" onClick={() => navigate('/discover')} className="text-gray-600 hover:text-gray-900">Discover</a>
              <a href="#" className="font-semibold">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-6"
          >
            <Avatar className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-4xl font-bold">
              JS
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">John Smith</h1>
              <p className="text-gray-600 mb-4">john@example.com</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{upcomingReservations.length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{pastReservations.length}</div>
                <div className="text-sm text-gray-600">Past</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{favoriteRestaurants.length}</div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-6">
              {upcomingReservations.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Upcoming Reservations</h3>
                  <p className="text-gray-600 mb-6">
                    Start exploring restaurants and make your next reservation
                  </p>
                  <Button onClick={() => navigate('/discover')}>
                    Discover Restaurants
                  </Button>
                </Card>
              ) : (
                upcomingReservations.map((reservation, i) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img
                          src={reservation.image}
                          alt={reservation.restaurant}
                          className="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-1">
                                {reservation.restaurant}
                              </h3>
                              <p className="text-gray-600">{reservation.cuisine}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-0">
                              Confirmed
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span>{reservation.date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <span>{reservation.time}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <span>{reservation.guests} guests</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">
                                Confirmation: {reservation.confirmation}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/restaurant/${reservation.id}`)}
                            >
                              View Restaurant
                            </Button>
                            <Button variant="outline">
                              Modify
                            </Button>
                            <Button variant="outline" className="text-red-600 hover:bg-red-50">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-6">
              {pastReservations.map((reservation, i) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={reservation.image}
                        alt={reservation.restaurant}
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-1">
                              {reservation.restaurant}
                            </h3>
                            <p className="text-gray-600">{reservation.cuisine}</p>
                          </div>
                          {reservation.rated && (
                            <div className="flex items-center gap-1">
                              {[...Array(reservation.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-5 h-5 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span>{reservation.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span>{reservation.time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{reservation.guests} guests</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => navigate(`/restaurant/${reservation.id}`)}>
                            Book Again
                          </Button>
                          {!reservation.rated && (
                            <Button variant="outline">
                              <Star className="w-4 h-4 mr-2" />
                              Write a Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRestaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden group cursor-pointer">
                    <div 
                      className="relative h-48 overflow-hidden"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div 
                      className="p-4"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{restaurant.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{restaurant.priceRange}</p>
                      <Button 
                        className="w-full"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
