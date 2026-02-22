import { getFontClassName } from "@/lib/fonts";

// ...

export function TemplateModern({ resume }: TemplateProps) {
    const { profile, customStyles } = resume;
    // ...
    const fontHeading = customStyles?.fontHeading || 'Inter';
    const fontBody = customStyles?.fontBody || 'Open Sans';
    const bodyWeight = customStyles?.bodyWeight || '400';
    const headingWeight = customStyles?.headingWeight || '700';
    const primaryColor = customStyles?.primaryColor || '#111827';
    const accentColor = customStyles?.accentColor || '#3B82F6';
    const sectionDividerStyle = customStyles?.sectionDividerStyle || 'solid_line';
    const bulletStyle = customStyles?.bulletStyle || 'disc';

    // Use Font Manager
    const headingFontClass = getFontClassName(fontHeading);
    const bodyFontClass = getFontClassName(fontBody);

    const isMono = fontHeading.toLowerCase().includes('mono') || fontHeading === 'Source Code Pro';

    return (
        <div className={`h-full flex flex-row ${bodyFontClass} text-slate-800 ${bodyWeight}`}>

            {/* Sidebar (Left) - dynamic width based on density? No, keep layout stable. */}
            <aside className="w-[32%] text-white p-8 flex flex-col gap-8 transition-colors duration-300" style={{ backgroundColor: primaryColor }}>

                {/* Contact Info */}
                <div className="mt-4 space-y-4">
                    {/* Contact items with Lucide icons if wanted, or minimal text */}
                    {profile.email && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Email</span>
                            <span className="text-sm font-medium opacity-90">{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Phone</span>
                            <span className="text-sm font-medium opacity-90">{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Location</span>
                            <span className="text-sm font-medium opacity-90">{profile.location}</span>
                        </div>
                    )}
                    {profile.website && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Website</span>
                            <span className="text-sm font-medium opacity-90 break-all">{profile.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                    )}
                </div>

                {/* Education in Sidebar */}
                {resume.education.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 border-b border-white/20 pb-2 mb-4">Education</h2>
                        <div className="space-y-6">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className={`text-sm ${headingWeight} leading-tight mb-1`} style={{ color: accentColor }}>{edu.institution}</div>
                                    <div className="text-xs text-white/80">{edu.degree}</div>
                                    <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">{edu.startDate} – {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills in Sidebar */}
                {resume.skills.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 border-b border-white/20 pb-2 mb-4">Skills</h2>
                        <div className="space-y-4">
                            {resume.skills.map((skillGroup) => (
                                <div key={skillGroup.id}>
                                    <div className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-wider">{skillGroup.category}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGroup.skills?.map((skill, i) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded bg-white/10 text-white/90 border border-white/5`}
                                                style={isMono ? { fontFamily: 'monospace' } : {}}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content (Right) */}
            <main className="flex-1 p-10 pt-14">

                {/* Header with big impact */}
                <header className="mb-10">
                    <h1 className={`text-5xl uppercase tracking-tighter leading-none mb-3 ${headingFontClass} ${headingWeight}`} style={{ color: primaryColor }}>
                        {profile.fullName}
                    </h1>
                    <p className={`text-xl tracking-wide ${isMono ? 'font-mono text-sm' : 'font-medium'}`} style={{ color: accentColor }}>
                        {resume.experience[0]?.title || "Professional Role"}
                    </p>
                </header>

                {/* Summary */}
                {profile.summary && (
                    <section className="mb-10 max-w-2xl">
                        <p className={`text-sm leading-7 text-slate-600 ${isMono ? 'font-mono text-xs' : ''}`}>
                            {profile.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {resume.experience.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className={`text-sm uppercase tracking-widest text-slate-400 font-bold ${headingWeight}`}>Experience</h2>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        <div className="space-y-10">
                            {resume.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-6 border-l-2 transition-all" style={{ borderColor: sectionDividerStyle === 'none' ? 'transparent' : accentColor }}>

                                    {/* Timeline Dot */}
                                    {sectionDividerStyle !== 'none' && (
                                        <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full ring-4 ring-white" style={{ backgroundColor: accentColor }}></div>
                                    )}

                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className={`text-xl text-slate-900 ${headingWeight}`}>{exp.title}</h3>
                                        <span className={`text-xs text-slate-500 font-bold uppercase tracking-wider ${isMono ? 'font-mono' : ''}`}>
                                            {exp.startDate} – {exp.endDate}
                                        </span>
                                    </div>

                                    <div className={`text-sm mb-3 font-medium uppercase tracking-wide opacity-80`} style={{ color: primaryColor }}>
                                        {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                                    </div>

                                    {exp.description && (
                                        <div className={`text-sm leading-relaxed text-slate-600 whitespace-pre-wrap ${bulletStyle === 'dash' ? 'list-none' : ''}`}>
                                            {/* We handle bullet styling via CSS injection or explicit rendering if needed. For now, native formatting. */}
                                            {exp.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

function selectionColor(style: string | undefined, color: string) {
    if (style === 'none') return 'transparent';
    return '#e2e8f0'; // slate-200 default
}
