/**
 * Normaliza o payload do formulário de alteração antes de enviar ao backend.
 * - Converte socios[].porcentagem de string (ex: "0%") para number.
 * - Remove socios[].socioEnabled (não existe no schema do backend).
 * - Corrige typo situcaoAlteracao → situacaoAlteracao.
 */
export function prepareDataForAlteracao(data) {
  if (!data) return data;
  const next = { ...data };
  if (Array.isArray(next.socios)) {
    next.socios = next.socios.map((socio) => {
      const { socioEnabled, porcentagem, ...rest } = socio ?? {};
      const num =
        typeof porcentagem === 'number' && !Number.isNaN(porcentagem)
          ? porcentagem
          : parseFloat(String(porcentagem ?? '').replace('%', '').replace(',', '.')) || 0;
      return { ...rest, porcentagem: num };
    });
  }
  if (
    Object.prototype.hasOwnProperty.call(next, 'situcaoAlteracao') &&
    !Object.prototype.hasOwnProperty.call(next, 'situacaoAlteracao')
  ) {
    next.situacaoAlteracao = Number(next.situcaoAlteracao) || 0;
    delete next.situcaoAlteracao;
  }
  return next;
}
