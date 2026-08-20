"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          background: "#08080b",
          color: "#f5f4f8",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7c6cff" }}>
          System error
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 560, letterSpacing: "-0.03em", margin: 0 }}>Something interrupted the session.</h1>
        <p style={{ color: "#a8a5ba", maxWidth: 420, margin: 0 }}>
          Your progress is saved locally. Try reloading — if it keeps happening, come back in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 8,
            background: "#7c6cff",
            color: "white",
            border: "none",
            borderRadius: 999,
            padding: "11px 22px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
