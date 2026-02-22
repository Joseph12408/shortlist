"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus, Trash2, X } from "lucide-react";

export function SkillsForm() {
    const { resume, addSkill, removeSkill, updateSkill } = useResumeStore();
    const { skills } = resume;

    const handleAddSkillTag = (id: string, currentSkills: string[], newSkill: string) => {
        if (!newSkill.trim()) return;
        updateSkill(id, { skills: [...currentSkills, newSkill.trim()] });
    };

    const handleRemoveSkillTag = (id: string, currentSkills: string[], skillToRemove: string) => {
        updateSkill(id, { skills: currentSkills.filter(s => s !== skillToRemove) });
    };

    return (
        <div className="space-y-6">
            {skills.map((skillGroup, index) => (
                <div key={skillGroup.id} className="space-y-4 p-4 border rounded-lg bg-card/50 relative group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeSkill(skillGroup.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Input
                            value={skillGroup.category}
                            onChange={(e) => updateSkill(skillGroup.id, { category: e.target.value })}
                            placeholder="Languages, Frameworks, etc."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Skills</Label>
                        <Input
                            placeholder="Type a skill and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSkillTag(skillGroup.id, skillGroup.skills, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {skillGroup.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="hover:bg-secondary/80">
                                    {skill}
                                    <button
                                        className="ml-1 hover:text-destructive"
                                        onClick={() => handleRemoveSkillTag(skillGroup.id, skillGroup.skills, skill)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            <Button onClick={addSkill} variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill Category
            </Button>
        </div>
    );
}
