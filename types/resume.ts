export interface ResumeProfile {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    summary: string;
    headline?: string; // Short bio/tagline
    jobTitle?: string; // Explicit job title if different from headline
}

export interface ResumeEducation {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
    score?: string;
}

export interface ResumeExperience {
    id: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string; // HTML or Markdown
}

export interface ResumeProject {
    id: string;
    name: string;
    description: string;
    url: string;
    technologies: string[];
}

export interface ResumeSkill {
    id: string;
    category: string;
    skills: string[]; // comma separated strings for V1 UI simplicity
}

export interface Resume {
    id: string;
    profile: ResumeProfile;
    education: ResumeEducation[];
    experience: ResumeExperience[];
    leadership: ResumeExperience[]; // Same structure as experience
    projects: ResumeProject[];
    skills: ResumeSkill[];
    customStyles?: {
        accentColor: string; // Hex code
        fontBody: string; // 'sans', 'serif', 'mono'
        fontHeading: string; // 'sans', 'serif', 'mono'
        theme: 'modern' | 'classic' | 'minimal' | 'efficient' | 'sidebar' | 'sidebar_right' | 'banner' | 'standard';
        // New Design Engine Tokens
        primaryColor?: string; // Neutral dark
        fontPair?: string; // Specific font pair identifier if needed, or just use fontBody/Heading
        headingWeight?: string; // '400', '500', '600'
        bodyWeight?: string; // '300', '400'
        sectionDividerStyle?: 'line' | 'none' | 'dot' | 'solid_line' | 'dashed_line' | 'spacer' | 'dotted' | 'double_line';
        bulletStyle?: 'circle' | 'square' | 'dash';
    };
    designCritique?: string; // Analysis of the resume's strength
    atsScore?: number; // Last calculated ATS score
    title?: string; // Name of the resume file or custom title
}
