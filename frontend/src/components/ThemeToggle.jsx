import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'futureme_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Light/dark switch. Until the user picks one, the app follows the device
 * setting (and keeps following it if that changes). index.html applies the
 * class before first paint; this keeps it in sync afterwards.
 */
export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const mq = media();
    const onChange = (e) => {
      if (!savedTheme()) setDark(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light');
    } catch {
      /* private mode — the switch still works for this visit */
    }
  };

  return (
    <button onClick={toggle} className={`btn-ghost p-2 ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
