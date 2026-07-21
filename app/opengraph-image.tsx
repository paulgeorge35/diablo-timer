import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const alt =
  "Diablo Sanctuary Tracker — World Boss, Legion, Helltide, and Realmwalker countdowns"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

const BACKGROUND =
  "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtr2cnj000801lk1g6tbyoq"

export default async function Image() {
  const [heavyData, lightData] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/DiabloHeavy.ttf")),
    readFile(join(process.cwd(), "app/fonts/DiabloLight.ttf")),
  ])

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#100e0d",
      }}
    >
      {/* Background art — right-weighted like the site */}
      <img
        src={BACKGROUND}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "70% center",
          opacity: 0.45,
        }}
      />

      {/* Ash veil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(16,14,13,0.96) 0%, rgba(16,14,13,0.82) 42%, rgba(16,14,13,0.35) 78%, rgba(16,14,13,0.55) 100%)",
        }}
      />

      {/* Ember wash from bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(16,14,13,0.2) 0%, rgba(16,14,13,0.15) 45%, rgba(120,45,20,0.28) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 720,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 2,
                backgroundColor: "#c49a45",
              }}
            />
            <span
              style={{
                fontFamily: "DiabloLight",
                fontSize: 22,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c49a45",
              }}
            >
              Sanctuary
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "DiabloHeavy",
                fontSize: 78,
                lineHeight: 1.02,
                letterSpacing: "0.04em",
                color: "#ece4d4",
              }}
            >
              Diablo
            </span>
            <span
              style={{
                fontFamily: "DiabloHeavy",
                fontSize: 78,
                lineHeight: 1.02,
                letterSpacing: "0.04em",
                color: "#ece4d4",
              }}
            >
              Sanctuary Tracker
            </span>
          </div>

          <div
            style={{
              width: 120,
              height: 2,
              backgroundColor: "#c49a45",
              opacity: 0.85,
            }}
          />

          <span
            style={{
              fontFamily: "DiabloLight",
              fontSize: 28,
              lineHeight: 1.35,
              color: "#b8aa94",
              maxWidth: 560,
            }}
          >
            Track World Boss, Legion, Helltide, and Realmwalker — never miss the next hunt.
          </span>

          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 8,
            }}
          >
            {["World Boss", "Legion", "Helltide", "Realmwalker"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  border: "1px solid rgba(196,154,69,0.35)",
                  backgroundColor: "rgba(196,154,69,0.08)",
                  color: "#d4c4a0",
                  fontFamily: "DiabloLight",
                  fontSize: 18,
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "DiabloHeavy",
          data: heavyData,
          style: "normal",
          weight: 700,
        },
        {
          name: "DiabloLight",
          data: lightData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  )
}
