'use client';

import { useState } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

// ----------------------------------------------------------------------
// Com streaming SSR o Next chama `useServerInsertedHTML` a cada chunk. A
// versão anterior serializava TODO o `cache.inserted` em cada chamada — o
// mesmo bloco de tema (~54KB) saía ~100x por página (~5,7MB de <style>).
// Agora interceptamos `cache.insert` e emitimos apenas o que foi inserido
// desde o último flush (mesmo padrão do AppRouterCacheProvider do MUI).
// ----------------------------------------------------------------------

export function EmotionCacheProvider({ options = { key: 'css' }, children }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache(options);
    emotionCache.compat = true;

    const prevInsert = emotionCache.insert;
    let inserted = [];
    emotionCache.insert = (...args) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flushNames = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache: emotionCache, flush: flushNames };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    names.forEach((name) => {
      const value = cache.inserted[name];
      // Estilos globais ficam marcados como `true` no mapa — não têm CSS aqui.
      if (typeof value === 'string') styles += value;
    });

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
