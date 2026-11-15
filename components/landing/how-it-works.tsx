import "./landing.css";

const steps = [
    {
        title: "Hand it over",
        body: "Upload the PDF you already have, or start a new resume in the builder. Either way you see a score in seconds.",
    },
    {
        title: "Read the marks",
        body: "Your score breaks down into the five areas above, with the issues that cost you the most points listed first.",
    },
    {
        title: "Fix it and send",
        body: "Rewrite the weak lines yourself or with AI, pick a template, and export a resume that is ready to go.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="ld-section ld-band">
            <div className="ld-wrap">
                <p className="ld-eyebrow">How it works</p>
                <h2 className="ld-h2">From first draft to ready in three steps.</h2>
                <ol className="ld-steps">
                    {steps.map((s, i) => (
                        <li className="ld-step" key={s.title}>
                            <div className="ld-step-n" aria-hidden="true">
                                {i + 1}.
                            </div>
                            <h3>{s.title}</h3>
                            <p>{s.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
