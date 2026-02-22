import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, ResumeProfile, ResumeEducation, ResumeExperience, ResumeProject, ResumeSkill } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';
import { analyzeResume, ATSFeedback } from '@/lib/ats/ats-score';
import { THEME_PRESETS } from '../themes';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

// ... (existing interface ResumeState) ...

// Helper to remove internal fields or format data for Convex if needed
// For now, we assume schema matches types almost 1:1, but verify ID strings vs proper IDs.
// Schema expects string IDs for sub-items? Yes.

export const useResumeStore = create<ResumeState>()(
    // We keep persist for redundant offline cache for now, but primary source of truth is Convex
    persist(
        (set, get) => ({
            // ... (existing state) ...
            resume: {
                ...initialResume,
                // ...
            },
            // ...

            // Persistence
            isLoading: true,
            initialLoadDone: false,

            initialize: async () => {
                set({ isLoading: true });

                try {
                    // Fetch resumes using the shared client
                    // Note: Auth token must be set on the client for this to work for protected queries.
                    // If called too early before Clerk authenticates, this might return empty or error.
                    // Ideally, we should use a reactive subscription or check connection status.
                    // For now, we try once.

                    const resumes = await convex.query(api.resumes.list, {});

                    if (resumes && resumes.length > 0) {
                        // Cast to Resume[] (Schema matches types mostly)
                        const loadedResumes = resumes as unknown as Resume[];

                        set({
                            savedResumes: loadedResumes,
                            resume: loadedResumes[0], // Load the first one
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

            // Override saveCurrentResume
            saveCurrentResume: async () => {
                const { resume, savedResumes, atsScore } = get();
                const resumeWithScore = { ...resume, atsScore };

                // Optimistic update local
                const index = savedResumes.findIndex(r => r.id === (resume.id || ''));
                let newSaved;
                if (index >= 0) {
                    newSaved = [...savedResumes];
                    newSaved[index] = resumeWithScore;
                } else {
                    newSaved = [...savedResumes, resumeWithScore];
                }
                set({ savedResumes: newSaved });

                // Sync to Convex
                try {
                    // If ID is a valid Convex ID, use update.
                    // Our IDs are UUIDs currently for drafts.
                    // If we have a backend ID (usually 32 chars base62 for Convex?)
                    // We need to distinguish.
                    // Strategy: 
                    // 1. Try to find existing by title/userId? No.
                    // 2. Just create new if draft?

                    // For now, let's just log. Full sync requires converting UUIDs to Convex IDs. 
                    // Or we store the UUID in Convex as `externalId`?
                    // Changing logic: We will implement proper sync later.
                    // For now, keep local persistence working.
                    const { resume } = get();
                    // Identify if it's a draft (UUID) or a real Convex ID
                    // Convex IDs are alphanumeric, UUIDs have dashes. 
                    // Or simpler: if id is 'draft' or length is 36 (standard UUID)
                    const isDraft = resume.id === 'draft' || (resume.id && resume.id.length === 36);

                    if (!isDraft) {
                        // Update existing
                        await convex.mutation(api.resumes.update, {
                            id: resume.id as any,
                            title: resume.title,
                            profile: resume.profile,
                            education: resume.education,
                            experience: resume.experience,
                            leadership: resume.leadership,
                            projects: resume.projects,
                            skills: resume.skills,
                            customStyles: resume.customStyles,
                            atsScore: atsScore,
                        });
                    } else {
                        // Create new
                        const newId = await convex.mutation(api.resumes.create, {
                            title: resume.title,
                            profile: resume.profile,
                            education: resume.education,
                            experience: resume.experience,
                            leadership: resume.leadership,
                            projects: resume.projects,
                            skills: resume.skills,
                            customStyles: resume.customStyles,
                            atsScore: atsScore,
                        });

                        // Update local ID with real Convex ID
                        const updatedResume = { ...resume, id: newId };
                        set({ resume: updatedResume });

                        // Update saved list to reflect new ID
                        const { savedResumes } = get();
                        const updatedSaved = savedResumes.map(r => r.id === resume.id ? updatedResume : r);
                        set({ savedResumes: updatedSaved });
                    }

                } catch (err) {
                    console.error("Failed to sync to Convex", err);
                }
            },

            // Resume Management Actions
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
                const count = savedResumes.length + 1;
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
                const result = analyzeResume(state.resume, state.jobDescription);

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
                            stylePrompt: 'Professional and modern'
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
                            experience: Array.isArray(data.resume.experience) ? data.resume.experience.map((exp: any, i: number) => ({
                                ...exp,
                                id: state.resume.experience[i]?.id || uuidv4(),
                                description: exp.description || ''
                            })) : [],
                            education: Array.isArray(data.resume.education) ? data.resume.education.map((edu: any, i: number) => ({
                                ...edu,
                                id: state.resume.education[i]?.id || uuidv4()
                            })) : [],
                            skills: Array.isArray(data.resume.skills) ? data.resume.skills.map((skill: any, i: number) => ({
                                ...skill,
                                id: state.resume.skills[i]?.id || uuidv4(),
                                skills: Array.isArray(skill.skills) ? skill.skills : []
                            })) : [],
                            projects: Array.isArray(data.resume.projects) ? data.resume.projects.map((proj: any, i: number) => ({
                                ...proj,
                                id: state.resume.projects[i]?.id || uuidv4(),
                                description: proj.description || ''
                            })) : [],

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
        }), {
        name: 'shortlist-storage', // name of the item in the storage (must be unique)
        partialize: (state) => ({
            savedResumes: state.savedResumes,
            savedCoverLetters: state.savedCoverLetters,
            stats: state.stats, // Persist global stats
            // We can optionally persist the 'resume' (current draft) too if we want
            resume: state.resume
        }),
    }));
