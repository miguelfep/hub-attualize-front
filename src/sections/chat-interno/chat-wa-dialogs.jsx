import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { onlyDigits } from 'src/utils/format-number';
import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { chatWaIniciar } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';

import { WaTemplatePicker } from '../whatsapp/wa-template-picker';

// ----------------------------------------------------------------------
// Ponte chat interno ↔ atendimento WhatsApp:
// Iniciar: telefone + template aprovado → POST /chat/canais/:id/wa/iniciar
// (cria a conversa no atendimento e posta o card no canal).
// ----------------------------------------------------------------------

export function ChatWaIniciarDialog({ open, canalId, onClose, onFeito }) {
  const [telefone, setTelefone] = useState('');
  const [sel, setSel] = useState({ template: null, valido: false });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTelefone('');
    setSel({ template: null, valido: false });
  }, [open]);

  const waId = (() => {
    const e164 = normalizePhoneToE164(telefone);
    return e164 ? onlyDigits(e164) : '';
  })();

  const handleIniciar = useCallback(async () => {
    if (waId.length < 12) {
      toast.error('Informe um telefone válido (com DDD).');
      return;
    }
    if (!sel.valido || !sel.template) {
      toast.error('Selecione um template e preencha as variáveis.');
      return;
    }
    setEnviando(true);
    try {
      const res = await chatWaIniciar(canalId, { telefone: waId, template: sel.template });
      toast.success('Atendimento iniciado — card postado no canal.');
      onFeito?.(res);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Falha ao iniciar.');
    } finally {
      setEnviando(false);
    }
  }, [waId, sel, canalId, onFeito]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Iniciar atendimento WhatsApp</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Telefone (com DDD)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="41 99999-9999"
            autoFocus
          />
          {open && <WaTemplatePicker onChange={setSel} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" color="success" loading={enviando} onClick={handleIniciar}>
          Iniciar e postar no canal
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
