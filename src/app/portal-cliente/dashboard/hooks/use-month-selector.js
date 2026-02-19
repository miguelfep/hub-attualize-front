import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useMemo } from 'react';


/**
 * Hook helper para gerenciar seleção de meses
 * Calcula mês anterior, formata meses, etc.
 */
export function useMonthSelector() {
  /**
   * Calcular mês anterior no formato YYYY-MM
   */
  const mesAnterior = useMemo(() => dayjs().subtract(1, 'month').format('YYYY-MM'), []);

  /**
   * Obter nome do mês em português (com primeira letra maiúscula)
   */
  const getNomeMes = (mesAno) => {
    if (!mesAno) return '';
    const [ano, mes] = mesAno.split('-');
    const date = dayjs(`${ano}-${mes}-01`);
    const mesFormatado = date.locale('pt-br').format('MMMM [de] YYYY');
    // Capitalizar primeira letra do mês
    return mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
  };

  /**
   * Obter nome curto do mês (ex: "Jan/2025")
   */
  const getNomeMesCurto = (mesAno) => {
    if (!mesAno) return '';
    const [ano, mes] = mesAno.split('-');
    const date = dayjs(`${ano}-${mes}-01`);
    return date.locale('pt-br').format('MMM/YYYY');
  };

  /**
   * Gerar lista de meses disponíveis (últimos 12 meses)
   */
  const mesesDisponiveis = useMemo(() => {
    const meses = [];
    const hoje = dayjs();

    for (let i = 11; i >= 0; i -= 1) {
      const mes = hoje.subtract(i, 'month');
      const labelCurtoFormatado = mes.locale('pt-br').format('MMM/YYYY');
      // Capitalizar primeira letra do mês
      const labelCurtoCapitalizado = labelCurtoFormatado.charAt(0).toUpperCase() + labelCurtoFormatado.slice(1);
      meses.push({
        value: mes.format('YYYY-MM'),
        label: mes.locale('pt-br').format('MMMM [de] YYYY'),
        labelCurto: labelCurtoCapitalizado,
        mes: mes.month() + 1,
        ano: mes.year(),
      });
    }

    return meses;
  }, []);

  /**
   * Validar formato de mesAno (YYYY-MM)
   */
  const validarMesAno = (mesAno) => {
    if (!mesAno) return false;
    return /^\d{4}-\d{2}$/.test(mesAno);
  };

  /**
   * Comparar dois meses (retorna -1, 0 ou 1)
   */
  const compararMeses = (mesAno1, mesAno2) => {
    if (!mesAno1 || !mesAno2) return 0;
    const date1 = dayjs(`${mesAno1}-01`);
    const date2 = dayjs(`${mesAno2}-01`);
    if (date1.isBefore(date2)) return -1;
    if (date1.isAfter(date2)) return 1;
    return 0;
  };

  return {
    mesAnterior,
    getNomeMes,
    getNomeMesCurto,
    mesesDisponiveis,
    validarMesAno,
    compararMeses,
  };
}
