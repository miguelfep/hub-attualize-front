// ----------------------------------------------------------------------
// Documento fiscal (CPF/CNPJ) — fonte única, pronta para o CNPJ ALFANUMÉRICO
// (IN RFB 2.229/2024): as 12 primeiras posições aceitam [A-Z0-9]; os 2 dígitos
// verificadores continuam numéricos. Máscara visual permanece
// XX.XXX.XXX/XXXX-XX. No cálculo do DV cada caractere vale charCode − 48
// ('0'–'9' → 0–9; 'A'–'Z' → 17–42). O CPF segue 100% numérico.
//
// Os utilitários legados (format-number, formatters, formatter, format-input,
// validators) DELEGAM para este arquivo — novas telas devem importar daqui.
// ----------------------------------------------------------------------

/** Mantém apenas [A-Z0-9] (maiúsculo). Normalização canônica de CNPJ. */
export const normalizarDocumento = (v) =>
  String(v ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

/** Mantém apenas dígitos (CPF, telefone etc.). */
export const normalizarCpf = (v) => String(v ?? '').replace(/\D/g, '');

/** Documento tem cara de CNPJ? (qualquer letra, ou mais de 11 caracteres) */
export const pareceCnpj = (v) => {
  const s = normalizarDocumento(v);
  return /[A-Z]/.test(s) || s.length > 11;
};

/**
 * Documento completo para consulta/validação?
 * CPF = 11 dígitos; CNPJ = 14 caracteres alfanuméricos.
 */
export const documentoCompleto = (v) => {
  const s = normalizarDocumento(v);
  return pareceCnpj(v) ? s.length === 14 : s.length === 11;
};

// ---------------------------------------------------------------- validação

/** Valor de um caractere no cálculo do DV do CNPJ alfanumérico. */
const valorDv = (ch) => ch.charCodeAt(0) - 48;

const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const calcularDvCnpj = (base) => {
  const pesos = base.length === 12 ? PESOS_DV1 : PESOS_DV2;
  const soma = base
    .split('')
    .reduce((acc, ch, i) => acc + valorDv(ch) * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

/** Valida CNPJ (numérico OU alfanumérico) pelos dígitos verificadores. */
export function validarCnpjDocumento(v) {
  const cnpj = normalizarDocumento(v);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;
  if (/^([A-Z0-9])\1{13}$/.test(cnpj)) return false;
  if (calcularDvCnpj(cnpj.slice(0, 12)) !== Number(cnpj[12])) return false;
  if (calcularDvCnpj(cnpj.slice(0, 13)) !== Number(cnpj[13])) return false;
  return true;
}

/** Valida CPF (sempre numérico) pelos dígitos verificadores. */
export function validarCpfDocumento(v) {
  const cpf = normalizarCpf(v);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(cpf[i]) * (10 - i);
  let dv = 11 - (soma % 11);
  if (dv >= 10) dv = 0;
  if (dv !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(cpf[i]) * (11 - i);
  dv = 11 - (soma % 11);
  if (dv >= 10) dv = 0;
  return dv === Number(cpf[10]);
}

/** Valida CPF (11 dígitos) ou CNPJ (14 alfanuméricos). */
export function validarCpfOuCnpjDocumento(v) {
  return pareceCnpj(v) ? validarCnpjDocumento(v) : validarCpfDocumento(v);
}

// -------------------------------------------------------------- formatação

/** Máscara incremental de CNPJ (aceita letras): XX.XXX.XXX/XXXX-XX. */
export function formatarCnpj(v) {
  const s = normalizarDocumento(v).slice(0, 14);
  if (s.length <= 2) return s;
  if (s.length <= 5) return `${s.slice(0, 2)}.${s.slice(2)}`;
  if (s.length <= 8) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
  if (s.length <= 12)
    return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8)}`;
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12, 14)}`;
}

/** Máscara incremental de CPF: 000.000.000-00. */
export function formatarCpf(v) {
  const s = normalizarCpf(v).slice(0, 11);
  if (s.length <= 3) return s;
  if (s.length <= 6) return `${s.slice(0, 3)}.${s.slice(3)}`;
  if (s.length <= 9) return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6)}`;
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9, 11)}`;
}

/** Máscara dinâmica: CPF até 11 dígitos (sem letra); CNPJ nos demais casos. */
export function formatarCpfCnpj(v) {
  return pareceCnpj(v) ? formatarCnpj(v) : formatarCpf(v);
}
