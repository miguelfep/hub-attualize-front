'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getStatusEmissaoDas, emitirSegundaViaDasPortal } from 'src/actions/serpro-portal';

import {
  MESES_COMPETENCIA_OPTIONS,
  buildPeriodoApuracaoSerpro,
  buildDataConsolidacaoSerpro,
} from 'src/sections/guias-fiscais/utils';

import { GuiaFiscalEmitirDasConfirmacaoDialog } from './guia-fiscal-emitir-das-confirmacao-dialog';

// ----------------------------------------------------------------------

const VAZIO = {
  mes: '',
  ano: '',
  dataVencimento: null,
};

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

// ----------------------------------------------------------------------

/**
 * Dialog de emissão de 2ª via da Guia DAS pelo portal do cliente.
 *
 * @param {object}     props
 * @param {boolean}    props.open
 * @param {() => void} props.onClose
 * @param {() => void} props.onSuccess
 */
export function GuiaFiscalEmitirDasPortalDialog({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [limite, setLimite] = useState(1);

  useEffect(() => {
    let active = true;
    if (open) {
      setForm(VAZIO);
      setErroApi('');
      setConfirmOpen(false);
      // Busca o teto mensal do cliente para repassar ao diálogo de confirmação.
      // Falha silenciosa mantém o default 1 (comportamento histórico).
      getStatusEmissaoDas()
        .then((data) => {
          if (active && data?.limite) setLimite(data.limite);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [open]);

  const periodoApuracao = buildPeriodoApuracaoSerpro(form.mes, form.ano);

  const handleClickEmitir = () => {
    setErroApi('');
    if (!form.mes) {
      toast.error('Selecione o mês da competência.');
      return;
    }
    if (!form.ano || String(form.ano).length !== 4) {
      toast.error('Informe o ano com 4 dígitos.');
      return;
    }
    if (!periodoApuracao) {
      toast.error('Competência inválida. Use mês 01–12 e ano com 4 dígitos.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmarEmissao = async () => {
    setConfirmOpen(false);
    setSalvando(true);
    setErroApi('');
    try {
      const dataConsolidacao = buildDataConsolidacaoSerpro(form.dataVencimento);
      await emitirSegundaViaDasPortal({ periodoApuracao, dataConsolidacao });
      toast.success('DAS emitida e salva na pasta com sucesso.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = apiErrMsg(err);
      setErroApi(msg);
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Emitir 2ª Via da Guia DAS</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField select label="Tipo de guia" value="DAS" disabled fullWidth>
              <MenuItem value="DAS">DAS</MenuItem>
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
              <TextField
                select
                label="Mês"
                value={form.mes}
                onChange={(e) => setForm((p) => ({ ...p, mes: e.target.value }))}
                fullWidth
                required
              >
                {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ano"
                value={form.ano}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ano: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                }
                inputMode="numeric"
                fullWidth
                required
              />
            </Stack>

            <DatePicker
              label="Data de vencimento (opcional)"
              value={form.dataVencimento}
              onChange={(newValue) => setForm((p) => ({ ...p, dataVencimento: newValue }))}
              format="dd/MM/yyyy"
              slotProps={{ textField: { fullWidth: true } }}
            />

            {erroApi && <Alert severity="error">{erroApi}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" loading={salvando} onClick={handleClickEmitir}>
            Emitir
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <GuiaFiscalEmitirDasConfirmacaoDialog
        open={confirmOpen}
        loading={salvando}
        limite={limite}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmarEmissao}
      />
    </>
  );
}
