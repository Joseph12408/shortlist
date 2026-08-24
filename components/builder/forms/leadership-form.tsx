"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus } from "lucide-react";
import { RemoveEntryButton } from "./remove-entry-button";

export function LeadershipForm() {
    const { resume, addLeadership, removeLeadership, updateLeadership } = useResumeStore();
    const leadership = resume.leadership || [];

    return (
        <div className="space-y-6">
            {leadership.map((item, index) => (
                <div key={item.id} className="space-y-4 p-4 border rounded-lg bg-card/50">

                    <div className="grid gap-2">
                        <Label>Organization</Label>
                        <Input
                            value={item.company}
                            onChange={(e) => updateLeadership(item.id, { company: e.target.value })}
                            placeholder="Student Council"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Role / Title</Label>
                        <Input
                            value={item.title}
                            onChange={(e) => updateLeadership(item.id, { title: e.target.value })}
                            placeholder="President"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input
                            value={item.location}
                            onChange={(e) => updateLeadership(item.id, { location: e.target.value })}
                            placeholder="University Campus"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input
                                value={item.startDate}
                                onChange={(e) => updateLeadership(item.id, { startDate: e.target.value })}
                                placeholder="Sep 2022"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input
                                value={item.endDate}
                                onChange={(e) => updateLeadership(item.id, { endDate: e.target.value })}
                                placeholder="Present"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={item.description}
                            onChange={(e) => updateLeadership(item.id, { description: e.target.value })}
                            placeholder="Describe your leadership responsibilities..."
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">Tip: Highlight your initiative and impact.</p>
                    </div>
                    <RemoveEntryButton label="leadership role" onRemove={() => removeLeadership(item.id)} />
                </div>
            ))}

            <Button onClick={addLeadership} variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Leadership Experience
            </Button>
        </div>
    );
}
