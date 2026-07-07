// ----------------------------------------------------------------------

export const stylesMode = {
  light: '[data-mui-color-scheme="light"] &',
  dark: '[data-mui-color-scheme="dark"] &',
};

export const mediaQueries = {
  upXs: '@media (min-width:0px)',
  upSm: '@media (min-width:600px)',
  upMd: '@media (min-width:900px)',
  upLg: '@media (min-width:1200px)',
  upXl: '@media (min-width:1536px)',
};

/**
 * Set font family
 */
export function setFont(fontName) {
  return `"${fontName}",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`;
}

/**
 * Converts rem to px
 */
export function remToPx(value) {
  return Math.round(parseFloat(value) * 16);
}

/**
 * Converts px to rem
 */
export function pxToRem(value) {
  return `${value / 16}rem`;
}

/**
 * Responsive font sizes
 */
export function responsiveFontSizes({ sm, md, lg }) {
  return {
    [mediaQueries.upSm]: { fontSize: pxToRem(sm) },
    [mediaQueries.upMd]: { fontSize: pxToRem(md) },
    [mediaQueries.upLg]: { fontSize: pxToRem(lg) },
  };
}

/**
 * Converts a hex color to RGB channels
 */
export function hexToRgbChannel(hex) {
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  return `${r} ${g} ${b}`;
}

/**
 * Converts a hex color to RGB channels
 */
export function createPaletteChannel(hexPalette) {
  const channelPalette = {};

  Object.entries(hexPalette).forEach(([key, value]) => {
    channelPalette[`${key}Channel`] = hexToRgbChannel(value);
  });

  return { ...hexPalette, ...channelPalette };
}

/**
 * Color with alpha channel
 */
export function varAlpha(color, opacity = 1) {
  const unsupported =
    color.startsWith('#') ||
    color.startsWith('rgb') ||
    color.startsWith('rgba') ||
    (!color.includes('var') && color.includes('Channel'));

  if (unsupported) {
    throw new Error(`[Alpha]: Unsupported color format "${color}".
     Supported formats are:
     - RGB channels: "0 184 217".
     - CSS variables with "Channel" prefix: "var(--palette-common-blackChannel, #000000)".
     Unsupported formats are:
     - Hex: "#00B8D9".
     - RGB: "rgb(0, 184, 217)".
     - RGBA: "rgba(0, 184, 217, 1)".
     `);
  }

  return `rgba(${color} / ${opacity})`;
}

/**
 * Aplica opacidade a cores hex, rgb/rgba ou canais do tema.
 * Retorna branco semitransparente se a cor for inválida.
 */
export function safeAlpha(color, opacity = 1) {
  try {
    if (!color || typeof color !== 'string') throw new Error('invalid');

    const trimmed = color.trim();

    if (trimmed.startsWith('#')) {
      let hex = trimmed.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) throw new Error('invalid hex');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r} ${g} ${b} / ${opacity})`;
    }

    const rgb = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (rgb) return `rgba(${rgb[1]} ${rgb[2]} ${rgb[3]} / ${opacity})`;

    if (trimmed.includes('Channel') || trimmed.includes('var(')) {
      return `rgba(${trimmed} / ${opacity})`;
    }

    throw new Error('unsupported');
  } catch {
    return `rgba(255 255 255 / ${opacity})`;
  }
}