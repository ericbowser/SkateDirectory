import { themeQuartz, iconSetQuartzLight } from 'ag-grid-community';

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz
	.withPart(iconSetQuartzLight)
	.withParams({
        accentColor: "#2049d8",
        backgroundColor: "#874343",
        borderColor: "rgb(7,37,236)",
        borderRadius: 2,
        browserColorScheme: "dark",
        cellHorizontalPaddingScale: 0.50,
        cellTextColor: "#fbf5f5",
        chromeBackgroundColor: "#090000",
        columnBorder: true,
        fontFamily: {
            googleFont: "Pixelify Sans"
        },
        fontSize: 12,
        foregroundColor: "rgba(0,0,0,0.15)",
        headerFontSize: 14,
        headerRowBorder: true,
        iconSize: 14,
        oddRowBackgroundColor: "#b4f391",
        rowBorder: true,
        rowVerticalPaddingScale: 0.5,
        spacing: 1,
        wrapperBorder: true
    });

export default myTheme;