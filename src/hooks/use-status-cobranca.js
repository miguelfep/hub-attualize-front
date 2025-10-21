import { useMemo } from 'react';

export const useStatusProps = (status) =>
  useMemo(
    () =>
      ({
        EMABERTO: { label: 'Aguardando', color: 'warning', icon: 'eva:clock-outline' },
        VENCIDO: { label: 'Vencida', color: 'error', icon: 'eva:alert-circle-outline' },
        RECEBIDO: { label: 'Paga', color: 'success', icon: 'eva:checkmark-circle-2-fill' },
        PAGO: { label: 'Paga', color: 'success', icon: 'eva:checkmark-circle-2-fill' },
        CANCELADO: { label: 'Cancelada', color: 'grey', icon: 'eva:slash-outline' },
        ATRASADO: { label: 'Atrasada', color: 'error', icon: 'solar:danger-bold' },
        EXPIRADO: { label: 'Expirada', color: 'error', icon: 'eva:calendar-outline' },
        A_RECEBER: { label: 'A receber', color: 'info', icon: 'eva:arrow-circle-down-outline' },
        PROCESSANDO: { label: 'Processando', color: 'info', icon: 'eva:sync-outline' },
        ERRO_PROCESSAMENTO: {
          label: 'Erro',
          color: 'error',
          icon: 'eva:alert-triangle-outline',
        },
      })[status] || { label: status, color: 'grey', icon: 'eva:eva:question-mark-circle-outline' },
    [status]
  );
