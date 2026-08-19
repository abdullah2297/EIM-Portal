import { createTheme } from '@mui/material/styles';

/**
 * MUI theme factory.
 *
 * MUI components read the exact same design tokens as the SCSS layer by
 * pointing at the CSS custom properties published in `src/styles/_tokens.scss`.
 * That keeps a single source of truth for colour, radius and typography, and
 * means dark mode is handled by the `.dark` class swap rather than by two
 * divergent palettes.
 */

/** Literal fallbacks: MUI needs real colours to compute contrast internally. */
const PALETTE_FALLBACK = {
  light: {
    primary: '#0A2A4A',
    primaryLight: '#2E6FA3',
    primaryDark: '#061B30',
    secondary: '#8C1D40',
    secondaryLight: '#B33A5F',
    secondaryDark: '#67142E',
    success: '#157A52',
    warning: '#B06A08',
    error: '#BB2D33',
    info: '#2E6FA3',
    background: '#F4F6F9',
    paper: '#FFFFFF',
    textPrimary: '#10203A',
    textSecondary: '#4A5B72',
    divider: '#DCE3EC',
  },
  dark: {
    primary: '#5CA2E0',
    primaryLight: '#8AC2F1',
    primaryDark: '#12395C',
    secondary: '#D66A91',
    secondaryLight: '#EA96B4',
    secondaryDark: '#8C1D40',
    success: '#3DB782',
    warning: '#E0A03E',
    error: '#E86A6F',
    info: '#6FB4E8',
    background: '#08131F',
    paper: '#0F1E2E',
    textPrimary: '#E8EEF6',
    textSecondary: '#A5B6CA',
    divider: '#24405A',
  },
};

const FONT_FAMILY =
  "'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const FONT_FAMILY_DISPLAY = "'Sora', 'Inter', 'Segoe UI', system-ui, sans-serif";

/**
 * @param {'light' | 'dark'} mode
 * @returns {import('@mui/material/styles').Theme}
 */
export function buildMuiTheme(mode) {
  const c = PALETTE_FALLBACK[mode] ?? PALETTE_FALLBACK.light;

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, light: c.primaryLight, dark: c.primaryDark },
      secondary: { main: c.secondary, light: c.secondaryLight, dark: c.secondaryDark },
      success: { main: c.success },
      warning: { main: c.warning },
      error: { main: c.error },
      info: { main: c.info },
      background: { default: c.background, paper: c.paper },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
      divider: c.divider,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 700 },
      h2: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 700 },
      h3: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 700 },
      h4: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 600 },
      h5: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 600 },
      h6: { fontFamily: FONT_FAMILY_DISPLAY, fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 'var(--radius-lg)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: 'var(--color-surface)',
            backgroundImage: 'none',
            borderRadius: 0,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            marginTop: 6,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-sm)',
            margin: '2px 6px',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 'var(--font-size-xs)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          indicator: { height: 2, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 'var(--radius-pill)', fontWeight: 600 },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: { borderRadius: 'var(--radius-md)', fontWeight: 600 },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: { borderRadius: 'var(--radius-md)' },
        },
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
      },
    },
  });
}

export default buildMuiTheme;
