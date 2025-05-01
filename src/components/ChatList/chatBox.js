import React, { useState } from "react";
import {
  collection,
  query,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
  getFirestore,
  getDoc,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import firebaseConfig from "./firebaseconfig";
import { initializeApp } from "firebase/app";
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const Chatbox = ({ selectedChatId, sender }) => {
  const [sending, setSending] = useState("");
  const messagesRef = selectedChatId
    ? collection(firestore, selectedChatId)
    : null;
  const messagesQuery = messagesRef
    ? query(messagesRef, orderBy("createdAt", "desc"))
    : null;

  const [messages] = useCollectionData(
    messagesQuery ?? query(collection(firestore, "__dummy__")),
    { idField: "id" }
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };
  
  const handleSend = async () => {
    if (!sending.trim() || !messagesRef) return;
    setSending("");
    const messageId = Date.now().toString();
    const messageRef = doc(messagesRef, messageId);
    const timestamp = serverTimestamp();

    await setDoc(messageRef, {
      id: messageId,
      text: sending,
      createdAt: serverTimestamp(),
      sender: sender || "unknown",
      reaction: {},
    });

    const initDocRef = doc(firestore, selectedChatId, "init");
    const initDocSnap = await getDoc(initDocRef);
    if (initDocSnap.exists()) {
      const data = initDocSnap.data();
      const members = data.member || [];

      // Cập nhật lastMessage cho mỗi user trong chatbox collection
      const updatePromises = members.map((memberId) => {
        const chatboxRef = doc(firestore, "chatbox", String(memberId));
        return setDoc(
          chatboxRef,
          {
            [selectedChatId]: {
              lastMessage: timestamp,
            },
          },
          { merge: true }
        );
      });

      await Promise.all(updatePromises);
    }
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white p-4">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 mb-4">
        {messages &&
          messages
            .filter((msg) => msg.sender !== "system")
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === sender ? "justify-end" : "justify-start"
                }`}
              >
                {/* {msg.sender != sender && (
                  <img
                    src={"https://res.cloudinary.com/dcrmd6dqj/image/upload/v1746043161/" + "/images/gemini.jpg"}
                    alt={"bot"}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  />
                )} */}

                <div
                  className={`p-4 max-w-[80%] w-fit rounded-lg break-words mb-4 ${
                    msg.sender === sender
                      ? "bg-[#D84152] text-white ml-auto"
                      : "bg-gray-100 text-black mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={sending}
          onChange={(e) => setSending(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
