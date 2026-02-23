import * as XLSX from 'xlsx';

const STATUS_LABEL = {
  true: 'Ativo',
  false: 'Inativo',
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pendente',
};

function getStatusLabel(status) {
  if (status == null) return '';
  return STATUS_LABEL[String(status).toLowerCase()] ?? status ?? '';
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

function formatDataHora(data) {
  if (!data) return '';
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${min}`;
}

function getEmpresasTexto(usuario) {
  if (!usuario.empresasId?.length) return '';
  return usuario.empresasId
    .map((e) => (typeof e === 'object' && e?.razaoSocial ? e.razaoSocial : String(e)))
    .filter(Boolean)
    .join(', ');
}

/**
 * Exporta usuários clientes para arquivo Excel.
 * @param {Array} usuarios - Array de usuários clientes
 */
export function exportUsuariosClientesExcel(usuarios) {
  const headers = [
    'Usuário',
    'Email',
    'Empresas',
    'Status',
    'Último Acesso',
    'Criado em',
  ];

  const rows = (usuarios || []).map((u) => [
    u.name || '',
    u.email || '',
    getEmpresasTexto(u),
    getStatusLabel(u.status),
    formatDataHora(u.ultimoAcesso),
    formatData(u.createdAt),
  ]);

  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const colWidths = [
    { wch: 28 },
    { wch: 32 },
    { wch: 40 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Usuários Clientes');

  const fileName = `usuarios-clientes-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
