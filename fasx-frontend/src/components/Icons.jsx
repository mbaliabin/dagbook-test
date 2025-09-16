export function Chart() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" className="rounded-xl bg-white p-4 shadow-md">
      <polyline points="10,140 50,110 90,100 130,60 170,80 210,40"
        fill="none" stroke="#FF5000" strokeWidth="4" />
      <rect x="10" y="140" width="10" height="5" fill="#ccc" />
      <rect x="50" y="130" width="10" height="15" fill="#ccc" />
      <rect x="90" y="120" width="10" height="25" fill="#ccc" />
      <rect x="130" y="100" width="10" height="45" fill="#ccc" />
      <rect x="170" y="90" width="10" height="55" fill="#ccc" />
    </svg>
  );
}

export function Goal() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10" stroke="#fff" />
      <path d="M12 6v6l4 2" stroke="#fff" />
    </svg>
  );
}

export function Watch() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <rect x="7" y="2" width="10" height="20" rx="2" ry="2" stroke="#fff" />
      <path d="M12 8v4" stroke="#fff" />
    </svg>
  );
}

export function Review() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#fff" />
    </svg>
  );
}

// ... твои существующие экспорты Chart, Goal, Watch, Review

export function RunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
      <path d="M13 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="#fff" />
      <path d="M9 22v-5l-2-4 4-2 2 2h4" stroke="#fff" />
      <path d="M13 12l1 8" stroke="#fff" />
    </svg>
  );
}

export function SkiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
      <path d="M4 20l4-12h2l-4 12H4z" stroke="#fff" />
      <path d="M14 20l4-12h2l-4 12h-2z" stroke="#fff" />
      <path d="M2 22h20" stroke="#fff" />
    </svg>
  );
}

