import { Resume } from "@/types/resume";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { v4 as uuidv4 } from 'uuid';

// Initialize PDF.js worker
// Note: In a production App, you might want to bundle the worker.
// Using CDN for simplicity in this implementation.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const parseResume = async (file: File): Promise<Resume> => {
    let text = "";

    if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        text = await extractTextFromDOCX(file);
    } else {
        throw new Error("Unsupported file type");
    }

    return mapTextToResume(text);
};

const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // Cast to any to avoid complex type setup for PDF.js in this environment
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf: any = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
    }

    return fullText;
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const mapTextToResume = (text: string): Resume => {
    // Very basic heuristic parser
    // 1. Identify sections based on keywords
    // 2. Extract content between sections

    const lines = text.split(/\n+/);
    const sections: { [key: string]: string[] } = {
        header: [],
        summary: [],
        experience: [],
        education: [],
        skills: [],
        projects: [],
    };

    let currentSection = "header";

    const sectionKeywords: { [key: string]: string[] } = {
        summary: ["summary", "profile", "about me", "professional summary"],
        experience: ["experience", "work history", "employment", "work experience"],
        education: ["education", "academic history", "qualifications"],
        skills: ["skills", "technologies", "competencies", "technical skills"],
        projects: ["projects", "personal projects"],
    };

    for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        let sectionFound = false;

        if (trimmed.length < 30) { // Headers are usually short
            for (const [section, keywords] of Object.entries(sectionKeywords)) {
                if (keywords.some(k => trimmed.includes(k))) {
                    currentSection = section;
                    sectionFound = true;
                    break;
                }
            }
        }

        if (!sectionFound) {
            sections[currentSection].push(line.trim());
        }
    }

    // Map extracted text to Resume object
    // P.S. This is where AI parsing would be much better.
    // Logic here is rudimentary for V1.

    const profileName = sections.header[0] || "";
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/);

    return {
        id: uuidv4(), // Generate a new ID
        profile: {
            fullName: profileName,
            email: emailMatch ? emailMatch[0] : "",
            phone: phoneMatch ? phoneMatch[0] : "",
            location: "", // Hard to extract reliably without NLP
            website: "",
            linkedin: linkedinMatch ? `https://www.${linkedinMatch[0]}` : "",
            summary: sections.summary.join("\n"),
        },
        experience: sections.experience.length > 0 ? [{
            id: uuidv4(),
            title: "Imported Experience (Edit me)",
            company: "Check Details",
            startDate: "",
            endDate: "",
            location: "",
            current: false,
            description: sections.experience.join("\n"),
        }] : [],
        education: sections.education.length > 0 ? [{
            id: uuidv4(),
            institution: "Imported Education (Edit me)",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            current: false,
        }] : [],
        skills: sections.skills.length > 0 ? [{
            id: uuidv4(),
            category: "Imported Skills",
            skills: sections.skills.join(",").split(",").map(s => s.trim()).filter(s => s),
        }] : [],
        projects: [],
    };
};
