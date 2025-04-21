import { useEffect, useRef } from "react";

const UsageTracker = ({ user }) => {
  const intervalRef = useRef(null);
  const accumulatedTime = useRef(0);

  const sendUsageToBackend = async () => {
    if (user && accumulatedTime.current > 0) {
        console.log("B")
      try {
        await fetch("/api/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            usedSeconds: accumulatedTime.current,
          }),
        });
        console.log(`Đã gửi ${accumulatedTime.current} giây lên backend`);
        accumulatedTime.current = 0;
      } catch (err) {
        console.error("Lỗi khi gửi usage:", err);
      }
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      accumulatedTime.current += 60;
    }, 60 * 1000);

    intervalRef.current = setInterval(() => {
      accumulatedTime.current += 60;
      sendUsageToBackend();
      console.log("AAAAAAAAAAAAAa");
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      sendUsageToBackend();
    };
  }, []);

  return null;
};

export default UsageTracker;
