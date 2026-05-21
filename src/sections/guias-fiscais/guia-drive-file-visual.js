// ----------------------------------------------------------------------

const DEFAULT_VISUAL = {
  icon: 'solar:file-text-bold-duotone',
  color: '#637381',
  bg: 'rgba(99, 115, 129, 0.12)',
  label: 'Arquivo',
};

const FILE_VISUAL_BY_EXT = {
  pdf: {
    icon: 'solar:document-text-bold-duotone',
    color: '#D32F2F',
    bg: 'rgba(211, 47, 47, 0.1)',
    label: 'PDF',
  },
  xlsx: {
    icon: 'solar:chart-2-bold-duotone',
    color: '#1D6F42',
    bg: 'rgba(29, 111, 66, 0.12)',
    label: 'Excel',
  },
  xls: {
    icon: 'solar:chart-2-bold-duotone',
    color: '#1D6F42',
    bg: 'rgba(29, 111, 66, 0.12)',
    label: 'Excel',
  },
  docx: {
    icon: 'solar:document-add-bold-duotone',
    color: '#2B579A',
    bg: 'rgba(43, 87, 154, 0.12)',
    label: 'Word',
  },
  doc: {
    icon: 'solar:document-add-bold-duotone',
    color: '#2B579A',
    bg: 'rgba(43, 87, 154, 0.12)',
    label: 'Word',
  },
  png: {
    icon: 'solar:gallery-bold-duotone',
    color: '#7B1FA2',
    bg: 'rgba(123, 31, 162, 0.1)',
    label: 'Imagem',
  },
  jpg: {
    icon: 'solar:gallery-bold-duotone',
    color: '#7B1FA2',
    bg: 'rgba(123, 31, 162, 0.1)',
    label: 'Imagem',
  },
  jpeg: {
    icon: 'solar:gallery-bold-duotone',
    color: '#7B1FA2',
    bg: 'rgba(123, 31, 162, 0.1)',
    label: 'Imagem',
  },
  gif: {
    icon: 'solar:gallery-bold-duotone',
    color: '#7B1FA2',
    bg: 'rgba(123, 31, 162, 0.1)',
    label: 'Imagem',
  },
  webp: {
    icon: 'solar:gallery-bold-duotone',
    color: '#7B1FA2',
    bg: 'rgba(123, 31, 162, 0.1)',
    label: 'Imagem',
  },
};

const DEFAULT_FOLDER_VISUAL = {
  icon: 'solar:folder-bold-duotone',
  color: '#B45309',
  bg: 'rgba(245, 158, 11, 0.14)',
};

/** Pastas principais — ícones temáticos por categoria (PRD). */
const FOLDER_CATEGORY_RULES = [
  {
    match: (n) => /fiscal/i.test(n),
    icon: 'solar:bill-list-bold-duotone',
    color: '#E53935',
    bg: 'rgba(229, 57, 53, 0.12)',
  },
  {
    match: (n) => /pessoal|departamento\s*pessoal|\bdp\b|rh|folha/i.test(n),
    icon: 'solar:users-group-rounded-bold-duotone',
    color: '#1E88E5',
    bg: 'rgba(30, 136, 229, 0.12)',
  },
  {
    match: (n) => /contabil|contábil|contabeis|contábeis/i.test(n),
    icon: 'solar:calculator-minimalistic-bold-duotone',
    color: '#43A047',
    bg: 'rgba(67, 160, 71, 0.12)',
  },
  {
    match: (n) => /societ|corporat|empresarial|juridic|jurídic/i.test(n),
    icon: 'solar:case-minimalistic-bold-duotone',
    color: '#8E24AA',
    bg: 'rgba(142, 36, 170, 0.12)',
  },
];

// ----------------------------------------------------------------------

export function getFileExtension(nomeArquivo) {
  const name = String(nomeArquivo || '').trim();
  const idx = name.lastIndexOf('.');
  if (idx <= 0 || idx === name.length - 1) return '';
  return name.slice(idx + 1).toLowerCase();
}

export function getDriveFileVisual(nomeArquivo) {
  const ext = getFileExtension(nomeArquivo);
  return FILE_VISUAL_BY_EXT[ext] || DEFAULT_VISUAL;
}

