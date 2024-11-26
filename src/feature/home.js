import React, { useEffect, useState } from "react";
import Chatbox from "../components/Chatbox/index";
import Login from "../components/Login/login";
import Header from "../components/Header/header";
import Post from "../components/Post/Post";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const untrimtoken = sessionStorage.getItem("access_token");
    if (untrimtoken) setIsLoggedIn(true);
  }, []);

  if (!isLoggedIn) return <Login />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <Post />
      <Chatbox />
    </div>
  );
};

export default Dashboard;
