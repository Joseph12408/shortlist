import { Resume } from "@/types/resume";

/**
 * Pure helpers for resume/cover-letter list behaviour.
 *
 * Kept out of the store so they can be imported (and tested) without pulling in
 * the Convex client, which needs a deployment URL at module load.
 */

/**
 * True when a resume holds nothing the user actually typed.
 *
 * Clicking "Create New Resume" used to persist a blank record immediately, so
 * abandoning the builder left an empty "Resume #1" in the list forever. Saving
 * is now gated on this, and blanks are pruned on load.
 */
export function isResumeEmpty(r: Resume | undefined | null): boolean {
    if (!r) return true;
    const p = r.profile;
    const hasProfile = Boolean(
        p?.fullName?.trim() || p?.email?.trim() || p?.phone?.trim() || p?.summary?.trim()
    );
    return (
        !hasProfile &&
        !(r.experience?.length) &&
        !(r.education?.length) &&
        !(r.skills?.length) &&
        !(r.projects?.length) &&
        !(r.leadership?.length)
    );
}

/**
 * A human-meaningful name for a resume.
 *
 * Nothing in the UI ever called `setResumeTitle`, so every resume fell back to
 * the placeholder and the list read as a column of "Untitled Resume". Derive
 * something useful from the content the user has already entered, and only use
 * a generic label when there is genuinely nothing to go on.
 */
export function deriveResumeTitle(r: Resume, fallbackIndex?: number): string {
    const role = r.experience?.[0]?.title?.trim();
    const name = r.profile?.fullName?.trim();

    if (role && name) return `${name}, ${role}`;
    if (role) return role;
    if (name) return `${name}'s Resume`;
    return fallbackIndex ? `Untitled Resume ${fallbackIndex}` : "Untitled Resume";
}

/** True when a cover letter has nothing worth persisting yet. */
export function isCoverLetterEmpty(cl: any): boolean {
    if (!cl) return true;
    return !(cl.body?.trim() || cl.jobTitle?.trim() || cl.company?.trim());
}

/** Name a cover letter from the job it targets. */
export function deriveCoverLetterTitle(cl: any): string | undefined {
    const role = cl?.jobTitle?.trim();
    const company = cl?.company?.trim();
    if (role && company) return `${role} at ${company}`;
    return role || company || undefined;
}

/** Titles the app assigned itself, safe to replace with a derived one. */
export function isPlaceholderTitle(title: string | undefined): boolean {
    if (!title) return true;
    return /^(Untitled Resume|Resume #\d+|Untitled Cover Letter|Cover Letter #\d+)/i.test(
        title.trim()
    );
}
