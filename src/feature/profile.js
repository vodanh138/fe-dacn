import React, { useState, useEffect } from "react";
import { http } from "../services/http";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Posts from "../components/Post/Posts";
import LoadingPage from "../components/Loading/loading";
import Popup from "../components/Popup";
import { usePopup } from "../contexts/PopupContext";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newCoverPhoto, setNewCoverPhoto] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const { popup, setPopup, onClose } = usePopup();
  const navigate = useNavigate();

  const handleLike = async (postId, isLiked) => {
    try {
      const token = JSON.parse(sessionStorage.getItem("access_token"));
      const response = await http({
        method: isLiked ? "DELETE" : "POST",
        url: `/api/post/${postId}/like`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: isLiked ? post.likes - 1 : post.likes + 1,
                  isLiked: !isLiked,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

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

        if (response?.data?.status === "success") {
          setUser(response?.data?.data?.user);
          setNewLastName(response?.data?.data?.user?.lastname);
          setNewFirstName(response?.data?.data?.user?.firstname);
          setFollowers(response?.data?.data?.follower);
          setFollowing(response?.data?.data?.following);
          setPosts(response?.data?.data?.posts);
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
      const response = await http.put(
        "/api/profile",
        { lastname: newLastName, firstname: newFirstName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPopup({
        notiOn: true,
        apiStatus: response?.data?.status,
        apiMessage: response?.data?.message,
      });
      setTimeout(() => {
        setPopup({
          notiOn: false,
          apiStatus: response?.data?.status,
          apiMessage: response?.data?.message,
        });
      }, 3000);
      setUser((prev) => ({
        ...prev,
        firstname: newFirstName,
        lastname: newLastName,
      }));
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
      setPopup({
        notiOn: true,
        apiStatus: error?.response?.data?.status,
        apiMessage: error?.response?.data?.message,
      });
      setTimeout(() => {
        setPopup({
          notiOn: false,
          apiStatus: error?.response?.data?.status,
          apiMessage: error?.response?.data?.message,
        });
      }, 3000);
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
      const res =await http.post(`/api/upload/${type}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res?.data?.status === "success") {
        setPopup({
          notiOn: true,
          apiStatus: res?.data?.status,
          apiMessage: res?.data?.message,
        });
        setTimeout(() => {
          setPopup({
            notiOn: false,
            apiStatus: res?.data?.status,
            apiMessage: res?.data?.message,
          });
        }, 3000);
      }

      const response = await http.get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.status === "success") {
        setUser(response?.data?.data?.user);
      }
    } catch (error) {
      console.error("Failed to upload file", error);
      setPopup({
        notiOn: true,
        apiStatus: error?.response?.data?.status,
        apiMessage: error?.response?.data?.message,
      });
      setTimeout(() => {
        setPopup({
          notiOn: false,
          apiStatus: error?.response?.data?.status,
          apiMessage: error?.response?.data?.message,
        });
      }, 3000);
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

  if (!user) return <LoadingPage />;

  return (
    <>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-gray-50 py-6">
        <div className="w-full max-w-4xl relative">
          {user.coverphoto && (
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.coverphoto}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer"
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
          <div className="bg-white p-8 shadow-lg rounded-lg flex flex-col items-center relative -mt-20 z-10">
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.ava}
                alt={`Avatar of ${user.firstname} ${user.lastname}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
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
              <div className="flex flex-col items-center mt-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1 text-gray-600">
                    Lastname:
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1 text-gray-600">
                    Firstname:
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleNameChange}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center mt-4">
                <h2 className="text-2xl font-semibold text-gray-800">{`${user.lastname} ${user.firstname}`}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
                >
                  Edit Name
                </button>
              </div>
            )}
            <div className="flex justify-around mt-4 w-full">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{followers}</h3>
                <p className="text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{following}</h3>
                <p className="text-gray-600">Following</p>
              </div>
            </div>
          </div>
          <div className="bg-white mt-4 p-6 shadow-md rounded-lg">
            {Array.isArray(posts) && posts.length === 0 ? (
              <p className="text-gray-500 text-center">
                You don't have any posts yet.
              </p>
            ) : (
              posts.map((post, index) => (
                <Posts
                  key={index}
                  post={post}
                  index={index}
                  handleLike={handleLike}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {popup.notiOn && (
        <Popup
          status={popup.apiStatus}
          message={popup.apiMessage || "Server Error"}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default Profile;
