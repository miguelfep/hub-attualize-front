import Script from 'next/script';

import { schemeConfig } from 'src/theme/color-scheme-script';

// ----------------------------------------------------------------------

export function InitColorSchemeScript() {
  return (
    <Script
      id="mui-color-scheme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const modeStorageKey = '${schemeConfig.modeStorageKey}';
            const defaultMode = '${schemeConfig.defaultMode}';
            const stored = localStorage.getItem(modeStorageKey);
            const mode = stored || defaultMode;
            document.documentElement.setAttribute('data-mui-color-scheme', mode);
          })();
        `,
      }}
    />
  );
}
