"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const name = (e.target as any).name.value;
        const userEmail = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        setEmail(userEmail);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email: userEmail,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            // Move to verification step
            setStep('verify');
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            alert("Account verified successfully!");
            router.push("/builder");
        }
    };

    if (step === 'verify') {
        return (
            <Card className="w-full">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold font-heading text-center">Verify your email</CardTitle>
                    <CardDescription className="text-center">
                        We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="otp">Verification Code</label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <Button className="w-full" disabled={loading}>
                            {loading ? "Verifying..." : "Verify Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold font-heading text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your email below to create your account
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
                <form onSubmit={handleSignup} className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="name">Full Name</label>
                        <Input id="name" type="text" placeholder="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <Input id="password" type="password" />
                    </div>
                    <Button className="w-full type=submit" disabled={loading}>
                        {loading ? "Creating..." : "Create account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
