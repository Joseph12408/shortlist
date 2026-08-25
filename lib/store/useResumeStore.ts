import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, ResumeProfile, ResumeEducation, ResumeExperience, ResumeProject, ResumeSkill } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';
import { analyzeResume, ATSFeedback } from '@/lib/ats/ats-score';
import { THEME_PRESETS } from '../themes';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { toast } from '@/lib/toast';
import { isResumeEmpty, deriveResumeTitle, isPlaceholderTitle, isCoverLetterEmpty, deriveCoverLetterTitle } from '@/lib/resume-utils';

export interface ResumeState {
    savedResumes: Resume[];
    savedCoverLetters: any[];
    resume: Resume;
    coverLetter: any;
    isLoading: boolean;
    initialLoadDone: boolean;
    jobDescription?: string;
    atsScore?: number;
    categoryScores?: Record<string, any>;
    atsFeedback?: any[];
    matchedKeywords?: string[];
    missingKeywords?: string[];
    stats: { totalReviews: number };
    referenceResume?: Resume | null;
    viewMode?: 'resume' | 'cover-letter' | 'design' | string;
    isPreviewVisible?: boolean;
    /** Free-tier job-scan quota, refreshed from /api/job-scan. */
    scanUsage: { used: number; limit: number | null; blocked: boolean };

    // Actions
    initialize: () => Promise<void>;
    saveCurrentResume: () => Promise<void>;
    resetBuilderSession: () => void;
    setResume: (resume: Resume) => void;
    setResumeTitle: (title: string) => void;
    loadResume: (id: string) => void;
    createNewResume: () => void;
    /** Rename a saved resume by id, from the dashboard list. */
    renameResume: (id: string, title: string) => Promise<void>;
    /** Rename a saved cover letter by id, from the dashboard list. */
    renameCoverLetter: (id: string, title: string) => Promise<void>;
    deleteResume: (id: string) => Promise<void>;
    
    // Cover Letter actions
    createNewCoverLetter: () => Promise<void>;
    deleteCoverLetter: (id: string) => Promise<void>;
    updateCoverLetter: (data: any) => void;
    saveCurrentCoverLetter: () => Promise<void>;
    loadCoverLetter: (id: string) => void;
    generateCoverLetterWithAI: () => Promise<void>;
    
    // Form actions
    updateProfile: (profile: Partial<ResumeProfile>) => void;
    addEducation: () => void;
    updateEducation: (id: string, edu: Partial<ResumeEducation>) => void;
    removeEducation: (id: string) => void;
    addExperience: () => void;
    updateExperience: (id: string, exp: Partial<ResumeExperience>) => void;
    removeExperience: (id: string) => void;
    addProject: () => void;
    updateProject: (id: string, proj: Partial<ResumeProject>) => void;
    removeProject: (id: string) => void;
    addSkill: () => void;
    updateSkill: (id: string, skill: Partial<ResumeSkill>) => void;
    removeSkill: (id: string) => void;
    addLeadership: () => void;
    updateLeadership: (id: string, leadership: Partial<ResumeExperience>) => void;
    removeLeadership: (id: string) => void;
    
    // AI
    setJobDescription: (text: string) => void;
    runATSAnalysis: () => void;
    /** Commits the current JD as a metered scan against the free-tier quota. */
    commitJobScan: () => Promise<void>;
    refreshScanUsage: () => Promise<void>;
    /** Saves the current analysis to the AI Reviews history. */
    recordAnalysis: (resumeTitle: string) => Promise<void>;
    improveResumeWithAI: () => Promise<void>;
    
    incrementReviewCount: () => void;
    resetStats: () => void;
    setTemplate: (theme: string) => void;
    setReferenceResume: (r: Resume | null) => void;
    setViewMode: (mode: string) => void;
    setPreviewVisible: (visible: boolean) => void;
    setColors: (primary: string, accent: string) => void;
}

