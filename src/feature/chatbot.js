import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { http } from "../services/http";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const untrimtoken = sessionStorage.getItem("access_token");
    if (untrimtoken) {
      const token = untrimtoken.replace(/"/g, "");
      try {
        const response = await http.post("/api/chatbot",{ message: input }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const botMessage = {
          role: "bot",
          text: data.candidates[0].content.parts[0].text,
        };

        setMessages((prev) => [...prev, botMessage]);
        setInput("");
      } catch (error) {
        console.error("Failed to sent message to AI", error);
      }
    }
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header cố định */}
      <Header />

      {/* Khung chat (dưới header) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-[60px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 max-w-xl rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
