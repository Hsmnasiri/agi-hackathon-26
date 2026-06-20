import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import App from "./App";
import DashboardPage from "./pages/DashboardPage";
import WorkbenchPage from "./pages/WorkbenchPage";
import TrackerPage from "./pages/TrackerPage";
import AdminPage from "./pages/AdminPage";
import PatientPage from "./pages/PatientPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "workbench", element: <WorkbenchPage /> },
      { path: "tracker", element: <TrackerPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "patient", element: <PatientPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
