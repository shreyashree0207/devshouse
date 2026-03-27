export default function Footer() {
  return (
    <footer className="w-full glass border-t border-green-500/20 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold font-space text-[var(--color-neon)] mb-2 tracking-wider">Sustainify</h2>
        <p className="text-gray-400 mb-6 font-inter text-sm">Every rupee tracked. Every NGO verified. Every impact real.</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          {/* SDG Icons stand-ins */}
          <div className="w-10 h-10 rounded-full border border-[var(--color-neon)] flex items-center justify-center text-[var(--color-neon)]">SDG</div>
          <div className="w-10 h-10 rounded-full border border-[var(--color-neon)] flex items-center justify-center text-[var(--color-neon)]">3</div>
          <div className="w-10 h-10 rounded-full border border-[var(--color-neon)] flex items-center justify-center text-[var(--color-neon)]">4</div>
          <div className="w-10 h-10 rounded-full border border-[var(--color-neon)] flex items-center justify-center text-[var(--color-neon)]">5</div>
          <div className="w-10 h-10 rounded-full border border-[var(--color-neon)] flex items-center justify-center text-[var(--color-neon)]">13</div>
        </div>
        
        <p className="text-gray-600 mt-8 text-xs">&copy; {new Date().getFullYear()} Sustainify. All rights reserved.</p>
      </div>
    </footer>
  );
}
