export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#logoGradient)"
        opacity="0.1"
      />

      <circle
        cx="50"
        cy="50"
        r="30"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
      />

      <circle
        cx="50"
        cy="50"
        r="20"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="4 3"
      />

      <line
        x1="50"
        y1="20"
        x2="50"
        y2="80"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
      />
      <line
        x1="20"
        y1="50"
        x2="80"
        y2="50"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
      />

      <path
        d="M 35 35 L 50 50 L 65 35"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <circle
        cx="50"
        cy="50"
        r="4"
        fill="url(#logoGradient)"
      />
      <circle
        cx="50"
        cy="20"
        r="3.5"
        fill="url(#logoGradient)"
      />
      <circle
        cx="50"
        cy="80"
        r="3.5"
        fill="url(#logoGradient)"
      />
      <circle
        cx="20"
        cy="50"
        r="3.5"
        fill="url(#logoGradient)"
      />
      <circle
        cx="80"
        cy="50"
        r="3.5"
        fill="url(#logoGradient)"
      />

      <rect
        x="42"
        y="60"
        width="16"
        height="12"
        rx="2"
        fill="url(#logoGradient)"
      />
      <rect
        x="44"
        y="63"
        width="12"
        height="2"
        fill="white"
        opacity="0.6"
      />
      <rect
        x="44"
        y="67"
        width="8"
        height="2"
        fill="white"
        opacity="0.6"
      />
    </svg>
  );
}
