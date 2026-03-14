import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { DiscoverPage } from "./pages/discover-page";
import { RestaurantDetailPage } from "./pages/restaurant-detail-page";
import { ReservationPage } from "./pages/reservation-page";
import { UserProfilePage } from "./pages/user-profile-page";
import { OwnerDashboardPage } from "./pages/owner-dashboard-page";
import { NotFoundPage } from "./pages/not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/discover",
    Component: DiscoverPage,
  },
  {
    path: "/restaurant/:id",
    Component: RestaurantDetailPage,
  },
  {
    path: "/reservation/:id",
    Component: ReservationPage,
  },
  {
    path: "/profile",
    Component: UserProfilePage,
  },
  {
    path: "/owner/dashboard",
    Component: OwnerDashboardPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
