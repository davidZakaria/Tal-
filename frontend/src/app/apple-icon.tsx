import { ImageResponse } from "next/og";

// 180×180 apple-touch-icon — Talé “T” monogram (matches src/app/icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "linear-gradient(145deg, #e0d0a0 0%, #c9a86a 48%, #8f7344 100%)";
const BG = "linear-gradient(180deg, #2a3838 0%, #121818 100%)";
const FRAME = "rgba(201,168,106,0.2)";
const FRAME_INNER = "rgba(201,168,106,0.09)";

const markShadow = "0 2px 4px rgba(0,0,0,0.42)";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
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
            border: `2px solid ${FRAME}`,
            borderRadius: 30,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 17,
            left: 17,
            right: 17,
            bottom: 17,
            border: `1px solid ${FRAME_INNER}`,
            borderRadius: 26,
            display: "flex",
          }}
        />
        {/* Accent diamond */}
        <div
          style={{
            position: "absolute",
            left: 112,
            top: 32,
            width: 14,
            height: 14,
            background: GOLD,
            transform: "rotate(25deg)",
            boxShadow: markShadow,
            display: "flex",
          }}
        />
        {/* T — top bar */}
        <div
          style={{
            position: "absolute",
            left: 33,
            top: 55,
            width: 114,
            height: 20,
            background: GOLD,
            boxShadow: markShadow,
            display: "flex",
          }}
        />
        {/* Stem */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 75,
            width: 20,
            height: 65,
            background: GOLD,
            boxShadow: markShadow,
            display: "flex",
          }}
        />
        {/* Bottom serif */}
        <div
          style={{
            position: "absolute",
            left: 67,
            top: 140,
            width: 46,
            height: 8,
            background: GOLD,
            boxShadow: markShadow,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
