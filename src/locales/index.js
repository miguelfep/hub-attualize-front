export * from './all-langs';

export * from './use-locales';

export * from './i18n-provider';

export * from './config-locales';

// NB: o LocalizationProvider NÃO é reexportado aqui de propósito. Este barril é
// importado por módulos usados em toda página (theme-provider, format-number), e
// reexportá-lo arrastava @mui/x-date-pickers + dayjs para o bundle das páginas
// públicas. Importe de 'src/locales/localization-provider' diretamente.
export * from './utils/number-format-locale';
