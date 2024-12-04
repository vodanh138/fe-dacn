import React, { useEffect, useState } from "react";
import { http } from "../../services/http";
import Like from "./Like";

const Comment = ({ post_id }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) {
        const token = untrimtoken.replace(/"/g, "");
        try {
          const response = await http.get(`/api/comment/${post_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setComments(response.data.data.comments);
        } catch (error) {
          console.error("Failed to fetch comments", error);
        }
      }
    };
    fetchComments();
  }, [post_id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const untrimtoken = sessionStorage.getItem("access_token");
    if (untrimtoken) {
      const token = untrimtoken.replace(/"/g, "");
      try {
        const response = await http.post(
          `/api/comment/${post_id}`,
          { content: newComment },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments((prevComments) => [...prevComments, response.data.data]);
        setNewComment("");
      } catch (error) {
        console.error("Failed to post comment", error);
      }
    }
  };

  const handleLikeComment = async (commentId, isLiked) => {
    console.log(commentId);
    const untrimtoken = sessionStorage.getItem("access_token");
    if (untrimtoken) {
      const token = untrimtoken.replace(/"/g, "");
      try {
        const response = await http({
          method: isLiked ? "DELETE" : "POST",
          url: `/api/comment/${commentId}/like`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked
                      ? comment.likes - 1
                      : comment.likes + 1,
                  }
                : comment
            )
          );
        }
      } catch (error) {
        console.error("Failed to like comment", error);
      }
    }
  };

  return (
    <div className="mt-4">
      <p className="font-medium text-gray-800 mb-2">Comments:</p>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="p-2 border rounded bg-gray-100">
            <div className="flex items-center mb-2">
              <img
                src={process.env.REACT_APP_API_URL + comment.user_ava}
                alt={comment.user_name}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <p className="font-medium text-gray-700">{comment.user_name}</p>
            </div>
            <p className="text-gray-700 mb-2">{comment.content}</p>
            <div className="flex items-center space-x-2">
              <Like
                isLiked={comment.isLiked}
                likes={comment.likes}
                handleLike={() => handleLikeComment(comment.id, comment.isLiked)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center">
        <input
          type="text"
          className="flex-grow border rounded p-2 text-gray-700"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleAddComment}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default Comment;
