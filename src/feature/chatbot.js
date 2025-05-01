import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { http } from "../services/http";
import {
  collection,
  doc,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../components/Chatbox/firebaseconfig";
import { useCollectionData } from "react-firebase-hooks/firestore";
import bot from "../assets/gemini.jpg";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const Chatbot = () => {
  const [userId, setuserId] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const untrimmedToken = sessionStorage.getItem("access_token");
      if (untrimmedToken) {
        const token = untrimmedToken.replace(/"/g, "");
        try {
          const response = await http.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = response?.data?.data?.user;
          setuserId(userData.id);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const messagesRef = collection(firestore, "AI" + userId);
  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));
  const [fireMessages] = useCollectionData(messagesQuery, { idField: "id" });
  const reversedMessages = fireMessages?.slice().reverse();

  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setInput("");
    const messageId = Date.now().toString();
    const messageRef = doc(messagesRef, messageId);
    await setDoc(messageRef, {
      id: messageId,
      text: input,
      sender: "user",
      createdAt: serverTimestamp(),
    });
    chatRef.current?.scrollIntoView({ behavior: "smooth" });

    const untrimtoken = sessionStorage.getItem("access_token");
    if (untrimtoken) {
      const token = untrimtoken.replace(/"/g, "");
      try {
        const response = await http.post(
          "/api/chatbot",
          { message: input },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const messageId = Date.now().toString();
        const messageRef = doc(messagesRef, messageId);
        await setDoc(messageRef, {
          id: messageId,
          text: response?.data?.data?.ai_message
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
          sender: "bot",
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(
          "Failed to send message to AI",
          error?.response?.data?.status
        );
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {reversedMessages &&
          reversedMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <img
                  src={bot}
                  alt={"bot"}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                />
              )}
              <div
                className={`p-4 max-w-[80%] w-fit rounded-lg break-words mb-4 ${
                  msg.sender === "user"
                    ? "bg-[#D84152] text-white ml-auto"
                    : "bg-gray-100 text-black mr-auto"
                }`}
              >
                {msg.sender === "bot" ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}

        <div ref={chatRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
