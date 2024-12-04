import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/http";
import SearchBar from "./search";

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [ava, setAva] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) {
        const token = untrimtoken.replace(/"/g, "");
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

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <button className="text-2xl font-bold" onClick={() => navigate("/")}>
          *Logo*
        </button>
        <SearchBar />
        <div className="relative flex items-center space-x-4">
          <button
            onClick={() => navigate("/message")}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
          >
            Messenger
          </button>
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
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
  );
};

export default Header;
