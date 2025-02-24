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

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

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

        const botMessage = {
          role: "bot",
          text: response?.data?.data?.ai_message,
        };
        setMessages((prev) => [...prev, botMessage]);

        const messageId = Date.now().toString();
        const messageRef = doc(messagesRef, messageId);
        await setDoc(messageRef, {
          id: messageId,
          text: input,
          response: response?.data?.data?.ai_message,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to send message to AI", error);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-[60px]">
        {reversedMessages &&
          reversedMessages.map((msg, index) => (
            <div key={index}>
              <div className={`flex justify-end`}>
                <div
                  className={`p-3 max-w-xl rounded-lg bg-blue-500 text-white`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
              <div className={`flex justify-start`}>
                <div
                  className={`p-3 max-w-xl rounded-lg bg-gray-200 text-black`}
                >
                  <p>{msg.response}</p>
                </div>
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
