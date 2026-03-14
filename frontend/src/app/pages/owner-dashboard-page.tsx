import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Menu,
  Home,
  Utensils,
  MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 45200 },
];

const reservationsData = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 38 },
  { day: "Wed", count: 45 },
  { day: "Thu", count: 52 },
  { day: "Fri", count: 68 },
  { day: "Sat", count: 75 },
  { day: "Sun", count: 58 },
];

const upcomingReservations = [
  { id: 1, time: "6:00 PM", name: "John Smith", guests: 4, table: "A5", status: "confirmed" },
  { id: 2, time: "6:30 PM", name: "Sarah Johnson", guests: 2, table: "B3", status: "confirmed" },
  { id: 3, time: "7:00 PM", name: "Michael Chen", guests: 6, table: "C1", status: "pending" },
  { id: 4, time: "7:30 PM", name: "Emily Davis", guests: 3, table: "A2", status: "confirmed" },
  { id: 5, time: "8:00 PM", name: "David Wilson", guests: 2, table: "B5", status: "confirmed" },
  { id: 6, time: "8:30 PM", name: "Lisa Brown", guests: 5, table: "C2", status: "pending" },
];

const recentReviews = [
  { name: "John Smith", rating: 5, date: "2 hours ago", text: "Exceptional dining experience! The service was impeccable." },
  { name: "Sarah Johnson", rating: 4, date: "5 hours ago", text: "Great food and atmosphere. Will definitely come back." },
  { name: "Michael Chen", rating: 5, date: "1 day ago", text: "Best restaurant in the city. Highly recommend!" },
];

export function OwnerDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="p-6">
            <button onClick={() => navigate('/')} className="text-2xl font-bold mb-8">
              SUFI
            </button>
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
                <Home className="w-5 h-5" />
                Dashboard
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5" />
                Reservations
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Utensils className="w-5 h-5" />
                Menu
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                <MessageSquare className="w-5 h-5" />
                Reviews
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <header className="bg-white border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  View Website
                </Button>
                <Button onClick={() => navigate('/discover')}>
                  Customer View
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8" />
                    <Badge className="bg-white/20 text-white border-0">Today</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">42</div>
                  <p className="text-blue-100">Total Reservations</p>
                  <p className="text-sm text-blue-100 mt-2">↑ 12% vs yesterday</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8" />
                    <Badge className="bg-white/20 text-white border-0">Month</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">$45.2k</div>
                  <p className="text-green-100">Revenue</p>
                  <p className="text-sm text-green-100 mt-2">↑ 18% vs last month</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8" />
                    <Badge className="bg-white/20 text-white border-0">Rating</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">4.8</div>
                  <p className="text-purple-100">Average Rating</p>
                  <p className="text-sm text-purple-100 mt-2">342 total reviews</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8" />
                    <Badge className="bg-white/20 text-white border-0">Week</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">1,234</div>
                  <p className="text-orange-100">Weekly Bookings</p>
                  <p className="text-sm text-orange-100 mt-2">↑ 23% vs last week</p>
                </Card>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6">Revenue Overview</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6">Weekly Reservations</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reservationsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* Reservations Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Today's Reservations</h2>
                  <Button variant="outline">View All</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingReservations.map((reservation, i) => (
                      <motion.tr
                        key={reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + i * 0.05 }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {reservation.time}
                          </div>
                        </TableCell>
                        <TableCell>{reservation.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {reservation.guests}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reservation.table}</Badge>
                        </TableCell>
                        <TableCell>
                          {reservation.status === "confirmed" ? (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-0">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View</Button>
                            {reservation.status === "pending" && (
                              <Button size="sm">Confirm</Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Reviews</h2>
                  <Button variant="outline">View All</Button>
                </div>
                <div className="space-y-4">
                  {recentReviews.map((review, i) => (
                    <div key={i} className="pb-4 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
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
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
