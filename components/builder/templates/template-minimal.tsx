import { getFontClassName } from "@/lib/fonts";
import { Resume } from "@/types/resume";
import { Phone, Mail, MapPin, Linkedin, Globe } from "lucide-react";

interface TemplateProps {
    resume: Resume;
}

export function TemplateMinimal({ resume }: TemplateProps) {
    const { profile, customStyles } = resume;
    const accentColor = customStyles?.accentColor || '#000000'; // Black
    const primaryColor = customStyles?.primaryColor || '#ffffff'; // White
    const fontHeading = customStyles?.fontHeading || 'sans';
    const fontBody = customStyles?.fontBody || 'sans';
    // Use Font Manager
    const headingFontClass = getFontClassName(fontHeading);
    const bodyFontClass = getFontClassName(fontBody);

    // Safety check for weight classes if they come in as raw numbers '600' vs 'font-bold'
    // The previous code had a manual map, but our system prompt now returns raw weights sometimes.
    // Let's ensure we use what is passed if it matches tailwind, or map it. 
    // Actually, for simplicity let's trust the AI or use the passed value if it's a class, 
    // but the system prompt sends "700". "700" is not a tailwind class.
    // We need to verify if the other templates handle "700" -> "font-bold".
    // TemplateModern uses `${headingWeight}` directly? 
    // Checking `system_design_prompt.txt`, it outputs "700".
    // Checking `template-modern.tsx`, it uses `${headingWeight}`.
    // DOES tailwind support `700` class? No. It supports `font-bold` (700) or `font-[700]` (arbitrary).
    // Safest is to use arbitrary values: `font-[${headingWeight}]` OR map it.
    // For now, I will use a simple mapper since I'm here.

    const getWeightClass = (w: string) => {
        if (w === '900') return 'font-black';
        if (w === '700') return 'font-bold';
        if (w === '600') return 'font-semibold';
        if (w === '500') return 'font-medium';
        if (w === '300') return 'font-light';
        return 'font-normal';
    };

    const finalHeadingWeight = getWeightClass(customStyles?.headingWeight || '700');
    const finalBodyWeight = getWeightClass(customStyles?.bodyWeight || '400');

    return (
        <div className={`p-16 h-full flex flex-col ${bodyFontClass} text-slate-900 ${finalBodyWeight}`} style={{ backgroundColor: primaryColor }}>

            {/* Header - Centered */}
            <header className="mb-12 text-center">
                <h1 className={`text-3xl tracking-widest uppercase mb-4 text-slate-900 ${headingFontClass} ${finalHeadingWeight}`} style={{ color: accentColor }}>
                    {profile.fullName || "Your Name"}
                </h1>

                <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 uppercase tracking-widest">
                    {profile.email && (
                        <span>{profile.email}</span>
                    )}
                    {profile.phone && (
                        <span>{profile.phone}</span>
                    )}
                    {profile.location && (
                        <span>{profile.location}</span>
                    )}
                    {profile.linkedin && (
                        <span>LinkedIn</span>
                    )}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-10 text-center max-w-lg mx-auto">
                    <p className="text-sm leading-7 text-slate-600">
                        {profile.summary}
                    </p>
                </section>
            )}

            {/* Experience Section */}
            {resume.experience.length > 0 && (
                <section className="mb-10">
                    <h2 className={`text-xs uppercase tracking-[0.2em] text-center mb-8 ${finalHeadingWeight}`} style={{ color: accentColor }}>Experience</h2>
                    <div className="space-y-8">
                        {resume.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className={`text-slate-800 ${finalHeadingWeight}`}>{exp.company}</h3>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {exp.startDate} – {exp.endDate}
                                    </span>
                                </div>
                                <div className="text-sm italic mb-2" style={{ color: accentColor }}>
                                    {exp.title}
                                </div>
                                {exp.description && (
                                    <div className="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">
                                        {exp.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education & Skills Grid */}
            <div className="grid grid-cols-2 gap-12">

                {/* Education Section */}
                {resume.education.length > 0 && (
                    <section>
                        <h2 className={`text-xs uppercase tracking-[0.2em] mb-6 text-center ${finalHeadingWeight}`} style={{ color: accentColor }}>Education</h2>
                        <div className="space-y-6 text-center">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className={`text-sm text-slate-800 ${finalHeadingWeight}`}>{edu.institution}</div>
                                    <div className="text-xs text-slate-500 mt-1">{edu.degree}</div>
                                    <div className="text-xs text-slate-400 mt-1">{edu.startDate} – {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills Section */}
                {resume.skills.length > 0 && (
                    <section>
                        <h2 className={`text-xs uppercase tracking-[0.2em] mb-6 text-center ${finalHeadingWeight}`} style={{ color: accentColor }}>Skills</h2>
                        <div className="space-y-4 text-center">
                            {resume.skills.map((skillGroup) => (
                                <div key={skillGroup.id}>
                                    <div className="text-xs font-bold text-slate-700 mb-1">{skillGroup.category}</div>
                                    <div className="text-xs text-slate-500 italic">
                                        {skillGroup.skills?.join(", ")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
