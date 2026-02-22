import { getFontClassName } from "@/lib/fonts";
import { Resume } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface TemplateProps {
    resume: Resume;
}

export function TemplateClassic({ resume }: TemplateProps) {
    const { profile, customStyles } = resume;
    const fontHeading = customStyles?.fontHeading || 'Merriweather';
    const fontBody = customStyles?.fontBody || 'Merriweather';

    // Default weights and colors to prevent undefined access
    const headingWeight = customStyles?.headingWeight || 'font-bold';
    const bodyWeight = customStyles?.bodyWeight || 'font-normal';
    // Use tailwind arbitrary values if raw number is passed, or map it. 
    // Simplified mapping for classic:
    const getWeight = (w?: string) => {
        if (!w) return 'font-normal';
        if (w === '300') return 'font-light';
        if (w === '400') return 'font-normal';
        if (w === '500') return 'font-medium';
        if (w === '600') return 'font-semibold';
        if (w === '700') return 'font-bold';
        if (w === '900') return 'font-black';
        return w; // Fallback to classname if it was allowed
    };

    const finalHeadingWeight = getWeight(customStyles?.headingWeight);
    const finalBodyWeight = getWeight(customStyles?.bodyWeight);

    const primaryColor = customStyles?.primaryColor || '#1F2937';
    const accentColor = customStyles?.accentColor || '#111827';

    // ...
    const headingFontClass = getFontClassName(fontHeading);
    const bodyFontClass = getFontClassName(fontBody);


    return (
        <div className={`p-12 h-full flex flex-col ${bodyFontClass} text-slate-900 ${finalBodyWeight}`} style={{ backgroundColor: '#ffffff' }}>
            {/* Header */}
            <header className="border-b-2 pb-6 mb-6" style={{ borderColor: accentColor }}>
                <h1 className={`text-4xl uppercase tracking-tight mb-2 ${headingFontClass} ${finalHeadingWeight}`} style={{ color: accentColor }}>
                    {profile.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium font-sans">
                    {profile.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.linkedin && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" />
                            <span>{profile.linkedin.replace(/^https?:\/\//, '')}</span>
                        </div>
                    )}
                    {profile.website && (
                        <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-6">
                    <h2 className={`text-sm uppercase tracking-wider mb-2 font-sans ${finalHeadingWeight}`} style={{ color: accentColor }}>Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                        {profile.summary}
                    </p>
                </section>
            )}

            {/* Experience Section */}
            {resume.experience.length > 0 && (
                <section className="mb-6">
                    <h2 className={`text-sm uppercase tracking-wider mb-3 border-b pb-1 font-sans ${finalHeadingWeight}`} style={{ color: accentColor, borderColor: accentColor }}>Experience</h2>
                    <div className="space-y-4">
                        {resume.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-slate-800 text-lg ${finalHeadingWeight}`}>{exp.title}</h3>
                                    <span className="text-sm text-slate-600 font-medium font-sans">
                                        {exp.startDate} – {exp.endDate}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold mb-2 font-sans" style={{ color: accentColor }}>
                                    {exp.company}{exp.location ? `, ${exp.location}` : ""}
                                </div>
                                {exp.description && (
                                    <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                                        {exp.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education Section */}
            {resume.education.length > 0 && (
                <section className="mb-6">
                    <h2 className={`text-sm uppercase tracking-wider mb-3 border-b pb-1 font-sans ${finalHeadingWeight}`} style={{ color: accentColor, borderColor: accentColor }}>Education</h2>
                    <div className="space-y-3">
                        {resume.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-slate-800 ${finalHeadingWeight}`}>{edu.institution}</h3>
                                    <span className="text-sm text-slate-600 font-medium font-sans">
                                        {edu.startDate} – {edu.endDate}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-800">
                                    <span className="font-semibold">{edu.degree}</span> in {edu.fieldOfStudy}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills Section */}
            {resume.skills.length > 0 && (
                <section>
                    <h2 className={`text-sm uppercase tracking-wider mb-3 border-b pb-1 font-sans ${headingWeight}`} style={{ color: accentColor, borderColor: accentColor }}>Skills</h2>
                    <div className="space-y-2">
                        {resume.skills.map((skillGroup) => (
                            <div key={skillGroup.id} className="flex gap-2">
                                <span className={`text-slate-800 w-32 shrink-0 text-sm ${headingWeight}`}>{skillGroup.category}</span>
                                <div className="text-sm text-slate-700 flex-1">
                                    {skillGroup.skills?.join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
