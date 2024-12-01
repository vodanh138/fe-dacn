import React, { useState } from "react";
import Comment from "./Comment";
import Like from "./Like";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";

const Posts = ({ post, index, handleLike }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  return (
    <div
      key={index}
      className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex items-center mb-4">
        <img
          src={process.env.REACT_APP_API_URL + post.user_ava}
          alt={post.user}
          className="w-10 h-10 rounded-full object-cover mr-4"
        />
        <div>
          <p className="font-medium text-gray-800">{post.user_name}</p>
          <span className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.content}</p>

      {post.image && (
        <img
          src={process.env.REACT_APP_API_URL + post.image}
          alt="Post"
          className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
        />
      )}
      <hr className="my-4 border-gray-300" />
      <div className="flex items-center space-x-4">
        <Like
          isLiked={post.isLiked}
          likes={post.likes}
          handleLike={() => handleLike(post.id, post.isLiked)}
        />
        <button
          className="flex items-center justify-center text-gray-500 hover:text-blue-500 focus:outline-none"
          onClick={() => toggleComments(index)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon icon={faCommentAlt} className="text-xl" />
        </button>
      </div>
      {commentsVisible && <Comment post_id={post.id} />}
    </div>
  );
};

export default Posts;