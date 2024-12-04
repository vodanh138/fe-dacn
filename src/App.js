import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./feature/register";
import Dashboard from "./feature/home";
import Profile from "./feature/profile";
import Friend from "./feature/friend";
import { UserProvider } from "./contexts/UserContext";
import "./tailwind.css";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/message" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/user/:id" element={<Friend />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
