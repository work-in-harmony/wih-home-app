import { useEffect, useRef, useState } from "react";
import { Send, Users, Clock } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function GroupChat({ projectId, currentUserEmail, currentUserRole, projectName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `https://proj.zonion.fun/messages/${projectId}`
        );
        if (response.ok) {
          const history = await response.json();
          setMessages(history);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [projectId]);

  useEffect(() => {
    const socket = new SockJS("https://proj.zonion.fun/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Chat WebSocket connected");
        setIsConnected(true);

        stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
          if (message.body) {
            const newMsg = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              {
                messageId: Date.now(),
                senderEmail: newMsg.senderEmail,
                senderRole: newMsg.senderRole,
                message: newMsg.message,
                createdAt: new Date().toISOString(),
                projectId: newMsg.projectId,
              },
            ]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ Chat WebSocket error:", frame);
        setIsConnected(false);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClient && stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [projectId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const messagePayload = {
      projectId,
      senderEmail: currentUserEmail,
      senderRole: currentUserRole,
      message: newMessage.trim(),
    };

    stompClientRef.current?.publish({
      destination: "/app/send",
      body: JSON.stringify(messagePayload),
    });

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" }) + " " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + " " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "MANAGER":
        return "bg-purple-600/20 text-purple-400 border-purple-500/30";
      case "DEVELOPER":
        return "bg-blue-600/20 text-blue-400 border-blue-500/30";
      case "TESTER":
        return "bg-green-600/20 text-green-400 border-green-500/30";
      default:
        return "bg-wih-600/20 text-wih-300 border-wih-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-wih-900">
        <div className="text-wih-400">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-wih-900 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-wih-800 px-4 py-3 border-b border-wih-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wih-700 rounded-lg">
            <Users size={20} className="text-wih-50" />
          </div>
          <div>
            <h2 className="font-semibold text-wih-50">{projectName}</h2>
            <div className="flex items-center gap-2 text-xs text-wih-400">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-wih-400">
            <Users size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderEmail === currentUserEmail;
            const showSender =
              index === 0 ||
              messages[index - 1].senderEmail !== msg.senderEmail;

            return (
              <div
                key={msg.messageId || index}
                className={`flex flex-col ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                {showSender && (
                  <div
                    className={`flex items-center gap-2 mb-1 px-1 ${
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="text-sm font-medium text-wih-50">
                      {isCurrentUser ? "You" : msg.senderEmail.split("@")[0]}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getRoleBadgeColor(
                        msg.senderRole
                      )}`}
                    >
                      {msg.senderRole}
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-wih-700 text-wih-50 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 px-2 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Clock size={12} className="text-wih-400" />
                    <span className="text-xs text-wih-400">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-wih-800 border-t border-wih-700 p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected ? "Type a message..." : "Connecting..."
            }
            disabled={!isConnected}
            className="flex-1 bg-wih-700 text-wih-50 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-wih-400"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-wih-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;