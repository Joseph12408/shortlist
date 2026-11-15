import { Reveal } from "@/components/landing/reveal";
import "./landing.css";

/** Mirrors the category weights in lib/ats/ats-score.ts. */
const criteria = [
    {
        name: "Content and impact",
        points: 30,
        checks: "Numbers in your bullets, a strong verb opening each one, three to five bullets per role, a real summary.",
    },
    {
        name: "Structure and format",
        points: 20,
        checks: "The sections a recruiter expects, enough substance to judge, every role backed by bullets, complete education.",
    },
    {
        name: "Writing quality",
        points: 20,
        checks: "Weak phrases, buzzwords, filler, bullets that run long, the same opening verb used again and again.",
    },
    {
        name: "Keywords and skills",
        points: 15,
        checks: "How well you match a job description when you add one. Without one, the depth of your concrete skills.",
    },
    {
        name: "Application ready",
        points: 15,
        checks: "Contact details, a professional link, dates on every role, and no stray typos or spacing slips.",
    },
];

export function Rubric() {
    return (
        <section id="features" className="ld-section">
            <div className="ld-wrap ld-rubric-grid">
                <div className="ld-rubric-intro">
                    <p className="ld-eyebrow">The score</p>
                    <h2 className="ld-h2">Graded the way a recruiter reads.</h2>
                    <p className="ld-lede">
                        No mystery number. Every point comes from a check you can see, so you know
                        what to change. The same resume always gets the same score, and 100 is
                        reachable.
                    </p>
                    <div className="ld-stat">
                        <b>7.4s</b>
                        <p>
                            The average first look a recruiter gives a resume.
                            <cite>Ladders eye-tracking study, 2018</cite>
                        </p>
                    </div>
                </div>

                <Reveal className="ld-card ld-scorecard">
                    <div className="ld-scorecard-head">
                        <span>What we check</span>
                        <span>Points</span>
                    </div>
                    {criteria.map((c, i) => (
                        <div className="ld-crit" key={c.name}>
                            <h3>{c.name}</h3>
                            <div className="ld-crit-pts">{c.points}</div>
                            <p>{c.checks}</p>
                            <div className="ld-crit-bar" aria-hidden="true">
                                <i
                                    style={
                                        {
                                            "--w": `${(c.points / 30) * 100}%`,
                                            "--d": `${i * 0.08}s`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        </div>
                    ))}
                    <div className="ld-scorecard-foot">
                        <span>Total</span>
                        <b>100</b>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
