// ----------------------------------------------------------------------
// Rastreamento de campanha (UTM) — captura first-touch no client.
//
// A primeira campanha que trouxe o visitante é preservada (campos já
// gravados não são sobrescritos). Os valores são enviados no corpo das
// chamadas de captação de lead (criarLead/createLead) em formato plano,
// conforme o contrato do backend (utm_source, gclid, referrer, ...).
// ----------------------------------------------------------------------

const STORAGE_KEY = 'attualize_utm';

// Parâmetros lidos da querystring da landing.
const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
];

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persiste as UTMs da URL atual com regra de first-touch (não sobrescreve
 * o que já foi capturado). Deve ser chamada a cada navegação.
 */
export function persistUtmFirstTouch() {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const stored = readStored();
    let mudou = false;

    UTM_PARAM_KEYS.forEach((key) => {
      const valor = params.get(key);
      if (valor && !stored[key]) {
        stored[key] = valor;
        mudou = true;
      }
    });

    // Guarda referrer e landingPage apenas na primeira visita registrada.
    const temUtm = UTM_PARAM_KEYS.some((k) => stored[k]);
    if (mudou || (temUtm && !stored.landingPage)) {
      if (!stored.referrer && document.referrer) stored.referrer = document.referrer;
      if (!stored.landingPage) stored.landingPage = window.location.href;
      mudou = true;
    }

    if (mudou) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  } catch {
    /* ignora indisponibilidade de storage (modo privado etc.) */
  }
}

/**
 * Retorna o payload de UTM (formato plano) para anexar à captação do lead.
 * Garante a captura mesmo quando o form está na própria landing (lê a URL
 * atual antes de devolver). Retorna `{}` quando não há UTM.
 */
export function getUtmPayload() {
  if (typeof window === 'undefined') return {};
  persistUtmFirstTouch();
  const stored = readStored();
  return Object.keys(stored).length ? stored : {};
}
