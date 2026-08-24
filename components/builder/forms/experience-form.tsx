"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus } from "lucide-react";
import { RemoveEntryButton } from "./remove-entry-button";

export function ExperienceForm() {
    const { resume, addExperience, removeExperience, updateExperience } = useResumeStore();
    const { experience } = resume;

    return (
        <div className="space-y-6">
            {experience.map((exp, index) => (
                <div key={exp.id} className="space-y-4 p-4 border rounded-lg bg-card/50">
                    <div className="grid gap-2">
                        <Label>Company</Label>
                        <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                            placeholder="Acme Corp"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Job Title</Label>
                        <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                            placeholder="Software Engineer"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                            placeholder="San Francisco, CA"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                placeholder="Jan 2023"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                placeholder="Present"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            placeholder="Describe your responsibilities and achievements..."
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">Tip: Use bullet points for better readability.</p>
                    </div>

                    <RemoveEntryButton label="experience" onRemove={() => removeExperience(exp.id)} />
                </div>
            ))}

            <Button onClick={addExperience} variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
            </Button>
        </div>
    );
}
