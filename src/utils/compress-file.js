import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const TARGET_SIZE_BYTES = 950 * 1024; // 950 KB — margem para o limite de 1 MB
const PDF_PAGE_SCALE = 1.5;
const IMG_MAX_DIMENSION = 1600;
const IMG_INITIAL_QUALITY = 0.7;

/**
 * Comprime um arquivo (PDF ou imagem) para ficar abaixo de TARGET_SIZE_BYTES.
 * Retorna um novo File já comprimido, ou o original se já estiver dentro do limite.
 *
 * @param {File} file
 * @param {object} [opts]
 * @param {number} [opts.targetBytes] - Tamanho máximo em bytes (padrão 950KB)
 * @param {(stage: string) => void} [opts.onStage] - Callback para feedback de etapa
 * @returns {Promise<{ file: File, compressed: boolean, originalSize: number, finalSize: number }>}
 */
export async function compressFile(file, opts = {}) {
  const targetBytes = opts.targetBytes ?? TARGET_SIZE_BYTES;
  const onStage = opts.onStage ?? (() => {});
  const originalSize = file.size;

  if (originalSize <= targetBytes) {
    return { file, compressed: false, originalSize, finalSize: originalSize };
  }

  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  if (isPdf) {
    onStage('Comprimindo PDF...');
    const compressed = await compressPdf(file, targetBytes);
    return {
      file: compressed,
      compressed: true,
      originalSize,
      finalSize: compressed.size,
    };
  }

  if (isImage) {
    onStage('Comprimindo imagem...');
    const compressed = await compressImage(file, targetBytes);
    return {
      file: compressed,
      compressed: true,
      originalSize,
      finalSize: compressed.size,
    };
  }

  return { file, compressed: false, originalSize, finalSize: originalSize };
}

// ─── PDF: renderiza cada página como JPEG e remonta com jsPDF ─────────────────

function renderAllPages(pdf, pageIndices, scale, quality) {
  return Promise.all(
    pageIndices.map((pageNum) => renderPageToImage(pdf, pageNum, scale, quality))
  );
}

async function renderPageToImage(pdf, pageNum, scale, quality) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  const imgData = canvas.toDataURL('image/jpeg', quality);
  return { imgData, viewport };
}

async function compressPdf(file, targetBytes) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  let scale = PDF_PAGE_SCALE;
  let quality = IMG_INITIAL_QUALITY;
  let attempt = 0;
  const maxAttempts = 4;

  while (attempt < maxAttempts) {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF({ unit: 'pt', compress: true });

    const pageIndices = Array.from({ length: totalPages }, (_, idx) => idx + 1);
    // eslint-disable-next-line no-await-in-loop
    const pages = await renderAllPages(pdf, pageIndices, scale, quality);

    pages.forEach(({ imgData, viewport }, idx) => {
      if (idx > 0) {
        doc.addPage([viewport.width, viewport.height]);
      } else {
        doc.internal.pageSize.width = viewport.width;
        doc.internal.pageSize.height = viewport.height;
      }
      doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
    });

    const blob = doc.output('blob');

    if (blob.size <= targetBytes) {
      return new File([blob], file.name.replace(/\.pdf$/i, '.pdf'), { type: 'application/pdf' });
    }

    quality = Math.max(0.2, quality - 0.15);
    scale = Math.max(0.6, scale - 0.25);
    attempt += 1;
  }

  throw new Error(
    `Não foi possível comprimir "${file.name}" para menos de ${Math.round(targetBytes / 1024)}KB. Tente um PDF com menos páginas ou resolução.`
  );
}

// ─── Imagem: redimensiona e reduz qualidade via canvas ────────────────────────

function canvasToBlob(canvas, q) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', q);
  });
}

async function compressImage(file, targetBytes) {
  const bitmap = await createImageBitmap(file);
  let maxDim = IMG_MAX_DIMENSION;
  let quality = IMG_INITIAL_QUALITY;
  let attempt = 0;
  const maxAttempts = 6;

  while (attempt < maxAttempts) {
    const { width, height } = fitDimensions(bitmap.width, bitmap.height, maxDim);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    // eslint-disable-next-line no-await-in-loop
    const blob = await canvasToBlob(canvas, quality);

    if (blob.size <= targetBytes) {
      const name = file.name.replace(/\.[^.]+$/, '.jpg');
      return new File([blob], name, { type: 'image/jpeg' });
    }

    quality = Math.max(0.15, quality - 0.12);
    maxDim = Math.max(600, maxDim - 200);
    attempt += 1;
  }

  throw new Error(
    `Não foi possível comprimir "${file.name}" para menos de ${Math.round(targetBytes / 1024)}KB. Tente uma imagem menor.`
  );
}


function fitDimensions(w, h, maxDim) {
  if (w <= maxDim && h <= maxDim) return { width: w, height: h };
  const ratio = Math.min(maxDim / w, maxDim / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

/**
 * Formata bytes para exibição amigável (ex: "1.2 MB", "350 KB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
