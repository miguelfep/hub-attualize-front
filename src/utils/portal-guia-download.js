import axios, { endpoints } from 'src/utils/axios';

import { revalidarCachesListagemGuiasPortal } from 'src/actions/cliente-portal-guias-api';

/**
 * Download de guia/documento no portal do cliente (blob + link).
 * Módulo isolado para evitar resolução errada com `guias-fiscais.js` no Turbopack.
 * Após sucesso, revalida listagens SWR — o backend registra leitura ao concluir o download.
 */
export async function downloadGuiaFiscalPortal(id, nomeArquivo) {
  const res = await axios.get(endpoints.guiasFiscais.portal.download(id), {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo || 'guia-fiscal.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  await revalidarCachesListagemGuiasPortal();

  return res.data;
}
