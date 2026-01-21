import { createBrowserRouter } from "react-router";

import ApplicationPage from "../pages/ApplicationPage";
import DefaultLandingPage from "../pages/DefaultLandingPage";
import ReviewChangesPage from "../pages/ReviewChangesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLandingPage />,
  },
  {
    path: "/request-listing-page",
    element: <ApplicationPage />,
  },
  {
    path: "/review-changes",
    element: <ReviewChangesPage />,
  },
]);

export default router;
