'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/dashboard/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <main className="container mx-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
