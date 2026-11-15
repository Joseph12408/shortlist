import { ScanSearch, PenLine, Mail } from "lucide-react";
import "./landing.css";

export function Tailor() {
    return (
        <section className="ld-section">
            <div className="ld-wrap ld-split">
                <div>
                    <p className="ld-eyebrow">Beyond the score</p>
                    <h2 className="ld-h2">One resume, tuned for each job.</h2>
                    <p className="ld-lede">
                        A strong resume still has to match the posting. Paste the job description
                        and Shortlist shows which of its keywords you already cover and which are
                        missing.
                    </p>
                    <ul className="ld-points">
                        <li>
                            <ScanSearch aria-hidden="true" />
                            <div>
                                <strong>Job scans</strong>
                                <span>See matched and missing keywords for any posting.</span>
                            </div>
                        </li>
                        <li>
                            <PenLine aria-hidden="true" />
                            <div>
                                <strong>
                                    AI rewrites <i className="ld-tag not-italic">Pro</i>
                                </strong>
                                <span>
                                    Sharper bullets built from what you actually did. It never invents
                                    numbers or skills.
                                </span>
                            </div>
                        </li>
                        <li>
                            <Mail aria-hidden="true" />
                            <div>
                                <strong>
                                    Cover letters <i className="ld-tag not-italic">Pro</i>
                                </strong>
                                <span>A tailored letter for each application, drafted from your resume.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="ld-card ld-jd">
                    <div className="ld-jd-label">Job description · Marketing Associate</div>
                    <p className="ld-jd-post">
                        You will plan and report on campaigns across <mark className="hit">SEO</mark>,
                        email and paid social, using <mark className="hit">Google Analytics</mark> and{" "}
                        <mark className="hit">HubSpot</mark> to track results. Strong{" "}
                        <mark className="hit">copywriting</mark> is essential. Experience with{" "}
                        <mark className="miss">A/B testing</mark> and{" "}
                        <mark className="miss">paid social</mark> budgets is a plus.
                    </p>
                    <div className="ld-jd-meter">
                        <span>
                            <b>4 of 6</b> keywords covered
                        </span>
                        <span className="ld-key">
                            <i /> On your resume
                        </span>
                        <span className="ld-key">
                            <i className="miss" /> Missing
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
