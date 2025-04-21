import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/http";
import { useUser } from "../../contexts/UserContext";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { loggedUser } = useUser();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() !== "") {
      const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) {
        const token = untrimtoken.replace(/"/g, "");
        try {
          const response = await http.get(`/api/search?search=${query}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSearchResults(response?.data?.data?.users);
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
      {searchResults && searchQuery.trim() !== "" && searchResults.length === 0 && (
        <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-10 text-center py-2">
          <span>No User Found</span>
        </div>
      )}
      {searchResults && searchResults.length > 0 && (
        <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-10">
          {searchResults.map((user) => (
            <button
              key={user.id}
              className="w-full text-left px-4 py-2 hover:bg-gray-200 flex items-center space-x-4"
              onClick={() =>
                user.id === loggedUser.id
                  ? navigate(`/profile`)
                  : navigate(`/user/${user.id}`)
              }
            >
              <img
                src={process.env.SECRET_APP_API_URL + user.ava}
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
