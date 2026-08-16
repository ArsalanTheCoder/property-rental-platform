// Central design tokens for the app.
// Every screen should pull colors and spacing from here instead of
// hardcoding values, so the look stays consistent and easy to update.

export const colors = {
  // Brand
  primary: "#0F172A", // deep navy, used for headings and primary actions
  primaryLight: "#1E293B",
  accent: "#2563EB", // blue, used for links and secondary actions

  // Status colors
  success: "#16A34A",
  successBg: "#ECFDF3",
  warning: "#D97706",
  warningBg: "#FEF6E7",
  danger: "#DC2626",
  dangerBg: "#FDECEC",
  info: "#2563EB",
  infoBg: "#EEF3FF",

  // Neutrals
  background: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  divider: "#F0F1F3",

  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textOnDark: "#FFFFFF",

  overlay: "rgba(15, 23, 42, 0.55)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: "700" as const, letterSpacing: -0.4 },
  h2: { fontSize: 21, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "400" as const },
  bodyStrong: { fontSize: 15, fontWeight: "600" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
  captionStrong: { fontSize: 13, fontWeight: "600" as const },
  tiny: { fontSize: 11, fontWeight: "500" as const },
};

// Subtle elevation, kept minimal on purpose so the UI does not look
// like a stack of floating cards. Used sparingly for property cards
// and modals only.
export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};
