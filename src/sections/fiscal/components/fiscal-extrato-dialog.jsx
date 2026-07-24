'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import {
  base64ToPdfFile,
  extractExtratoPdf,
  arquivarExtratoDas,
  consultarExtratoDas,
} from 'src/actions/serPro';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

export function FiscalExtratoDialog({ open, onClose, clienteId, row }) {
  const [baixando, setBaixando] = useState(false);
  const [anexando, setAnexando] = useState(false);

  const numeroDas = row?.numeroDas || '';
  const periodoApuracao = row?.periodoApuracao || '';
  const competenciaLabel = row?.competenciaLabel || '';

  const busy = baixando || anexando;

  const handleClose = () => {
    if (busy) return;
    onClose?.();
  };

  // Baixa o PDF (base64) no computador do usuário.
  const baixarPdfLocal = (base64, nomeArquivo) => {
    const file = base64ToPdfFile(base64, nomeArquivo || `extrato-DAS-${periodoApuracao}.pdf`);
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleBaixar = async () => {
    if (!clienteId || !numeroDas) return;
    setBaixando(true);
    try {
      const res = await consultarExtratoDas(clienteId, { numeroDas, periodoApuracao });
      const item = extractExtratoPdf(res.data?.extrato);
      if (!item?.pdf) {
        throw new Error('A Serpro não retornou o PDF do extrato.');
      }
      baixarPdfLocal(item.pdf, item.nomeArquivo);
      if (res.data?.origem === 'drive') {
        toast.success('Baixado do Drive (sem nova consulta à Serpro).');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setBaixando(false);
    }
  };

  const handleAnexar = async () => {
    if (!clienteId || !numeroDas || !periodoApuracao) return;
    setAnexando(true);
    try {
      const res = await arquivarExtratoDas(clienteId, { numeroDas, periodoApuracao });
      // O backend devolve o PDF fresco na mesma resposta — baixa no PC sem nova request.
      const item = extractExtratoPdf(res.data?.extrato);
      if (item?.pdf) {
        baixarPdfLocal(item.pdf, item.nomeArquivo);
        toast.success('Extrato atualizado no Drive e baixado no computador.');
      } else {
        toast.success('Extrato atualizado no Drive do cliente, junto da DAS.');
      }
      onClose?.();
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setAnexando(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:file-download-bold-duotone" width={22} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" lineHeight={1.3}>
              Extrato do DAS
            </Typography>
            {competenciaLabel ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {competenciaLabel}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Baixar</strong>: baixa o extrato deste mês (usa a cópia já arquivada no Drive, sem
          nova consulta à Serpro). <strong>Substituir no Drive e baixar</strong>: busca a versão
          atual na Serpro, atualiza/substitui a cópia no Drive do cliente (junto da DAS) e baixa o PDF
          no seu computador.
        </Typography>
        {numeroDas ? (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
            Nº DAS: {numeroDas}
          </Typography>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={busy} color="inherit">
          Fechar
        </Button>
        <Button
          variant="outlined"
          onClick={handleBaixar}
          disabled={busy}
          startIcon={
            baixando ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:download-minimalistic-bold" />
            )
          }
        >
          {baixando ? 'Baixando…' : 'Baixar'}
        </Button>
        <Button
          variant="contained"
          onClick={handleAnexar}
          disabled={busy}
          startIcon={
            anexando ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:cloud-download-bold" />
            )
          }
        >
          {anexando ? 'Substituindo…' : 'Substituir no Drive e baixar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
