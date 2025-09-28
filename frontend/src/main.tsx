import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./modules/auth/AuthProvider";
import Login from "./modules/auth/Login";
import { ProtectedRoute, OperatorRoute, EndUserRoute } from "./modules/auth/ProtectedRoute";
import AppLayout from "./modules/layout/AppLayout";
import Welcome from "./modules/layout/Welcome";
import NewRequestPage from "./modules/flights/NewRequestPage";
import MyRequestsPage from "./modules/flights/MyRequestsPage";
import RequestDetailPage from "./modules/flights/RequestDetailPage";
import OperatorPendingPage from "./modules/operator/OperatorPendingPage";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DestinationsCrudPage from "./modules/admin/DestinationsCrudPage";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <ProtectedRoute><Welcome /></ProtectedRoute> },
  { path: "new", element: <EndUserRoute><NewRequestPage /></EndUserRoute> },
  { path: "requests", element: <EndUserRoute><MyRequestsPage /></EndUserRoute> },
      { path: "requests/:id", element: <ProtectedRoute><RequestDetailPage /></ProtectedRoute> },
      { path: "operator", element: <OperatorRoute><OperatorPendingPage /></OperatorRoute> },
      { path: "destinations", element: <OperatorRoute><DestinationsCrudPage /></OperatorRoute> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
