import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginForm from "./components/Login/LoginForm";
import Dashboard from "./pages/Dashboard/Dashboard";
import LanguagePage from "./pages/Language/LanguagePage";
import TMPage from "./pages/TM/TMPage";
import ColorsPage from "./pages/Colors/ColorsPage";
import HousesPage from "./pages/Houses/HousesPage";
import ImagesPage from "./pages/Images/ImagesPage";
import Widget from "./pages/Widgets/Widget";
import WidgetDetails from "./pages/Widgets/WidgetDetails";

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />

        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/language"
          element={
            <PrivateRoute>
              <LanguagePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tm"
          element={
            <PrivateRoute>
              <TMPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/colors"
          element={
            <PrivateRoute>
              <ColorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/houses"
          element={
            <PrivateRoute>
              <HousesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/images"
          element={
            <PrivateRoute>
              <ImagesPage />
            </PrivateRoute>
          }
        />
         <Route
          path="/widgets/:id"
          element={<WidgetDetails />} 
        />
    
        <Route
          path="/widgets"
          element={
            <PrivateRoute>
              <Widget />
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
