// ----------------------------------------------------------------------
// Leitura dos campos de “já viu / baixou” no portal.
//
// Portal (API §6.8): por usuário logado
// - lidoPeloUsuario, vistoEmUsuario
//
// Admin: quando a API enviar resumo/lista (ex.: leiturasPortal, leiturasPortalResumo,
// quantidadeLeiturasPortal, ultimaVisualizacaoPortalEm), usamos os mesmos helpers.

/** @deprecated Preferir vistoEmUsuario (API portal). */
const CANDIDATAS_DATA_VISUALIZACAO = [
  'clienteVisualizouEm',
  'clienteVisualizadoEm',
  'visualizadoPeloClienteEm',
  'visualizadoEmCliente',
  'dataVisualizacaoCliente',
  'ultimaVisualizacaoCliente',
  'portalVisualizouEm',
];

function nomeDeReferenciaUsuario(ref) {
  if (!ref || typeof ref !== 'object') return null;
  return ref.name ?? ref.nome ?? ref.email ?? ref.userName ?? null;
}

function coletarEntradasLeituraPortal(guia) {
  if (!guia || typeof guia !== 'object') return [];
  const raw = guia.leiturasPortal ?? guia.portalLeituras ?? guia.leiturasUsuariosPortal;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((e) => {
      if (!e || typeof e !== 'object') return null;
      const vistoEm = e.vistoEm ?? e.em ?? e.data;
      const label =
        e.nome ??
        e.nomeUsuario ??
        e.userName ??
        e.email ??
        nomeDeReferenciaUsuario(e.usuarioId) ??
        nomeDeReferenciaUsuario(e.usuario) ??
        'Usuário do portal';
      return { label, vistoEm: vistoEm || null };
    })
    .filter(Boolean);
}

/**
 * Lista normalizada para exibição no admin (detalhe do documento).
 * @returns {{ label: string, vistoEm: string|null }[]}
 */
export function getLeiturasPortalItensAdmin(guia) {
  return coletarEntradasLeituraPortal(guia);
}

export function temInformacaoLeituraPortalAdmin(guia) {
  if (!guia || typeof guia !== 'object') return false;
  if (getLeiturasPortalItensAdmin(guia).length > 0) return true;
  if (typeof guia.quantidadeLeiturasPortal === 'number') return true;
  if (guia.leiturasPortalResumo && typeof guia.leiturasPortalResumo === 'object') return true;
  if (guia.ultimaVisualizacaoPortalEm) return true;
  if (guia.ultimaLeituraPortalEm) return true;
  return false;
}

/**
 * @param {unknown} guia
 * @returns {string|Date|null}
 */
export function getClienteVisualizouEm(guia) {
  if (!guia || typeof guia !== 'object') return null;

  const vistoApi = guia.vistoEmUsuario;
  if (vistoApi != null && vistoApi !== '') return vistoApi;

  const resumo = guia.leiturasPortalResumo;
  if (resumo && typeof resumo === 'object') {
    const v = resumo.ultimaEm ?? resumo.ultimaVisualizacaoEm ?? resumo.vistoEm;
    if (v != null && v !== '') return v;
  }

  const ultima = guia.ultimaVisualizacaoPortalEm ?? guia.ultimaLeituraPortalEm;
  if (ultima != null && ultima !== '') return ultima;

  const entradas = coletarEntradasLeituraPortal(guia);
  const comData = entradas.filter((e) => e.vistoEm);
  if (comData.length > 0) {
    comData.sort((a, b) => new Date(b.vistoEm).getTime() - new Date(a.vistoEm).getTime());
    return comData[0].vistoEm;
  }

  const keyComData = CANDIDATAS_DATA_VISUALIZACAO.find((key) => {
    const v = guia[key];
    return v != null && v !== '';
  });
  if (keyComData) return guia[keyComData];

  const nested = guia.visualizacaoCliente;
  if (nested && typeof nested === 'object') {
    const v = nested.em ?? nested.data ?? nested.at;
    if (v != null && v !== '') return v;
  }

  return null;
}

/**
 * @param {unknown} guia
 * @returns {boolean}
 */
export function clienteJaVisualizouDocumento(guia) {
  if (!guia || typeof guia !== 'object') return false;

  if (guia.lidoPeloUsuario === true) return true;
  if (guia.lidoPeloUsuario === false) return false;

  if (guia.teveLeituraPortal === true || guia.teveVisualizacaoPortal === true) return true;

  const resumo = guia.leiturasPortalResumo;
  if (resumo && typeof resumo === 'object') {
    const n = resumo.total ?? resumo.quantidade ?? resumo.count;
    if (typeof n === 'number' && n > 0) return true;
  }

  if (typeof guia.quantidadeLeiturasPortal === 'number' && guia.quantidadeLeiturasPortal > 0) return true;

  if (coletarEntradasLeituraPortal(guia).length > 0) return true;

  const flagsTrue = ['visualizadoPeloCliente', 'clienteVisualizou', 'jaVisualizadoPeloCliente'];
  if (flagsTrue.some((k) => guia[k] === true)) return true;

  if (getClienteVisualizouEm(guia)) return true;

  const flagsFalse = ['naoLidoPeloCliente', 'naoVisualizadoPeloCliente'];
  if (flagsFalse.some((k) => guia[k] === true)) return false;

  return false;
}

/**
 * Leitura mais recente no portal para resumo em cartões (admin).
 * @returns {{ visto: boolean, nome: string|null, em: string|Date|null, totalLeituras: number }}
 */
export function getUltimaLeituraPortalAdmin(guia) {
  if (!guia || typeof guia !== 'object') {
    return { visto: false, nome: null, em: null, totalLeituras: 0 };
  }
  if (!clienteJaVisualizouDocumento(guia)) {
    return { visto: false, nome: null, em: null, totalLeituras: 0 };
  }
  const itens = getLeiturasPortalItensAdmin(guia);
  if (itens.length > 0) {
    const sorted = [...itens].sort((a, b) => {
      const ta = a.vistoEm ? new Date(a.vistoEm).getTime() : 0;
      const tb = b.vistoEm ? new Date(b.vistoEm).getTime() : 0;
      return tb - ta;
    });
    const pick = sorted[0];
    return {
      visto: true,
      nome: pick.label,
      em: pick.vistoEm || null,
      totalLeituras: itens.length,
    };
  }
  const em = getClienteVisualizouEm(guia);
  const n =
    typeof guia.quantidadeLeiturasPortal === 'number' ? guia.quantidadeLeiturasPortal : em ? 1 : 0;
  return { visto: true, nome: null, em, totalLeituras: n };
}

/**
 * Documento ainda não visto pelo cliente no portal (badge "Novo").
 * @param {unknown} guia
 * @returns {boolean}
 */
export function isDocumentoNovoParaClientePortal(guia) {
  if (!guia || typeof guia !== 'object') return false;

  if (guia.novoParaCliente === true || guia.isNovoParaCliente === true) return true;
  if (guia.novoParaCliente === false || guia.isNovoParaCliente === false) return false;

  if (guia.lidoPeloUsuario === true) return false;
  if (guia.lidoPeloUsuario === false) return true;

  return !clienteJaVisualizouDocumento(guia);
}
