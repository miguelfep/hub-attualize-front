import { useRef, useEffect, useCallback } from 'react';

import { obterMeuPedidoIr } from 'src/actions/ir';

// ----------------------------------------------------------------------

/**
 * Componente invisível que faz polling do status de pagamento de um pedido IR.
 * Chama onPaid quando o status muda para 'paga' ou além.
 *
 * @param {{
 *   orderId: string,
 *   paymentType: 'boleto'|'pix',
 *   currentStatus: string,
 *   onPaid: (order: object) => void,
 *   enabled?: boolean
 * }} props
 */
export default function IrPaymentPoller({
  orderId,
  paymentType,
  currentStatus,
  onPaid,
  enabled = true,
}) {
  const intervalMs = paymentType === 'pix' ? 5000 : 10000;
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  const PAID_STATUSES = ['paga', 'paid', 'coletando_documentos', 'em_processo', 'finalizada'];

  const poll = useCallback(async () => {
    try {
      const order = await obterMeuPedidoIr(orderId);
      if (PAID_STATUSES.includes(order?.status)) {
        onPaidRef.current(order);
      }
    } catch {
      // ignora erros de polling silenciosamente
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!enabled || !orderId || PAID_STATUSES.includes(currentStatus)) return undefined;

    const timer = setInterval(poll, intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, orderId, currentStatus, intervalMs, poll]);

  return null;
}
