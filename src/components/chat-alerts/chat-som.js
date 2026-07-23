// ----------------------------------------------------------------------
// Som de notificação do chat interno (estilo Slack "knock"): duas notas curtas
// geradas via Web Audio — sem asset externo. Preferência do usuário persiste em
// localStorage (ligado por padrão). Navegadores bloqueiam áudio antes do 1º
// gesto do usuário; nesse caso falhamos em silêncio.
// ----------------------------------------------------------------------

const STORAGE_KEY = 'chat-interno-som';

let audioCtx = null;

export function somAtivo() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) !== 'off';
}

export function alternarSom() {
  const novo = !somAtivo();
  window.localStorage.setItem(STORAGE_KEY, novo ? 'on' : 'off');
  if (novo) tocarSomChat(true); // feedback imediato ao religar
  return novo;
}

function nota(ctx, freq, inicio, duracao, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + inicio + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracao);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + inicio);
  osc.stop(ctx.currentTime + inicio + duracao + 0.05);
}

/** Toca o som (se habilitado). `forcar` ignora a preferência (feedback do toggle). */
export function tocarSomChat(forcar = false) {
  if (typeof window === 'undefined') return;
  if (!forcar && !somAtivo()) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') {
      // Sem gesto do usuário ainda — tenta retomar; se não der, silêncio.
      audioCtx.resume().catch(() => {});
      if (audioCtx.state === 'suspended') return;
    }
    // Duas notas rápidas (sol → dó), volume discreto.
    nota(audioCtx, 784, 0, 0.12, 0.12);
    nota(audioCtx, 1047, 0.13, 0.16, 0.12);
  } catch {
    /* áudio indisponível — ignora */
  }
}
