export default function Loading() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.25)",
          borderTopColor: "#fff",
          animation: "tb-spin 0.6s linear infinite"
        }}
      />
      <style>{`
        @keyframes tb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}