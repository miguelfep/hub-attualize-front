/**
 * Flags do cliente no portal (possuiFuncionario, possuiExtrato, etc.).
 * A API pode enviar boolean ou, em alguns casos, valores serializados.
 * @param {unknown} v
 * @returns {boolean}
 */
export function isClientePortalFlagAtiva(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

/**
 * Une cliente + settings + linha da empresa ativa na lista (GET empresas).
 * Documentação: `possuiFuncionario` espelhado em `data.settings` e em `data.empresas[]`.
 *
 * @param {{ cliente?: object, settings?: object, empresas?: object[], empresaAtivaId?: string | null }} p
 */
export function mergeClientePortalContext({ cliente, settings, empresas, empresaAtivaId }) {
  const id = empresaAtivaId ?? cliente?._id;
  const row = id && Array.isArray(empresas) ? empresas.find((e) => e._id === id) : null;

  const possuiFuncionario =
    isClientePortalFlagAtiva(cliente?.possuiFuncionario) ||
    isClientePortalFlagAtiva(settings?.possuiFuncionario) ||
    isClientePortalFlagAtiva(row?.possuiFuncionario);

  if (cliente && typeof cliente === 'object') {
    return { ...cliente, possuiFuncionario };
  }
  if (row && typeof row === 'object') {
    return { ...row, _id: row._id || id, possuiFuncionario };
  }
  return null;
}
