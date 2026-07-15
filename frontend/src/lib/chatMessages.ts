export function appendChatMessage<T extends { messageId: number }>(current: T[], msg: T): T[] {
  const id = Number(msg.messageId);
  if (Number.isFinite(id) && id > 0) {
    if (current.some((m) => Number(m.messageId) === id)) return current;
  }
  return [...current, msg];
}
