import React, { useEffect, useState } from "react";
import { http } from "../services/http";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [ava, setAva] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const untrimtoken = sessionStorage.getItem("access_token");
      const token = untrimtoken.replace(/"/g, "");
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await http.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAva(process.env.REACT_APP_API_URL + response.data.data.user.ava);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await http.post("/api/login", { username, password });
      if (
        response.data.status === "success" &&
        response.data.data.access_token
      ) {
        sessionStorage.setItem(
          "access_token",
          JSON.stringify(response.data.data.access_token)
        );
        window.location.reload();
      }
      console.log(response.data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <button
            onClick={() => navigate("/register")}
            className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">*Logo*</h1>

          <div className="relative flex items-center space-x-4">
            <button
              onClick={() => {}}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
            >
              Messenger
            </button>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <img
                src={ava}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-black focus:outline-none"
              />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white p-4 shadow-md rounded-lg"></div>
      </main>

      <footer className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between"></div>
      </footer>
    </div>
  );
};

export default Dashboard;
