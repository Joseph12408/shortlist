import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, ResumeProfile, ResumeEducation, ResumeExperience, ResumeProject, ResumeSkill } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';
import { analyzeResume, ATSFeedback } from '@/lib/ats/ats-score';
import { THEME_PRESETS } from '../themes';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

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

    // Actions
    initialize: () => Promise<void>;
    saveCurrentResume: () => Promise<void>;
    resetBuilderSession: () => void;
    setResume: (resume: Resume) => void;
    setResumeTitle: (title: string) => void;
    loadResume: (id: string) => void;
    createNewResume: () => void;
    deleteResume: (id: string) => Promise<void>;
    
    // Cover Letter actions
    createNewCoverLetter: () => void;
    deleteCoverLetter: (id: string) => void;
    updateCoverLetter: (data: any) => void;
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
    improveResumeWithAI: () => Promise<void>;
    
    incrementReviewCount: () => void;
    resetStats: () => void;
    setTemplate: (theme: string) => void;
    setReferenceResume: (r: Resume | null) => void;
    setViewMode: (mode: string) => void;
    setPreviewVisible: (visible: boolean) => void;
    setColors: (primary: string, accent: string) => void;
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
            isLoading: true,
            initialLoadDone: false,

            initialize: async () => {
                set({ isLoading: true });

                try {
                    const resumes = await convex.query(api.resumes.list, {});

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
                const resumeWithScore = { ...resume, atsScore };

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
                    const isDraft = !resume.id || resume.id === 'draft' || resume.id.includes('-');

                    if (!isDraft) {
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
                    // Silently handle auth failures — the Convex client may not have
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
                const { savedResumes } = get();
                const count = (savedResumes || []).length + 1;
                const newResume = {
                    ...initialResume,
                    id: uuidv4(), // Draft ID
                    title: `Resume #${count}`
                };
                set({ resume: newResume });
                // Save immediately to creation in Convex
                get().saveCurrentResume();
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
                    // Check if it's a real Convex ID (not draft UUID)
                    // UUIDs are typically 36 chars with dashes. Convex IDs are base62.
                    const isDraft = id === 'draft' || (id.length === 36 && id.includes('-'));
                    if (!isDraft) {
                        await convex.mutation(api.resumes.deleteResume, { id: id as any });
                    }
                } catch (error) {
                    console.error("Failed to delete resume from Convex", error);
                    // Optionally revert local state if failed? 
                }
            },

            createNewCoverLetter: () => {
                const { savedCoverLetters } = get();
                const count = (savedCoverLetters || []).length + 1;
                const newCL = {
                    id: uuidv4(),
                    title: `Cover Letter #${count}`,
                    jobTitle: '',
                    company: '',
                    recipient: '',
                    body: '',
                };
                set({ coverLetter: newCL, savedCoverLetters: [...(savedCoverLetters || []), newCL] });
            },

            deleteCoverLetter: (id: string) => {
                const { savedCoverLetters, coverLetter } = get();
                const newSaved = (savedCoverLetters || []).filter((cl: any) => cl.id !== id);
                set({ savedCoverLetters: newSaved });
                if (coverLetter?.id === id) {
                    set({ coverLetter: { title: 'Untitled Cover Letter', jobTitle: '', company: '', recipient: '', body: '' } });
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
                // Simple debounce could go here if needed, but for now we just run it.
                // Analysis is fast enough (regex on small text).
                const result = analyzeResume(state.resume, state.jobDescription || '');

                // Only increment stats if score > 0 to avoid counting initial empty analysis
                if (result.overallScore > 0) {
                    // We need to be careful not to infinite loop if we put it here and it triggers updates.
                    // But stats is separate.
                    // Actually, let's just increment it here safely.
                    set((state) => ({
                        stats: {
                            totalReviews: state.stats.totalReviews + 1
                        }
                    }));
                }

                set({
                    atsScore: result.overallScore,
                    categoryScores: result.categoryScores,
                    atsFeedback: result.feedback,
                    matchedKeywords: result.matchedKeywords,
                    missingKeywords: result.missingKeywords,
                });
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

                            customStyles: data.resume.customStyles || state.resume.customStyles
                        };

                        // Update template selection if AI suggests a different theme
                        if (data.resume.customStyles?.theme && ['modern', 'classic', 'minimal'].includes(data.resume.customStyles.theme)) {
                            get().setTemplate(data.resume.customStyles.theme);
                        }

                        set({ resume: improvedResume, isPreviewVisible: true });
                    } else {
                        console.error('AI Generation failed:', data.error);
                        alert('Failed to generate: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('API Error:', error);
                    alert('Failed to connect to AI service');
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
                    if (data.success && data.content) {
                        set((state) => ({
                            coverLetter: {
                                ...state.coverLetter,
                                body: data.content
                            }
                        }));
                    } else {
                        alert(data.error || 'Failed to generate cover letter');
                    }
                } catch (e: any) {
                    alert('Error reaching AI: ' + e.message);
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
            savedResumes: state.savedResumes,
            savedCoverLetters: state.savedCoverLetters,
            stats: state.stats,
            // resume, coverLetter, viewMode are NOT persisted.
            // They are session-scoped and reset on each builder visit.
        }),
    }));
