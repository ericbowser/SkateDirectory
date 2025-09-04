import { themeQuartz, iconSetQuartzLight } from 'ag-grid-community';

// Energetic Pastel Theme - Mint & Fresh Vibes
const myTheme = themeQuartz
  .withPart(iconSetQuartzLight)
  .withParams({
    // Primary mint-inspired accent
    accentColor: "#2dd481", // Energetic teal-mint

    // Clean, soft background
    backgroundColor: "#F8FAFC", // Very light gray-blue

    // Subtle borders for definition
    borderColor: "#f3bfe7", // Light gray-blue border
    borderRadius: 6,

    // Light theme for energy
    browserColorScheme: "dark",

    // Comfortable spacing
    cellHorizontalPaddingScale: 0.8,

    // Dark text for readability on light backgrounds
    cellTextColor: "#176037", // Slate gray - energetic but readable

    // Header area - soft mint tone
    chromeBackgroundColor: "#F0FDF4", // Very light mint

    // Clean column separation
    columnBorder: true,

    // Modern, clean font
    fontFamily: {
      googleFont: "Inter"
    },
    fontSize: 13,

    // Soft foreground elements
    foregroundColor: "#94A3B8", // Light slate for subtle elements

    // Slightly larger headers for hierarchy
    headerFontSize: 14,
    headerRowBorder: true,

    // Crisp icons
    iconSize: 16,

    // Alternating rows - soft energy
    oddRowBackgroundColor: "#d6ffec", // Very light mint-green

    // Clean row definition
    rowBorder: false, // Less visual noise
    rowVerticalPaddingScale: 0.7,

    // Comfortable spacing
    spacing: 2,
    wrapperBorder: true
  });

export default myTheme;