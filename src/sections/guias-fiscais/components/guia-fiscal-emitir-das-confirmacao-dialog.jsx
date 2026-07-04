'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DURACAO_TIMER = 10;

// ----------------------------------------------------------------------

/**
 * Dialog de confirmação "Estou ciente" antes de emitir a 2ª via da DAS.
 * Espelha o modal do Imposto de Renda (ir-coleta-view.jsx:1357-1558):
 * backdrop borrado, timer de 15s, checkbox obrigatório, botão habilitado
 * apenas quando timer=0 && checkbox marcado.
 *
 * @param {object}     props
 * @param {boolean}    props.open
 * @param {boolean}    props.loading
 * @param {() => void} props.onClose
 * @param {() => void} props.onConfirm
 * @param {number}     [props.limite=1] — teto mensal de emissões DAS do cliente (vindo do statusEmissao).
 */
export function GuiaFiscalEmitirDasConfirmacaoDialog({ open, loading, onClose, onConfirm, limite = 1 }) {
  const limiteNum = Math.max(1, Number(limite) || 1);
  const guiaLabel = limiteNum === 1 ? 'uma Guia DAS' : `${limiteNum} Guias DAS`;
  const [timer, setTimer] = useState(DURACAO_TIMER);
  const [ciente, setCiente] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setTimer(DURACAO_TIMER);
    setCiente(false);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => { }}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, p: { xs: 1, sm: 2 } } }}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.72)' } } }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box
          sx={{
            mx: 'auto',
            mb: 2,
            width: 68,
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'rgba(255, 171, 0, 0.12)',
          }}
        >
          <Iconify icon="eva:alert-triangle-fill" width={36} sx={{ color: 'error.main' }} />
        </Box>
        <Typography variant="h5" textAlign="center">
          Confirmação de Emissão
        </Typography>
        <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" icon={false} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Você pode emitir apenas {guiaLabel} por mês.
          </Typography>
        </Alert>

        <Typography variant="body2" textAlign="center" sx={{ maxWidth: 480, mx: 'auto', mb: 2 }}>
          Por padrão, o sistema permite a emissão de{' '}
          <Typography component="span" fontWeight="bold" color="error.main">
            {guiaLabel} por mês
          </Typography>
          . Após confirmar, a guia será gerada e salva automaticamente na sua pasta de documentos.
        </Typography>

        <Box
          sx={{
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
            <CircularProgress
              variant="determinate"
              value={(timer / DURACAO_TIMER) * 100}
              size={48}
              color={timer > 0 ? 'warning' : 'success'}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {timer > 0 ? `${timer}s` : 'OK'}
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={(timer / DURACAO_TIMER) * 100}
            color={timer > 0 ? 'warning' : 'success'}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            disabled={timer > 0}
            sx={{ margin: 0 }}
            control={
              <Checkbox
                checked={ciente}
                onChange={(e) => setCiente(e.target.checked)}
                color="success"
                size="medium"
              />
            }
            label={
              <Typography variant="body2">
                Estou ciente que só posso emitir{' '}
                <Typography component="span" fontWeight="bold" color="error.main">
                  {guiaLabel} por mês
                </Typography>
                .
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button variant="outlined" color="inherit" size="large" onClick={onClose}>
          Voltar
        </Button>
        <LoadingButton
          variant="contained"
          color={timer > 0 ? 'warning' : 'success'}
          size="large"
          disabled={timer > 0 || !ciente}
          loading={loading}
          onClick={onConfirm}
        >
          Emitir 2ª via
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
