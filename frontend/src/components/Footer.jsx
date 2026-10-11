import { Info } from 'lucide-react';
import { Logo } from './ui.jsx';

/**
 * A dark band in both themes (gray, not the theme-flipping slate), so it reads
 * as the end of the page rather than a second navbar.
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-gray-950 text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm">See what you have. Learn what you need.</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Good to know</p>
          <p className="mt-3 flex items-start gap-2 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Salaries, demand and scores are AI estimates for the Indian job market. Use them as guidance.
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FutureMe
      </div>
    </footer>
  );
}
