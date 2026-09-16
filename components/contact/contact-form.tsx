"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const CATEGORIES = [
    { value: "question", label: "A question" },
    { value: "suggestion", label: "A suggestion" },
    { value: "problem", label: "A problem with the app" },
    { value: "other", label: "Something else" },
] as const;

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === "sending") return;

        setError(null);
        setStatus("sending");

        const form = e.currentTarget;
        const data = new FormData(form);

        const payload = {
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            category: String(data.get("category") ?? ""),
            message: String(data.get("message") ?? ""),
            // Honeypot: hidden from real users.
            company: String(data.get("company") ?? ""),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(
                    body?.error ||
                        "Something went wrong sending your message. Please try again."
                );
            }

            form.reset();
            setStatus("sent");
        } catch (err) {
            setStatus("idle");
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        }
    }

    if (status === "sent") {
        return (
            <div className="rounded-lg border bg-card p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h2 className="mt-4 text-xl font-semibold">Thanks — we&apos;ve got it</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your message is on its way to us. We&apos;ll reply to the email you
                    gave, usually within a couple of days.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button variant="outline" onClick={() => setStatus("idle")}>
                        Send another
                    </Button>
                    <Button asChild>
                        <Link href="/">Back to home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Honeypot: positioned off-screen, hidden from assistive tech. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
                <label htmlFor="company">Company</label>
                <input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" required maxLength={200} autoComplete="name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Your email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        maxLength={320}
                        autoComplete="email"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">What&apos;s this about?</Label>
                <select
                    id="category"
                    name="category"
                    required
                    defaultValue="question"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    placeholder="Tell us what's on your mind — a question, an idea, or a problem you ran into."
                />
            </div>

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">
                {status === "sending" ? "Sending…" : "Send message"}
            </Button>
        </form>
    );
}
