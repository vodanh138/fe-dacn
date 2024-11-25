import React, { useEffect, useState } from "react";
import Chatbox from '../components/Chatbox/index';
import Login from "../components/Login/login";
import Header from "../components/Header/header";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) 
        setIsLoggedIn(true);
  }, []);

  if (!isLoggedIn)
    return (
      <Login/>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header/>

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white p-4 shadow-md rounded-lg"></div>
      </main>

      <footer className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between"></div>
      </footer>
      <Chatbox/> 
    </div>
  );
};

export default Dashboard;
