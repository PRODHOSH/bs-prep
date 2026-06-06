"use client"

const GOLD = "#C9973D"
const NAVY = "#0D1B2A"
const CREAM = "#FFFEF8"

function CornerOrnament() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" style={{ display: "block" }}>
      {/* Outer L-bracket */}
      <polyline points="6,120 6,6 120,6" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner echo L-bracket */}
      <polyline points="16,105 16,16 105,16" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />

      {/* Outer corner diamond */}
      <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill={GOLD} />
      {/* Inner corner circle */}
      <circle cx="16" cy="16" r="5" fill="none" stroke={GOLD} strokeWidth="1.3" />
      <circle cx="16" cy="16" r="2" fill={GOLD} />

      {/* Decorative scroll near corner, spiraling outward */}
      <path
        d="M6,6 C6,6 28,5 32,18 C36,31 22,38 16,30 C10,22 18,14 26,18 C34,22 32,34 20,34"
        stroke={GOLD} strokeWidth="1.3" fill="none" opacity="0.65"
      />

      {/* Small C-scroll ornaments along horizontal arm */}
      <path d="M54,6 C52,2 49,3 50,6 C51,9 54,9 55,7 C56,5 54,3 52,4" stroke={GOLD} strokeWidth="1.1" fill="none" />
      <path d="M84,6 C82,2 79,3 80,6 C81,9 84,9 85,7 C86,5 84,3 82,4" stroke={GOLD} strokeWidth="1.1" fill="none" />

      {/* Small C-scroll ornaments along vertical arm */}
      <path d="M6,54 C2,52 3,49 6,50 C9,51 9,54 7,55 C5,56 3,54 4,52" stroke={GOLD} strokeWidth="1.1" fill="none" />
      <path d="M6,84 C2,82 3,79 6,80 C9,81 9,84 7,85 C5,86 3,84 4,82" stroke={GOLD} strokeWidth="1.1" fill="none" />

      {/* Mid accent dots */}
      <circle cx="68" cy="6" r="1.8" fill={GOLD} opacity="0.5" />
      <circle cx="6" cy="68" r="1.8" fill={GOLD} opacity="0.5" />

      {/* End caps */}
      <circle cx="120" cy="6" r="3" fill={GOLD} />
      <circle cx="6" cy="120" r="3" fill={GOLD} />
    </svg>
  )
}

export function CertificateDocument({
  studentName,
  courseName,
  issueDate,
}: {
  studentName: string
  courseName: string
  issueDate: string
}) {
  return (
    <div
      style={{
        width: "297mm",
        height: "210mm",
        background: CREAM,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        border: `7px solid ${NAVY}`,
        boxSizing: "border-box",
      }}
    >
      {/* Inner gold border */}
      <div
        style={{
          position: "absolute",
          inset: "9mm",
          border: `1px solid ${GOLD}`,
          pointerEvents: "none",
        }}
      />

      {/* Corner ornaments — TL, TR (flipped), BL (flipped), BR (rotated) */}
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <CornerOrnament />
      </div>
      <div style={{ position: "absolute", top: 0, right: 0, transform: "scaleX(-1)" }}>
        <CornerOrnament />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, transform: "scaleY(-1)" }}>
        <CornerOrnament />
      </div>
      <div style={{ position: "absolute", bottom: 0, right: 0, transform: "scale(-1,-1)" }}>
        <CornerOrnament />
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18mm 36mm 14mm",
          textAlign: "center",
        }}
      >
        {/* TOP: logo + title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <img
            src="/new-logo-favicon.png"
            alt="BSPrep"
            style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "5px" }}
          />
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: 700,
              color: NAVY,
              letterSpacing: "0.18em",
              lineHeight: 1,
            }}
          >
            CERTIFICATE
          </div>
          <div
            style={{
              fontSize: "9.5px",
              color: "#999",
              letterSpacing: "0.5em",
              marginTop: "3px",
            }}
          >
            OF COMPLETION
          </div>
        </div>

        {/* MIDDLE: divider + name block */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "10px", marginBottom: "10mm" }}>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
              <rect x="1.5" y="1.5" width="11" height="11" transform="rotate(45 7 7)" fill="none" stroke={GOLD} strokeWidth="1.2" />
              <rect x="4" y="4" width="6" height="6" transform="rotate(45 7 7)" fill={GOLD} />
            </svg>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "12px",
              color: "#aaa",
              marginBottom: "5mm",
              letterSpacing: "0.04em",
            }}
          >
            This certificate is proudly awarded to
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "44px",
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.1,
              marginBottom: "3mm",
            }}
          >
            {studentName}
          </div>

          {/* Gold underline beneath name */}
          <div
            style={{
              width: "80mm",
              height: "2px",
              background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
              marginBottom: "5mm",
            }}
          />

          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "3mm" }}>
            for successfully completing the course
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: 700,
              color: NAVY,
              marginBottom: "2mm",
            }}
          >
            {courseName}
          </div>

          <div style={{ fontSize: "8px", color: GOLD, letterSpacing: "0.2em" }}>
            IITM BS QUALIFIER PREP &nbsp;·&nbsp; BSPREP &nbsp;·&nbsp; 2026
          </div>
        </div>

        {/* BOTTOM: date | seal | issued by */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: `1px solid ${GOLD}40`,
            paddingTop: "4mm",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "7px", color: GOLD, letterSpacing: "0.14em", fontWeight: 600, marginBottom: "1.5mm" }}>
              DATE ISSUED
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY }}>{issueDate}</div>
          </div>

          {/* Seal */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                border: `2px solid ${GOLD}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 3px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border: `1px solid ${GOLD}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src="/new-logo-favicon.png" alt="" style={{ width: "22px" }} />
              </div>
            </div>
            <div style={{ fontSize: "6.5px", color: GOLD, letterSpacing: "0.15em" }}>OFFICIAL SEAL</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "7px", color: GOLD, letterSpacing: "0.14em", fontWeight: 600, marginBottom: "1.5mm" }}>
              ISSUED BY
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY }}>The BSPrep Team</div>
            <div style={{ fontSize: "8px", color: "#bbb", marginTop: "1px" }}>bsprep.in</div>
          </div>
        </div>
      </div>
    </div>
  )
}
