import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Target, Compass, LayoutDashboard, LogOut, Menu, X, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from './ui.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const LINKS = [
  { to: '/skill-gap', label: 'Skill Gap', icon: Target },
  { to: '/explore', label: 'Find Careers', icon: Compass },
];

function navClass({ isActive }) {
  return `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthed, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = isAuthed
    ? [...LINKS, { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
    : LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-surface/75 backdrop-blur-lg"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <>
              <NavLink to="/profile" title="Your profile" aria-label="Your profile"
                className={({ isActive }) => `grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white transition hover:scale-105 ${
                  isActive ? 'ring-2 ring-brand-300 ring-offset-2 ring-offset-surface' : ''}`}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </NavLink>
              <button onClick={onLogout} className="btn-ghost px-3 py-2 text-sm" title="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost px-4 py-2 text-sm">Log in</Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
            </>
          )}
          </div>

          {/* Mobile toggle */}
          <button className="btn-ghost p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {(isAuthed ? [...links, { to: '/profile', label: 'Profile', icon: UserRound }] : links).map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            {isAuthed ? (
              <button onClick={onLogout} className="btn-ghost w-full text-sm">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-sm">Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
