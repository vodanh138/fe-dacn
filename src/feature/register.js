import React, { useState } from "react";
import { http } from "../services/http";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiStatus, setApiStatus] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [notiOn, setNotiOn] = useState("");
  const navigate = useNavigate();

  const handleClosePopup = () => {
    setNotiOn(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await http.post("/api/register", { username, password });
      setApiStatus(response?.data?.status);
      setApiMessage(response?.data?.message);
      console.log(response?.data);
      setNotiOn(true);
      setTimeout(() => {
        setNotiOn(false);
      }, 3000);
    } catch (error) {
      console.error("Registration failed", error);
      setApiStatus(error?.response?.data?.status);
      setApiMessage(error?.response?.data?.message);
      setNotiOn(true);
      setTimeout(() => {
        setNotiOn(false);
      }, 3000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Back to Login
        </button>
      </div>
      {notiOn && <Popup status={apiStatus} message={apiMessage || "Server Error"} onClose={handleClosePopup}/>}
    </div>
  );
};

export default Register;
