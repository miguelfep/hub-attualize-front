import axios, { endpoints } from 'src/utils/axios';

import { revalidarCachesListagemGuiasPortal } from 'src/actions/cliente-portal-guias-api';

const MIME_POR_EXT = {
  pdf: 'application/pdf',
  ofx: 'application/x-ofx',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
};

function mimeFromFileName(nomeArquivo) {
  const ext = String(nomeArquivo || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  return (ext && MIME_POR_EXT[ext]) || 'application/octet-stream';
}

/**
 * Download de guia/documento no portal do cliente (blob + link).
 * Módulo isolado para evitar resolução errada com `guias-fiscais.js` no Turbopack.
 * Após sucesso, revalida listagens SWR — o backend registra leitura ao concluir o download.
 */
export async function downloadGuiaFiscalPortal(id, nomeArquivo) {
  const res = await axios.get(endpoints.guiasFiscais.portal.download(id), {
    responseType: 'blob',
  });

  const fileName = nomeArquivo || 'guia-fiscal.pdf';
  const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeFromFileName(fileName) }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  await revalidarCachesListagemGuiasPortal();

  return res.data;
}
