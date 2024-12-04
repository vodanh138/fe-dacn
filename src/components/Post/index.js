import { useEffect, useState } from "react";
import { http } from "../../services/http";
import Posts from "./Posts";
import Popup from "../Popup";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [token, setToken] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [notiOn, setNotiOn] = useState("");
  const [apiStatus, setApiStatus] = useState("");
  const [apiMessage, setApiMessage] = useState("");

  const handleClosePopup = () => {
    setNotiOn(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFileName("");
      setImagePreview(null);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
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
    const fetchPost = async () => {
      try {
        const stoken = JSON.parse(sessionStorage.getItem("access_token"));
        if (stoken) {
          setToken(stoken);
          const response = await http.get("/api/post", {
            headers: {
              Authorization: `Bearer ${stoken}`,
            },
          });

          if (response.data.status === "success") {
            setPosts(response.data.data.posts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };

    fetchPost();
  }, []);

  const handleCreatePost = async () => {
    if (newPost.trim() && token) {
      const formData = new FormData();
      const imageFile = document.getElementById("postImage").files[0];

      if (imageFile) {
        formData.append("image", imageFile);
      }

      formData.append("content", newPost);

      try {
        const response = await http.post("/api/post", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          const createdPost = response.data.data.posts;
          setPosts([createdPost, ...posts]);
          setNewPost("");
          setImagePreview("");
          setSelectedFileName(null);
          setNotiOn(true);
          setTimeout(() => {
            setNotiOn(false);
          }, 3000);
          setApiStatus(response.data.status);
          setApiMessage(response.data.message);
          document.getElementById("postImage").value = "";
        }
      } catch (error) {
        console.error("Failed to create post", error);
        setNotiOn(true);
        setTimeout(() => {
          setNotiOn(false);
        }, 3000);
        setApiStatus(error.response.data.status);
        setApiMessage(error.response.data.message);
      }
    }
  };

  return (
    <>
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white p-4 shadow-md rounded-lg mb-4">
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Post something..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="mt-2 flex items-center">
            <label
              htmlFor="postImage"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-200 hover:text-gray-900"
            >
              Image
            </label>
            <span className="ml-2 text-gray-500 text-sm">
              {selectedFileName || "No Image"}
            </span>
            <input
              type="file"
              id="postImage"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img
                src={imagePreview}
                alt="Preview of selected file"
                className="w-full max-w-xs rounded-lg shadow-md"
              />
              <button
                className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 focus:outline-none"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedFileName("");
                  document.getElementById("postImage").value = "";
                }}
              >
                &times;
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-start">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreatePost}
            >
              Post
            </button>
          </div>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          {Array.isArray(posts) && posts.length === 0 ? (
            <p className="text-gray-500">There are no posts for you yet.</p>
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
      </main>
      <footer className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between"></div>
      </footer>
      {notiOn && <Popup status={apiStatus} message={apiMessage} onClose={handleClosePopup} />}
    </>
  );
};
export default Post;