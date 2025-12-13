'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Home,
  Globe,
  Key,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  Activity,
  BookOpen,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Evaluations', href: '/dashboard/evaluations', icon: FileText },
    { name: 'Visa Explorer', href: '/dashboard/visa-config', icon: Globe },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'API Usage', href: '/dashboard/api-usage', icon: Activity },
    { name: 'API Docs', href: '/dashboard/api-docs', icon: BookOpen },
    { name: 'Manage Subscription', href: '/dashboard/subscription/manage', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <nav className="bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-[var(--primary)]">
              Visa Evaluation
            </Link>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <span className="text-sm font-semibold text-[var(--primary-foreground)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{user?.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={isActive ? 'bg-[var(--muted)] text-[var(--primary)]' : ''}
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </div>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[var(--error)]">
                  <div className="flex items-center">
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--card)]">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--muted)] border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-[var(--border)]">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <span className="text-lg font-semibold text-[var(--primary-foreground)]">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-[var(--foreground)]">
                  {user?.name}
                </div>
                <div className="text-sm font-medium text-[var(--muted-foreground)]">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <div className="flex items-center px-3 py-2">
                <span className="text-sm font-medium text-[var(--foreground)] mr-2">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-start text-[var(--error)]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
