import React from "react";
import Login from "src/pages/login";
import NotFoundPage from "src/pages/404";

export const pageRoutes = [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <div>Home</div>,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    }
]
