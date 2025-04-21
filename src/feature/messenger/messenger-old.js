import { initializeApp } from "firebase/app";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { Button, Input, Layout, Dropdown } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  angryIcon,
  careIcon,
  hahaIcon,
  likeIcon,
  loveIcon,
  sadIcon,
  wowIcon,
} from "../../assets/reactions/reactions";
import firebaseConfig from "../..";
import { http } from "../../services/http";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function Chatbox({userID}) {
  const [visible, setVisible] = useState(false);
  const messagesRef = collection(firestore, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));
  const [messages] = useCollectionData(messagesQuery, { idField: "id" });

  const chatboxQuery = doc(firestore, "chatbox", String(userID));
  const [chatboxx] = useDocumentData(chatboxQuery, { idField: "id" });
  const chatboxs = chatboxx?.chatto || [];

  const [formValue, setFormValue] = useState("");
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState("");
  const [sender, setSender] = useState("");
  const [currentChatUser, setCurrentChatUser] = useState(null);

  const toggleChatbox = () => {
    setVisible(!visible);
  };

  const closeChatbox = () => {
    setVisible(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (visible) {
      scrollToBottom();
    }
  }, [visible]);
  useEffect(() => {
    const sendMessageAsync = async () => {
      if (sending) {
        try {
          setFormValue("");
          const untrimtoken = sessionStorage.getItem("access_token");
          if (untrimtoken) {
            const token = untrimtoken.replace(/"/g, "");
            try {
              const response = await http.get("/api/profile", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setSender(response?.data?.data?.user?.id);
              console.log(response?.data?.data?.user?.id);
            } catch (error) {
              console.error("Failed to fetch user data", error);
            }
          }
          const reaction = {};
          const messageId = Date.now().toString();
          const messageRef = doc(messagesRef, messageId);

          await setDoc(messageRef, {
            id: messageId,
            text: sending,
            createdAt: serverTimestamp(),
            sender,
            reaction,
          });

          setSending("");
          scrollToBottom();
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    };

    sendMessageAsync();
  }, [sending]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (formValue.trim() === "") {
      return;
    }
    setSending(formValue);
  };

  const reversedMessages = messages?.slice().reverse();
  useEffect(() => {
    const getSender = async () => {
      const untrimtoken = sessionStorage.getItem("access_token");
      if (untrimtoken) {
        const token = untrimtoken.replace(/"/g, "");
        try {
          const response = await http.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSender(response?.data?.data?.user?.id);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    getSender();

    scrollToBottom();
    const handleStorageChange = (event) => {
      if (event.storageArea === sessionStorage) {
        console.log("SessionStorage changed:", event);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="chatbox-container">
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={toggleChatbox}
        className="fixed bottom-7 right-7 z-50 shadow-lg hover:shadow-2xl !bg-primary-dominant hover:!bg-primary-dominant-dark focus:!bg-primary-dominant-light"
      />
      {visible && (
        <Layout className={`chatbox ${visible ? "chatbox-visible" : ""}`}>
          <aside className="chatbox-sidebar">
            {Array.isArray(chatboxs)&&   console.log(chatboxs) && chatboxs.map((user) => (
              <div
                key={user}
                // className={`chatbox-user ${
                //   user === currentChatUser.id ? "active" : ""
                // }`}
                onClick={() => setCurrentChatUser(user)}
              >
              </div>
            ))}
          </aside>
          <Header className="chatbox-header">
            <div className="chatbox-title">Chat</div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeChatbox}
            />
          </Header>
          <Content className="chatbox-messages">
            {reversedMessages &&
              reversedMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  text={msg.text}
                  sender={msg.sender}
                  loggedUser={sender}
                  createdAt={msg.createdAt}
                  id={msg.id}
                  reaction={msg.reaction}
                />
              ))}
            <div ref={messagesEndRef} />
          </Content>
          <Footer className="chatbox-input-container">
            <div className="chat-form">
              <form onSubmit={sendMessage}>
                <Input
                  className="chatbox-input"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Type a message"
                  suffix={
                    <SendOutlined
                      onClick={sendMessage}
                      style={{ cursor: "pointer" }}
                    />
                  }
                />
              </form>
            </div>
          </Footer>
        </Layout>
      )}
    </div>
  );
}

function ChatMessage({ text, sender, loggedUser, createdAt, id, reaction }) {
  const messageClass = sender === loggedUser ? "sent" : "received";
  const messageDoc = doc(firestore, "messages", id.toString());
  const [reactions, setReactions] = useState({
    like: 0,
    love: 0,
    haha: 0,
    angry: 0,
    care: 0,
    sad: 0,
    wow: 0,
  });
  const [totalReaction, setTotalReaction] = useState(0);
  const [currentReaction, setcurrentReaction] = useState("");
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const stoken = JSON.parse(sessionStorage.getItem("access_token"));
        if (stoken) {
          const response = await http.get(`/api/profile/${sender}`, {
            headers: {
              Authorization: `Bearer ${stoken}`,
            },
          });
          setUser(response?.data?.data);
          console.log(response?.data?.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [sender]);

  const deleteMessage = async () => {
    try {
      await deleteDoc(messageDoc);
      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const formattedTime = createdAt
    ? `${createdAt.toDate().toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${createdAt.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`
    : "";

  useEffect(() => {
    const findcurrentReaction = async () => {
      try {
        const docSnapshot = await getDoc(messageDoc);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const foundReaction = data.reaction
            ? data.reaction[loggedUser]
            : null;
          setcurrentReaction(foundReaction);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error setting reaction:", error);
      }
    };

    const countReactions = () => {
      const counts = {
        like: 0,
        love: 0,
        haha: 0,
        angry: 0,
        care: 0,
        sad: 0,
        wow: 0,
      };
      let total = 0;
      if (reaction) {
        Object.values(reaction).forEach((reactionType) => {
          if (reactionType in counts) {
            counts[reactionType] += 1;
            total += 1;
          }
        });
      }

      setReactions(counts);
      setTotalReaction(total);
    };
    findcurrentReaction();
    countReactions();
  }, [reaction]);

  const handleReaction = async (value) => {
    try {
      if (currentReaction === value) {
        await updateDoc(messageDoc, {
          [`reaction.${loggedUser}`]: null,
        });
      } else {
        await updateDoc(messageDoc, {
          [`reaction.${loggedUser}`]: value,
        });
        setcurrentReaction(value);
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const items = [
    {
      key: "time",
      label: <span className="text-xs font-thin">{formattedTime}</span>,
    },
    {
      key: "like",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("like")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("like")}
          aria-label="Like"
          className={`p-2 rounded-full ${
            currentReaction === "like"
              ? "bg-lightblue border-2 border-blue-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={likeIcon} alt="Like" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "love",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("love")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("love")}
          aria-label="Love"
          className={`p-2 rounded-full ${
            currentReaction === "love"
              ? "bg-lightblue border-2 border-pink-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={loveIcon} alt="Love" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "haha",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("haha")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("haha")}
          aria-label="Haha"
          className={`p-2 rounded-full ${
            currentReaction === "haha"
              ? "bg-lightblue border-2 border-yellow-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={hahaIcon} alt="Haha" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "wow",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("wow")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("wow")}
          aria-label="Wow"
          className={`p-2 rounded-full ${
            currentReaction === "wow"
              ? "bg-lightblue border-2 border-yellow-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={wowIcon} alt="Wow" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "sad",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("sad")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("sad")}
          aria-label="Sad"
          className={`p-2 rounded-full ${
            currentReaction === "sad"
              ? "bg-lightblue border-2 border-yellow-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={sadIcon} alt="Sad" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "angry",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("angry")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("angry")}
          aria-label="Angry"
          className={`p-2 rounded-full ${
            currentReaction === "angry"
              ? "bg-lightblue border-2 border-red-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={angryIcon} alt="Angry" className="w-6 h-6" />
        </button>
      ),
    },
    {
      key: "care",
      label: (
        <button
          type="button"
          onClick={() => handleReaction("care")}
          onKeyDown={(e) => e.key === "Enter" && handleReaction("care")}
          aria-label="Care"
          className={`p-2 rounded-full ${
            currentReaction === "care"
              ? "bg-lightblue border-2 border-green-500"
              : "bg-gray-100 border-0 hover:bg-gray-200"
          }`}
        >
          <img src={careIcon} alt="Care" className="w-6 h-6" />
        </button>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "more",
      label: (
        <>
          <DeleteOutlined
            className="text-red-500 hover:text-red-700 m-2"
            onClick={() => deleteMessage()}
            style={{ cursor: "pointer" }}
          />
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <div className={`message ${messageClass}`}>
      <div
        className={`text-xs font-medium ${
          messageClass === "sent" ? "text-right" : "text-left"
        }`}
      >
        {messageClass === "received" && <>{user.name}</>}
      </div>

      <div
        className={`flex ${
          messageClass === "sent" ? "flex-row-reverse" : "flex-row"
        } items-center mt-1`}
      >
        {messageClass === "received" && (
          <img
            src={process.env.SECRET_APP_API_URL + user.ava}
            alt={user}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() =>
              sender === loggedUser
                ? navigate(`/profile`)
                : navigate(`/user/${sender}`)
            }
          />
        )}
        <div
          className={`group relative max-w-[70%] rounded-lg break-words ${
            messageClass === "sent"
              ? "bg-[#D84152] text-white"
              : "bg-[#EEEDEB] text-black"
          }`}
        >
          <Dropdown
            menu={{ items }}
            trigger={["hover"]}
            className="relative group"
            placement="topRight"
            overlayClassName="horizontal-dropdown"
            arrow={false}
          >
            <div className=" p-2 rounded-lg">
              <span>{text}</span>
            </div>
          </Dropdown>
        </div>
        {Object.entries(reactions).map(
          ([key, value]) =>
            value > 0 && (
              <img
                key={key}
                src={`http://127.0.0.1:8000/images/${key}.png`}
                alt={key}
                style={{ margin: "5px", width: "20px", height: "20px" }}
              />
            )
        )}
        {totalReaction > 0 && <p className="ml-2">{totalReaction}</p>}
      </div>
    </div>
  );
}

export default Chatbox;