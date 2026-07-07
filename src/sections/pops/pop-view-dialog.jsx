'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { getPopById } from 'src/actions/pops';

import { Label } from 'src/components/label';
import { Markdown } from 'src/components/markdown';

// ----------------------------------------------------------------------

/**
 * Dialog de leitura de um POP. Busca o POP completo (com `conteudo`) ao abrir.
 * Mantido leve (sem dependências da feature tarefas) para poder ser reutilizado
 * a partir do drawer de tarefas.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {string=}  props.popId
 */
export function PopViewDialog({ open, onClose, popId }) {
  const [pop, setPop] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !popId) {
      setPop(null);
      return undefined;
    }

    let ativo = true;
    setLoading(true);
    getPopById(popId)
      .then((data) => {
        if (ativo) setPop(data || null);
      })
      .catch((e) => {
        if (!ativo) return;
        toast.error(e?.response?.data?.message || e?.message || 'Erro ao carregar o POP.');
        setPop(null);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [open, popId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <span>{pop?.titulo || 'POP'}</span>
          {pop && (
            <Label variant="soft" color="info">
              v{pop.versao}
            </Label>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !pop ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            POP não encontrado.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {!!pop.setores?.length && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {pop.setores.map((s) => (
                  <Label key={s} variant="soft" color="info">
                    {s}
                  </Label>
                ))}
              </Stack>
            )}

            {!!pop.descricao && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {pop.descricao}
              </Typography>
            )}

            <Markdown>{pop.conteudo || ''}</Markdown>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