export function getDriveFolderVisual(folder) {
  const nome = String(folder?.nome || folder?.slug || '').trim();
  const slug = String(folder?.slug || '').trim();
  const haystack = `${nome} ${slug}`.toLowerCase();

  const rule = FOLDER_CATEGORY_RULES.find((r) => r.match(haystack));
  return rule || DEFAULT_FOLDER_VISUAL;
}

/** 16px — cantos arredondados modernos (PRD: 12–16px). */
export const DRIVE_SURFACE_RADIUS = 2;

/** Borda neutra clara (Google Drive). */
export const DRIVE_BORDER_COLOR = '#dadce0';

/** Fundo da área de preview (estilo Google Drive). */
export const DRIVE_PREVIEW_BG = '#F8FAFC';

/** Sombra suave para cards. */
export const DRIVE_SHADOW_SOFT = '0 1px 3px rgba(15, 23, 42, 0.06)';

export const DRIVE_SHADOW_HOVER = '0 8px 24px rgba(15, 23, 42, 0.1)';

/** Título de seção (Pastas / Arquivos). */
export const DRIVE_SECTION_TITLE_SX = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'text.primary',
  letterSpacing: '-0.01em',
};

/** Grid responsivo de pastas (estilo Google Drive). */
export const DRIVE_FOLDER_GRID_AUTO_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: { xs: 1, sm: 1.25, md: 1.5 },
  width: '100%',
};

/** @deprecated Use DRIVE_FOLDER_GRID_AUTO_SX */
export const DRIVE_FOLDER_ROOT_GRID_SX = DRIVE_FOLDER_GRID_AUTO_SX;

/** @deprecated Use DRIVE_FOLDER_GRID_AUTO_SX */
export const DRIVE_FOLDER_STRIP_SX = DRIVE_FOLDER_GRID_AUTO_SX;

export const DRIVE_FILE_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(3, 1fr)',
    md: 'repeat(4, minmax(0, 1fr))',
    lg: 'repeat(5, minmax(0, 1fr))',
  },
  gap: { xs: 1.5, md: 2 },
};

/** Painel de arquivos — mesmo plano do drive. */
export const DRIVE_FILES_PANEL_SX = {
  mt: 3,
  pt: 0,
};

/** Zona de upload vazia (pasta sem arquivos). */
export const DRIVE_EMPTY_DROPZONE_SX = {
  py: 5,
  px: 3,
  borderRadius: DRIVE_SURFACE_RADIUS,
  border: `2px dashed ${DRIVE_BORDER_COLOR}`,
  bgcolor: DRIVE_PREVIEW_BG,
  textAlign: 'center',
};

/** Card de pasta horizontal (Google Drive). */
export const DRIVE_FOLDER_CARD_SX = {
  position: 'relative',
  width: '100%',
  maxWidth: 'none',
  borderRadius: DRIVE_SURFACE_RADIUS,
  border: `1px solid ${DRIVE_BORDER_COLOR}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  transition: (theme) =>
    theme.transitions.create(['box-shadow', 'border-color', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  '&:hover': {
    bgcolor: 'action.hover',
    borderColor: DRIVE_BORDER_COLOR,
    boxShadow: DRIVE_SHADOW_SOFT,
  },
};

/** Alias — mesmo layout horizontal para raiz e subpastas. */
export const DRIVE_FOLDER_ROOT_CARD_SX = DRIVE_FOLDER_CARD_SX;

export const DRIVE_FILE_CARD_SX = {
  position: 'relative',
  borderRadius: 2,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: (theme) =>
    theme.transitions.create(['box-shadow', 'border-color', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  '&:hover': {
    bgcolor: 'action.hover',
  },
};

export const DRIVE_CHECKBOX_SX = {
  p: 0.5,
  color: 'text.disabled',
  '&.Mui-checked': {
    color: 'primary.main',
  },
};


/** Área de preview com ícone centralizado (grade). */
export const DRIVE_FILE_PREVIEW_SX = {
  height: { xs: 120, sm: 128 },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: DRIVE_PREVIEW_BG,
  borderBottom: `1px solid ${DRIVE_BORDER_COLOR}`,
  overflow: 'hidden',
};

/** Preview compacto (lista). */
export const DRIVE_FILE_PREVIEW_COMPACT_SX = {
  height: 56,
  width: 56,
  borderRadius: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  bgcolor: DRIVE_PREVIEW_BG,
  border: `1px solid ${DRIVE_BORDER_COLOR}`,
};
