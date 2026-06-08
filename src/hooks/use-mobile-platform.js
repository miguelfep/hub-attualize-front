import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

/**
 * Detecta a plataforma do dispositivo a partir do user-agent.
 *
 * Roda só no cliente (após a montagem) para evitar divergência de hidratação:
 * o retorno inicial é sempre `null`.
 *
 * @returns {null | 'ios' | 'android' | 'other'}
 *   `null` enquanto não detectado, depois `'ios'`/`'android'` em celulares/tablets
 *   ou `'other'` em desktop e demais casos.
 */
export function useMobilePlatform() {
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent || navigator.vendor || '';

    if (/android/i.test(ua)) {
      setPlatform('android');
    } else if (
      /iphone|ipad|ipod/i.test(ua) ||
      // iPadOS 13+ se identifica como "Macintosh" — diferencia pelo toque.
      (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
    ) {
      setPlatform('ios');
    } else {
      setPlatform('other');
    }
  }, []);

  return platform;
}
