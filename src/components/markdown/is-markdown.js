// Separado de html-to-markdown.js de propósito: este detector é leve e roda no
// caminho síncrono do <Markdown>, enquanto o conversor puxa o turndown (~20 KiB)
// e é carregado sob demanda só quando o conteúdo é HTML puro.
export function isMarkdownContent(content) {
  // Checking if the content contains Markdown-specific patterns
  const markdownPatterns = [
    /* Heading */
    /^#+\s/,
    /* List item */
    /^(\*|-|\d+\.)\s/,
    /* Code block */
    /^```/,
    /* Table */
    /^\|/,
    /* Unordered list */
    /^(\s*)[*+-] [^\r\n]+/,
    /* Ordered list */
    /^(\s*)\d+\. [^\r\n]+/,
    /* Image */
    /!\[.*?\]\(.*?\)/,
    /* Link */
    /\[.*?\]\(.*?\)/,
  ];

  // Checking if any of the patterns match
  return markdownPatterns.some((pattern) => pattern.test(content));
}
