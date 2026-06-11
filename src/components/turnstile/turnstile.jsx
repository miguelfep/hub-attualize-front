'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Widget do Cloudflare Turnstile (anti-bot / anti força-bruta).
// O token gerado é de uso único e DEVE ser validado no backend via
// https://challenges.cloudflare.com/turnstile/v0/siteverify
// ----------------------------------------------------------------------

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Falha ao carregar o Cloudflare Turnstile'));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export const Turnstile = forwardRef(
  ({ siteKey, onVerify, onExpire, onError, options, sx }, ref) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);

    useImperativeHandle(ref, () => ({
      /** Reseta o widget (tokens são de uso único — chamar após cada tentativa). */
      reset: () => {
        if (widgetIdRef.current !== null && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;

      loadTurnstileScript()
        .then((turnstile) => {
          if (cancelled || !turnstile || !containerRef.current || widgetIdRef.current !== null) {
            return;
          }

          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey: siteKey,
            language: 'pt-br',
            theme: 'light',
            callback: (token) => onVerify?.(token),
            'expired-callback': () => onExpire?.(),
            'error-callback': () => onError?.(),
            ...options,
          });
        })
        .catch(() => onError?.());

      return () => {
        cancelled = true;
        if (widgetIdRef.current !== null && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey]);

    return <Box ref={containerRef} sx={{ minHeight: 65, ...sx }} />;
  }
);

Turnstile.displayName = 'Turnstile';
