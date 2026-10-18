import React, { useState, useRef, useEffect } from 'react';
import { Bell, ArrowLeftRight, Check, Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { UserRole, DemoUser } from '../../types';
import { useToast } from './Toast';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
  role: UserRole;
  currentUser: DemoUser;
  onReturnToRoles: () => void;
  onToggleMobileSidebar: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  role,
  currentUser,
  onReturnToRoles,
  onToggleMobileSidebar,
  onSwitchRole,
}) => {
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 'n1',
      title: 'Grand Mock Test #04 published',
      time: '2h ago',
      unread: true,
      role: 'all',
    },
    {
      id: 'n2',
      title: '14 Physics questions peer-approved',
      time: '3h ago',
      unread: true,
      role: 'examiner',
    },
    {
      id: 'n3',
      title: 'Percentile report ready for Mock #03',
      time: '1d ago',
      unread: false,
      role: 'admin',
    },
    {
      id: 'n4',
      title: 'New Sectional Test available in your dashboard',
      time: '1d ago',
      unread: false,
      role: 'student',
    },
  ].filter((n) => n.role === 'all' || n.role === role);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Admin Workspace
          </span>
        );
      case 'examiner':
        return (
          <span className="text-xs font-medium text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            Examiner Workspace
          </span>
        );
      case 'student':
        return (
          <span className="text-xs font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Student Workspace
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200">
      {/* Left: Mobile trigger & Page breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
            <div className="hidden sm:inline-block">{getRoleBadge()}</div>
          </div>
          {pageSubtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">{pageSubtitle}</p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Switch Role Quick Button */}
        <button
          onClick={onReturnToRoles}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="Return to Role Selection"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Change Role</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-xs text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                      n.unread ? 'bg-slate-50/70' : ''
                    }`}
                    onClick={() => {
                      showToast('Notification viewed', n.title, 'info');
                      setShowNotifications(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-800 leading-tight">{n.title}</span>
                      {n.unread && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    showToast('All notifications cleared', undefined, 'success');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-900 leading-none">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 leading-none mt-1 capitalize">{role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Institutional Demo Access</span>
                </div>
              </div>

              {onSwitchRole && (
                <div className="py-1 border-b border-slate-100">
                  <div className="px-4 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Quick Role Switch
                  </div>
                  {(['admin', 'examiner', 'student'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSwitchRole(r);
                      }}
                      className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left capitalize"
                    >
                      <span>{r} Workspace</span>
                      {r === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onReturnToRoles();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                  Return to Role Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
