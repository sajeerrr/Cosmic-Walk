import { Link, useLocation } from "react-router";

const NAV_LINKS = [
  { to: "/", label: "Mission Control" },
  { to: "/plan", label: "Plan Journey" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-void/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 no-underline group"
        >
          <div className="w-2 h-2 rounded-full bg-amber glow-amber group-hover:scale-125 transition-transform duration-300" />
          <span className="font-mono text-sm font-semibold tracking-[0.15em] uppercase text-text-primary">
            CosmicWalk
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  px-3 py-1.5 rounded-sm
                  font-mono text-xs tracking-wider uppercase
                  transition-colors duration-200 no-underline
                  ${
                    isActive
                      ? "text-amber bg-amber/[0.08]"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="w-px h-4 bg-border mx-2" />
          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-text-tertiary">
            v0.1
          </span>
        </div>
      </div>
    </nav>
  );
}
