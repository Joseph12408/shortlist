export const DESIGN_SYSTEM = {
    "font_library": {
        "sans_serif": [
            "Inter",
            "Open Sans",
            "Roboto",
            "Lato",
            "Source Sans Pro",
            "Nunito Sans",
            "Work Sans",
            "Fira Sans",
            "Helvetica",
            "Arial",
            "Verdana",
            "Tahoma",
            "Trebuchet MS"
        ],
        "serif": [
            "Georgia",
            "Garamond",
            "Merriweather",
            "PT Serif",
            "Baskerville"
        ]
    },

    "font_pairings": [
        { "heading": "Inter", "body": "Open Sans" },
        { "heading": "Montserrat", "body": "Lato" },
        { "heading": "Helvetica", "body": "Roboto" },
        { "heading": "Georgia", "body": "Source Sans Pro" },
        { "heading": "Baskerville", "body": "Nunito Sans" }
    ],

    "color_palettes": {
        "neutral_base": [
            "#000000",
            "#111827",
            "#1F2937",
            "#374151"
        ],
        "accent_colors": [
            "#2563EB",
            "#0EA5E9",
            "#047857",
            "#D97706",
            "#7C3AED"
        ],
        "rules": {
            "max_accent_colors": 1,
            "body_text_color": "neutral_base",
            "accent_usage": ["headings", "section_dividers"]
        }
    },

    "spacing_rules": {
        "font_sizes": {
            "name": "16-20pt",
            "section_heading": "12-16pt",
            "body": "10-12pt",
            "meta": "9-11pt"
        },
        "line_height": {
            "body": "1.0-1.15",
            "sections": "1.4-1.8"
        },
        "margins": {
            "top_bottom": "0.5-1in",
            "left_right": "0.5-1in"
        },
        "white_space_ratio": "25-30%"
    },

    "layout_patterns": [
        {
            "id": "classic_clean",
            "columns": 1,
            "section_order": [
                "Header",
                "Professional Summary",
                "Skills",
                "Experience",
                "Projects",
                "Education",
                "Certifications"
            ],
            "best_for": ["general", "business", "early_career"]
        },
        {
            "id": "skills_forward",
            "columns": 1,
            "section_order": [
                "Header",
                "Skills",
                "Professional Summary",
                "Experience",
                "Projects",
                "Education"
            ],
            "best_for": ["technical", "career_switchers"]
        },
        {
            "id": "experience_emphasis",
            "columns": 1,
            "section_order": [
                "Header",
                "Professional Summary",
                "Experience",
                "Skills",
                "Projects",
                "Education"
            ],
            "best_for": ["experienced", "corporate"]
        }
    ],

    "section_emphasis_rules": {
        "skills": ["compact", "grouped", "keyword_dense"],
        "experience": ["impact_first", "metrics_focused", "reverse_chronological"],
        "projects": ["outcome_driven", "tech_stack_visible"],
        "education": ["minimal", "placement_last"]
    },

    "section_embellishments": {
        "header_styles": ["underline", "letter_spacing", "small_caps"],
        "section_dividers": ["solid_line", "dashed_line", "spacer"],
        "bullet_styles": ["dash", "circle", "square"],
        "text_emphasis": ["bold_action_verbs", "uppercase_headings"]
    },

    "constraints": {
        "columns": 1,
        "tables": false,
        "icons": false,
        "images": false,
        "charts": false,
        "ats_safe_only": true
    },

    "quality_bar": {
        "target_percentile": "top_20%",
        "ats_risk_tolerance": "low",
        "visual_creativity": "moderate",
        "clarity_priority": "high"
    }
} as const;
