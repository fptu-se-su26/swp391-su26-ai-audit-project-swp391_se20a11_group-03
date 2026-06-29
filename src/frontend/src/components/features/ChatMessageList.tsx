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
};

export default function ChatMessageList({ messages, currentUserId }: Props) {
  return (
    <>
      {messages.map((m) => {
        const isMe = isMessageFromMe(m.senderId, currentUserId);
        return (
          <div key={m.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                isMe
                  ? "rounded-br-md bg-[#c9aa5d] text-[#071626]"
                  : "rounded-bl-md border border-[#e2dcd1] bg-white text-[#263544] shadow-sm"
              }`}
            >
              {!isMe && (
                <p className="mb-1 text-[10px] font-label-sm text-secondary">
                  {m.senderName} <span className="text-outline">· {m.senderRole}</span>
                </p>
              )}
              <p className="font-body-md whitespace-pre-wrap break-words">{m.content}</p>
              <p className={`mt-1 text-[10px] ${isMe ? "text-[#071626]/70" : "text-on-surface-variant"}`}>
                {new Date(m.sentAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}
