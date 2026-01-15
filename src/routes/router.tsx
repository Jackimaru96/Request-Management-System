import { createBrowserRouter } from "react-router";

import ApplicationPage from "../pages/ApplicationPage";
import DefaultLandingPage from "../pages/DefaultLandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLandingPage />,
  },
  {
    path: "/request-listing-page",
    element: <ApplicationPage />,
  },
]);

export default router;
