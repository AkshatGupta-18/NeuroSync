import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<Success />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;