import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./search";
import LoadingPage from "../Loading/loading";
import { http } from "../../services/http";

const Header = () => {
  const [loggedUser, setLoggedUser] = useState([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    window.location.reload();
  };

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
            ava: process.env.REACT_APP_API_URL + userData.ava,
            id: userData.id,
            isLoggedIn: true,
          });
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    fetchUserData();
  }, []);

  if (!loggedUser.ava) return <LoadingPage />;
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <button className="text-2xl font-bold" onClick={() => navigate("/")}>
          MSA
        </button>
        <SearchBar id={loggedUser.id} />
        <div className="relative flex items-center space-x-4">
          <button
            onClick={() => navigate("/chatbot")}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 
             hover:bg-purple-600 transition duration-300 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 13h-9c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5z" />
            </svg>
            <span className="font-semibold">AI Help</span>
          </button>

          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
            <img
              src={loggedUser.ava}
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
  );
};

export default Header;
