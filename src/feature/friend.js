import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../services/http";
import Header from "../components/Header";

const Friend = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

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
          console.log(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) return <p className="text-center mt-4">Loading...</p>;
  return (
    <>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
        <div className="w-full max-w-4xl relative">
          <div className="relative">
            <img
              src={process.env.REACT_APP_API_URL + user.coverphoto}
              alt={`${user.name}`}
              className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
            />
          </div>
          <div className="bg-white p-8 shadow-md rounded-lg flex flex-col items-center relative -mt-32 z-10">
            <div className="relative">
              <img
                src={process.env.REACT_APP_API_URL + user.ava}
                alt={`Avatar of ${user.name}`}
                className="w-40 h-40 rounded-full border-4 border-white shadow-lg cursor-pointer"
              />
            </div>
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-2xl font-semibold">{`${user.name}`}</h2>
            </div>
            <p className="text-gray-700 mb-6">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Friend;
