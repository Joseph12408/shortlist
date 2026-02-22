import { getFontClassName } from "@/lib/fonts";
import { Resume } from "@/types/resume";

interface TemplateProps {
    resume: Resume;
}

export function TemplateStandard({ resume }: TemplateProps) {
    const { profile, customStyles, experience, education, skills, projects, leadership } = resume;

    const fontHeading = customStyles?.fontHeading || 'Merriweather';
    const fontBody = customStyles?.fontBody || 'Source Sans 3';
    const headingFont = getFontClassName(fontHeading);
    const bodyFont = getFontClassName(fontBody);

    // Standard template is typically black and white or very dark grey
    const primaryColor = customStyles?.primaryColor || '#000000';
    const accentColor = customStyles?.accentColor || '#000000'; // Usually black for standard

    return (
        <div className={`p-12 h-full flex flex-col ${bodyFont} text-black`} style={{ fontFamily: fontBody }}>

            {/* Header */}
            <header className="text-center mb-6">
                <h1 className={`text-3xl font-bold uppercase tracking-wide mb-2 ${headingFont}`} style={{ color: primaryColor }}>
                    {profile.fullName}
                </h1>
                <div className="flex justify-center flex-wrap gap-3 text-sm text-gray-800">
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.phone && profile.email && <span>|</span>}
                    {profile.email && <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>}
                    {profile.email && profile.linkedin && <span>|</span>}
                    {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
                    {profile.linkedin && profile.location && <span>|</span>}
                    {profile.location && <span>{profile.location}</span>}
                </div>
            </header>

            {/* Sections Generator */}
            <div className="space-y-5">

                {/* Summary (Optional for this format, but good to have) */}
                {profile.summary && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Summary
                        </h2>
                        <p className="text-sm leading-relaxed">{profile.summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base">{exp.title}</h3>
                                        <span className="text-sm italic text-gray-700">{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-sm font-semibold italic">{exp.company}</span>
                                        <span className="text-sm text-gray-600">{exp.location}</span>
                                    </div>
                                    <div className="text-sm leading-relaxed mt-1 whitespace-pre-line pl-1">
                                        {exp.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Leadership Experience */}
                {leadership && leadership.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Leadership Experience
                        </h2>
                        <div className="space-y-4">
                            {leadership.map((lead) => (
                                <div key={lead.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base">{lead.title}</h3>
                                        <span className="text-sm italic text-gray-700">{lead.startDate} – {lead.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-sm font-semibold italic">{lead.company}</span>
                                        <span className="text-sm text-gray-600">{lead.location}</span>
                                    </div>
                                    <div className="text-sm leading-relaxed mt-1 whitespace-pre-line pl-1">
                                        {lead.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base">{proj.name}</h3>
                                        {proj.url && <a href={proj.url} className="text-xs text-blue-800 hover:underline">View Project</a>}
                                    </div>
                                    <div className="text-sm leading-relaxed mt-1">
                                        {proj.description}
                                    </div>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="text-xs text-gray-600 mt-1 italic">
                                            <span className="font-semibold">Technologies:</span> {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Education
                        </h2>
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-base">{edu.institution}</h3>
                                        <span className="text-sm italic text-gray-700">{edu.startDate} – {edu.endDate}</span>
                                    </div>
                                    <div className="text-sm">
                                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Technical Skills
                        </h2>
                        <div className="space-y-1">
                            {skills.map((skill) => (
                                <div key={skill.id} className="text-sm flex gap-2">
                                    <span className="font-bold min-w-[100px]">{skill.category}:</span>
                                    <span>{skill.skills.join(", ")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
