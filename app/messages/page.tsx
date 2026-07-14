import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="shell">
        <EmptyState title="Sign in required" body="Log in to see your messages." />
      </main>
    );
  }

  const db = await readDb();
  const chats = db.chats.filter((chat) => chat.buyerId === user.id || chat.sellerId === user.id);

  const conversations = chats.map((chat) => {
    const otherUserId = chat.buyerId === user.id ? chat.sellerId : chat.buyerId;
    const otherUser = db.users.find((item) => item.id === otherUserId);
    const product = db.products.find((item) => item.id === chat.productId);
    const chatMessages = db.messages
      .filter((item) => item.chatId === chat.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const lastMessage = chatMessages[chatMessages.length - 1];
    const unread = lastMessage ? lastMessage.senderId !== user.id : false;

    return {
      id: chat.id,
      otherName: otherUser?.fullName || otherUser?.email || "User",
      initial: (otherUser?.fullName || otherUser?.email || "U").slice(0, 1).toUpperCase(),
      startedFrom: product?.title || "",
      lastMessageText: lastMessage?.message || "No messages yet",
      lastMessageAt: lastMessage?.createdAt || chat.createdAt,
      unread
    };
  }).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  return (
    <main className="shell">
      <section className="page-title">
        <h1>Messages</h1>
        <p>All your conversations in one place.</p>
      </section>

      {conversations.length ? (
        <section className="form-panel" style={{ padding: 0, overflow: "hidden" }}>
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat/${conversation.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: "1px solid #eee",
                textDecoration: "none",
                color: "inherit",
                background: conversation.unread ? "#fafafa" : "white"
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#1b1b1b",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {conversation.initial}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontWeight: conversation.unread ? 700 : 500 }}>{conversation.otherName}</strong>
                  <small style={{ color: "#888", whiteSpace: "nowrap" }}>
                    {new Date(conversation.lastMessageAt).toLocaleDateString()}
                  </small>
                </span>
                <span
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: conversation.unread ? "#1b1b1b" : "#888",
                    fontWeight: conversation.unread ? 600 : 400,
                    fontSize: 14
                  }}
                >
                  {conversation.lastMessageText}
                </span>
              </span>
              {conversation.unread && (
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#1b1b1b", flexShrink: 0 }} />
              )}
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState title="No messages yet" body="Conversations with buyers and sellers will appear here." />
      )}
    </main>
  );
}