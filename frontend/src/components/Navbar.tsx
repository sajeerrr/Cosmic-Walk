import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";

const NAV_LINKS = [
  { to: "/", label: "Mission Control" },
  { to: "/plan", label: "Plan Journey" },
];

export default function Navbar() {
  const location = useLocation();
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-void/85 backdrop-blur-lg">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark & Mission Status */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline group"
          >
            <div className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-amber/30 animate-ping opacity-75" />
              <span className="w-2 h-2 rounded-full bg-amber glow-amber group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-[0.18em] uppercase text-text-primary group-hover:text-amber transition-colors">
                Cosmic<span className="text-amber">Walk</span>
              </span>
              <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-text-tertiary hidden sm:inline-block">
                Interplanetary Locomotion
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded border border-border bg-surface/50 text-[0.65rem] font-mono text-text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-text-secondary tracking-wider">SYS.ONLINE</span>
            {utcTime && <span className="text-amber/80 tracking-widest pl-1 border-l border-border">{utcTime}</span>}
          </div>
        </div>

        {/* Navigation & Telemetry Tag */}
        <div className="flex items-center gap-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  relative px-3.5 py-1.5 rounded-xs
                  font-mono text-xs tracking-wider uppercase
                  transition-all duration-200 no-underline
                  ${
                    isActive
                      ? "text-amber bg-amber/[0.1] border border-amber/30 font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-text-tertiary hidden sm:inline-block">
            CW-2026.09
          </span>
        </div>
      </div>
    </nav>
  );
}

