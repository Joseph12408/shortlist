"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { User, CreditCard, FileText } from "lucide-react";

export default function AccountPage() {
    const { resume } = useResumeStore();
    const profile = resume.profile;

    // Mock subs
    const plan = "Free Tier";

    return (
        <div className="container py-10 max-w-4xl">
            <h1 className="text-3xl font-bold font-heading mb-8">Account Settings</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8 w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscription
                    </TabsTrigger>
                    <TabsTrigger value="resumes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                        <FileText className="w-4 h-4 mr-2" />
                        My Resumes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Manage your personal details used in your resumes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input defaultValue={profile.fullName || "John Doe"} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input defaultValue={profile.email || "john@example.com"} disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input defaultValue={profile.phone} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input defaultValue={profile.location} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Plan</CardTitle>
                            <CardDescription>Manage your billing and plan details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/20">
                                <div>
                                    <p className="font-semibold text-lg">{plan}</p>
                                    <p className="text-sm text-muted-foreground">Limited features</p>
                                </div>
                                <Button variant="default">Upgrade to Pro</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="resumes">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Resumes</CardTitle>
                            <CardDescription>History of your created resumes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-8 bg-slate-200 rounded" />
                                        <div>
                                            <p className="font-medium">Software Engineer Resume</p>
                                            <p className="text-xs text-muted-foreground">Edited 2 hours ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                                <div className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-8 bg-slate-200 rounded" />
                                        <div>
                                            <p className="font-medium">Product Manager Resume</p>
                                            <p className="text-xs text-muted-foreground">Edited 2 days ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
