import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./feature/register";
import Dashboard from "./feature/home";
import Profile from "./feature/profile";
import Friend from "./feature/friend";
import { UserProvider } from "./contexts/UserContext";
import "./tailwind.css";
import { PopupProvider } from "./contexts/PopupContext";
import { LoadingProvider } from "./contexts/LoadingContext";

const App = () => {
  return (
    <UserProvider>
      <LoadingProvider>
        <PopupProvider>
          <Router>
            <Routes>
              {/* <Route path="/message" element={<Messenger />} /> */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/user/:id" element={<Friend />} />
            </Routes>
          </Router>
        </PopupProvider>
      </LoadingProvider>
    </UserProvider>
  );
};

export default App;
