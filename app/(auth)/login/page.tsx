"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const { toast } = { toast: (opts: any) => alert(opts.title + ": " + opts.description) }; // Mock toast for now

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message); // Simple fallback
            setLoading(false);
        } else {
            router.push("/builder");
            router.refresh();
        }
    };

    const handleOAuth = async (provider: 'github' | 'google') => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold font-heading text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Enter your email to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-6">
                    <Button variant="outline">
                        Github
                    </Button>
                    <Button variant="outline">
                        Google
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <Input id="password" type="password" />
                    </div>
                    <Button className="w-full type=submit">
                        Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
