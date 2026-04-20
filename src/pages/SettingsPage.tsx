import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Bell, Moon, Sun, ShieldCheck, LogOut, Link as LinkIcon, Smartphone, Mail, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState({
        dailyReminders: true,
        testAlerts: true,
        weeklyReports: false,
        newFeatures: true,
    });

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSave = () => {
        toast.success('Settings saved successfully! ✅');
    };

    return (
        <MainLayout title="Settings">
            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground font-serif">Settings</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Manage your preferences and account settings.</p>
                    </div>
                </motion.div>

                {/* ═══ Appearance ═══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                    {theme === 'dark' ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Appearance</CardTitle>
                                    <CardDescription className="text-xs">Customize the look and feel of SETU.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                                </div>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ═══ Notifications ═══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Notifications</CardTitle>
                                    <CardDescription className="text-xs">Choose what updates you want to receive.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Daily Practice Reminders</Label>
                                    <p className="text-xs text-muted-foreground">Get reminded to maintain your streak.</p>
                                </div>
                                <Switch
                                    checked={notifications.dailyReminders}
                                    onCheckedChange={(c) => setNotifications({ ...notifications, dailyReminders: c })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> Upcoming Test Alerts</Label>
                                    <p className="text-xs text-muted-foreground">Notifications for mock tests and major tests.</p>
                                </div>
                                <Switch
                                    checked={notifications.testAlerts}
                                    onCheckedChange={(c) => setNotifications({ ...notifications, testAlerts: c })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Weekly Progress Reports</Label>
                                    <p className="text-xs text-muted-foreground">Receive your performance summary via email.</p>
                                </div>
                                <Switch
                                    checked={notifications.weeklyReports}
                                    onCheckedChange={(c) => setNotifications({ ...notifications, weeklyReports: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ═══ Privacy & Account ═══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Account & Legal</CardTitle>
                                    <CardDescription className="text-xs">Manage your data and review our policies.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex flex-col gap-3">
                                <Link to="/privacy" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                                    <LinkIcon className="w-4 h-4 mr-3 text-accent" /> Privacy Policy
                                </Link>
                                <Link to="/terms" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                                    <LinkIcon className="w-4 h-4 mr-3 text-accent" /> Terms of Service
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-4">
                                    Signed in as <span className="font-semibold text-foreground">{user?.email}</span>
                                </p>
                                <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto h-10">
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ═══ Save Button ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end pt-4"
                >
                    <Button onClick={handleSave} size="lg" className="px-8 shadow-lg shadow-accent/20">
                        Save Settings
                    </Button>
                </motion.div>

                {/* ═══ Mentor Footer ═══ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-12 mb-6"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                        <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Your preferences help Jeetu Bhaiya personalize your learning journey to perfection.
                    </p>
                </motion.div>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;
