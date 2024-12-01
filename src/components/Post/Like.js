import React from "react";

const Like = ({ isLiked, likes, handleLike }) => {
  return (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 cursor-pointer transition-transform duration-300 transform hover:scale-110"
        viewBox="0 0 20 20"
        fill={isLiked ? "red" : "white"}
        stroke={isLiked ? "red" : "gray"}
        strokeWidth="2"
        onClick={handleLike}
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656l-6.364 6.364a1 1 0 01-1.414 0l-6.364-6.364a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
      <span className="ml-2 text-gray-600">{likes}</span>
    </div>
  );
};

export default Like;
