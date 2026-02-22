import { useResumeStore } from "@/lib/store/useResumeStore";
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon } from "lucide-react";

export function CoverLetterPreview() {
    const { resume, coverLetter } = useResumeStore();
    const { profile } = resume;

    // Use specific date from generation or today's date if editing manually
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto shadow-sm print:shadow-none bg-white p-[25mm] flex flex-col font-serif">

            {/* Professional Header - "Erik Cupsa" Style */}
            <header className="flex flex-col items-center border-b-2 border-slate-800 pb-8 mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-widest text-slate-900 mb-4 font-serif text-center">
                    {profile.fullName || "Your Name"}
                </h1>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium tracking-wide">
                    {profile.email && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            <span>{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.linkedin && (
                        <div className="flex items-center gap-1.5">
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn</span>
                        </div>
                    )}
                    {profile.website && (
                        <div className="flex items-center gap-1.5">
                            <LinkIcon className="w-3 h-3" />
                            <span>Portfolio</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Letter Content */}
            <div className="flex-1 max-w-[170mm]">
                {/* Date */}
                <div className="mb-8 font-medium text-slate-700">
                    {today}
                </div>

                {/* Recipient Block - Only show if data exists to avoid empty gaps */}
                {(coverLetter.company || coverLetter.recipient) && (
                    <div className="mb-8 text-slate-800 font-medium leading-relaxed">
                        {coverLetter.recipient && <div>{coverLetter.recipient}</div>}
                        {coverLetter.jobTitle && <div>Hiring Team for {coverLetter.jobTitle}</div>}
                        {coverLetter.company && <div>{coverLetter.company}</div>}
                    </div>
                )}

                {/* Subject Line standard */}
                {coverLetter.jobTitle && (
                    <div className="mb-6 font-bold text-slate-900 border-b inline-block pb-1 border-slate-300">
                        RE: {coverLetter.jobTitle} Application
                    </div>
                )}

                {/* Body Text */}
                <div className="text-[10.5pt] leading-[1.6] text-slate-800 whitespace-pre-wrap text-justify font-serif">
                    {/* If body is empty, show a subtle guide */}
                    {coverLetter.body ? (
                        coverLetter.body
                    ) : (
                        <span className="text-slate-300 select-none">
                            [Your cover letter content will be generated here. Click "Generate" to write with AI...]
                        </span>
                    )}
                </div>

                {/* Signature Block */}
                <div className="mt-12">
                    <p className="mb-4 text-slate-800">Sincerely,</p>

                    {/* Cursive Signature */}
                    <div className="text-3xl text-slate-900 mb-2" style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}>
                        {profile.fullName || "Candidate"}
                    </div>

                    <p className="font-bold text-slate-900 mt-1">
                        {profile.fullName || "Your Name"}
                    </p>
                </div>
            </div>
        </div>
    );
}
