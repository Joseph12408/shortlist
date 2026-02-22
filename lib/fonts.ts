// Simplified font loader to bypass Turbopack bug
// import { Inter } from 'next/font/google';

// // Initialize fonts
// const inter = { className: 'font-sans', variable: '--font-inter', style: { fontFamily: 'Inter' } };

// // Stand-in for other fonts to prevent build errors
// const fallbackFont = inter;

// Force all fonts to return a generic sans class for now
export function getFontClassName(fontName: string): string {
    return 'font-sans';
}

export const availableFonts = [
    "Inter", "Roboto", "Open Sans", "Lato", "Source Sans 3", "Nunito Sans", "Outfit",
    "Work Sans", "Fira Sans", "Montserrat", "Oswald", "Raleway",
    "Merriweather", "PT Serif", "Playfair Display", "Georgia", "Garamond", "Baskerville"
];

/*
// Map font names to their Next.js font objects
const fontMap: Record<string, any> = {
    // Sans
    "Inter": inter,


// Map font names to their Next.js font objects
const fontMap: Record<string, any> = {
    // Sans
    "Inter": inter,
    "Roboto": fallbackFont,
    "Open Sans": fallbackFont,
    "Lato": fallbackFont,
    "Source Sans Pro": fallbackFont,
    "Nunito Sans": fallbackFont,
    "Work Sans": fallbackFont,
    "Fira Sans": fallbackFont,
    "Montserrat": fallbackFont,
    "Oswald": fallbackFont,
    "Raleway": fallbackFont,
    "Helvetica": inter,
    "Arial": fallbackFont,
    "Verdana": fallbackFont,
    "Tahoma": fallbackFont,
    "Trebuchet MS": fallbackFont,

    // Serif
    "Merriweather": fallbackFont,
    "PT Serif": fallbackFont,
    "Playfair Display": fallbackFont,
    "Georgia": fallbackFont,
    "Garamond": fallbackFont,
    "Baskerville": fallbackFont
};

export function getFontClassName(fontName: string): string {
    const font = fontMap[fontName] || inter; // Default to Inter
    return font.className;
}

export const availableFonts = Object.keys(fontMap);
*/
