'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { getAnexoBlobUrl } from 'src/actions/tarefas';

// ----------------------------------------------------------------------

/**
 * Renderiza a imagem de um anexo a partir do endpoint autenticado (busca como
 * blob e cria um object URL, revogado ao desmontar). Mostra um skeleton
 * enquanto carrega.
 *
 * @param {object}  props
 * @param {string}  props.tarefaId
 * @param {object}  props.anexo       { _id, nomeArquivo }
 * @param {'view'|'thumbnail'} [props.tipo]  default `thumbnail`
 * @param {object}  [props.sx]
 * @param {() => void} [props.onClick]
 */
export function AnexoImagem({ tarefaId, anexo, tipo = 'thumbnail', sx, onClick }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl;
    let ativo = true;

    getAnexoBlobUrl(tarefaId, anexo._id, tipo)
      .then((u) => {
        if (ativo) {
          objectUrl = u;
          setSrc(u);
        } else {
          URL.revokeObjectURL(u);
        }
      })
      .catch(() => {});

    return () => {
      ativo = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [tarefaId, anexo._id, tipo]);

  if (!src) return <Skeleton variant="rounded" sx={sx} />;

  return (
    <Box component="img" src={src} alt={anexo.nomeArquivo} title={anexo.nomeArquivo} onClick={onClick} sx={sx} />
  );
}
