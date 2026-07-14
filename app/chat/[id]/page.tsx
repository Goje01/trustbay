import Link from "next/link";
import { notFound } from "next/navigation";
import { sendChatMessage } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const db = await readDb();
  const chat = db.chats.find((item) => item.id === id && [item.buyerId, item.sellerId].includes(user?.id || ""));
  if (!chat) notFound();

  const otherUserId = chat.buyerId === user?.id ? chat.sellerId : chat.buyerId;
  const otherUser = db.users.find((item) => item.id === otherUserId);
  const startedFromProduct = db.products.find((item) => item.id === chat.productId);
  const messages = db.messages.filter((item) => item.chatId === chat.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <main className="shell">
      <Link href="/messages" style={{ display: "inline-block", marginBottom: 12, fontSize: 14 }}>← Back to Messages</Link>
      <section className="page-title">
        <h1>{otherUser?.fullName || otherUser?.email || "Chat"}</h1>
        {startedFromProduct && <p>Started from: {startedFromProduct.title}</p>}
        <p>Keep the conversation inside Trust Bay for safety and dispute support.</p>
      </section>
      <section className="form-panel">
        <div style={{ display: "grid", gap: 12, minHeight: 320 }}>
          {messages.map((message) => {
            const mine = message.senderId === user?.id;
            return <article key={message.id} className="flow-card" style={{ maxWidth: 680, justifySelf: mine ? "end" : "start", background: mine ? "#1b1b1b" : "white", color: mine ? "white" : "#1b1b1b" }}>
              <p>{message.message}</p>
              <small>{new Date(message.createdAt).toLocaleString()}</small>
            </article>;
          })}
        </div>
        <form className="form-grid" action={sendChatMessage.bind(null, chat.id)}>
          <label className="wide">Message<input name="message" required placeholder="Write a message" /></label>
          <label className="field">Attachment<input name="attachment" type="file" /></label>
          <button className="btn dark">Send Message</button>
        </form>
      </section>
    </main>
  );
}