import { Database } from 'lucide-react';

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <Database className={className} />
  );
}
