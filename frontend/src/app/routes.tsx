import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Landing } from "./pages/Landing";
import { Discover } from "./pages/Discover";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { Trending } from "./pages/Trending";
import { AIConcierge } from "./pages/AIConcierge";
import { Profile } from "./pages/Profile";
import { Dashboard } from "./pages/Dashboard";
import { Reservations } from "./pages/Reservations";
import { Waitlist } from "./pages/Waitlist";
import { Analytics } from "./pages/Analytics";
import { Docs } from "./pages/Docs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "discover", Component: Discover },
      { path: "restaurant/:id", Component: RestaurantDetail },
      { path: "trending", Component: Trending },
      { path: "ai-concierge", Component: AIConcierge },
      { path: "profile", Component: Profile },
      { path: "dashboard", Component: Dashboard },
      { path: "reservations", Component: Reservations },
      { path: "waitlist", Component: Waitlist },
      { path: "analytics", Component: Analytics },
      { path: "docs", Component: Docs },
      {
        path: "*",
        Component: () => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground">Page not found.</p>
            </div>
          </div>
        ),
      },
    ],
  },
]);
