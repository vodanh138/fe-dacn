import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../services/http";
import Header from "../components/Header";
import Posts from "../components/Post/Posts";
import LoadingPage from "../components/Loading/loading";
import Popup from "../components/Popup";
import { usePopup } from "../contexts/PopupContext";
import Chatbox from "../components/Chatbox";

const Friend = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollow, setIsFollow] = useState(false);
  const { popup, setPopup, onClose } = usePopup();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const navigate = useNavigate();

  const handlePrivateMessage = () => {
    navigate(`/messenger/${id}`)
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
          console.log(response);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

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

  const handleAddFollow = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("access_token"));
      const response = await http({
        method: isFollow ? "DELETE" : "POST",
        url: `/api/follow/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.status === 200) {
        setIsFollow(!isFollow);
        console.log(response?.data);
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
        setFollowers(isFollow ? followers - 1 : followers + 1);
      }
    } catch (error) {
      console.error(
        "Failed to handle Follow request",
        error?.response?.data?.message
      );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const stoken = JSON.parse(sessionStorage.getItem("access_token"));
        if (stoken) {
          const response = await http.get(`/api/profile/${id}`, {
            headers: {
              Authorization: `Bearer ${stoken}`,
            },
          });
          setUser(response?.data?.data);
          setPosts(response?.data?.data?.posts);
          setIsFollow(response?.data?.data?.isFollow);
          setFollowers(response?.data?.data?.follower);
          setFollowing(response?.data?.data?.following);
          console.log(response?.data?.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) return <LoadingPage />;
  return (
    <>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-gray-50 py-6">
        <div className="w-full max-w-4xl relative">
          {user.coverphoto && (
            <div className="relative">
              <img
                src={process.env.SECRET_APP_API_URL + user.coverphoto}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer"
              />
            </div>
          )}
          <div className="bg-white p-8 shadow-lg rounded-lg flex flex-col items-center relative -mt-20 z-10">
            <div className="relative">
              <img
                src={process.env.SECRET_APP_API_URL + user.ava}
                alt={`Avatar of ${user.firstname} ${user.lastname}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <h2 className="text-2xl font-semibold text-gray-800">{`${user.name}`}</h2>
            </div>

            <div className="flex justify-between mt-4 space-x-4">
              <button
                onClick={handleAddFollow}
                className={`px-4 py-2 rounded-lg text-white ${
                  isFollow ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {isFollow ? "Unfollow" : "Follow"}
              </button>

              <button
                onClick={handlePrivateMessage}
                className="px-4 py-2 rounded-lg text-white bg-green-500"
              >
                Message
              </button>
            </div>
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
                This user has no posts yet.
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
      <Chatbox />
    </>
  );
};

export default Friend;
