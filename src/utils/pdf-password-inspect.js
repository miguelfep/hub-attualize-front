import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Verifica se um PDF exige senha (sem renderizar páginas).
 * @param {File} file
 * @returns {Promise<{ protegido: boolean, status: 'ok' | 'needs_password' | 'not_pdf' | 'error' }>}
 */
export async function inspectPdfPassword(file) {
  const isPdf =
    file?.type === 'application/pdf' || String(file?.name || '').toLowerCase().endsWith('.pdf');

  if (!file || !isPdf) {
    return { protegido: false, status: 'not_pdf' };
  }

  try {
    const data = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data, verbosity: 0 });
    await loadingTask.promise;
    return { protegido: false, status: 'ok' };
  } catch (err) {
    if (err?.name === 'PasswordException' || err?.code === 1) {
      return { protegido: true, status: 'needs_password' };
    }
    return { protegido: false, status: 'error' };
  }
}
