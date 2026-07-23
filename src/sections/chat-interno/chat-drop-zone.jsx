import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { enviarAnexoChat } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Área de drop da conversa: arrastar arquivos para qualquer ponto do canal
// aberto envia como anexo. Overlay tracejado enquanto arrasta; spinner
// discreto enquanto envia.
// ----------------------------------------------------------------------

const LIMITE_ANEXO = 15 * 1024 * 1024; // 15 MB (mesmo limite do clipe)

export function ChatDropZone({ canalId, onEnviada, children }) {
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // dragenter/dragleave disparam nos filhos — contador evita o overlay piscar.
  const contadorRef = useRef(0);

  const temArquivos = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');

  const enviarArquivos = useCallback(
    async (files) => {
      if (!canalId || !files.length) return;
      setEnviando(true);
      try {
        // Sequencial para preservar a ordem das mensagens.
        await files.reduce(async (anterior, file) => {
          await anterior;
          if (file.size > LIMITE_ANEXO) {
            toast.error(`"${file.name}" passa de 15 MB — ignorado.`);
          } else {
            const msg = await enviarAnexoChat(canalId, file, {});
            onEnviada?.(msg);
          }
        }, Promise.resolve());
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || 'Falha ao anexar.');
      } finally {
        setEnviando(false);
      }
    },
    [canalId, onEnviada]
  );

  const onDragEnter = useCallback((e) => {
    if (!temArquivos(e)) return;
    e.preventDefault();
    contadorRef.current += 1;
    setArrastando(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    if (!temArquivos(e)) return;
    e.preventDefault();
    contadorRef.current = Math.max(0, contadorRef.current - 1);
    if (!contadorRef.current) setArrastando(false);
  }, []);

  const onDragOver = useCallback((e) => {
    if (!temArquivos(e)) return;
    e.preventDefault(); // necessário para o navegador permitir o drop
  }, []);

  const onDrop = useCallback(
    (e) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      contadorRef.current = 0;
      setArrastando(false);
      enviarArquivos(Array.from(e.dataTransfer.files));
    },
    [enviarArquivos]
  );

  return (
    <Stack
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{ position: 'relative', flex: '1 1 auto', minWidth: 0, minHeight: 0 }}
    >
      {children}

      {arrastando && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            inset: 8,
            zIndex: 20,
            borderRadius: 2,
            pointerEvents: 'none',
            border: (t) => `2px dashed ${t.vars.palette.primary.main}`,
            bgcolor: (t) => `rgba(${t.vars.palette.primary.mainChannel} / 0.08)`,
            backdropFilter: 'blur(2px)',
          }}
        >
          <Iconify icon="eva:attach-2-fill" width={40} sx={{ color: 'primary.main', mb: 1 }} />
          <Typography variant="subtitle1" color="primary.main">
            Solte para anexar na conversa
          </Typography>
        </Stack>
      )}

      {enviando && (
        <Box sx={{ position: 'absolute', right: 16, bottom: 72, zIndex: 20 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Stack>
  );
}
