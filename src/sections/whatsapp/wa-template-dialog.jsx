import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { WaTemplatePicker } from './wa-template-picker';

// ----------------------------------------------------------------------
// Envio de um template (HSM) numa conversa existente — usado para (re)abrir a
// conversa fora da janela de 24h.
// ----------------------------------------------------------------------

export function WaTemplateDialog({ open, onClose, onEnviar, enviando }) {
  const [sel, setSel] = useState({ template: null, valido: false });

  const handleEnviar = useCallback(() => {
    if (sel.template) onEnviar(sel.template);
  }, [sel, onEnviar]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar template</DialogTitle>

      <DialogContent>
        <Stack sx={{ pt: 1 }}>{open && <WaTemplatePicker onChange={setSel} />}</Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleEnviar}
          loading={enviando}
          disabled={!sel.template || !sel.valido}
        >
          Enviar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
