import React, { useState, useEffect } from "react";
import { http } from "../services/http";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newCoverPhoto, setNewCoverPhoto] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = JSON.parse(sessionStorage.getItem("access_token"));
        if (!token) {
          navigate("/");
          return;
        }
        const response = await http.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          setUser(response.data.data.user);
          setNewLastName(response.data.data.user.lastname);
          setNewFirstName(response.data.data.user.firstname);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleNameChange = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("access_token"));
      await http.put(
        "/api/profile",
        { lastname: newLastName, firstname: newFirstName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser((prev) => ({
        ...prev,
        firstname: newFirstName,
        lastname: newLastName,
      }));
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
    }
  };

  const handleCoverPhotoChange = (e) => {
    setNewCoverPhoto(e.target.files[0]);
  };

  const handleAvatarChange = (e) => {
    setNewAvatar(e.target.files[0]);
  };

  const handleFileUpload = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = JSON.parse(sessionStorage.getItem("access_token"));
      await http.post(`/api/upload/${type}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const response = await http.get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error("Failed to upload file", error);
    }
  };

  useEffect(() => {
    if (newCoverPhoto) {
      handleFileUpload(newCoverPhoto, "coverphoto");
    }
  }, [newCoverPhoto]);

  useEffect(() => {
    if (newAvatar) {
      handleFileUpload(newAvatar, "avatar");
    }
  }, [newAvatar]);

  if (!user) return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
        <div className="w-full max-w-4xl relative">
          {user.coverphoto && (
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.coverphoto}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
                onClick={() =>
                  document.getElementById("coverPhotoInput").click()
                }
              />
              <input
                type="file"
                id="coverPhotoInput"
                className="hidden"
                accept="image/*"
                onChange={handleCoverPhotoChange}
              />
            </div>
          )}
          <div className="bg-white p-8 shadow-md rounded-lg flex flex-col items-center relative -mt-32 z-10">
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.ava}
                alt={`Avatar of ${user.firstname} ${user.lastname}`}
                className="w-40 h-40 rounded-full border-4 border-white shadow-lg cursor-pointer"
                onClick={() => document.getElementById("avatarInput").click()}
              />
              <input
                type="file"
                id="avatarInput"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            {editingName ? (
              <div className="flex flex-col items-center mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Lastname:
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Firstname:
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                  />
                </div>
                <button
                  onClick={handleNameChange}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="mt-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-4">
                <h2 className="text-2xl font-semibold">{`${user.lastname} ${user.firstname}`}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="mt-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-200"
                >
                  Edit Name
                </button>
              </div>
            )}
            <p className="text-gray-700 mb-6">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
