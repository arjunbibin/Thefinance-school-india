
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Code, BarChart, Settings, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  // Admin Role Management State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (profile && profile.role === 'user') {
      auth.signOut();
      router.push('/login');
      toast({ variant: "destructive", title: "Unauthorized", description: "Your account has no management role." });
    }
  }, [user, isUserLoading, router, profile, auth, toast]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    setIsAdminProcessing(true);
    try {
      const targetRef = doc(db, 'userProfiles', targetUserId.trim());
      await updateDoc(targetRef, {
        role: selectedRole
      });

      toast({
        title: "Staff Position Updated",
        description: `UID ${targetUserId} assigned as ${selectedRole.replace('_', ' ').toUpperCase()}`,
      });
      setTargetUserId('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsAdminProcessing(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';
  const staffName = profile?.firstName || user?.displayName?.split(' ')[0] || 'Administrator';

  // Role-based UI components
  const renderDepartmentStats = () => {
    switch(role) {
      case 'tech_head':
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Code} title="Server Health" value="Stable" color="bg-blue-500" />
            <StatCard icon={Settings} title="Active Deployments" value="12" color="bg-indigo-500" />
            <StatCard icon={Users} title="Bug Reports" value="0" color="bg-green-500" />
          </div>
        );
      case 'accounts_head':
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={BarChart} title="Monthly Revenue" value="Processing" color="bg-emerald-500" />
            <StatCard icon={Users} title="Active Subscriptions" value="1,240" color="bg-teal-500" />
            <StatCard icon={Mail} title="Pending Invoices" value="5" color="bg-amber-500" />
          </div>
        );
      case 'content_head':
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={MessageSquare} title="New Lessons" value="8" color="bg-purple-500" />
            <StatCard icon={Settings} title="Video Queue" value="14" color="bg-pink-500" />
            <StatCard icon={Users} title="Writer Feedback" value="High" color="bg-indigo-500" />
          </div>
        );
      default:
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Briefcase} title="School Leads" value="45" color="bg-primary" />
            <StatCard icon={Users} title="Engagement Rate" value="+12%" color="bg-accent" />
            <StatCard icon={Mail} title="Student Feedback" value="8" color="bg-indigo-400" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pb-24 px-6 max-w-5xl mx-auto w-full pt-16">
        <div className="mb-12 space-y-4 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Welcome, <span className="text-accent">{staffName}</span>
            </h1>
            {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Management Portal for <span className="font-bold text-primary">The Finance School India</span>.
          </p>
        </div>

        {renderDepartmentStats()}

        <div className="grid gap-10">
          {/* Admin Panel (Only visible to Admins) */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-destructive text-white p-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Authorize Staff Position</CardTitle>
                    <CardDescription className="text-white/70">
                      Promote a user by their UID to unlock department dashboards.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleUpdateRole} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetUid">User UID</Label>
                      <Input 
                        id="targetUid"
                        placeholder="e.g. gHZ9n7s2b9X8..."
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="rounded-xl h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Select Department Position</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Revoke Access (Regular User)</SelectItem>
                          <SelectItem value="admin">Primary Admin</SelectItem>
                          <SelectItem value="content_head">Content Head</SelectItem>
                          <SelectItem value="student_specialist">Student Engagement Specialist</SelectItem>
                          <SelectItem value="accounts_head">Accounts Head</SelectItem>
                          <SelectItem value="general_manager">General Manager</SelectItem>
                          <SelectItem value="tech_head">Tech Head</SelectItem>
                          <SelectItem value="operations_head">Operations Head</SelectItem>
                          <SelectItem value="strategy_manager">Strategy Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isAdminProcessing}
                    className="w-full h-14 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all"
                  >
                    {isAdminProcessing ? 'Applying Authorization...' : 'Authorize Position'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Account Profile Card */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] p-10">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                    <Settings className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-primary">
                      {role.replace('_', ' ').toUpperCase()} 
                    </h3>
                    <p className="text-muted-foreground font-medium">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full md:w-auto h-14 px-8 rounded-2xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold"
                >
                  <LogOut className="w-5 h-5 mr-3" /> Secure Logout
                </Button>
             </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
  return (
    <Card className="finance-3d-shadow border-none rounded-3xl p-6 bg-white overflow-hidden relative group hover:-translate-y-1 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.05] rounded-bl-full`} />
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} text-white rounded-2xl`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-bold">{title}</p>
          <h4 className="text-2xl font-headline font-bold text-primary">{value}</h4>
        </div>
      </div>
    </Card>
  );
}
