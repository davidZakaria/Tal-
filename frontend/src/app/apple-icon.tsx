import { ImageResponse } from "next/og";

// 180×180 apple-touch-icon — sandy dunes + boutique hotel (matches src/app/icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "#c9a86a";
const CHARCOAL = "#1e2e2e";
const SAND_TOP = "#faf4eb";
const SAND_MID = "#f2e6d6";
const DUNE_A = "#e8d9c6";
const DUNE_B = "#dcc9ae";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(180deg, ${SAND_TOP} 0%, ${SAND_MID} 55%, #e5d4be 100%)`,
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
            opacity: 0.28,
            borderRadius: 30,
            display: "flex",
          }}
        />
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            right: 22,
            top: 18,
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: GOLD,
            opacity: 0.9,
            display: "flex",
          }}
        />
        {/* Dunes */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 72,
            backgroundColor: DUNE_A,
            borderTopLeftRadius: 48,
            borderTopRightRadius: 40,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 48,
            backgroundColor: DUNE_B,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 28,
            display: "flex",
          }}
        />
        {/* Roofline (flat modern resort canopy over façade) */}
        <div
          style={{
            position: "absolute",
            left: 54,
            top: 38,
            width: 72,
            height: 16,
            backgroundColor: CHARCOAL,
            borderRadius: 5,
            display: "flex",
          }}
        />
        {/* Hotel façade */}
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 52,
            width: 64,
            height: 78,
            backgroundColor: CHARCOAL,
            borderRadius: 8,
            display: "flex",
          }}
        />
        {/* Windows row 1 */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 62,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 83,
            top: 62,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 102,
            top: 62,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        {/* Windows row 2 */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 80,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 83,
            top: 80,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 102,
            top: 80,
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: GOLD,
            display: "flex",
          }}
        />
        {/* Door */}
        <div
          style={{
            position: "absolute",
            left: 81,
            top: 100,
            width: 18,
            height: 26,
            borderRadius: 4,
            backgroundColor: GOLD,
            opacity: 0.82,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
