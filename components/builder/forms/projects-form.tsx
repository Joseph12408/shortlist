"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus, Trash2 } from "lucide-react";

export function ProjectsForm() {
    const { resume, addProject, removeProject, updateProject } = useResumeStore();
    const { projects } = resume;

    return (
        <div className="space-y-6">
            {projects.map((project, index) => (
                <div key={project.id} className="space-y-4 p-4 border rounded-lg bg-card/50 relative group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeProject(project.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid gap-2">
                        <Label>Project Name</Label>
                        <Input
                            value={project.name}
                            onChange={(e) => updateProject(project.id, { name: e.target.value })}
                            placeholder="Project Name"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Link / URL</Label>
                        <Input
                            value={project.url}
                            onChange={(e) => updateProject(project.id, { url: e.target.value })}
                            placeholder="github.com/..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={project.description}
                            onChange={(e) => updateProject(project.id, { description: e.target.value })}
                            placeholder="Describe the project..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
            ))}

            <Button onClick={addProject} variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
            </Button>
        </div>
    );
}
