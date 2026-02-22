import { Resume } from "@/types/resume";
import { getFontClassName } from "@/lib/fonts";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface TemplateProps {
    resume: Resume;
}

export function TemplateEfficient({ resume }: TemplateProps) {
    const { profile, customStyles, education, experience, projects, skills, leadership } = resume;

    const navColor = customStyles?.accentColor || '#3B82F6'; // Default Blue
    const fontHeading = customStyles?.fontHeading || 'Inter';
    const fontBody = customStyles?.fontBody || 'Open Sans';

    const headingFontClass = getFontClassName(fontHeading);
    const bodyFontClass = getFontClassName(fontBody);

    return (
        <div className={`h-full flex flex-row ${bodyFontClass} text-slate-800`}>
            {/* Left Column (Sidebar) */}
            <aside className="w-[35%] bg-[#F0F4F8] flex flex-col p-8 gap-8 border-r border-slate-200">
                {/* Contact Section */}
                <div>
                    <h3 className={`text-lg uppercase tracking-widest font-bold mb-4 border-b-2`} style={{ borderColor: navColor, color: navColor }}>
                        Contact
                    </h3>
                    <div className="space-y-3 text-sm">
                        {profile.phone && (
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full text-white" style={{ backgroundColor: navColor }}>
                                    <Phone className="w-3 h-3" />
                                </div>
                                <span>{profile.phone}</span>
                            </div>
                        )}
                        {profile.email && (
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full text-white" style={{ backgroundColor: navColor }}>
                                    <Mail className="w-3 h-3" />
                                </div>
                                <span className="break-all">{profile.email}</span>
                            </div>
                        )}
                        {profile.location && (
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full text-white" style={{ backgroundColor: navColor }}>
                                    <MapPin className="w-3 h-3" />
                                </div>
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.website && (
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full text-white" style={{ backgroundColor: navColor }}>
                                    <Globe className="w-3 h-3" />
                                </div>
                                <span className="break-all">{profile.website.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                        {profile.linkedin && (
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full text-white" style={{ backgroundColor: navColor }}>
                                    <Linkedin className="w-3 h-3" />
                                </div>
                                <span className="break-all">{profile.linkedin.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills Section */}
                {skills?.length > 0 && (
                    <div>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-4 border-b-2`} style={{ borderColor: navColor, color: navColor }}>
                            Skills
                        </h3>
                        <div className="space-y-4">
                            {skills.map((skillGroup) => (
                                <div key={skillGroup.id}>
                                    <h4 className="font-semibold text-sm mb-2">{skillGroup.category}</h4>
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-slate-700">
                                        {skillGroup.skills?.map((skill, i) => (
                                            <li key={i}>{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Right Column (Main) */}
            <main className="flex-1 p-8 pt-12 flex flex-col gap-8">
                {/* Header */}
                <header>
                    <h1 className={`text-4xl uppercase font-bold tracking-tight mb-2 ${headingFontClass}`} style={{ color: navColor }}>
                        {profile.fullName}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium uppercase tracking-wide">
                        {experience?.[0]?.title || "Professional Title"}
                    </p>
                </header>

                {/* Summary */}
                {profile.summary && (
                    <section>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-3 border-b-2 inline-block px-1`} style={{ backgroundColor: navColor, color: 'white', borderColor: navColor }}>
                            Summary
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700">
                            {profile.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {experience?.length > 0 && (
                    <section>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-6 border-b-2 inline-block px-1`} style={{ backgroundColor: navColor, color: 'white', borderColor: navColor }}>
                            Work Experience
                        </h3>
                        <div className="space-y-6">
                            {experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-base font-bold text-slate-900">{exp.title}</h4>
                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            {exp.startDate} – {exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium mb-2 italic" style={{ color: navColor }}>
                                        {exp.company}, {exp.location}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Leadership Experience */}
                {leadership?.length > 0 && (
                    <section>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-6 border-b-2 inline-block px-1`} style={{ backgroundColor: navColor, color: 'white', borderColor: navColor }}>
                            Leadership Experience
                        </h3>
                        <div className="space-y-6">
                            {leadership.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            {item.startDate} – {item.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium mb-2 italic" style={{ color: navColor }}>
                                        {item.company}, {item.location}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && (
                    <section>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-6 border-b-2 inline-block px-1`} style={{ backgroundColor: navColor, color: 'white', borderColor: navColor }}>
                            Projects
                        </h3>
                        <div className="space-y-6">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-base font-bold text-slate-900">{proj.name}</h4>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: navColor }}>
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {proj.description}
                                    </p>
                                    {proj.technologies?.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {proj.technologies.map((tech, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education?.length > 0 && (
                    <section>
                        <h3 className={`text-lg uppercase tracking-widest font-bold mb-6 border-b-2 inline-block px-1`} style={{ backgroundColor: navColor, color: 'white', borderColor: navColor }}>
                            Education
                        </h3>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <h4 className="text-base font-bold text-slate-900">{edu.institution}</h4>
                                    <div className="text-sm font-medium" style={{ color: navColor }}>
                                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {edu.startDate} – {edu.endDate} {edu.score ? `| GPA: ${edu.score}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
