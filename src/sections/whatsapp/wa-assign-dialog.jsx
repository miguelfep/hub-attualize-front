import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getSetores } from 'src/actions/setores';
import { getUsersInternos } from 'src/actions/users';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------
// Dialog reutilizável para Atribuir (modo="atribuir") e Transferir
// (modo="transferir"). Atribuir usa PATCH …/atribuir; transferir usa
// POST …/transferir e aceita um motivo (auditável).
// ----------------------------------------------------------------------

const idOf = (v) => (v && typeof v === 'object' ? v._id || v.id : v);

export function WaAssignDialog({ open, onClose, conversa, modo = 'atribuir', onConfirmar, salvando }) {
  const transferir = modo === 'transferir';

  const [setoresOpts, setSetoresOpts] = useState([]);
  const [usuariosOpts, setUsuariosOpts] = useState([]);

  const [setores, setSetores] = useState([]);
  const [atendente, setAtendente] = useState(null);
  const [motivo, setMotivo] = useState('');

  // Carrega opções ao abrir.
  useEffect(() => {
    if (!open) return;
    getSetores()
      .then(setSetoresOpts)
      .catch(() => setSetoresOpts([]));
    getUsersInternos()
      .then((res) => setUsuariosOpts(Array.isArray(res) ? res : res?.data || res?.usuarios || []))
      .catch(() => setUsuariosOpts([]));
  }, [open]);

  // Pré-preenche com o estado atual da conversa (só ao abrir).
  useEffect(() => {
    if (!open) return;
    setMotivo('');
    if (transferir) {
      setSetores([]);
      setAtendente(null);
    } else {
      setSetores(conversa?.setores || []);
      setAtendente(conversa?.atendente || null);
    }
  }, [open, transferir, conversa]);

  const handleConfirmar = () => {
    const payload = {};
    if (setores.length) payload.setores = setores.map((s) => (typeof s === 'string' ? s : s.slug));
    if (atendente) payload.atendente = idOf(atendente);
    if (transferir && motivo.trim()) payload.motivo = motivo.trim();

    if (!payload.setores && !payload.atendente) {
      toast.error('Informe ao menos um setor ou atendente.');
      return;
    }
    onConfirmar(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{transferir ? 'Transferir conversa' : 'Atribuir conversa'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Autocomplete
            multiple
            options={setoresOpts}
            value={setores}
            onChange={(_, v) => setSetores(v)}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.nome || o.slug)}
            isOptionEqualToValue={(o, v) =>
              (typeof o === 'string' ? o : o.slug) === (typeof v === 'string' ? v : v.slug)
            }
            renderInput={(params) => (
              <TextField {...params} label="Setores" placeholder="Selecione…" />
            )}
          />

          <Autocomplete
            options={usuariosOpts}
            value={atendente}
            onChange={(_, v) => setAtendente(v)}
            getOptionLabel={(o) => o?.name || o?.email || ''}
            isOptionEqualToValue={(o, v) => idOf(o) === idOf(v)}
            renderInput={(params) => (
              <TextField {...params} label="Atendente" placeholder="Selecione…" />
            )}
          />

          {transferir && (
            <TextField
              label="Motivo (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              multiline
              minRows={2}
              placeholder="Ex.: assunto contábil"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" onClick={handleConfirmar} loading={salvando}>
          {transferir ? 'Transferir' : 'Atribuir'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
