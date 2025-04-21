import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import Header from "../components/Header";
import Post from "../components/Post";
import { http } from "../services/http";
import LoadingPage from "../components/Loading/loading";
import { useUser } from "../contexts/UserContext";
import Chatbox from "../components/Chatbox";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const { loggedUser, setLoggedUser } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      const untrimmedToken = sessionStorage.getItem("access_token");
      if (untrimmedToken) {
        const token = untrimmedToken.replace(/"/g, "");
        try {
          const response = await http.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = response?.data?.data?.user;
          setLoggedUser({
            ava: process.env.SECRET_APP_API_URL + userData.ava,
            id: userData.id,
            isLoggedIn: true,
          });
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [setLoggedUser]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!loggedUser || !loggedUser.isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header ava={loggedUser.ava} id={loggedUser.id} />
      <Post />
      <Chatbox />
    </div>
  );
};

export default Dashboard;
