"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus } from "lucide-react";
import { RemoveEntryButton } from "./remove-entry-button";

export function EducationForm() {
    const { resume, addEducation, removeEducation, updateEducation } = useResumeStore();
    const { education } = resume;

    return (
        <div className="space-y-6">
            {education.map((edu, index) => (
                <div key={edu.id} className="space-y-4 p-4 border rounded-lg bg-card/50">

                    <div className="grid gap-2">
                        <Label>School / University</Label>
                        <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                            placeholder="Harvard University"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Degree</Label>
                            <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                placeholder="Bachelor of Science"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Field of Study</Label>
                            <Input
                                value={edu.fieldOfStudy}
                                onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                                placeholder="Computer Science"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                placeholder="Sep 2018"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                placeholder="May 2022"
                            />
                        </div>
                    </div>
                    <RemoveEntryButton label="education entry" onRemove={() => removeEducation(edu.id)} />
                </div>
            ))}

            <Button onClick={addEducation} variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
            </Button>
        </div>
    );
}
