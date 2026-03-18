import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Search, Sparkles, TrendingUp, BookOpen, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function Navigation() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navItems = [
    { path: "/discover", label: "Discover", icon: Search },
    { path: "/trending", label: "Trending", icon: TrendingUp },
    { path: "/ai-concierge", label: "AI Concierge", icon: Sparkles },
    { path: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-card/80 backdrop-blur-xl shadow-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#ea6a0f] flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#F97316] to-[#6366F1] bg-clip-text text-transparent">
                SUFI
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className="relative flex items-center gap-2 text-sm font-medium transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className={isActive ? "text-[#F97316]" : "text-foreground/70 hover:text-foreground"}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#F97316]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
