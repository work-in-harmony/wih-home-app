import { Client } from "@stomp/stompjs";
import { useState, useEffect } from "react";
import SockJS from "sockjs-client";

export const TaskComments = ({ taskId, userEmail }) => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);

  useEffect(() => {
    fetch(`https://proj.zonion.fun/api/comments/${taskId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [taskId]);

  useEffect(() => {
    // Create new STOMP client
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("https://proj.zonion.fun/ws"),
      reconnectDelay: 5000, // auto reconnect every 5s
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        stompClient.subscribe(`/topic/tasks/${taskId}/comments`, (payload) => {
          const comment = JSON.parse(payload.body);
          setComments((prev) => [...prev, comment]);
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [taskId]);

  const sendComment = () => {
    if (!message.trim() || !client || !client.connected) return;

    const comment = {
      text: message,
      commentFrom: userEmail,
    };

    client.publish({
      destination: `/app/tasks/${taskId}/comments`,
      body: JSON.stringify(comment),
    });

    setMessage("");
  };

  return (
    <div className="p-4 bg-wih-800 rounded-md mt-4">
      <h3 className="text-lg font-semibold mb-3 text-wih-50">💬 Comments</h3>

      <div className="max-h-60 overflow-y-auto mb-4 bg-wih-700 p-2 rounded-md">
        {comments.length === 0 ? (
          <p className="text-wih-400 text-sm">No comments yet</p>
        ) : (
          comments.map((c, idx) => (
            <div key={idx} className="mb-2">
              <span className="text-blue-400 font-semibold">
                {c.commentFrom}
              </span>
              <p className="text-wih-200 text-sm">{c.text}</p>
              <span className="text-xs text-wih-500">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 bg-wih-700 text-wih-50 rounded-md outline-none" />
        <button
          onClick={sendComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};
