import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarkedResume } from "@/components/landing/marked-resume";
import "./landing.css";

export function Hero() {
    return (
        <section className="ld-hero">
            <div className="ld-wrap ld-hero-grid">
                <div>
                    <p className="ld-eyebrow">Resume grader and builder</p>
                    <h1 className="ld-h1">
                        Find the{" "}
                        <span className="ld-redink">
                            red ink
                            <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                                <path pathLength={1} d="M3 8 C 40 2, 80 11, 120 5 S 180 4, 197 7" />
                            </svg>
                        </span>{" "}
                        before a recruiter does.
                    </h1>
                    <p className="ld-hero-lede">
                        Shortlist grades your resume against a strict 100-point rubric, shows you
                        what is costing you points, and helps you rewrite it for the job you want.
                    </p>
                    <div className="ld-hero-actions">
                        <Link href="/analysis" className="ld-btn ld-btn-marker">
                            Score my resume
                            <ArrowRight />
                        </Link>
                        <Link href="/builder" className="ld-btn ld-btn-ghost-dark">
                            Build one from scratch
                        </Link>
                    </div>
                    <p className="ld-hero-note">Free to start. No card needed.</p>
                </div>

                <MarkedResume />
            </div>
        </section>
    );
}
