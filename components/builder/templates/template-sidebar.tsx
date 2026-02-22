import { getFontClassName } from "@/lib/fonts";
import { Resume } from "@/types/resume";

interface TemplateProps {
    resume: Resume;
    sidebarOnRight?: boolean;
}

export function TemplateSidebar({ resume, sidebarOnRight = false }: TemplateProps) {
    const { profile, customStyles, experience, education, skills, projects, leadership } = resume;

    const fontHeading = customStyles?.fontHeading || 'Inter';
    const fontBody = customStyles?.fontBody || 'Open Sans';
    const headingFont = getFontClassName(fontHeading);
    const bodyFont = getFontClassName(fontBody);

    // Sidebar usually takes the primary color
    // If primary is dark (black), text should be white.
    // If user picks a light color, we might need dark text.
    // For simplicity, we assume primaryColor is an "Accent" or "Brand" color here.
    // But wait, the prompt says "Keep primaryColor neutral". 
    // The user's images show COLORFUL sidebars (Blue, Green).
    // So we should use `accentColor` for the sidebar background?
    // User Guide "Color Mapping Logic": "If user asks for a color... apply it to 'accentColor'".
    // So Sidebar BG = accentColor.
    const sidebarBg = customStyles?.accentColor || '#3B82F6';
    const sidebarText = '#ffffff'; // Assuming dark/saturated accents for now.

    const ContentSection = (
        <main className="flex-1 p-8 text-slate-800">
            {/* Header / Name (if not in sidebar - usually top of main in this layout) */}
            <header className="mb-8">
                <h1 className={`text-4xl font-bold uppercase tracking-tight mb-2 ${headingFont}`} style={{ color: sidebarBg }}>
                    {profile.fullName}
                </h1>
                <h2 className="text-xl font-medium text-slate-500">{experience[0]?.title}</h2>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-8">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 border-b-2 pb-1 ${headingFont}`} style={{ borderColor: sidebarBg, color: sidebarBg }}>
                        Profile
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">{profile.summary}</p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section className="mb-8">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b-2 pb-1 ${headingFont}`} style={{ borderColor: sidebarBg, color: sidebarBg }}>
                        Experience
                    </h3>
                    <div className="space-y-6">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-lg text-slate-800">{exp.title}</h4>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <div className="text-sm font-medium italic mb-2" style={{ color: sidebarBg }}>
                                    {exp.company}, {exp.location}
                                </div>
                                <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-line pl-1">
                                    {exp.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Leadership (if any) */}
            {leadership && leadership.length > 0 && (
                <section className="mb-8">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b-2 pb-1 ${headingFont}`} style={{ borderColor: sidebarBg, color: sidebarBg }}>
                        Leadership
                    </h3>
                    <div className="space-y-6">
                        {leadership.map((lead) => (
                            <div key={lead.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-lg text-slate-800">{lead.title}</h4>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">{lead.startDate} – {lead.endDate}</span>
                                </div>
                                <div className="text-sm font-medium italic mb-2" style={{ color: sidebarBg }}>
                                    {lead.company}
                                </div>
                                <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-line pl-1">
                                    {lead.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects (if any) */}
            {projects.length > 0 && (
                <section className="mb-8">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b-2 pb-1 ${headingFont}`} style={{ borderColor: sidebarBg, color: sidebarBg }}>
                        Projects
                    </h3>
                    {projects.map((proj) => (
                        <div key={proj.id} className="mb-4">
                            <h4 className="font-bold text-base text-slate-800">{proj.name}</h4>
                            <p className="text-sm text-slate-600">{proj.description}</p>
                        </div>
                    ))}
                </section>
            )}


        </main>
    );

    const SidebarSection = (
        <aside className="w-[30%] p-8 flex flex-col gap-8 text-white min-h-full" style={{ backgroundColor: sidebarBg }}>

            {/* Contact */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Contact</h3>
                <div className="space-y-3 text-sm">
                    {profile.phone && <div className="opacity-90">{profile.phone}</div>}
                    {profile.email && <div className="opacity-90 break-all">{profile.email}</div>}
                    {profile.location && <div className="opacity-90">{profile.location}</div>}
                    {profile.linkedin && <div className="opacity-90 break-all">{profile.linkedin.replace(/^https?:\/\//, '')}</div>}
                    {profile.website && <div className="opacity-90 break-all">{profile.website.replace(/^https?:\/\//, '')}</div>}
                </div>
            </div>

            {/* Education (Placed in Sidebar per Images 0 and 2 often) */}
            {/* Actually Image 1 has Education in main, but Sidebar layouts often put it side. */}
            {/* Let's put Education in Sidebar for distinctiveness from Standard */}
            {education.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Education</h3>
                    <div className="space-y-4">
                        {education.map((edu) => (
                            <div key={edu.id}>
                                <div className="font-bold text-sm">{edu.institution}</div>
                                <div className="text-xs opacity-80">{edu.degree}</div>
                                <div className="text-[10px] opacity-60 uppercase mt-1">{edu.startDate} – {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Skills</h3>
                    <div className="space-y-4">
                        {skills.map((grp) => (
                            <div key={grp.id}>
                                <div className="text-xs font-bold opacity-75 uppercase mb-1">{grp.category}</div>
                                <div className="flex flex-wrap gap-2">
                                    {grp.skills.map((s, i) => (
                                        <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{s}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </aside>
    );

    return (
        <div className={`flex h-full ${bodyFont}`} style={{ fontFamily: fontBody }}>
            {sidebarOnRight ? (
                <>
                    {ContentSection}
                    {SidebarSection}
                </>
            ) : (
                <>
                    {SidebarSection}
                    {ContentSection}
                </>
            )}
        </div>
    );
}
