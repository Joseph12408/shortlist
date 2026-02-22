"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function ProfileForm() {
    const { resume, updateProfile } = useResumeStore();
    const { profile } = resume;

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={profile.fullName}
                    onChange={(e) => updateProfile({ fullName: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={profile.email}
                        onChange={(e) => updateProfile({ email: e.target.value })}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        placeholder="(555) 555-5555"
                        value={profile.phone}
                        onChange={(e) => updateProfile({ phone: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    placeholder="New York, NY"
                    value={profile.location}
                    onChange={(e) => updateProfile({ location: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                        id="linkedin"
                        placeholder="linkedin.com/in/johndoe"
                        value={profile.linkedin}
                        onChange={(e) => updateProfile({ linkedin: e.target.value })}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="website">Website / Portfolio</Label>
                    <Input
                        id="website"
                        placeholder="johndoe.com"
                        value={profile.website}
                        onChange={(e) => updateProfile({ website: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                    id="summary"
                    placeholder="Brief summary of your professional background..."
                    className="min-h-[120px]"
                    value={profile.summary}
                    onChange={(e) => updateProfile({ summary: e.target.value })}
                />
            </div>
        </div>
    );
}
