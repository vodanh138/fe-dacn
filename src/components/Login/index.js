import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/http";
import Popup from "../Popup";
import { usePopup } from "../../contexts/PopupContext";
const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { popup, setPopup, onClose } = usePopup();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await http.post("/api/login", { username, password });
          if (
            response?.data?.status === "success" &&
            response?.data?.data?.access_token
          ) {
            sessionStorage.setItem(
              "access_token",
              JSON.stringify(response?.data?.data?.access_token)
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
            window.location.reload();
          }
          console.log(response?.data);
        } catch (error) {
          console.error("Login failed", error);
          setPopup({
            notiOn: true,
            apiStatus: error.response?.data?.status,
            apiMessage: error.response?.data?.message,
          });
          setTimeout(() => {
            setPopup({
              notiOn: false,
              apiStatus: error.response?.data?.status,
              apiMessage: error.response?.data?.message,
            });
          }, 3000);
        }
      };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
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
            Login
          </button>
        </form>
        <button
          onClick={() => navigate("/register")}
          className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
      </div>
      {popup.notiOn && (
        <Popup
          status={popup.apiStatus}
          message={popup.apiMessage || "Server Error"}
          onClose={onClose}
        />
      )}
    </div>
  );
};
export default Login;
