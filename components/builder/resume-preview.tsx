"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { TemplateClassic } from "./templates/template-classic";
import { TemplateModern } from "./templates/template-modern";
import { TemplateMinimal } from "./templates/template-minimal";
import { TemplateStandard } from "./templates/template-standard";
import { TemplateEfficient } from "./templates/template-efficient";
import { TemplateSidebar } from "./templates/template-sidebar";
import { TemplateBanner } from "./templates/template-banner";
import { CoverLetterPreview } from "./cover-letter/cover-letter-preview";

export function ResumePreview() {
    const { resume, viewMode } = useResumeStore();
    const currentTheme = resume.customStyles?.theme || 'modern';

    // If in Cover Letter mode, strict return of Cover Letter Preview
    if (viewMode === 'cover-letter') {
        return (
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top transform transition-transform duration-200 ease-in-out text-slate-900 overflow-hidden print:shadow-none print:w-full print:h-auto">
                <CoverLetterPreview />
            </div>
        );
    }

    // Standard A4 aspect ratio (approximate for screen)
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top transform transition-transform duration-200 ease-in-out text-slate-900 overflow-hidden print:shadow-none print:w-full print:h-auto"
            id="resume-preview">

            <>
                {currentTheme === 'classic' && <TemplateClassic resume={resume} />}
                {currentTheme === 'modern' && <TemplateModern resume={resume} />}
                {currentTheme === 'minimal' && <TemplateMinimal resume={resume} />}
                {currentTheme === 'efficient' && <TemplateEfficient resume={resume} />}
                {currentTheme === 'standard' && <TemplateStandard resume={resume} />}
                {currentTheme === 'sidebar' && <TemplateSidebar resume={resume} sidebarOnRight={false} />}
                {currentTheme === 'sidebar_right' && <TemplateSidebar resume={resume} sidebarOnRight={true} />}
                {currentTheme === 'banner' && <TemplateBanner resume={resume} />}
            </>

        </div>
    );
}
