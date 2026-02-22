import { getFontClassName } from "@/lib/fonts";
import { Resume } from "@/types/resume";

interface TemplateProps {
    resume: Resume;
}

export function TemplateBanner({ resume }: TemplateProps) {
    const { profile, customStyles, experience, education, skills, projects, leadership } = resume;

    const fontHeading = customStyles?.fontHeading || 'Outfit';
    const fontBody = customStyles?.fontBody || 'Source Sans 3';
    const headingFont = getFontClassName(fontHeading);
    const bodyFont = getFontClassName(fontBody);

    // Banner background
    const accentColor = customStyles?.accentColor || '#3B82F6';

    return (
        <div className={`h-full flex flex-col ${bodyFont}`} style={{ fontFamily: fontBody }}>

            {/* Banner Header */}
            <header className="p-10 text-white" style={{ backgroundColor: accentColor }}>
                <h1 className={`text-4xl font-bold uppercase tracking-tight mb-2 ${headingFont}`}>
                    {profile.fullName}
                </h1>
                <h2 className="text-xl font-medium opacity-90 mb-6">{experience[0]?.title || "Professional Role"}</h2>

                <div className="flex flex-wrap gap-6 text-sm font-medium opacity-80">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.location && <span>{profile.location}</span>}
                    {profile.linkedin && <span>LinkedIn</span>}
                </div>
            </header>

            {/* Split Content */}
            <div className="flex flex-1">
                {/* Left Column (Narrow - Skills, Education) - As per Image 1 approx */}
                <aside className="w-[30%] bg-slate-50 p-8 border-r border-slate-200">

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Skills</h3>
                            <div className="space-y-4">
                                {skills.map((grp) => (
                                    <div key={grp.id}>
                                        <div className="text-sm font-bold text-slate-700 mb-1">{grp.category}</div>
                                        <div className="text-sm text-slate-500 leading-relaxed">
                                            {grp.skills.join(", ")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Education</h3>
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-sm text-slate-800">{edu.institution}</div>
                                        <div className="text-xs text-slate-500">{edu.degree}</div>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase">{edu.startDate} – {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 text-slate-800">

                    {/* Summary */}
                    {profile.summary && (
                        <section className="mb-8">
                            <h3 className={`text-xl font-bold mb-3 ${headingFont}`} style={{ color: accentColor }}>
                                Professional Summary
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600">{profile.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section className="mb-8">
                            <h3 className={`text-xl font-bold mb-6 ${headingFont}`} style={{ color: accentColor }}>
                                Work Experience
                            </h3>
                            <div className="space-y-8">
                                {experience.map((exp) => (
                                    <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: accentColor }}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-lg">{exp.title}</h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase">{exp.startDate} – {exp.endDate}</span>
                                        </div>
                                        <div className="text-sm font-semibold mb-2 text-slate-500">
                                            {exp.company}
                                        </div>
                                        <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                                            {exp.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Leadership */}
                    {leadership && leadership.length > 0 && (
                        <section className="mb-8">
                            <h3 className={`text-xl font-bold mb-6 ${headingFont}`} style={{ color: accentColor }}>
                                Leadership
                            </h3>
                            <div className="space-y-6">
                                {leadership.map((lead) => (
                                    <div key={lead.id} className="relative pl-4 border-l-2" style={{ borderColor: accentColor }}>
                                        <h4 className="font-bold text-base">{lead.title}</h4>
                                        <div className="text-sm text-slate-500 mb-2">{lead.company} | {lead.startDate}</div>
                                        <div className="text-sm leading-relaxed text-slate-600">{lead.description}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
}
