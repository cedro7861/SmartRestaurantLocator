// Modern Color Palette for Smart Restaurant Locator
// Professional light and dark themes with teal/mint accents

export const LightColors = {
  // Primary Brand Colors
  primary: '#009688',        // Teal - Main brand color
  primaryDark: '#00796b',    // Darker teal for pressed states
  primaryLight: '#4db6ac',   // Lighter teal for backgrounds

  // Background Colors
  background: '#f5f5f5',     // Light gray background
  surface: '#ffffff',        // White card/surface background
  surfaceLight: '#f8f9fa',   // Very light surface for contrast

  // Text Colors
  text: '#212121',           // Dark gray primary text
  textSecondary: '#757575',  // Medium gray secondary text
  textMuted: '#9e9e9e',      // Light gray muted text

  // Status Colors
  success: '#4caf50',        // Green for success states
  error: '#f44336',          // Red for errors
  warning: '#ff9800',        // Orange for warnings
  info: '#2196f3',           // Blue for info

  // Role-based Colors (for dashboards)
  admin: '#9c27b0',          // Purple for admin
  owner: '#ff5722',          // Deep orange for owner
  delivery: '#3f51b5',       // Indigo for delivery
  customer: '#009688',       // Teal for customer

  // UI Element Colors
  border: '#e0e0e0',         // Light borders
  borderLight: '#f0f0f0',    // Very light borders
  shadow: 'rgba(0, 0, 0, 0.1)', // Light shadow color

  // Social Colors
  google: '#db4437',         // Google red
  facebook: '#4267b2',       // Facebook blue

  // Gradients (for advanced styling)
  gradientPrimary: ['#009688', '#4db6ac'],
  gradientBackground: ['#f5f5f5', '#ffffff'],
} as const;

export const DarkColors = {
  // Primary Brand Colors
  primary: '#4db6ac',        // Teal/Mint - Main brand color
  primaryDark: '#26a69a',    // Darker teal for pressed states
  primaryLight: '#80cbc4',   // Lighter teal for backgrounds

  // Background Colors
  background: '#12121e',     // Deep dark background
  surface: '#1f1f33',        // Card/surface background
  surfaceLight: '#2a2a3e',   // Lighter surface for contrast

  // Text Colors
  text: '#ffffff',           // Primary text
  textSecondary: '#b0b0b0',  // Secondary text
  textMuted: '#8e8e93',      // Muted text

  // Status Colors
  success: '#4caf50',        // Green for success states
  error: '#f44336',          // Red for errors
  warning: '#ff9800',        // Orange for warnings
  info: '#2196f3',           // Blue for info

  // Role-based Colors (for dashboards)
  admin: '#9c27b0',          // Purple for admin
  owner: '#ff5722',          // Deep orange for owner
  delivery: '#3f51b5',       // Indigo for delivery
  customer: '#009688',       // Teal for customer

  // UI Element Colors
  border: '#404040',         // Subtle borders
  borderLight: '#555555',    // Lighter borders
  shadow: 'rgba(0, 0, 0, 0.3)', // Shadow color

  // Social Colors
  google: '#db4437',         // Google red
  facebook: '#4267b2',       // Facebook blue

  // Gradients (for advanced styling)
  gradientPrimary: ['#4db6ac', '#26a69a'],
  gradientBackground: ['#12121e', '#1f1f33'],
} as const;

// Legacy Colors (for backward compatibility)
export const Colors = DarkColors;

// Theme object for easy access (legacy - will be replaced by ThemeContext)
export const Theme = {
  colors: Colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
} as const;

export default Colors;