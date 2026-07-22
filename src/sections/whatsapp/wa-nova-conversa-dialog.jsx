import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { onlyDigits } from 'src/utils/format-number';
import { normalizePhoneToE164 } from 'src/utils/phone-e164';
import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';
import { getCanais, iniciarConversa } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { WaTemplatePicker } from './wa-template-picker';

// ----------------------------------------------------------------------
// Inicia uma conversa nova: escolhe um cliente (ou digita um telefone) e envia
// um template aprovado. POST /wa/iniciar → { conversa, mensagem }.
//
// O WhatsApp identifica o contato pelo telefone em dígitos com DDI (ex.:
// "5541999999999"), então normalizamos para E.164 e removemos o "+".
// ----------------------------------------------------------------------

/** Telefone (dígitos com DDI) a partir de um valor livre; '' se inválido. */
function telefoneWaId(valor) {
  const e164 = normalizePhoneToE164(valor);
  return e164 ? onlyDigits(e164) : '';
}

export function WaNovaConversaDialog({ open, onClose, onIniciada }) {
  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [sel, setSel] = useState({ template: null, valido: false });
  const [enviando, setEnviando] = useState(false);

  // Canais (números). Só mostra o seletor quando há mais de um.
  const [canais, setCanais] = useState([]);
  const [canalId, setCanalId] = useState('');

  // Carrega clientes e canais ao abrir.
  useEffect(() => {
    if (!open) return;
    setCarregandoClientes(true);
    getClientes({ status: true, tipoContato: 'cliente' })
      .then((res) => setClientes(Array.isArray(res) ? res : res?.clientes || []))
      .catch(() => toast.error('Erro ao carregar clientes'))
      .finally(() => setCarregandoClientes(false));

    getCanais()
      .then((lista) => {
        const ativos = lista.filter((c) => c.ativo !== false);
        setCanais(ativos);
        const padrao = ativos.find((c) => c.padrao) || ativos[0];
        setCanalId(padrao?._id || '');
      })
      .catch(() => setCanais([]));
  }, [open]);

  // Reset ao abrir/fechar.
  useEffect(() => {
    if (!open) return;
    setCliente(null);
    setTelefone('');
    setSel({ template: null, valido: false });
  }, [open]);

  // Ao escolher um cliente, pré-preenche o telefone com o WhatsApp dele.
  const handleCliente = useCallback((_, v) => {
    setCliente(v);
    if (v?.whatsapp) setTelefone(v.whatsapp);
  }, []);

  const waId = telefoneWaId(telefone);
  const telefoneValido = waId.length >= 12; // DDI + DDD + número

  const handleIniciar = useCallback(async () => {
    if (!telefoneValido) {
      toast.error('Informe um telefone válido (com DDD).');
      return;
    }
    if (!sel.template || !sel.valido) {
      toast.error('Selecione um template e preencha as variáveis.');
      return;
    }
    setEnviando(true);
    try {
      const res = await iniciarConversa({
        telefone: waId,
        cliente: cliente?._id || undefined,
        canalId: canalId || undefined,
        template: sel.template,
      });
      toast.success('Conversa iniciada.');
      onIniciada?.(res?.conversa || res);
      onClose();
    } catch (error) {
      if (error?.status === 403) {
        toast.error('Contato bloqueado — não é possível enviar mensagens.');
      } else {
        toast.error(error?.message || 'Não foi possível iniciar a conversa.');
      }
    } finally {
      setEnviando(false);
    }
  }, [telefoneValido, waId, cliente, canalId, sel, onIniciada, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova conversa</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {canais.length > 1 && (
            <TextField
              select
              label="Canal (número de envio)"
              value={canalId}
              onChange={(e) => setCanalId(e.target.value)}
            >
              {canais.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nome}
                  {c.phoneDisplay ? ` — ${c.phoneDisplay}` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Autocomplete
            options={clientes}
            value={cliente}
            onChange={handleCliente}
            loading={carregandoClientes}
            getOptionLabel={(o) => formatClienteCodigoRazao(o) || o?.razaoSocial || o?.nome || ''}
            isOptionEqualToValue={(o, v) => o?._id === v?._id}
            renderInput={(params) => (
              <TextField {...params} label="Cliente (opcional)" placeholder="Buscar cliente…" />
            )}
            noOptionsText="Nenhum cliente"
          />

          <TextField
            label="Telefone (com DDD)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(41) 99999-9999"
            error={!!telefone && !telefoneValido}
            helperText={
              telefone && !telefoneValido
                ? 'Telefone inválido'
                : waId
                  ? `Será enviado para: ${waId}`
                  : 'Preencha ou escolha um cliente'
            }
            InputProps={{
              startAdornment: (
                <Iconify icon="ic:baseline-whatsapp" sx={{ mr: 1, color: 'success.main' }} />
              ),
            }}
          />

          <Divider />

          <Typography variant="subtitle2">Template aprovado</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1.5 }}>
            Conversas iniciadas pela empresa só podem começar com um template (regra da Meta).
          </Typography>

          {open && <WaTemplatePicker onChange={setSel} />}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          startIcon={<Iconify icon="solar:plain-bold" />}
          onClick={handleIniciar}
          loading={enviando}
          disabled={!telefoneValido || !sel.template || !sel.valido}
        >
          Iniciar conversa
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
