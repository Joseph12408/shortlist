"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "before" | "after";

const BEFORE_SCORE = 61;
const AFTER_SCORE = 93;

/** One resume line shown in both states, with the recruiter's margin note. */
function Line({
    before,
    after,
    note,
    delay,
}: {
    before: string;
    after: string;
    note: string;
    delay: number;
}) {
    return (
        <li>
            <span className="ld-swap">
                <span className="ld-before">
                    <span style={{ "--d": `${delay}s` } as React.CSSProperties}>{before}</span>
                </span>
                <span className="ld-after">
                    <span>{after}</span>
                </span>
            </span>
            <span className="ld-note">
                <span className="ld-note-red" style={{ "--d": `${delay + 0.35}s` } as React.CSSProperties}>
                    {note}
                </span>
                <span className="ld-note-blue">✓</span>
            </span>
        </li>
    );
}

/**
 * The hero illustration: a sample resume marked up in red pen, then fixed.
 * It plays once on load (marks draw in, then the rewrite lands) and the
 * Before / After toggle lets a visitor flip between the two states.
 */
export function MarkedResume() {
    const [stage, setStage] = useState<Stage>("before");
    const [score, setScore] = useState(BEFORE_SCORE);
    const touched = useRef(false);

    // Auto-advance to the fixed version once, unless the visitor took over.
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = setTimeout(
            () => {
                if (!touched.current) setStage("after");
            },
            reduced ? 0 : 3600,
        );
        return () => clearTimeout(timer);
    }, []);

    // Count the score toward whichever state is showing.
    useEffect(() => {
        const target = stage === "after" ? AFTER_SCORE : BEFORE_SCORE;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const id = setInterval(() => {
            setScore((s) => {
                if (s === target) {
                    clearInterval(id);
                    return s;
                }
                if (reduced) return target;
                return s + (target > s ? 1 : -1);
            });
        }, 22);
        return () => clearInterval(id);
    }, [stage]);

    const choose = (next: Stage) => {
        touched.current = true;
        setStage(next);
    };

    return (
        <div className="ld-demo" data-stage={stage}>
            <div className="ld-toggle" role="group" aria-label="Show the sample resume">
                <button type="button" aria-pressed={stage === "before"} onClick={() => choose("before")}>
                    Before
                </button>
                <button type="button" aria-pressed={stage === "after"} onClick={() => choose("after")}>
                    After Shortlist
                </button>
            </div>

            <div className="ld-pile">
                <div
                    className="ld-sheet"
                    role="img"
                    aria-label={
                        stage === "before"
                            ? `Sample resume scoring ${BEFORE_SCORE} out of 100, with vague bullets and buzzwords flagged in red pen.`
                            : `The same resume scoring ${AFTER_SCORE} out of 100 after its bullets were rewritten with numbers and its skills made concrete.`
                    }
                >
                    <div aria-hidden="true">
                        <div className="ld-score">
                            <svg viewBox="0 0 100 100">
                                <path
                                    pathLength={1}
                                    d="M52 6 C 22 4, 5 26, 7 52 C 9 80, 32 96, 56 93 C 82 90, 96 68, 93 44 C 90 20, 70 6, 44 9"
                                />
                            </svg>
                            <b>{score}</b>
                            <small>out of 100</small>
                        </div>

                        <div className="ld-sheet-name">Amara Bell</div>
                        <div className="ld-sheet-contact">amara.bell@email.com · linkedin.com/in/amarabell</div>

                        <div className="ld-sheet-h">Experience</div>
                        <div className="ld-sheet-role">
                            <span>Marketing Coordinator, Brightline Studio</span>
                            <span>2024 – Present</span>
                        </div>
                        <ul>
                            <Line
                                delay={0.9}
                                before="Responsible for managing the company's social media accounts"
                                after="Grew Instagram audience 38% in six months with a weekly video series"
                                note="what did YOU do?"
                            />
                            <Line
                                delay={1.5}
                                before="Helped with email campaigns for product launches"
                                after="Wrote 12 launch emails averaging a 41% open rate"
                                note="how many?"
                            />
                            <li>
                                Cut weekly reporting from 3 hours to 20 minutes by automating the dashboard
                                <span className="ld-note">
                                    <span className="ld-note-blue" style={{ opacity: 1 }}>
                                        ✓
                                    </span>
                                </span>
                            </li>
                        </ul>

                        <div className="ld-sheet-h">Skills</div>
                        <ul>
                            <Line
                                delay={2.1}
                                before="Hard-working team player, detail-oriented, fast learner"
                                after="SEO · Google Analytics · HubSpot · Figma · Copywriting"
                                note="buzzwords"
                            />
                        </ul>

                        <div className="ld-sheet-h">Education</div>
                        <div className="ld-sheet-role">
                            <span>B.A. Communications, Westbrook University</span>
                            <span>2023</span>
                        </div>

                        <div className="ld-stamp">Shortlist-ready</div>
                    </div>
                </div>
            </div>

            <p className="ld-demo-caption">A sample resume. Yours gets the same treatment.</p>
        </div>
    );
}
