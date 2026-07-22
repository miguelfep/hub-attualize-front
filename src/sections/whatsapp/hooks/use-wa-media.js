import { useState, useEffect } from 'react';

import { baixarMidiaBlobUrl } from 'src/actions/whatsapp';

// ----------------------------------------------------------------------
// Baixa a mídia de uma mensagem com o Bearer e devolve um objectURL (blob:)
// pronto para usar em <img>/<audio>/<video>/<a>. A mídia NÃO é pública, então
// não dá pra apontar a tag direto pra urlPublica. Revoga o URL ao desmontar.
//
// `pronta` deve refletir `midia.baixada` (inbound pode chegar false); enquanto
// false não tentamos baixar (o backend responderia 404).
// ----------------------------------------------------------------------

/**
 * @param {string} mensagemId
 * @param {boolean} [pronta=true] se a mídia já terminou de baixar no backend
 * @returns {{ src: string|null, carregando: boolean, erro: string|null }}
 */
export function useWaMedia(mensagemId, pronta = true) {
  const [src, setSrc] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!mensagemId || !pronta) return undefined;

    let ativo = true;
    let objectUrl = null;

    setCarregando(true);
    setErro(null);

    baixarMidiaBlobUrl(mensagemId)
      .then((url) => {
        objectUrl = url;
        if (ativo) setSrc(url);
        else URL.revokeObjectURL(url);
      })
      .catch((e) => {
        if (ativo) setErro(e?.message || 'Falha ao carregar a mídia');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mensagemId, pronta]);

  return { src, carregando, erro };
}
