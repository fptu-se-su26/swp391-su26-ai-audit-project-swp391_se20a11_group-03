export type ChatMessageItem = {
  messageId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
};

export function isMessageFromMe(
  senderId: number,
  currentUserId: number | null | undefined,
): boolean {
  if (currentUserId == null) return false;
  return Number(senderId) === Number(currentUserId);
}

type Props = {
  messages: ChatMessageItem[];
  currentUserId: number | null;
  theme?: "light" | "dark";
};

export default function ChatMessageList({ messages, currentUserId, theme = "light" }: Props) {
  const isDark = theme === "dark";
  return (
    <>
      {messages.map((m) => {
        const isMe = isMessageFromMe(m.senderId, currentUserId);
        return (
          <div key={m.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                isMe
                  ? "rounded-br-md bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-[#100d08]"
                  : isDark
                    ? "rounded-bl-md border border-white/10 bg-white/[.06] text-white/90 shadow-sm"
                    : "rounded-bl-md border border-[#e2dcd1] bg-[#f8f5ee] text-[#263544] shadow-sm"
              }`}
            >
              {!isMe && (
                <p className={`mb-1 text-[10px] font-label-sm ${isDark ? "text-[#d4aa61]" : "text-[#9a7429]"}`}>
                  {m.senderName}{" "}
                  <span className={isDark ? "text-[#9d948a]" : "text-[#707a82]"}>· {m.senderRole}</span>
                </p>
              )}
              <p className="font-body-md whitespace-pre-wrap break-words">{m.content}</p>
              <p
                className={`mt-1 text-[10px] ${
                  isMe ? "text-[#100d08]/70" : isDark ? "text-[#9d948a]" : "text-[#707a82]"
                }`}
              >
                {new Date(m.sentAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}
