import Link from "next/link";
import { isTemplateFree } from "@/lib/tiers";
import "./landing.css";

type Shape = "plain" | "center" | "serif" | "cols" | "left" | "right" | "banner" | "dark";

const templates: { id: string; name: string; shape: Shape }[] = [
    { id: "standard", name: "Standard", shape: "plain" },
    { id: "classic", name: "Classic", shape: "serif" },
    { id: "minimal", name: "Minimal", shape: "center" },
    { id: "modern", name: "Modern", shape: "dark" },
    { id: "efficient", name: "Efficient", shape: "cols" },
    { id: "sidebar", name: "Creative Left", shape: "left" },
    { id: "sidebar_right", name: "Creative Right", shape: "right" },
    { id: "banner", name: "Executive Banner", shape: "banner" },
];

function Body() {
    return (
        <>
            <i className="h" />
            <i />
            <i className="w8" />
            <i className="w6" />
            <i className="h" />
            <i />
            <i className="w8" />
            <i />
            <i className="w4" />
            <i className="h" />
            <i className="w8" />
            <i className="w6" />
        </>
    );
}

function Side() {
    return (
        <div className="ld-thumb-side">
            <i className="dot" />
            <i />
            <i className="w8" />
            <i className="w6" />
            <i />
            <i className="w4" />
        </div>
    );
}

/** A small wireframe of each layout, drawn in CSS so it stays crisp. */
function Thumb({ shape }: { shape: Shape }) {
    if (shape === "banner" || shape === "dark") {
        return (
            <div className={`ld-thumb banner ${shape === "dark" ? "dark" : ""}`}>
                <div className="ld-thumb-banner">
                    <i className="name" />
                    <i className="w6" />
                </div>
                <div className="ld-thumb-main">
                    <Body />
                </div>
            </div>
        );
    }
    return (
        <div className={`ld-thumb ${shape}`}>
            {shape === "left" && <Side />}
            <div className="ld-thumb-main">
                <i className="name" />
                {shape !== "center" && <i className="rule" />}
                <Body />
            </div>
            {shape === "right" && <Side />}
        </div>
    );
}

export function TemplateShowcase() {
    return (
        <section className="ld-section ld-band">
            <div className="ld-wrap">
                <div className="ld-head-row">
                    <div>
                        <p className="ld-eyebrow">Templates</p>
                        <h2 className="ld-h2">Eight layouts. Three are free.</h2>
                        <p className="ld-lede">
                            Clean, single-purpose designs that put your experience first. What you see
                            in the builder is exactly what the PDF looks like.
                        </p>
                    </div>
                    <Link href="/templates" className="ld-link">
                        See all templates →
                    </Link>
                </div>

                <div className="ld-templates">
                    {templates.map((t) => (
                        <figure className="ld-tpl" key={t.id}>
                            <div aria-hidden="true">
                                <Thumb shape={t.shape} />
                            </div>
                            <figcaption>
                                {t.name}
                                {isTemplateFree(t.id) ? <small>Free</small> : <small className="pro">Pro</small>}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
