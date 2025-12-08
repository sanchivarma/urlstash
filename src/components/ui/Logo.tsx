export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/urlstash_transparent_trimmed.png"
      alt="UrlStash Logo"
      className={className}
    />
  );
}
