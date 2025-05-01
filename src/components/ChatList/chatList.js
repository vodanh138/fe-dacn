import { useState, useEffect } from "react";
import { http } from "../../services/http";

const ChatList = ({ chatList, setSelectedChatForP }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [friendsInfo, setFriendsInfo] = useState([]);

  useEffect(() => {
    if (setSelectedChatForP) {
      setSelectedChatForP(selectedChat);
    }
  }, [selectedChat, setSelectedChatForP]);

  useEffect(() => {
    const fetchAllFriends = async () => {
      const untrimmedToken = sessionStorage.getItem("access_token");
      if (!untrimmedToken || !chatList || typeof chatList !== "object") return;

      const token = untrimmedToken.replace(/"/g, "");

      try {
        // B1: Lấy ra danh sách friend và sắp xếp theo lastMessage mới nhất
        const sortedFriends = Object.values(chatList)
          .filter((f) => f.type === "friend" && f.friendId && f.lastMessage)
          .sort((a, b) => {
            const timeA = a.lastMessage?.seconds || 0;
            const timeB = b.lastMessage?.seconds || 0;
            return timeB - timeA; // mới nhất lên đầu
          });

        // B2: Lấy thông tin bạn bè qua API
        const results = await Promise.all(
          sortedFriends.map(async (f) => {
            try {
              const response = await http.get(`/api/profile/${f.friendId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return {
                id: f.id,
                name: response?.data?.data?.name,
                ava: response?.data?.data?.ava,
              };
            } catch (err) {
              console.warn("Fetch failed for friendId:", f.friendId, err);
              return null;
            }
          })
        );

        setFriendsInfo(results.filter(Boolean));
      } catch (error) {
        console.error("Failed to fetch friends data:", error);
      }
    };

    if (chatList && Object.keys(chatList).length > 0) {
      fetchAllFriends();
    }
  }, [chatList]);

  return (
    <aside className="w-64 bg-[#E4E6EB] p-3 border-r border-gray-300 text-[#050505] h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Chat</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        <ul className="space-y-1">
          {friendsInfo.map((friend) => (
            <li
              key={friend.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                selectedChat === friend.id
                  ? "bg-[#BFC2C7]"
                  : "hover:bg-[#BCC0C4]"
              }`}
              onClick={() => setSelectedChat(friend.id)}
            >
              <img
                src={"https://res.cloudinary.com/dcrmd6dqj/image/upload/v1746043161/" + friend.ava}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-gray-400"
              />
              <span className="font-medium truncate">{friend.name}</span>
            </li>
          ))}

          {/* Placeholder để đủ 10 ô */}
          {Array.from({ length: Math.max(0, 10 - friendsInfo.length) }).map(
            (_, i) => (
              <li
                key={`placeholder-${i}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-[#D8DADF] opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gray-400 border border-gray-400" />
                <span className="font-medium text-gray-500"></span>
              </li>
            )
          )}
        </ul>
      </div>
    </aside>
  );
};
export default ChatList;
