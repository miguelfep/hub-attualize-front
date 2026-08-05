import './code-highlight-block.css';

import remarkGfm from 'remark-gfm';
import { useMemo, useState, useEffect } from 'react';

import Link from '@mui/material/Link';

import { isExternalLink } from 'src/routes/utils';
import { RouterLink } from 'src/routes/components';

import { Image } from '../image';
import { StyledRoot } from './styles';
import { markdownClasses } from './classes';
import { isMarkdownContent } from './is-markdown';

// ----------------------------------------------------------------------

export function Markdown({ children, sx, asMarkdown = false, ...other }) {
  // `asMarkdown`: trata o conteúdo sempre como Markdown puro.
  // O react-markdown (com remark-gfm + rehype-raw) já renderiza markdown E HTML
  // embutido, então não usamos a heurística que pode corromper o conteúdo
  // (ex.: posts que não começam com "#"/"-" eram convertidos via turndown).
  const isMd = asMarkdown || isMarkdownContent(`${children}`);

  // Conversão HTML→Markdown só quando o conteúdo é HTML puro. O turndown
  // (~20 KiB) é carregado sob demanda; enquanto isso o HTML bruto já renderiza
  // corretamente via rehype-raw, então não há flash de conteúdo vazio.
  const [converted, setConverted] = useState(null);

  useEffect(() => {
    if (isMd) return undefined;

    let active = true;
    import('./html-to-markdown')
      .then((mod) => {
        if (active) setConverted(mod.htmlToMarkdown(`${children}`.trim()));
      })
      .catch((error) => console.error('Falha ao carregar html-to-markdown:', error));

    return () => {
      active = false;
    };
  }, [isMd, children]);

  const content = useMemo(() => {
    if (isMd) return children;
    return converted ?? `${children}`;
  }, [isMd, children, converted]);

  const rehypePlugins = useRehypePlugins(content);

  return (
    <StyledRoot
      children={content}
      components={components}
      rehypePlugins={rehypePlugins}
      /* base64-encoded images
       * https://github.com/remarkjs/react-markdown/issues/774
       * urlTransform={(value: string) => value}
       */
      className={markdownClasses.root}
      sx={sx}
      {...other}
    />
  );
}

const GFM_PLUGIN = [remarkGfm, { singleTilde: false }];

const hasCodeBlock = (content) => /```|<pre[\s>]|<code[\s>]/.test(`${content}`);

const hasHtmlTag = (content) => /<\/?[a-z][^>]*>/i.test(`${content}`);

/**
 * `rehype-highlight` puxa o highlight.js (~100 KiB gzip) e `rehype-raw` puxa o
 * parse5 (~100 KiB) — ambos inúteis na esmagadora maioria dos posts do blog, que
 * são Markdown puro sem bloco de código nem HTML embutido (amostragem de 40
 * posts da API: zero com HTML). Carregamos cada plugin sob demanda: o conteúdo
 * renderiza imediatamente sem ele e, se o texto tiver código/HTML, o plugin
 * chega logo depois e é aplicado num segundo render.
 */
function useRehypePlugins(content) {
  const needsHighlight = hasCodeBlock(content);
  const needsRaw = hasHtmlTag(content);
  const [highlight, setHighlight] = useState(null);
  const [rehypeRaw, setRehypeRaw] = useState(null);

  useEffect(() => {
    if (!needsHighlight || highlight) return undefined;

    let active = true;
    import('rehype-highlight')
      .then((mod) => {
        // Guardado numa closure: setState com função trataria o plugin como updater.
        if (active) setHighlight(() => mod.default);
      })
      .catch((error) => console.error('Falha ao carregar rehype-highlight:', error));

    return () => {
      active = false;
    };
  }, [needsHighlight, highlight]);

  useEffect(() => {
    if (!needsRaw || rehypeRaw) return undefined;

    let active = true;
    import('rehype-raw')
      .then((mod) => {
        if (active) setRehypeRaw(() => mod.default);
      })
      .catch((error) => console.error('Falha ao carregar rehype-raw:', error));

    return () => {
      active = false;
    };
  }, [needsRaw, rehypeRaw]);

  return useMemo(() => {
    const plugins = [];
    if (rehypeRaw) plugins.push(rehypeRaw);
    if (highlight) plugins.push(highlight);
    plugins.push(GFM_PLUGIN);
    return plugins;
  }, [rehypeRaw, highlight]);
}

// Hosts liberados no `images.remotePatterns` do next.config.mjs. Só para esses
// dá para usar o otimizador do next/image; qualquer outro host faria o
// componente lançar erro em runtime, então cai no <img> lazy original.
const OPTIMIZABLE_HOSTS = ['api.attualizecontabil.com.br', 'attualizecontabil.com.br'];

const canOptimize = (src) => {
  if (!src || typeof src !== 'string') return false;
  // Caminho relativo (/assets/...) é sempre servido por nós.
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    return OPTIMIZABLE_HOSTS.includes(new URL(src).hostname);
  } catch (_error) {
    return false;
  }
};

const components = {
  img: ({ node, src, ...other }) => (
    <Image
      ratio="16/9"
      src={src}
      className={markdownClasses.content.image}
      sx={{ borderRadius: 2 }}
      // Imagens do corpo do post ficam abaixo da dobra: sem `priority`, o
      // next/image já entrega AVIF/WebP redimensionado com loading="lazy".
      // A coluna de texto tem no máximo 1000px — sem `sizes` o padrão '100vw'
      // baixava a variante de 1920/2048px em desktop.
      useNextImage={canOptimize(src)}
      sizes="(max-width: 1000px) 100vw, 1000px"
      {...other}
    />
  ),
  a: ({ href, children, node, ...other }) => {
    const linkProps = isExternalLink(href)
      ? { target: '_blank', rel: 'noopener' }
      : { component: RouterLink };

    return (
      <Link {...linkProps} href={href} className={markdownClasses.content.link} {...other}>
        {children}
      </Link>
    );
  },
  pre: ({ children }) => (
    <div className={markdownClasses.content.codeBlock}>
      <pre>{children}</pre>
    </div>
  ),
  code({ className, children, node, ...other }) {
    const language = /language-(\w+)/.exec(className || '');

    return language ? (
      <code {...other} className={className}>
        {children}
      </code>
    ) : (
      <code {...other} className={markdownClasses.content.codeInline}>
        {children}
      </code>
    );
  },
};
