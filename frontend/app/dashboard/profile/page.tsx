'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          View your account information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-base font-semibold mt-1">{user.name}</p>
              </div>
            </div>

            <div className="border-t" />

            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-base font-semibold mt-1">{user.email}</p>
              </div>
            </div>

            <div className="border-t" />

            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Authentication Method
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base">Email & Password</span>
                  <Badge variant="secondary">Credentials</Badge>
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-base font-semibold mt-1">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">User ID</p>
              <code className="text-xs bg-muted px-3 py-2 rounded block break-all border">
                {user.id}
              </code>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Account Status</p>
              <Badge className="bg-green-600">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
