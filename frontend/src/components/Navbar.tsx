import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";

const NAV_LINKS = [
  { label: "Home",     path: "/" },
  { label: "Missions", path: "#" },
  { label: "Planets",  path: "#" },
  { label: "Support",  path: "#" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isOnLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isOnLanding && !scrolled;

  return (
    <nav
      id="main-nav"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: "56px",
        background: transparent ? "rgba(0,0,0,0)" : "rgba(5,4,14,0.85)",
        backdropFilter: transparent ? "none" : "blur(20px)",
        WebkitBackdropFilter: transparent ? "none" : "blur(20px)",
        borderBottom: transparent ? "1px solid transparent" : "1px solid rgba(212,168,83,0.08)",
        transition: "background 0.35s, border-color 0.35s, backdrop-filter 0.35s",
      }}
    >
      <div style={{
        maxWidth: 1440, margin: "0 auto", padding: "0 40px",
        height: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* ── Left: Nav links ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {NAV_LINKS.map((link) => {
            const active = link.path !== "#" && location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                id={`nav-${link.label.toLowerCase()}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  color: active ? "#f0eee8" : "rgba(240,238,232,0.4)",
                  background: active ? "rgba(212,168,83,0.07)" : "transparent",
                  borderBottom: active ? "1px solid rgba(212,168,83,0.5)" : "1px solid transparent",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(240,238,232,0.85)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(240,238,232,0.4)";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Center: Brand ── */}
        <Link
          to="/"
          id="nav-brand"
          style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            textDecoration: "none",
          }}
        >
          <span style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: "1rem",
            letterSpacing: "0.12em",
            color: "#f0eee8",
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(212,168,83,0.3)",
          }}>
            Cosmic
            <span style={{ color: "#d4a853" }}>Walk</span>
          </span>
        </Link>

        {/* ── Right: Status + CTA ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Live status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", borderRadius: "99px",
            border: "1px solid rgba(212,168,83,0.2)",
            background: "rgba(212,168,83,0.05)",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#d4a853",
              boxShadow: "0 0 5px rgba(212,168,83,0.9)",
              display: "inline-block",
              animation: "pulse-slow 2s infinite",
            }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.58rem",
              letterSpacing: "0.1em", color: "rgba(212,168,83,0.7)",
            }}>
              Solar GMT +4
            </span>
          </div>

          {/* Plan Journey CTA */}
          <Link
            to="/plan"
            id="nav-plan"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "7px 18px",
              borderRadius: "8px",
              background: "#d4a853",
              color: "#07060e",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.06em",
              textDecoration: "none",
              textTransform: "uppercase",
              boxShadow: "0 0 18px rgba(212,168,83,0.3)",
              transition: "opacity 0.2s, transform 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Plan Journey
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