/**
 * Local drafts use a UUID (36 chars, dash-separated) or the literal 'draft';
 * anything else is a real Convex document id. Convex ids never contain dashes,
 * so this cleanly distinguishes "needs insert" from "needs patch".
 */
function isDraftId(id: string | undefined | null): boolean {
    if (!id) return true;
    return id === 'draft' || (id.length === 36 && id.includes('-'));
}


const initialResume: Resume = {
    id: 'draft',
    title: 'Untitled Resume',
    profile: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        summary: '',
        headline: '',
        jobTitle: '',
    },
    education: [],
    experience: [],
    leadership: [],
    projects: [],
    skills: [],
    customStyles: THEME_PRESETS[2].tokens, // 2 is San Francisco which has theme 'modern'
};

export const useResumeStore = create<ResumeState>()(
    persist(
        (set, get) => ({
            savedResumes: [],
            savedCoverLetters: [],
            resume: {
                ...initialResume,
            },
            coverLetter: {
                title: 'Untitled Cover Letter',
                jobTitle: '',
                company: '',
                recipient: '',
                body: ''
            },
            viewMode: 'resume',
            jobDescription: '',
            atsScore: 0,
            categoryScores: {},
            atsFeedback: [],
            matchedKeywords: [],
            missingKeywords: [],
            stats: { totalReviews: 0 },
            scanUsage: { used: 0, limit: null, blocked: false },
            isLoading: true,
            initialLoadDone: false,

            initialize: async () => {
                set({ isLoading: true });

                // Drop blank records left behind by the old create-then-save
                // behaviour. They contain nothing the user entered, so this is
                // safe, and it clears the stray "Resume #1" already in storage.
                {
                    const { savedResumes, savedCoverLetters } = get();
                    const prunedResumes = (savedResumes || []).filter(r => !isResumeEmpty(r));
                    const prunedLetters = (savedCoverLetters || []).filter(
                        (cl: any) => cl?.body?.trim() || cl?.jobTitle?.trim() || cl?.company?.trim()
                    );
                    if (prunedResumes.length !== (savedResumes || []).length) {
                        set({ savedResumes: prunedResumes });
                    }
                    if (prunedLetters.length !== (savedCoverLetters || []).length) {
                        set({ savedCoverLetters: prunedLetters });
                    }
                }

                try {
                    const [resumes, coverLetters] = await Promise.all([
                        convex.query(api.resumes.list, {}),
                        convex.query(api.coverLetters.list, {}).catch(() => null),
                    ]);

                    // Convex is the source of truth for cover letters; fall back to
                    // whatever was persisted locally if the query failed.
                    if (coverLetters) {
                        set({
                            savedCoverLetters: coverLetters.map((cl: any) => ({
                                ...cl,
                                id: cl._id,
                            })),
                        });
                    }

                    get().refreshScanUsage();

                    if (resumes && resumes.length > 0) {
                        const loadedResumes = resumes as unknown as Resume[];
                        const currentResume = get().resume;
                        
                        const hasActiveData = Boolean(
                            currentResume.profile?.fullName ||
                            (currentResume.experience && currentResume.experience.length > 0) ||
                            (currentResume.education && currentResume.education.length > 0) ||
                            (currentResume.skills && currentResume.skills.length > 0)
                        );

                        set({
                            savedResumes: loadedResumes,
                            resume: hasActiveData ? currentResume : loadedResumes[0], 
                            initialLoadDone: true,
                            isLoading: false
                        });

                        get().runATSAnalysis();
                    } else {
                        set({ initialLoadDone: true, isLoading: false });
                    }

                } catch (error) {
                    console.error("Failed to initialize store from Convex", error);
                    set({ isLoading: false, initialLoadDone: true });
                }
            },

            saveCurrentResume: async () => {
                const { resume, savedResumes, atsScore } = get();

                // Never persist a blank record. Creating a resume and walking away
                // used to leave an empty entry in the list permanently.
                if (isResumeEmpty(resume)) return;

                // Keep the name in step with the content while the user has not
                // set one explicitly. Once they rename it, leave it alone.
                const title = isPlaceholderTitle(resume.title)
                    ? deriveResumeTitle(resume)
                    : resume.title;

                const resumeWithScore = { ...resume, title, atsScore };
                if (title !== resume.title) set({ resume: { ...resume, title } });

                const index = savedResumes.findIndex(r => r.id === (resume.id || ''));
                let newSaved;
                if (index >= 0) {
                    newSaved = [...savedResumes];
                    newSaved[index] = resumeWithScore;
                } else {
                    newSaved = [...savedResumes, resumeWithScore];
                }
                set({ savedResumes: newSaved });

                try {
                    const { resume } = get();

                    if (!isDraftId(resume.id)) {
                        await convex.mutation(api.resumes.update, {
                            id: resume.id as any,
                            title: resume.title,
                            profile: resume.profile,
                            education: resume.education,
                            experience: resume.experience,
                            leadership: resume.leadership || [],
                            projects: resume.projects,
                            skills: resume.skills,
                            customStyles: resume.customStyles,
                            atsScore: atsScore,
                        });
                    } else {
                        const newId = await convex.mutation(api.resumes.create, {
                            title: resume.title || 'Untitled Resume',
                            profile: resume.profile,
                            education: resume.education || [],
                            experience: resume.experience || [],
                            leadership: resume.leadership || [],
                            projects: resume.projects || [],
                            skills: resume.skills || [],
                            customStyles: resume.customStyles,
                        });

                        const updatedResume = { ...resume, id: newId };
                        set({ resume: updatedResume });

                        const { savedResumes } = get();
                        const updatedSaved = savedResumes.map(r => r.id === resume.id ? updatedResume : r);
                        set({ savedResumes: updatedSaved });
                    }

                } catch (err: any) {
                    // Silently handle auth failures. The Convex client may not have
                    // the Clerk JWT yet if the user just signed in. Local persistence
                    // still works via Zustand's persist middleware.
                    const errorString = String(err);
                    if (errorString.includes('Unauthenticated') || errorString.includes('Not authenticated')) {
                        console.warn("Convex sync skipped (not authenticated yet). Data saved locally.");
                    } else {
                        console.error("Failed to sync to Convex", err);
                    }
                }
            },

            // Resume Management Actions
            setResume: (newResume: Resume) => {
                set((state) => ({ 
                    resume: {
                        ...initialResume,
                        ...state.resume,
                        ...newResume,
                        profile: {
                            ...initialResume.profile,
                            ...state.resume?.profile,
                            ...newResume?.profile,
                        },
                        education: newResume.education || state.resume?.education || initialResume.education,
                        experience: newResume.experience || state.resume?.experience || initialResume.experience,
                        skills: newResume.skills || state.resume?.skills || initialResume.skills,
                        projects: newResume.projects || state.resume?.projects || initialResume.projects,
                        leadership: newResume.leadership || state.resume?.leadership || initialResume.leadership,
                        customStyles: newResume.customStyles || state.resume?.customStyles || initialResume.customStyles
                    } as Resume
                }));
                get().saveCurrentResume();
            },
            setResumeTitle: (title) => {
                set((state) => ({
                    resume: { ...state.resume, title }
                }));
                get().saveCurrentResume();
            },

            loadResume: (id) => {
                const { savedResumes } = get();
                const found = savedResumes.find(r => r.id === id);
                if (found) {
                    set({ resume: found });
                    get().runATSAnalysis();
                }
            },

            createNewResume: () => {
                const newResume = {
                    ...initialResume,
                    id: uuidv4(), // Draft ID
                    title: 'Untitled Resume',
                };
                set({ resume: newResume });
                // Deliberately not saved here. The persistence hook writes it once
                // the user actually enters something, so abandoning the builder no
                // longer leaves a blank entry behind.
            },

            renameResume: async (id, title) => {
                const next = title.trim();
                if (!next) return;

                set((state) => ({
                    savedResumes: (state.savedResumes || []).map(r =>
                        r.id === id ? { ...r, title: next } : r
                    ),
                    // Keep the open resume in step if it is the one renamed.
                    resume: state.resume?.id === id ? { ...state.resume, title: next } : state.resume,
                }));

                try {
                    if (!isDraftId(id)) {
                        await convex.mutation(api.resumes.update, { id: id as any, title: next } as any);
                    }
                } catch (err) {
                    console.error('Failed to rename resume in Convex', err);
                }
            },

            renameCoverLetter: async (id, title) => {
                const next = title.trim();
                if (!next) return;

                set((state) => ({
                    savedCoverLetters: (state.savedCoverLetters || []).map((cl: any) =>
                        cl.id === id ? { ...cl, title: next } : cl
                    ),
                    coverLetter: state.coverLetter?.id === id
                        ? { ...state.coverLetter, title: next }
                        : state.coverLetter,
                }));

                try {
                    if (!isDraftId(id)) {
                        await convex.mutation(api.coverLetters.update, { id: id as any, title: next });
                    }
                } catch (err) {
                    console.error('Failed to rename cover letter in Convex', err);
                }
            },

            deleteResume: async (id) => {
                const { savedResumes } = get();
                const newSaved = savedResumes.filter(r => r.id !== id);
                set({ savedResumes: newSaved });

                // If the deleted resume was active, reset to initial or another one?
                const { resume } = get();
                if (resume.id === id) {
                    set({ resume: { ...initialResume, id: uuidv4() } });
                }

                // Convex delete
                try {
                    if (!isDraftId(id)) {
                        await convex.mutation(api.resumes.deleteResume, { id: id as any });
                    }
                } catch (error) {
                    console.error("Failed to delete resume from Convex", error);
                    // Optionally revert local state if failed? 
                }
            },

            createNewCoverLetter: async () => {
                // Same fix as resumes: hold the draft in session only. It is
                // persisted by saveCurrentCoverLetter once it has real content,
                // so abandoning the editor leaves no blank entry in the list.
                set({
                    coverLetter: {
                        id: uuidv4(), // Draft id until Convex assigns a real one
                        title: 'Untitled Cover Letter',
                        jobTitle: '',
                        company: '',
                        recipient: '',
                        body: '',
                    },
                });
            },

            deleteCoverLetter: async (id: string) => {
                const { savedCoverLetters, coverLetter } = get();
                const newSaved = (savedCoverLetters || []).filter((cl: any) => cl.id !== id);
                set({ savedCoverLetters: newSaved });
                if (coverLetter?.id === id) {
                    set({ coverLetter: { title: 'Untitled Cover Letter', jobTitle: '', company: '', recipient: '', body: '' } });
                }

                try {
                    if (!isDraftId(id)) {
                        await convex.mutation(api.coverLetters.remove, { id: id as any });
                    }
                } catch (err) {
                    console.error('Failed to delete cover letter from Convex', err);
                }
            },

            saveCurrentCoverLetter: async () => {
                const { coverLetter, savedCoverLetters } = get();
                if (!coverLetter) return;

                // Nothing worth keeping yet, so do not create a blank entry.
                const hasContent = Boolean(
                    coverLetter.body?.trim() ||
                    coverLetter.jobTitle?.trim() ||
                    coverLetter.company?.trim()
                );
                if (!hasContent) return;

                // Name it from the job it targets while the title is still a
                // placeholder, so the list is not a column of "Untitled".
                if (isPlaceholderTitle(coverLetter.title)) {
                    const derived = coverLetter.company?.trim() && coverLetter.jobTitle?.trim()
                        ? `${coverLetter.jobTitle.trim()} at ${coverLetter.company.trim()}`
                        : coverLetter.jobTitle?.trim() || coverLetter.company?.trim();
                    if (derived) coverLetter.title = derived;
                }

                // Mirror into the local list so the dashboard updates immediately.
                const index = (savedCoverLetters || []).findIndex((cl: any) => cl.id === coverLetter.id);
                const nextSaved = index >= 0
                    ? (savedCoverLetters || []).map((cl: any) => (cl.id === coverLetter.id ? coverLetter : cl))
                    : [...(savedCoverLetters || []), coverLetter];
                set({ savedCoverLetters: nextSaved });

                const payload = {
                    title: coverLetter.title || 'Untitled Cover Letter',
                    jobTitle: coverLetter.jobTitle || '',
                    company: coverLetter.company || '',
                    recipient: coverLetter.recipient || '',
                    body: coverLetter.body || '',
                };

                try {
                    if (isDraftId(coverLetter.id)) {
                        const newId = await convex.mutation(api.coverLetters.create, payload);
                        const persisted = { ...coverLetter, id: newId as unknown as string };
                        set((state) => ({
                            coverLetter: persisted,
                            savedCoverLetters: (state.savedCoverLetters || []).map((cl: any) =>
                                cl.id === coverLetter.id ? persisted : cl
                            ),
                        }));
                    } else {
                        await convex.mutation(api.coverLetters.update, {
                            id: coverLetter.id as any,
                            ...payload,
                        });
                    }
                } catch (err) {
                    const errorString = String(err);
                    if (errorString.includes('Unauthenticated') || errorString.includes('Not authenticated')) {
                        console.warn('Cover letter sync skipped (not authenticated yet). Saved locally.');
                    } else {
                        console.error('Failed to sync cover letter to Convex', err);
                    }
                }
            },

            updateProfile: (profile) => {
                set((state) => ({
                    resume: { ...state.resume, profile: { ...state.resume.profile, ...profile } },
                }));
                get().runATSAnalysis();
            },
            addEducation: () => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        education: [
                            ...state.resume.education,
                            {
                                id: uuidv4(),
                                institution: '',
                                degree: '',
                                fieldOfStudy: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                score: '',
                            },
                        ],
                    },
                }));
                get().runATSAnalysis();
            },
            updateEducation: (id, edu) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        education: state.resume.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
                    },
                }));
                get().runATSAnalysis();
            },
            removeEducation: (id) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        education: state.resume.education.filter((e) => e.id !== id),
                    },
                }));
                get().runATSAnalysis();
            },
            addExperience: () => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        experience: [
                            ...state.resume.experience,
                            {
                                id: uuidv4(),
                                company: '',
                                title: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                description: '',
                            },
                        ],
                    },
                }));
                get().runATSAnalysis();
            },
            updateExperience: (id, exp) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        experience: state.resume.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
                    },
                }));
                get().runATSAnalysis();
            },
            removeExperience: (id) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        experience: state.resume.experience.filter((e) => e.id !== id),
                    },
                }));
                get().runATSAnalysis();
            },
            addProject: () => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        projects: [
                            ...state.resume.projects,
                            {
                                id: uuidv4(),
                                name: '',
                                description: '',
                                url: '',
                                technologies: [],
                            },
                        ],
                    },
                }));
                get().runATSAnalysis();
            },
            updateProject: (id, proj) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        projects: state.resume.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
                    },
                }));
                get().runATSAnalysis();
            },
            removeProject: (id) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        projects: state.resume.projects.filter((p) => p.id !== id),
                    },
                }));
                get().runATSAnalysis();
            },
            addSkill: () => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        skills: [
                            ...state.resume.skills,
                            {
                                id: uuidv4(),
                                category: 'Languages',
                                skills: [],
                            },
                        ],
                    },
                }));
                get().runATSAnalysis();
            },
            updateSkill: (id, skill) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        skills: state.resume.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
                    },
                }));
                get().runATSAnalysis();
            },
            removeSkill: (id) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        skills: state.resume.skills.filter((s) => s.id !== id),
                    },
                }));
                get().runATSAnalysis();
            },
            addLeadership: () => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        leadership: [
                            ...state.resume.leadership,
                            {
                                id: uuidv4(),
                                company: '',
                                title: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                description: '',
                            },
                        ],
                    },
                }));
                get().runATSAnalysis();
            },
            updateLeadership: (id, leadershipItem) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        leadership: state.resume.leadership.map((e) => (e.id === id ? { ...e, ...leadershipItem } : e)),
                    },
                }));
                get().runATSAnalysis();
            },
            removeLeadership: (id) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        leadership: state.resume.leadership.filter((e) => e.id !== id),
                    },
                }));
                get().runATSAnalysis();
            },

            setJobDescription: (text) => {
                set({ jobDescription: text });
                get().runATSAnalysis();
            },

            runATSAnalysis: () => {
                const state = get();
                // Local, synchronous scoring, cheap enough to run on every edit.
                // NOTE: this deliberately does NOT touch stats.totalReviews. It is
                // called from every form mutation, so incrementing here counted a
                // "review" per keystroke and made the dashboard metric meaningless.
                // Reviews are counted explicitly via incrementReviewCount().
                const result = analyzeResume(state.resume, state.jobDescription || '');

                set({
                    atsScore: result.overallScore,
                    categoryScores: result.categoryScores,
                    atsFeedback: result.feedback,
                    matchedKeywords: result.matchedKeywords,
                    missingKeywords: result.missingKeywords,
                });
            },

            refreshScanUsage: async () => {
                try {
                    const res = await fetch('/api/job-scan');
                    if (!res.ok) return;
                    const data = await res.json();
                    set({
                        scanUsage: {
                            used: data.used ?? 0,
                            limit: data.limit ?? null,
                            blocked: data.limit !== null && (data.used ?? 0) >= data.limit,
                        },
                    });
                } catch {
                    // Non-fatal: the server re-checks the quota on every scan anyway.
                }
            },

            recordAnalysis: async (resumeTitle: string) => {
                const state = get();
                const categories = Object.values(state.categoryScores || {});
                if (categories.length === 0) return;

                const feedback = (state.atsFeedback || []) as ATSFeedback[];
                const jd = (state.jobDescription || '').trim();

                try {
                    await convex.mutation(api.analyses.record, {
                        resumeId: isDraftId(state.resume.id) ? undefined : (state.resume.id as any),
                        resumeTitle: resumeTitle || 'Untitled Resume',
                        overallScore: state.atsScore ?? 0,
                        categoryScores: categories.map((c: any) => ({
                            name: c.name,
                            score: c.score,
                            maxScore: c.maxScore,
                        })),
                        issueCounts: {
                            errors: feedback.filter((f) => f.type === 'error').length,
                            warnings: feedback.filter((f) => f.type === 'warning').length,
                            successes: feedback.filter((f) => f.type === 'success').length,
                        },
                        feedback: feedback.map((f) => ({
                            category: f.category,
                            message: f.message,
                            detail: f.detail,
                            solution: f.solution,
                            type: f.type,
                            scoreImpact: f.scoreImpact,
                        })),
                        jobDescriptionPreview: jd ? jd.slice(0, 300) : undefined,
                        missingKeywords: state.missingKeywords ?? [],
                    });
                } catch (err) {
                    // History is a convenience, never block the analysis on it.
                    console.error('Failed to save analysis to history', err);
                }
            },

            commitJobScan: async () => {
                const state = get();
                const jd = (state.jobDescription || '').trim();
                if (jd.length < 50) return;

                try {
                    const res = await fetch('/api/job-scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jobDescription: jd,
                            atsScore: state.atsScore ?? 0,
                            matchedKeywords: state.matchedKeywords ?? [],
                            missingKeywords: state.missingKeywords ?? [],
                            resumeId: isDraftId(state.resume.id) ? undefined : state.resume.id,
                        }),
                    });

                    const data = await res.json();

                    if (res.status === 402) {
                        set({
                            scanUsage: {
                                used: data.used ?? 0,
                                limit: data.limit ?? null,
                                blocked: true,
                            },
                        });
                        return;
                    }

                    if (res.ok) {
                        set({
                            scanUsage: {
                                used: data.used ?? 0,
                                limit: data.limit ?? null,
                                blocked: false,
                            },
                        });
                    }
                } catch (err) {
                    console.error('Failed to record job scan', err);
                }
            },
            improveResumeWithAI: async () => {
                set({ isLoading: true });
                const state = get();

                try {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resume: state.resume,
                            jobDescription: state.jobDescription, // Pass JD for optimization
                            stylePrompt: state.resume.customStyles?.theme || 'Professional and modern'
                        })
                    });

                    const data = await response.json();

                    if (response.status === 402) {
                        toast.error(data.message || 'This feature requires Shortlist Pro.');
                        return;
                    }

                    if (data.success && data.resume) {
                        // Preserve IDs from original resume
                        const improvedResume = {
                            ...state.resume, // Start with existing state to preserve everything
                            ...data.resume,  // JavaSript spread will override with AI data where present
                            id: state.resume.id,
                            profile: {
                                ...state.resume.profile,
                                ...(data.resume.profile || {})
                            },
                            experience: Array.isArray(data.resume.experience) && data.resume.experience.length > 0 ? data.resume.experience.map((exp: any, i: number) => ({
                                ...exp,
                                id: state.resume.experience[i]?.id || uuidv4(),
                                description: exp.description || ''
                            })) : state.resume.experience,
                            education: Array.isArray(data.resume.education) && data.resume.education.length > 0 ? data.resume.education.map((edu: any, i: number) => ({
                                ...edu,
                                id: state.resume.education[i]?.id || uuidv4()
                            })) : state.resume.education,
                            skills: Array.isArray(data.resume.skills) && data.resume.skills.length > 0 ? data.resume.skills.map((skill: any, i: number) => ({
                                ...skill,
                                id: state.resume.skills[i]?.id || uuidv4(),
                                skills: Array.isArray(skill.skills) ? skill.skills : []
                            })) : state.resume.skills,
                            projects: Array.isArray(data.resume.projects) && data.resume.projects.length > 0 ? data.resume.projects.map((proj: any, i: number) => ({
                                ...proj,
                                id: state.resume.projects[i]?.id || uuidv4(),
                                description: proj.description || ''
                            })) : state.resume.projects,

                            leadership: Array.isArray(data.resume.leadership) && data.resume.leadership.length > 0 ? data.resume.leadership.map((item: any, i: number) => ({
                                ...item,
                                id: state.resume.leadership?.[i]?.id || uuidv4(),
                                description: item.description || ''
                            })) : state.resume.leadership,

                            customStyles: data.resume.customStyles || state.resume.customStyles
                        };

                        // NOTE: this used to call setTemplate() with the AI's suggested
                        // theme, silently switching the template the user had chosen.
                        // The template is the user's decision; the server now echoes
                        // their existing styles back unless they asked for a change.

                        set({ resume: improvedResume, isPreviewVisible: true });

                        // Tell the user what actually changed, so a subtle rewrite
                        // never looks like "nothing happened".
                        const changes: string[] = Array.isArray(data.changesMade) ? data.changesMade : [];
                        toast.success(
                            changes.length > 0
                                ? `Resume optimized. ${changes.length} improvement${changes.length === 1 ? '' : 's'} applied.`
                                : 'Resume optimized.'
                        );
                    } else {
                        console.error('AI Generation failed:', data.error);
                        // data.error is already a user-safe message from the API route.
                        toast.error(data.error || 'Something went wrong optimizing your resume. Please try again.');
                    }
                } catch (error) {
                    console.error('API Error:', error);
                    toast.error('Could not reach the AI service. Please check your connection and try again.');
                } finally {
                    set({ isLoading: false });
                    get().runATSAnalysis();
                }
            },

            // --- Cover Letter Logic ---
            updateCoverLetter: (data: any) => {
                set((state) => ({
                    coverLetter: { ...state.coverLetter, ...data }
                }));
            },
            loadCoverLetter: (id: string) => {
                const { savedCoverLetters } = get();
                const found = savedCoverLetters.find(c => c.id === id);
                if (found) set({ coverLetter: found });
            },
            generateCoverLetterWithAI: async () => {
                set({ isLoading: true });
                const state = get();

                try {
                    const response = await fetch('/api/generate-cover-letter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resume: state.resume,
                            jobTitle: state.coverLetter.jobTitle,
                            company: state.coverLetter.company,
                            tone: 'Professional'
                        })
                    });

                    const data = await response.json();
                    if (response.status === 402) {
                        toast.error(data.message || 'Cover letter generation requires Shortlist Pro.');
                        return;
                    }
                    if (data.success && data.content) {
                        set((state) => ({
                            coverLetter: {
                                ...state.coverLetter,
                                body: data.content
                            }
                        }));
                        await get().saveCurrentCoverLetter();
                    } else {
                        // data.error is already a user-safe message from the API route.
                        toast.error(data.error || 'Something went wrong generating your cover letter. Please try again.');
                    }
                } catch (e: any) {
                    toast.error('Could not reach the AI service. Please check your connection and try again.');
                } finally {
                    set({ isLoading: false });
                }
            },

            incrementReviewCount: () => {
                set((state) => ({
                    stats: {
                        totalReviews: state.stats.totalReviews + 1
                    }
                }));
            },
            resetStats: () => {
                set({
                    stats: {
                        totalReviews: 0
                    }
                });
            },
            setTemplate: (theme: string) => {
                const preset = THEME_PRESETS.find(t => t.tokens.theme === theme || t.id === theme);
                if (preset) {
                    set((state) => ({
                        resume: {
                            ...state.resume,
                            customStyles: {
                                ...preset.tokens,
                                // Maintain the user's custom color if they picked one
                                primaryColor: state.resume.customStyles?.primaryColor || preset.tokens.primaryColor,
                                accentColor: state.resume.customStyles?.accentColor || preset.tokens.accentColor,
                            }
                        }
                    }));
                }
            },
            setColors: (primary: string, accent: string) => {
                set((state) => ({
                    resume: {
                        ...state.resume,
                        customStyles: {
                            ...state.resume.customStyles,
                            primaryColor: primary,
                            accentColor: accent,
                        } as any
                    }
                }));
            },
            resetBuilderSession: () => {
                set({
                    resume: { ...initialResume, id: 'draft' },
                    coverLetter: { title: 'Untitled Cover Letter', jobTitle: '', company: '', recipient: '', body: '' },
                    viewMode: 'resume',
                    jobDescription: '',
                    atsScore: 0,
                    categoryScores: {},
                    atsFeedback: [],
                    matchedKeywords: [],
                    missingKeywords: [],
                });
            },
            setReferenceResume: (r: Resume | null) => set({ referenceResume: r }),
            setViewMode: (mode: string) => set({ viewMode: mode }),
            setPreviewVisible: (visible: boolean) => set({ isPreviewVisible: visible }),
        }), {
        name: 'shortlist-storage',
        partialize: (state) => ({
            // Local mirror for instant paint before Convex responds. Convex is
            // the source of truth and overwrites both on initialize().
            savedResumes: state.savedResumes,
            savedCoverLetters: state.savedCoverLetters,
            stats: state.stats,
            // resume, coverLetter, viewMode are NOT persisted.
            // They are session-scoped and reset on each builder visit.
            // scanUsage is NOT persisted, quota is server-authoritative.
        }),
    }));
