import {
  ColorScale,
  commonColors,
  ConfigTheme,
  ConfigThemes,
  heroui,
  LayoutTheme,
  ThemeColors,
} from "@heroui/theme";
import tailwindTypography from "@tailwindcss/typography";

import type { Config } from "tailwindcss";

type CustomSemanticColors = {
  option1: ColorScale;
  option2: ColorScale;
  sidebar: ColorScale;
};

type CustomLayout = {
  sidebarBorderWidth: string | number;
};

type CustomTheme = ConfigTheme & {
  colors?: Partial<ThemeColors & CustomSemanticColors>;
  layout?: Partial<LayoutTheme & CustomLayout>;
};

const customThemes = (themes: Record<string, CustomTheme>): ConfigThemes =>
  themes;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        "sidebar-border": "var(--heroui-sidebar-border-width)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "hsl(var(--heroui-foreground))",
            "--tw-prose-headings": "hsl(var(--heroui-foreground))",
            "--tw-prose-lead": "hsl(var(--heroui-foreground))",
            "--tw-prose-links": "hsl(var(--heroui-primary))",
            "--tw-prose-bold": "hsl(var(--heroui-foreground))",
            "--tw-prose-counters": "hsl(var(--heroui-foreground))",
            "--tw-prose-bullets": "hsl(var(--heroui-foreground))",
            "--tw-prose-hr": "hsl(var(--heroui-foreground))",
            "--tw-prose-quotes": "hsl(var(--heroui-foreground))",
            "--tw-prose-quote-borders": "hsl(var(--heroui-secondary))",
            "--tw-prose-captions": "hsl(var(--heroui-foreground))",
            "--tw-prose-code": "hsl(var(--heroui-foreground))",
            "--tw-prose-pre-code": "hsl(var(--heroui-foreground))",
            "--tw-prose-pre-bg": "hsl(var(--heroui-background))",
            "--tw-prose-th-borders": "hsl(var(--heroui-foreground))",
            "--tw-prose-td-borders": "hsl(var(--heroui-foreground))",
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              code: { "background-color": "transparent" },
            },
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: customThemes({
        dark: {
          colors: {
            primary: {
              DEFAULT: "#42b4ff",
              foreground: commonColors.black,
              "50": "#42b4ff",
              "100": "#266A98",
              "600": "#42b4ff",
            },
            secondary: {
              DEFAULT: "#E17A35",
              foreground: commonColors.white,
            },
            background: {
              DEFAULT: "#181923",
              foreground: commonColors.white,
            },
            foreground: {
              DEFAULT: commonColors.white,
              "500": "#D6D6D6",
            },
            default: {
              DEFAULT: "#2C2F41",
              "50": "#2F3041",
              "100": "#2F3144",
              "200": "#393A50",
              "300": "#42445E",
              foreground: commonColors.white,
            },
            content1: {
              DEFAULT: "#222432",
              foreground: commonColors.white,
            },
            content2: {
              DEFAULT: "#292C3D",
              foreground: commonColors.white,
            },
            content3: {
              DEFAULT: "#2F3246",
              foreground: commonColors.white,
            },
            divider: {
              DEFAULT: "#AFBAD5",
            },
            option1: {
              DEFAULT: commonColors.cyan["500"],
              foreground: commonColors.black,
            },
            option2: {
              DEFAULT: commonColors.pink["400"],
              foreground: commonColors.white,
            },
            sidebar: {
              DEFAULT: "#181923",
              foreground: commonColors.white,
            },
          },
          layout: {
            sidebarBorderWidth: "1px",
          },
        },
        light: {
          colors: {
            background: {
              DEFAULT: "#f4f5f7",
              foreground: commonColors.black,
            },
            foreground: {
              DEFAULT: commonColors.black,
              "500": "#606060",
            },
            default: {
              DEFAULT: "#CECECE",
              "50": "#CBC9C9",
              "100": "#F0F0F0",
              "200": "#CCCCCC",
              "300": "#B3B3B3",
              "500": "#6E6E6E",
              foreground: commonColors.black,
            },
            content1: {
              DEFAULT: "#F6F6F6",
              foreground: commonColors.black,
            },
            content2: {
              DEFAULT: "#EFEFEF",
              foreground: commonColors.black,
            },
            content3: {
              DEFAULT: "#DDDDDD",
              foreground: commonColors.black,
            },
            primary: {
              DEFAULT: "#00c9ec",
              foreground: commonColors.black,
              "50": "#ABE9F4",
              "100": "#14C0EF",
              "600": "#00A3C4",
            },
            secondary: {
              DEFAULT: "#C369D9",
              foreground: commonColors.white,
            },
            sidebar: {
              DEFAULT: "#f4f5f7",
              foreground: commonColors.black,
            },
          },
          layout: {
            sidebarBorderWidth: "1px",
          },
        },
      }),
    }),
    tailwindTypography,
  ],
};
export default config;
