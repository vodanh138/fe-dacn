import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../services/http";
import Header from "../components/Header";
import Posts from "../components/Post/Posts";
import LoadingPage from "../components/Loading/loading";

const Friend = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

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

      if (response.status === 200) {
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
    const fetchUserData = async () => {
      try {
        const stoken = JSON.parse(sessionStorage.getItem("access_token"));
        if (stoken) {
          const response = await http.get(`/api/profile/${id}`, {
            headers: {
              Authorization: `Bearer ${stoken}`,
            },
          });
          setUser(response.data.data);
          setPosts(response.data.data.posts);
          console.log(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) return <LoadingPage/>;
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
              />
            </div>
          )}
          <div className="bg-white p-8 shadow-lg rounded-lg flex flex-col items-center relative -mt-20 z-10">
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.ava}
                alt={`Avatar of ${user.firstname} ${user.lastname}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <h2 className="text-2xl font-semibold text-gray-800">{`${user.name}`}</h2>
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
    </>
  );
};

export default Friend;
