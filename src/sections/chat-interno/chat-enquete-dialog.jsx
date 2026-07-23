import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { criarEnqueteChat } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Criação de enquete simples: pergunta + 2 a 10 opções. 1 voto por pessoa
// (toggle/troca). O resultado aparece ao vivo na mensagem para todos.
// ----------------------------------------------------------------------

export function ChatEnqueteDialog({ open, canalId, onClose, onCriada }) {
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPergunta('');
    setOpcoes(['', '']);
  }, [open]);

  const setOpcao = (idx, valor) =>
    setOpcoes((prev) => prev.map((o, i) => (i === idx ? valor : o)));

  const handleCriar = useCallback(async () => {
    const limpas = opcoes.map((o) => o.trim()).filter(Boolean);
    if (!pergunta.trim() || limpas.length < 2) {
      toast.error('Informe a pergunta e pelo menos 2 opções.');
      return;
    }
    setSalvando(true);
    try {
      const msg = await criarEnqueteChat(canalId, { pergunta: pergunta.trim(), opcoes: limpas });
      onCriada?.(msg);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha ao criar a enquete.');
    } finally {
      setSalvando(false);
    }
  }, [pergunta, opcoes, canalId, onCriada]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova enquete</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Pergunta"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            autoFocus
          />

          {opcoes.map((opcao, idx) => (
            <Stack key={idx} direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label={`Opção ${idx + 1}`}
                value={opcao}
                onChange={(e) => setOpcao(idx, e.target.value)}
              />
              {opcoes.length > 2 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setOpcoes((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
              )}
            </Stack>
          ))}

          {opcoes.length < 10 && (
            <Button
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setOpcoes((prev) => [...prev, ''])}
              sx={{ alignSelf: 'flex-start' }}
            >
              Adicionar opção
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} onClick={handleCriar}>
          Criar enquete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
