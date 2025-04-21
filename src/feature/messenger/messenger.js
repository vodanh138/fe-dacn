import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { http } from "../../services/http";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseconfig";
import { useDocumentData } from "react-firebase-hooks/firestore";
import Chatbox from "../../components/ChatList/chatBox";
import ChatList from "../../components/ChatList/chatList";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import LoadingPage from "../../components/Loading/loading";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const Messenger = () => {
  const { id } = useParams();
  const [userId, setuserId] = useState(0);
  const [selectedChat, setSelectedChatForP] = useState(id + "_" + userId);

  useEffect(() => {
    const checkOrCreateChatCollection = async (receiverId, senderId) => {
      const col1 = `${receiverId}_${senderId}`;
      const col2 = `${senderId}_${receiverId}`;

      const col1Snapshot = await getDocs(collection(firestore, col1));
      const col2Snapshot = await getDocs(collection(firestore, col2));

      if (!col1Snapshot.empty) {
        setSelectedChatForP(col1);
      } else if (!col2Snapshot.empty) {
        setSelectedChatForP(col2);
      } else if (senderId && receiverId) {
        const newCollection = `${senderId}_${receiverId}`;
        const messageId = Date.now().toString();
        const dummyDoc = doc(firestore, newCollection, "init"); // dummy doc
        await setDoc(dummyDoc, {
          id: messageId,
          createdAt: serverTimestamp(),
          sender: "system",
          messages: [],
          member: [senderId.toString(), receiverId.toString()],
        });
        const senderChatboxRef = doc(firestore, "chatbox", String(senderId));
        const receiverChatboxRef = doc(
          firestore,
          "chatbox",
          String(receiverId)
        );

        const chatboxDataForSender = {
          [newCollection]: {
            type: "friend",
            id: newCollection,
            friendId: receiverId.toString(),
            lastMessage: new Timestamp(0, 0),
          },
        };

        const chatboxDataForReceiver = {
          [newCollection]: {
            type: "friend",
            id: newCollection,
            friendId: senderId.toString(),
            lastMessage: new Timestamp(0, 0),
          },
        };

        await Promise.all([
          setDoc(senderChatboxRef, chatboxDataForSender, { merge: true }),
          setDoc(receiverChatboxRef, chatboxDataForReceiver, { merge: true }),
        ]);

        setSelectedChatForP(newCollection);
      } else {
        console.log(senderId, receiverId);
      }
    };

    if (userId && id) {
      checkOrCreateChatCollection(id, userId);
    }
  }, [id, userId]);

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

  const chatboxQuery = doc(firestore, "chatbox", String(userId));
  const [chatboxs] = useDocumentData(chatboxQuery, { idField: "id" });
  if (id && !chatboxs) return (<><Header /><LoadingPage/></>)
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {" "}
        <ChatList
          chatList={chatboxs}
          setSelectedChatForP={setSelectedChatForP}
        />
        <Chatbox selectedChatId={selectedChat} sender={userId} />
      </div>
    </div>
  );
};
export default Messenger;
