"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditableTitle } from "@/components/dashboard/editable-title";
import { DashboardHeader } from "@/components/layout/dashboard-nav";

export default function ResumesPage() {
    const { savedResumes, loadResume, deleteResume, createNewResume, renameResume } = useResumeStore();
    const router = useRouter();

    const handleEdit = (id: string) => {
        // loadResume(id); // Removed: Loading happens in Builder based on URL
        router.push(`/builder?mode=edit&resumeId=${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this resume?")) {
            deleteResume(id);
        }
    };

    const handleCreate = () => {
        createNewResume();
        // Navigate without mode=edit so user sees the AILanding pre-builder page
        router.push("/builder");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <DashboardHeader
                title="My Resumes"
                description="Every resume you have created or uploaded."
                action={
                    <Button onClick={handleCreate} className="w-full md:w-auto gap-2">
                        <Plus className="w-4 h-4" />
                        New Resume
                    </Button>
                }
            />

            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {(!savedResumes || savedResumes.length === 0) ? (
                    <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first resume to get started.</p>
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Resume
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Add New Card */}
                        <div
                            onClick={handleCreate}
                            className="flex flex-col items-center justify-center h-64 bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4 text-slate-500">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Create New Resume</span>
                        </div>

                        {/* Resume Cards. Reversed so the newest sits immediately
                            after "Create New Resume" rather than at the very end. */}
                        {[...(savedResumes || [])].reverse().map((resume, index) => (
                            <div key={`${resume.id}-${index}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-64">
                                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b p-6 relative group">
                                    <FileText className="w-12 h-12 text-slate-300 absolute bottom-4 right-4 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <EditableTitle
                                        value={resume.title || resume.profile.fullName || "Untitled Resume"}
                                        placeholder="Untitled Resume"
                                        onSave={(next) => renameResume(resume.id, next)}
                                    />
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {resume.experience?.[0]?.title || "No Role"} • {resume.experience?.[0]?.company || "No Company"}
                                    </p>

                                    <div className="mt-auto flex gap-2">
                                        <Button size="sm" className="flex-1" onClick={() => handleEdit(resume.id)}>
                                            <Edit2 className="w-3 h-3 mr-2" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(resume.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
