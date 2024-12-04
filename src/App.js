import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./feature/register";
import Dashboard from "./feature/home";
import "./tailwind.css";
import Profile from "./feature/profile";
import Friend from "./feature/friend";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/message" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile/:id" element={<Friend />} />
      </Routes>
    </Router>
  );
};

export default App;
