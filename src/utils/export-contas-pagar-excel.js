import * as XLSX from 'xlsx';

const STATUS_LABEL = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
};

const TIPO_LABEL = {
  AVULSA: 'Avulsa',
  RECORRENTE: 'Recorrente',
};

function formatValor(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

function formatData(data) {
  if (!data) return '';
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Exporta contas a pagar para arquivo Excel.
 * @param {Array} contas - Array de contas (tableData do período)
 * @param {object} startDate - dayjs da data inicial do período
 * @param {object} endDate - dayjs da data final do período
 */
export function exportContasPagarExcel(contas, startDate, endDate) {
  const headers = [
    'Nome',
    'Descrição',
    'Valor',
    'Data Vencimento',
    'Status',
    'Banco',
    'Categoria',
    'Tipo',
    'Parcela',
  ];


  const rows = contas.map((conta) => [
    conta.nome || conta.descricao || '',
    conta.descricao || '',
    formatValor(conta.valor),
    formatData(conta.dataVencimento),
    STATUS_LABEL[conta.status] || conta.status || '',
    conta.banco?.nome ?? '',
    conta?.categoria?.nome ?? '',
    TIPO_LABEL[conta.tipo] || conta.tipo || '',
    conta.parcelas != null ? String(conta.parcelas) : '',
  ]);

  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const colWidths = [
    { wch: 28 },
    { wch: 35 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 32 },
    { wch: 12 },
    { wch: 8 },
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contas a Pagar');

  const startStr = startDate.format('YYYY-MM');
  const endStr = endDate.format('YYYY-MM');
  const fileName =
    startStr === endStr
      ? `contas-a-pagar-${startStr}.xlsx`
      : `contas-a-pagar-${startStr}-${endStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
