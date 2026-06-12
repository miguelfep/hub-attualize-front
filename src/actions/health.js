import axiosInstance, { baseUrl, publicBaseUrl } from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Consulta o /health da API medindo a latência da requisição.
 * A rota é autenticada (Bearer) e pode estar na base da API ou na raiz do
 * host (sem /api), então tenta as duas antes de desistir.
 *
 * Payload esperado:
 * {
 *   status: 'ok' | 'degraded' | 'down',
 *   version, uptimeSeconds,
 *   checks: { mongo, redis, uploadQueue },
 *   process: { node, env, memory: { rssMb, heapUsedMb, heapTotalMb } },
 * }
 *
 * Importante: quando o Mongo está fora, a rota responde HTTP 503 mas COM o
 * payload completo (status: 'down') — esse caso é tratado como resposta
 * válida, não como falha de conexão.
 */
export async function getHealth() {
  const candidatos = [...new Set([`${baseUrl}health`, `${publicBaseUrl}health`])];

  const inicio = Date.now();
  let ultimoErro = null;

  // eslint-disable-next-line no-restricted-syntax
  for (const url of candidatos) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axiosInstance.get(url, { timeout: 10000 });
      return {
        online: true,
        latencia: Date.now() - inicio,
        data: response.data,
        erro: null,
      };
    } catch (error) {
      ultimoErro = error;

      // 503 com payload de health = API respondeu, mas com dependência caída
      if (error?.response?.status === 503 && error.response.data?.status) {
        return {
          online: true,
          latencia: Date.now() - inicio,
          data: error.response.data,
          erro: null,
        };
      }

      // 404 = rota não existe nessa base, tenta a próxima; outros erros = para
      if (error?.response && error.response.status !== 404) {
        break;
      }
    }
  }

  const status = ultimoErro?.response?.status;
  let erro;
  if (status === 401) {
    erro = 'Não autorizado (401) — sessão expirada ou token inválido';
  } else if (status) {
    erro = `HTTP ${status}`;
  } else if (ultimoErro?.code === 'ECONNABORTED') {
    erro = 'Timeout (10s)';
  } else {
    erro = ultimoErro?.message || 'Falha de conexão';
  }

  return {
    online: false,
    latencia: Date.now() - inicio,
    data: ultimoErro?.response?.data?.status ? ultimoErro.response.data : null,
    erro,
  };
}

/**
 * Formata o uptime (em segundos) para leitura humana. Ex.: 766 → "12m 46s".
 */
export function formatarUptime(segundos) {
  if (typeof segundos !== 'number' || Number.isNaN(segundos) || segundos < 0) return '—';
  const total = Math.floor(segundos);
  const dias = Math.floor(total / 86400);
  const horas = Math.floor((total % 86400) / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segs = total % 60;

  const partes = [];
  if (dias) partes.push(`${dias}d`);
  if (horas) partes.push(`${horas}h`);
  if (minutos) partes.push(`${minutos}m`);
  partes.push(`${segs}s`);
  return partes.join(' ');
}
