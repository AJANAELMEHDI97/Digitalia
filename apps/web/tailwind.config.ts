import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Statuts harmonisés
        status: {
          draft: {
            DEFAULT: "hsl(var(--status-draft-bg))",
            foreground: "hsl(var(--status-draft-text))",
            border: "hsl(var(--status-draft-border))",
          },
          pending: {
            DEFAULT: "hsl(var(--status-pending-bg))",
            foreground: "hsl(var(--status-pending-text))",
            border: "hsl(var(--status-pending-border))",
          },
          scheduled: {
            DEFAULT: "hsl(var(--status-scheduled-bg))",
            foreground: "hsl(var(--status-scheduled-text))",
            border: "hsl(var(--status-scheduled-border))",
          },
          published: {
            DEFAULT: "hsl(var(--status-published-bg))",
            foreground: "hsl(var(--status-published-text))",
            border: "hsl(var(--status-published-border))",
          },
        },
        // Sensibilité éditoriale
        sensitivity: {
          opportune: {
            DEFAULT: "hsl(var(--sensitivity-opportune-bg))",
            foreground: "hsl(var(--sensitivity-opportune-text))",
          },
          watch: {
            DEFAULT: "hsl(var(--sensitivity-watch-bg))",
            foreground: "hsl(var(--sensitivity-watch-text))",
          },
          avoid: {
            DEFAULT: "hsl(var(--sensitivity-avoid-bg))",
            foreground: "hsl(var(--sensitivity-avoid-text))",
          },
        },
        // Performance
        perf: {
          good: {
            DEFAULT: "hsl(var(--perf-good-bg))",
            foreground: "hsl(var(--perf-good-text))",
          },
          average: {
            DEFAULT: "hsl(var(--perf-average-bg))",
            foreground: "hsl(var(--perf-average-text))",
          },
          poor: {
            DEFAULT: "hsl(var(--perf-poor-bg))",
            foreground: "hsl(var(--perf-poor-text))",
          },
        },
        // Éléments calendrier
        keydate: {
          DEFAULT: "hsl(var(--keydate-bg))",
          foreground: "hsl(var(--keydate-text))",
          border: "hsl(var(--keydate-border))",
        },
        event: {
          DEFAULT: "hsl(var(--event-bg))",
          foreground: "hsl(var(--event-text))",
          border: "hsl(var(--event-border))",
        },
        // Plateformes sociales
        platform: {
          linkedin: "hsl(var(--platform-linkedin))",
          instagram: "hsl(var(--platform-instagram))",
          facebook: "hsl(var(--platform-facebook))",
          twitter: "hsl(var(--platform-twitter))",
        },
        // Accent brand (Fuchsia)
        "accent-brand": {
          DEFAULT: "hsl(var(--accent-brand))",
          foreground: "hsl(var(--accent-brand-foreground))",
        },
        // SocialPulse palette utilities
        "sp-primary": {
          100: "#EAE8FB",
          400: "#6E60E8",
          500: "#5646D8",
          600: "#4C3BBF",
        },
        "sp-accent": {
          100: "#FFE4F2",
          400: "#FF6BB5",
          500: "#F04DA1",
          600: "#E0418E",
        },
        "sp-success": "#16B364",
        "sp-warning": "#F79009",
        "sp-error": "#F04438",
        "sp-info": "#2E90FA",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-fast": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-fast": "fade-in-fast 0.15s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(30, 31, 43, 0.03)",
        card: "0 2px 8px rgba(30, 31, 43, 0.05)",
        elevated: "0 4px 12px rgba(30, 31, 43, 0.08), 0 1px 3px rgba(30, 31, 43, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
