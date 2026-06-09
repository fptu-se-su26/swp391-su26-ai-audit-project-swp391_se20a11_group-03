"use client";

import { useState, useEffect, useRef } from "react";
import StaffShell from "@/components/layout/StaffShell";
import { useWebSocket, ChatMessage } from "@/lib/useWebSocket";
import { useCurrentUser } from "@/lib/useCurrentUser";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface ChatRoom {
  roomId: number;
  userId: number;
  staffId: number | null;
  status: string;
  createdAt: string;
  unreadCount: number;
  lastMessage: ChatMessage | null;
}


export default function SupportPage() {
  const currentUser = useCurrentUser();
  const currentStaffId = currentUser?.userId ?? 0;

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, connected, sendMessage } = useWebSocket({
    roomId: selectedRoomId,
    currentUserId: currentStaffId,
  });

  // Load danh sách rooms của Staff/Seller
  const loadRooms = async (staffId: number) => {
    if (!staffId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/rooms?staffId=${staffId}`);
      if (res.ok) {
        const data: ChatRoom[] = await res.json();
        setRooms(data);
        if (data.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data[0].roomId);
        }
      }
    } catch (e) {
      console.error("Failed to load rooms", e);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!currentStaffId) return;
    loadRooms(currentStaffId);
    const interval = setInterval(() => loadRooms(currentStaffId), 10000);
    return () => clearInterval(interval);
  }, [currentStaffId]);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    fetch(`${BACKEND_URL}/api/chat/room/${roomId}/read?readerId=${currentStaffId}`, {
      method: "POST",
    }).catch(() => {});
    setRooms((prev) =>
      prev.map((r) => (r.roomId === roomId ? { ...r, unreadCount: 0 } : r))
    );
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    sendMessage(reply);
    setReply("");
  };

  const handleAssign = async (roomId: number) => {
    await fetch(`${BACKEND_URL}/api/chat/room/${roomId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: currentStaffId }),
    });
    loadRooms(currentStaffId);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const selectedRoom = rooms.find((r) => r.roomId === selectedRoomId);

  return (
    <StaffShell>
      <div className="flex h-full overflow-hidden">
        {/* Danh sách room / Inbox */}
        <aside className="w-80 border-r border-outline-variant flex flex-col h-full bg-surface-container-low shrink-0">
          <div className="p-md border-b border-outline-variant">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Support Inbox</h2>
              <button
                onClick={() => loadRooms(currentStaffId)}
                className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]"
              >
                refresh
              </button>
            </div>
            <div className="mt-sm relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:border-secondary outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingRooms && (
              <div className="p-md text-sm text-outline text-center">Đang tải...</div>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <div className="p-md text-sm text-outline text-center">
                Chưa có yêu cầu hỗ trợ nào
              </div>
            )}
            {rooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => handleSelectRoom(room.roomId)}
                className={`w-full text-left p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors ${
                  selectedRoomId === room.roomId
                    ? "bg-surface-container-high border-r-2 border-r-secondary"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-xs">
                  <span className="font-label-md text-primary text-sm truncate flex-1">
                    User #{room.userId}
                  </span>
                  {room.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center flex-shrink-0">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant truncate mb-xs">
                  {room.lastMessage?.content ?? "Chưa có tin nhắn"}
                </p>
                <div className="flex gap-xs items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    room.status === "OPEN"
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {room.status}
                  </span>
                  {room.staffId ? (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold uppercase">
                      Assigned
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-error-container text-on-error-container font-bold uppercase">
                      Unassigned
                    </span>
                  )}
                  <span className="text-[10px] text-outline ml-auto">
                    {room.lastMessage ? formatTime(room.lastMessage.sentAt) : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Khu vực chat */}
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-outline flex-col gap-sm">
              <span className="material-symbols-outlined text-[48px]">inbox</span>
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="p-md border-b border-outline-variant bg-surface flex justify-between items-start">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    User #{selectedRoom.userId} — Support Chat
                  </h3>
                  <div className="flex items-center gap-sm mt-xs">
                    <span className={`w-2 h-2 rounded-full ${connected ? "bg-on-tertiary-container animate-pulse" : "bg-outline"}`} />
                    <span className="font-label-sm text-on-surface-variant text-sm">
                      {connected ? "Connected" : "Connecting..."}
                    </span>
                    <span className="text-outline">·</span>
                    <span className="font-label-sm text-on-surface-variant text-sm">
                      Room #{selectedRoom.roomId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  {!selectedRoom.staffId && (
                    <button
                      onClick={() => handleAssign(selectedRoom.roomId)}
                      className="px-md py-sm rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center gap-xs hover:opacity-90 transition-opacity glow-accent"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span>
                      Assign to me
                    </button>
                  )}
                  <button className="px-md py-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center gap-xs hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Resolve
                  </button>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-md space-y-md no-scrollbar">
                {messages.length === 0 && (
                  <div className="flex justify-center py-8 text-outline text-sm">
                    Chưa có tin nhắn nào
                  </div>
                )}

                {messages.map((msg) => {
                  const isStaff = msg.senderId === currentStaffId;
                  return (
                    <div
                      key={msg.messageId}
                      className={`flex items-start gap-md ${isStaff ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isStaff ? "bg-secondary-container text-secondary" : "bg-primary-container text-secondary"
                      }`}>
                        <span className="material-symbols-outlined">
                          {isStaff ? "support_agent" : "person"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center gap-sm mb-xs ${isStaff ? "flex-row-reverse" : ""}`}>
                          <span className="font-label-md text-primary">
                            {isStaff ? "You (Staff)" : `User #${msg.senderId}`}
                          </span>
                          <span className="text-[10px] text-outline">{formatTime(msg.sentAt)}</span>
                        </div>
                        <div className={`rounded-2xl p-md soft-shadow max-w-[80%] ${
                          isStaff
                            ? "bg-secondary text-on-secondary rounded-tr-none ml-auto glow-accent"
                            : "bg-surface border border-outline-variant/20 rounded-tl-none"
                        }`}>
                          <p className="font-body-md text-sm">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply Box */}
              <footer className="p-md border-t border-outline-variant bg-surface-container-low">
                <div className="flex items-start gap-md">
                  <textarea
                    id="staff-chat-input"
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder={connected ? "Type your response... (Enter to send, Shift+Enter for newline)" : "Đang kết nối..."}
                    disabled={!connected}
                    className="flex-1 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none font-body-md text-sm disabled:opacity-50"
                  />
                  <button
                    id="staff-chat-send"
                    onClick={handleReply}
                    disabled={!connected || !reply.trim()}
                    className="bg-secondary text-on-secondary rounded-xl px-md py-sm font-label-md text-label-md flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent self-end disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    Reply
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </StaffShell>
  );
}
