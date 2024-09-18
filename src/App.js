import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./feature/register";
import Dashboard from "./feature/home";
import "./tailwind.css";
import Profile from "./feature/profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
