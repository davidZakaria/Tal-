import { ImageResponse } from "next/og";

// 180x180 apple-touch-icon — sun & sea motif (matches src/app/icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "#c9a86a";
const TEAL = "#003b3a";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: TEAL,
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            border: `2px solid ${GOLD}`,
            opacity: 0.35,
            borderRadius: 30,
            display: "flex",
          }}
        />
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            left: 62,
            top: 34,
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        {/* Horizon */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 104,
            width: 120,
            height: 2,
            backgroundColor: GOLD,
            opacity: 0.4,
            display: "flex",
          }}
        />
        {/* Waves */}
        <div
          style={{
            position: "absolute",
            left: 25,
            top: 118,
            width: 130,
            height: 11,
            borderRadius: 6,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 138,
            width: 115,
            height: 9,
            borderRadius: 5,
            backgroundColor: GOLD,
            opacity: 0.88,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
