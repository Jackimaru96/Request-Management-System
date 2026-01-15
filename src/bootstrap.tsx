import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import AppWrapper from "./AppWrapper";
import router from "./routes/router";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(
  <AppWrapper>
    <RouterProvider router={router} />
  </AppWrapper>,
);

export default {};
