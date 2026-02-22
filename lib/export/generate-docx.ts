import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { Resume } from "@/types/resume";

export const generateDocx = async (resume: Resume) => {
    const { profile, education, experience, skills } = resume;

    // Helper for creating section headers
    const createSectionHeader = (text: string) => {
        return new Paragraph({
            text: text.toUpperCase(),
            heading: HeadingLevel.HEADING_2,
            border: {
                bottom: {
                    color: "000000",
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                },
            },
            spacing: {
                before: 200,
                after: 100,
            },
        });
    };

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Header
                    new Paragraph({
                        text: profile.fullName || "Your Name",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: `${profile.email || ""} | ${profile.phone || ""} | ${profile.location || ""}`, bold: false }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Summary
                    ...(profile.summary ? [
                        createSectionHeader("Professional Summary"),
                        new Paragraph({
                            text: profile.summary,
                            spacing: { after: 200 },
                        }),
                    ] : []),

                    // Experience
                    ...(experience.length > 0 ? [
                        createSectionHeader("Experience"),
                        ...experience.flatMap(exp => [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp.title, bold: true, size: 24 }),
                                    new TextRun({ text: `\t${exp.startDate} – ${exp.endDate}`, bold: true }),
                                ],
                                tabStops: [
                                    { type: "right", position: 9000 },
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp.company, italics: true }),
                                    new TextRun({ text: exp.location ? `\t${exp.location}` : "" }),
                                ],
                                tabStops: [
                                    { type: "right", position: 9000 },
                                ],
                                spacing: { after: 100 },
                            }),
                            new Paragraph({
                                text: exp.description || "",
                                spacing: { after: 200 },
                            }),
                        ]),
                    ] : []),

                    // Education
                    ...(education.length > 0 ? [
                        createSectionHeader("Education"),
                        ...education.flatMap(edu => [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: edu.institution, bold: true }),
                                    new TextRun({ text: `\t${edu.startDate} – ${edu.endDate}`, bold: true }),
                                ],
                                tabStops: [
                                    { type: "right", position: 9000 },
                                ],
                            }),
                            new Paragraph({
                                text: `${edu.degree} in ${edu.fieldOfStudy}`,
                                spacing: { after: 200 },
                            }),
                        ]),
                    ] : []),

                    // Skills
                    ...(skills.length > 0 ? [
                        createSectionHeader("Skills"),
                        ...skills.map(skillGroup => {
                            // Handle if skillGroup is just a string (legacy/edge case)
                            if (typeof skillGroup === 'string') {
                                return new Paragraph({
                                    children: [new TextRun({ text: skillGroup })]
                                });
                            }

                            // Handle structured skills
                            const skillList = Array.isArray(skillGroup.skills)
                                ? skillGroup.skills.join(", ")
                                : String(skillGroup.skills || '');

                            return new Paragraph({
                                children: [
                                    new TextRun({ text: `${skillGroup.category || 'Skills'}: `, bold: true }),
                                    new TextRun({ text: skillList }),
                                ],
                            });
                        }),
                    ] : []),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${profile.fullName.replace(/\s+/g, '_')}_Resume.docx`);
};
