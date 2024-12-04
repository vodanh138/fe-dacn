import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/http";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() !== "") {
      const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) {
        const token = untrimtoken.replace(/"/g, "");
        try {
          const response = await http.get(`/api/search?search=${e.target.value}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSearchResults(response.data.data.users);
        } catch (error) {
          console.error("Failed to search users", error);
        }
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search users..."
        className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {searchResults && searchResults.length > 0 && (
        <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-10">
          {searchResults.map((user) => (
            <button
            key={user.id}
            className="w-full text-left px-4 py-2 hover:bg-gray-200 flex items-center space-x-4"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <img
              src={process.env.REACT_APP_API_URL + user.ava}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
          </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;