import { Icons } from "./icons";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="empty-state">
      <span className="icon-tile" style={{ margin: "0 auto 16px" }}>
        <Icons.Store size={20} />
      </span>
      <h2>{title}</h2>
      <p className="muted">{body}</p>
    </section>
  );
}
