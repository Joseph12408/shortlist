export type ThemeKey =
    | 'stockholm' | 'london' | 'san_francisco' | 'new_york'
    | 'berlin' | 'geneva' | 'tokyo' | 'austin'
    | 'seattle' | 'toronto' | 'sydney' | 'dubai'
    | 'munich' | 'vancouver' | 'singapore';

export interface ThemeConfig {
    id: ThemeKey;
    label: string;
    description: string;
    tokens: {
        fontHeading: string;
        fontBody: string;
        primaryColor: string;
        accentColor: string;
        headingWeight: string;
        bodyWeight: string;
        sectionDividerStyle: 'solid_line' | 'dashed_line' | 'spacer' | 'dotted' | 'double_line' | 'none';
        theme: 'modern' | 'classic' | 'minimal' | 'efficient' | 'sidebar' | 'sidebar_right' | 'standard' | 'banner';
    }
}

export const THEME_PRESETS: ThemeConfig[] = [
    {
        id: 'stockholm',
        label: 'Stockholm',
        description: 'Ultra-Minimalist',
        tokens: {
            theme: 'minimal',
            fontHeading: 'Inter',
            fontBody: 'Inter',
            primaryColor: '#000000',
            accentColor: '#333333',
            headingWeight: '400',
            bodyWeight: '400',
            sectionDividerStyle: 'spacer'
        }
    },
    {
        id: 'standard',
        label: 'Standard Layout',
        description: 'Traditional ATS Compatible',
        tokens: {
            theme: 'standard',
            fontHeading: 'Inter',
            fontBody: 'Inter',
            primaryColor: '#000000',
            accentColor: '#3B82F6',
            headingWeight: '600',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'banner',
        label: 'Executive Banner',
        description: 'Full-width Accent Header',
        tokens: {
            theme: 'banner',
            fontHeading: 'Outfit',
            fontBody: 'Inter',
            primaryColor: '#111827',
            accentColor: '#1e3a8a',
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'none'
        }
    },
    {
        id: 'london',
        label: 'London',
        description: 'Traditional & Financial',
        tokens: {
            theme: 'classic',
            fontHeading: 'Merriweather',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#111827',
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'san_francisco',
        label: 'San Francisco',
        description: 'Modern Tech',
        tokens: {
            theme: 'modern',
            fontHeading: 'Inter',
            fontBody: 'Inter',
            primaryColor: '#111827',
            accentColor: '#0F766E', // Teal
            headingWeight: '600',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'new_york',
        label: 'New York',
        description: 'Bold Executive',
        tokens: {
            theme: 'modern',
            fontHeading: 'Outfit',
            fontBody: 'Source Sans 3',
            primaryColor: '#000000',
            accentColor: '#000000',
            headingWeight: '900',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'berlin',
        label: 'Berlin',
        description: 'Precision Engineering',
        tokens: {
            theme: 'minimal',
            fontHeading: 'Source Sans 3',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#4B5563',
            headingWeight: '600',
            bodyWeight: '400',
            sectionDividerStyle: 'dashed_line'
        }
    },
    {
        id: 'geneva',
        label: 'Geneva',
        description: 'Clean Professional',
        tokens: {
            theme: 'classic',
            fontHeading: 'Source Sans 3',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#2563EB',
            headingWeight: '400',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'tokyo',
        label: 'Tokyo',
        description: 'Contemporary & Pop',
        tokens: {
            theme: 'modern',
            fontHeading: 'Outfit',
            fontBody: 'Inter',
            primaryColor: '#1F2937',
            accentColor: '#7C3AED', // Violet
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'spacer'
        }
    },
    {
        id: 'austin',
        label: 'Austin',
        description: 'Creative Startup',
        tokens: {
            theme: 'modern',
            fontHeading: 'Outfit',
            fontBody: 'Source Sans 3',
            primaryColor: '#111827',
            accentColor: '#EA580C', // Orange
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'seattle',
        label: 'Seattle',
        description: 'Natural & Calm',
        tokens: {
            theme: 'classic',
            fontHeading: 'Merriweather',
            fontBody: 'Inter',
            primaryColor: '#0F3F3F',
            accentColor: '#059669', // Emerald
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'double_line'
        }
    },
    {
        id: 'toronto',
        label: 'Toronto',
        description: 'Corporate Cool',
        tokens: {
            theme: 'minimal',
            fontHeading: 'Inter',
            fontBody: 'Inter',
            primaryColor: '#1F2937',
            accentColor: '#4F46E5', // Indigo
            headingWeight: '600',
            bodyWeight: '400',
            sectionDividerStyle: 'spacer'
        }
    },
    {
        id: 'sydney',
        label: 'Sydney',
        description: 'Friendly & Open',
        tokens: {
            theme: 'modern',
            fontHeading: 'Outfit',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#0EA5E9', // Sky
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'dotted'
        }
    },
    {
        id: 'dubai',
        label: 'Dubai',
        description: 'High Contrast Luxury',
        tokens: {
            theme: 'modern',
            fontHeading: 'Outfit',
            fontBody: 'Outfit',
            primaryColor: '#000000',
            accentColor: '#D97706', // Gold/Amber
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'munich',
        label: 'Munich',
        description: 'Efficient & Compact',
        tokens: {
            theme: 'efficient',
            fontHeading: 'Inter',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#DC2626', // Red
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'solid_line'
        }
    },
    {
        id: 'vancouver',
        label: 'Vancouver',
        description: 'Sidebar Layout',
        tokens: {
            theme: 'sidebar',
            fontHeading: 'Outfit',
            fontBody: 'Inter',
            primaryColor: '#111827',
            accentColor: '#059669', // Emerald
            headingWeight: '700',
            bodyWeight: '400',
            sectionDividerStyle: 'none'
        }
    },
    {
        id: 'singapore',
        label: 'Singapore',
        description: 'Right Sidebar',
        tokens: {
            theme: 'sidebar_right',
            fontHeading: 'Inter',
            fontBody: 'Source Sans 3',
            primaryColor: '#1F2937',
            accentColor: '#7C3AED', // Violet
            headingWeight: '600',
            bodyWeight: '400',
            sectionDividerStyle: 'none'
        }
    }
];
