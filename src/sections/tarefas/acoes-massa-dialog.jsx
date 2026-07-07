'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { setorNome } from './utils';

// ----------------------------------------------------------------------

/**
 * Diálogo de ações em massa nas tarefas selecionadas: reatribuir responsável,
 * definir setores ou excluir. A exclusão é exclusiva (não combina com as
 * demais) e permanente. Os loops (uma chamada por tarefa) ficam no pai.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {number}   props.quantidade  nº de tarefas selecionadas
 * @param {Array}    props.usuarios    internos p/ novo responsável
 * @param {Array}    props.setores     setores ativos ({ _id, nome, slug })
 * @param {boolean}  props.salvando
 * @param {(acoes: { responsavelId?: string, setores?: string[], excluir?: boolean }) => void} props.onConfirm
 */
export function AcoesMassaDialog({
  open,
  onClose,
  quantidade,
  usuarios = [],
  setores = [],
  salvando = false,
  onConfirm,
}) {
  const [aplicarResponsavel, setAplicarResponsavel] = useState(false);
  const [responsavel, setResponsavel] = useState(null);
  const [aplicarSetores, setAplicarSetores] = useState(false);
  const [setoresSel, setSetoresSel] = useState([]);
  const [aplicarExcluir, setAplicarExcluir] = useState(false);

  useEffect(() => {
    if (open) {
      setAplicarResponsavel(false);
      setResponsavel(null);
      setAplicarSetores(false);
      setSetoresSel([]);
      setAplicarExcluir(false);
    }
  }, [open]);

  const handleClose = () => {
    if (salvando) return;
    onClose();
  };

  // A exclusão é exclusiva: marcar desliga as demais ações.
  const handleToggleExcluir = (checked) => {
    setAplicarExcluir(checked);
    if (checked) {
      setAplicarResponsavel(false);
      setResponsavel(null);
      setAplicarSetores(false);
      setSetoresSel([]);
    }
  };

  const responsavelOk = !aplicarResponsavel || Boolean(responsavel);
  const podeConfirmar =
    aplicarExcluir || ((aplicarResponsavel || aplicarSetores) && responsavelOk);

  const handleConfirmar = () => {
    if (aplicarExcluir) {
      onConfirm({ excluir: true });
      return;
    }
    onConfirm({
      responsavelId: aplicarResponsavel ? responsavel?._id : undefined,
      setores: aplicarSetores ? setoresSel : undefined,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Ações em massa — {quantidade} tarefa(s)</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Alert severity="info">
            As alterações marcadas serão aplicadas às {quantidade} tarefa(s) selecionada(s).
          </Alert>

          {/* Reatribuir */}
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aplicarResponsavel}
                  disabled={aplicarExcluir}
                  onChange={(e) => setAplicarResponsavel(e.target.checked)}
                />
              }
              label="Reatribuir responsável"
            />
            <Autocomplete
              options={usuarios}
              value={responsavel}
              disabled={!aplicarResponsavel}
              getOptionLabel={(o) => o?.name || o?.email || ''}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              onChange={(_, value) => setResponsavel(value)}
              renderInput={(params) => <TextField {...params} label="Novo responsável" />}
            />
          </Stack>

          {/* Definir setores */}
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aplicarSetores}
                  disabled={aplicarExcluir}
                  onChange={(e) => setAplicarSetores(e.target.checked)}
                />
              }
              label="Definir setores"
            />
            <Autocomplete
              multiple
              options={setores.map((s) => s.slug)}
              value={setoresSel}
              disabled={!aplicarSetores}
              getOptionLabel={(slug) => setorNome(slug, setores)}
              onChange={(_, value) => setSetoresSel(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Setores"
                  helperText="Substitui os setores das tarefas (vazio = remover todos)."
                />
              )}
            />
          </Stack>

          {/* Excluir (somente admin/gerencial — exclusão permanente) */}
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  color="error"
                  checked={aplicarExcluir}
                  onChange={(e) => handleToggleExcluir(e.target.checked)}
                />
              }
              label="Excluir tarefas"
            />
            {aplicarExcluir && (
              <Alert severity="error">
                As {quantidade} tarefa(s) selecionada(s) serão excluídas permanentemente,
                incluindo comentários, anexos e checklist. Essa ação não pode ser desfeita.
              </Alert>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={salvando}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color={aplicarExcluir ? 'error' : 'primary'}
          loading={salvando}
          disabled={!podeConfirmar}
          onClick={handleConfirmar}
        >
          {aplicarExcluir ? `Excluir ${quantidade} tarefa(s)` : 'Aplicar'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
