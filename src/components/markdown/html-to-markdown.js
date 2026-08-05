import TurndownService from 'turndown';

import { htmlTags } from './html-tags';

const excludeTags = ['pre', 'code'];

const turndownService = new TurndownService({ codeBlockStyle: 'fenced', fence: '```' });

const filterTags = htmlTags.filter((item) => !excludeTags.includes(item));

/**
 * Custom rule
 * https://github.com/mixmark-io/turndown/issues/241#issuecomment-400591362
 */
turndownService.addRule('keep', {
  filter: filterTags,
  replacement(content, node) {
    const { isBlock, outerHTML } = node;

    return node && isBlock ? `\n\n${outerHTML}\n\n` : outerHTML;
  },
});

// ----------------------------------------------------------------------

export function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}

// isMarkdownContent vive em ./is-markdown para que importá-lo não arraste o
// turndown junto (este módulo só é carregado sob demanda pelo <Markdown>).
export { isMarkdownContent } from './is-markdown';
