import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Filas BullMQ — monitoramento (/api/queues). Restrito a administradores.
// ----------------------------------------------------------------------

/**
 * Contadores por fila: { nome, pausada, waiting, active, completed, failed,
 * delayed, paused }.
 * @returns {Promise<Array>}
 */
export async function getQueueStats() {
  const res = await axios.get(endpoints.queues.stats);
  return res.data?.data ?? [];
}
