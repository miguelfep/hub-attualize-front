'use client';

import { useState, useEffect, useMemo } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { collectPastaTreeItemIds } from '../utils';
import { ClienteDocumentoPastaTreeView } from './cliente-documento-pasta-tree-view';

// ----------------------------------------------------------------------

export function GuiaFiscalMovePastaDialog({
  open,
  onClose,
  title = 'Mover para pasta',
  folders,
  onConfirm,
  loading,
}) {
  const [pick, setPick] = useState(null);

  const expanded = useMemo(() => collectPastaTreeItemIds(folders || []), [folders]);

  useEffect(() => {
    if (open) {
      setPick(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecione a pasta de destino (deve pertencer ao mesmo cliente).
        </Typography>
        {folders?.length ? (
          <ClienteDocumentoPastaTreeView
            folders={folders}
            selectedId={pick}
            onSelect={setPick}
            defaultExpandedItems={expanded}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhuma pasta disponível.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!pick || loading} onClick={() => onConfirm(pick)}>
          Mover
        </Button>
      </DialogActions>
    </Dialog>
  );
}
