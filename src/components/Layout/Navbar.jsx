import { Menu, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Badge from '../UI/Badge';
import { MOCK_CRISIS_EVENTS } from '../../config/mockData';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Register', to: '/register' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Missions', to: '/missions' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasLiveCrisis = useMemo(() => MOCK_CRISIS_EVENTS.some((event) => event.status === 'active'), []);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white shadow-card">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-navy">NeighborAid</p>
            <p className="text-xs text-slate-500">Community Crisis Response</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-navy'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {hasLiveCrisis && (
            <Badge color="red" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </nav>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  location.pathname === link.to ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {hasLiveCrisis && (
              <div>
                <Badge color="red" className="animate-pulse">
                  LIVE
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
