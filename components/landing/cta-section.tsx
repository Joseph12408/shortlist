import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./landing.css";

export function CTASection() {
    return (
        <section className="ld-section ld-close">
            <div className="ld-wrap">
                <h2 className="ld-h2">Seven seconds is not long.<br />Make them count.</h2>
                <p>Upload your resume and see where it stands before your next application.</p>
                <Link href="/analysis" className="ld-btn ld-btn-marker">
                    Score my resume
                    <ArrowRight />
                </Link>
                <small>Free to start. No card needed.</small>
            </div>
        </section>
    );
}
