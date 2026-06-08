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
 * Diálogo de ações em massa nas tarefas selecionadas: reatribuir responsável
 * e/ou definir setores. Cada ação é opcional, mas ao menos uma deve ser marcada.
 * Os loops (uma chamada por tarefa) ficam no componente pai.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {number}   props.quantidade  nº de tarefas selecionadas
 * @param {Array}    props.usuarios    internos p/ novo responsável
 * @param {Array}    props.setores     setores ativos ({ _id, nome, slug })
 * @param {boolean}  props.salvando
 * @param {(acoes: { responsavelId?: string, setores?: string[] }) => void} props.onConfirm
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

  useEffect(() => {
    if (open) {
      setAplicarResponsavel(false);
      setResponsavel(null);
      setAplicarSetores(false);
      setSetoresSel([]);
    }
  }, [open]);

  const handleClose = () => {
    if (salvando) return;
    onClose();
  };

  const responsavelOk = !aplicarResponsavel || Boolean(responsavel);
  const podeConfirmar = (aplicarResponsavel || aplicarSetores) && responsavelOk;

  const handleConfirmar = () => {
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={salvando}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={salvando}
          disabled={!podeConfirmar}
          onClick={handleConfirmar}
        >
          Aplicar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
