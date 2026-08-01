import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 48%, #020617 100%)",
          color: "#f8fafc",
          padding: 72,
          fontFamily: "Arial"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 116,
              height: 116,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 28,
              border: "1px solid rgba(94, 234, 212, 0.35)",
              background: "linear-gradient(145deg, #000, #0f172a)",
              boxShadow: "0 0 60px rgba(94, 234, 212, 0.24)",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 2
            }}
          >
            BTG
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>BoranTheGreat</div>
            <div style={{ marginTop: 8, color: "#5eead4", fontSize: 26, fontWeight: 800, letterSpacing: 5 }}>
              GLOBAL MARKETS & WEATHER RADAR
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {["FX", "CRYPTO", "GOLD", "WEATHER", "BorAI"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(148, 163, 184, 0.22)",
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                padding: "18px 24px",
                fontSize: 25,
                fontWeight: 800
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div style={{ color: "#94a3b8", fontSize: 24 }}>boranthegreat.xyz</div>
      </div>
    ),
    size
  );
}
