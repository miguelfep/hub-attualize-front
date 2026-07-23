import { useState, useEffect } from 'react';

import { baixarAnexoBlobUrl } from 'src/actions/chat-interno';

// ----------------------------------------------------------------------
// Baixa um anexo do chat com o Bearer e devolve um objectURL (blob:) pronto
// para <img>/<a>. Anexos NÃO são públicos. Revoga o URL ao desmontar.
// ----------------------------------------------------------------------

export function useChatAnexo(mensagemId, indice, habilitado = true) {
  const [src, setSrc] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!mensagemId || !habilitado) return undefined;

    let ativo = true;
    let objectUrl = null;

    setCarregando(true);
    setErro(null);

    baixarAnexoBlobUrl(mensagemId, indice)
      .then((url) => {
        objectUrl = url;
        if (ativo) setSrc(url);
        else URL.revokeObjectURL(url);
      })
      .catch((e) => {
        if (ativo) setErro(e?.message || 'Falha ao carregar o anexo');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mensagemId, indice, habilitado]);

  return { src, carregando, erro };
}
