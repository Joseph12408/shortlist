"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, FileText, ArrowLeft, LayoutDashboard, Files, FileType } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CoverLettersPage() {
    const { savedCoverLetters, loadCoverLetter, deleteCoverLetter, createNewCoverLetter } = useResumeStore();
    const router = useRouter();

    const handleEdit = (id: string) => {
        // loadCoverLetter(id);
        router.push(`/builder?tab=cover-letter&coverLetterId=${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this cover letter?")) {
            deleteCoverLetter(id);
        }
    };

    const handleCreate = () => {
        createNewCoverLetter();
        router.push("/builder?tab=cover-letter");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header / Sub-nav */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                        Cover Letters
                    </h1>

                    <nav className="flex items-center gap-6 mt-8 border-b border-transparent">
                        <Link href="/dashboard" className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link href="/dashboard/resumes" className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <Files className="w-4 h-4" />
                            My Resumes
                        </Link>
                        <Link href="/dashboard/cover-letters" className="pb-3 border-b-2 border-primary font-medium text-primary flex items-center gap-2">
                            <FileType className="w-4 h-4" />
                            Cover Letters
                        </Link>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">

                {(!savedCoverLetters || savedCoverLetters.length === 0) ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileType className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No cover letters yet</h3>
                        <p className="text-muted-foreground mb-6">Create a tailored cover letter for your next application.</p>
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Write Cover Letter
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
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Create New Cover Letter</span>
                        </div>

                        {/* CL Cards */}
                        {(savedCoverLetters || []).map((cl) => (
                            <div key={cl.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-64">
                                <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-900 border-b p-6 relative group">
                                    <FileType className="w-12 h-12 text-purple-300 absolute bottom-4 right-4 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg truncate mb-1">
                                        {cl.title || (cl.jobTitle ? `Application for ${cl.jobTitle}` : "Untitled Cover Letter")}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {cl.company || "No company specified"}
                                    </p>

                                    <div className="mt-auto flex gap-2">
                                        <Button size="sm" className="flex-1" onClick={() => handleEdit(cl.id)}>
                                            <Edit2 className="w-3 h-3 mr-2" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(cl.id)}>
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
