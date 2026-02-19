
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
import { doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Code, BarChart, Settings, Mail } from 'lucide-react';
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
      toast({ variant: "destructive", title: "Unauthorized", description: "You do not have staff permissions." });
    }
  }, [user, isUserLoading, router, profile, auth, toast]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    setIsAdminProcessing(true);
    const targetRef = doc(db, 'userProfiles', targetUserId.trim());
    
    updateDocumentNonBlocking(targetRef, {
      role: selectedRole
    });

    toast({
      title: "Role Updated",
      description: `User UID ${targetUserId} has been assigned the role: ${selectedRole}`,
    });
    setTargetUserId('');
    setIsAdminProcessing(false);
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const staffName = profile?.firstName || user?.displayName?.split(' ')[0] || 'Staff Member';
  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';

  // Role-based UI components
  const renderDepartmentStats = () => {
    switch(role) {
      case 'tech_head':
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Code} title="Server Health" value="99.9%" color="bg-blue-500" />
            <StatCard icon={Settings} title="Active Deployments" value="12" color="bg-indigo-500" />
            <StatCard icon={Users} title="Bug Reports" value="0" color="bg-green-500" />
          </div>
        );
      case 'accounts_head':
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={BarChart} title="Monthly Revenue" value="₹4.2L" color="bg-emerald-500" />
            <StatCard icon={Users} title="Active Subscriptions" value="1,240" color="bg-teal-500" />
            <StatCard icon={Mail} title="Pending Invoices" value="5" color="bg-amber-500" />
          </div>
        );
      default:
        return (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Briefcase} title="Active Leads" value="45" color="bg-primary" />
            <StatCard icon={Users} title="Student Growth" value="+12%" color="bg-accent" />
            <StatCard icon={Mail} title="New Feedbacks" value="8" color="bg-indigo-400" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pb-24 px-6 max-w-5xl mx-auto w-full pt-16">
        {/* Personalized Greeting */}
        <div className="mb-12 space-y-4 text-center md:text-left animate-in fade-in slide-in-from-left-5 duration-700">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Hello, <span className="text-accent underline decoration-accent/30 underline-offset-8">{staffName}</span>
            </h1>
            {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Manage your department and the future of <span className="font-bold text-primary">The Finance School India</span>.
          </p>
        </div>

        {renderDepartmentStats()}

        <div className="grid gap-10">
          {/* Admin Panel (Only visible to Admins) */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-destructive/5 rounded-[2.5rem] overflow-hidden border-2 border-destructive/20">
              <CardHeader className="bg-destructive text-white p-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Staff Role Management</CardTitle>
                    <CardDescription className="text-white/70">
                      Assign professional roles to workers like Tech Head or Content Head.
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
                        placeholder="Paste UID (from Authentication tab)"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="rounded-xl h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Assign Position</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Deactivate (Regular User)</SelectItem>
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
                    className="w-full h-14 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all flex items-center justify-center gap-2"
                  >
                    {isAdminProcessing ? 'Processing Authorization...' : (
                      <>
                        Authorize Staff Access <UserPlus className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Department Quick Actions */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] p-10">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                    <Settings className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                      {role.replace('_', ' ').toUpperCase()} 
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md">PRO</span>
                    </h3>
                    <p className="text-muted-foreground font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold"
                  >
                    <LogOut className="w-5 h-5 mr-3" /> Sign Out
                  </Button>
                </div>
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
    <Card className="finance-3d-shadow border-none rounded-3xl p-6 bg-white overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`} />
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
