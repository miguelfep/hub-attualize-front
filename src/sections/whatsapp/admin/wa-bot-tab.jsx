import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { getAgenteConfig, salvarAgenteConfig } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Aba "Bot": agente de IA embarcado do atendimento. Liga/desliga, escolhe o
// provider (Claude/Gemini) e o modelo, e permite instruções adicionais que são
// anexadas ao comportamento do agente (regras da casa, respostas padrão).
// ----------------------------------------------------------------------

const PROVIDERS = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'gemini', label: 'Gemini (Google)' },
];

export function WaBotTab() {
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [habilitado, setHabilitado] = useState(false);
  const [provider, setProvider] = useState('claude');
  const [modelo, setModelo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [conhecimento, setConhecimento] = useState([]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await getAgenteConfig();
      setConfig(res || {});
      setHabilitado(Boolean(res?.habilitado));
      setProvider(res?.provider || 'claude');
      setModelo(res?.modelo || '');
      setInstrucoes(res?.instrucoes || '');
      setConhecimento(res?.conhecimento || []);
    } catch (error) {
      toast.error(error?.message || 'Falha ao carregar a configuração do bot.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const providerSemChave =
    (provider === 'claude' && config && !config.claudeDisponivel) ||
    (provider === 'gemini' && config && !config.geminiDisponivel);

  const modelosSugeridos = config?.modelosSugeridos?.[provider] || [];

  const handleTrocarProvider = (novo) => {
    setProvider(novo);
    // Ao trocar de provider, sugere o modelo padrão dele.
    const sugeridos = config?.modelosSugeridos?.[novo] || [];
    setModelo(sugeridos[0] || '');
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const res = await salvarAgenteConfig({
        habilitado,
        provider,
        modelo: modelo.trim(),
        instrucoes,
        conhecimento: conhecimento.filter((c) => c.pergunta?.trim() && c.resposta?.trim()),
      });
      setConfig(res || {});
      toast.success('Configuração do bot salva.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const atualizarItem = (index, patch) => {
    setConhecimento((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const removerItem = (index) => {
    setConhecimento((prev) => prev.filter((_, i) => i !== index));
  };

  const adicionarItem = () => {
    setConhecimento((prev) => [...prev, { pergunta: '', resposta: '', ativo: true }]);
  };

  if (carregando) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={26} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Bot de atendimento (IA)</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          O bot responde automaticamente as conversas que ainda não têm atendente: identifica o
          cliente pelo número do WhatsApp, envia guias e boletos, consulta pagamentos e transfere
          para a equipe quando não resolve (vira tarefa no setor escolhido).
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <FormControlLabel
            control={
              <Switch checked={habilitado} onChange={(e) => setHabilitado(e.target.checked)} />
            }
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">
                  {habilitado ? 'Bot ligado' : 'Bot desligado'}
                </Typography>
                <Iconify
                  icon={habilitado ? 'solar:bolt-bold' : 'solar:moon-bold'}
                  sx={{ color: habilitado ? 'success.main' : 'text.disabled' }}
                />
              </Stack>
            }
          />

          {habilitado && (
            <Alert severity="info" variant="outlined">
              O bot só responde conversas <b>sem atendente atribuído</b>. Assim que alguém do time
              assume (ou o bot transfere), ele para de responder naquela conversa.
            </Alert>
          )}

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Provedor de IA"
              value={provider}
              onChange={(e) => handleTrocarProvider(e.target.value)}
              sx={{ minWidth: 240 }}
            >
              {PROVIDERS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              freeSolo
              options={modelosSugeridos}
              value={modelo}
              onInputChange={(_, v) => setModelo(v || '')}
              sx={{ minWidth: 280, flexGrow: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Modelo"
                  placeholder={modelosSugeridos[0] || ''}
                  helperText="Deixe em branco para usar o modelo padrão do provedor."
                />
              )}
            />
          </Stack>

          {providerSemChave && (
            <Alert severity="warning" variant="outlined">
              A chave de API do provedor selecionado (
              {provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY'}) não está
              configurada no servidor — o bot não vai responder até ela ser definida.
            </Alert>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2">Base de conhecimento (perguntas e respostas)</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              O bot usa estas respostas quando a pergunta do cliente corresponder. Desative um item
              para pausá-lo sem apagar.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {conhecimento.map((item, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      fullWidth
                      size="small"
                      label={`Pergunta ${index + 1}`}
                      value={item.pergunta}
                      onChange={(e) => atualizarItem(index, { pergunta: e.target.value })}
                      placeholder="Ex.: Vocês atendem MEI?"
                    />
                    <Switch
                      checked={item.ativo !== false}
                      onChange={(e) => atualizarItem(index, { ativo: e.target.checked })}
                      title={item.ativo !== false ? 'Ativa' : 'Pausada'}
                    />
                    <IconButton color="error" onClick={() => removerItem(index)} title="Remover">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Resposta"
                    value={item.resposta}
                    onChange={(e) => atualizarItem(index, { resposta: e.target.value })}
                    placeholder="A resposta completa que o bot deve dar."
                  />
                </Stack>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={adicionarItem}
              sx={{ alignSelf: 'flex-start' }}
            >
              Adicionar pergunta
            </Button>
          </Stack>

          <Divider />

          <TextField
            label="Instruções adicionais"
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            multiline
            minRows={5}
            maxRows={16}
            placeholder={
              'Regras e respostas da Attualize que o bot deve seguir. Ex.:\n' +
              '- Emitimos guias até o dia 18; após isso, orientar a falar com o fiscal.\n' +
              'P: Vocês atendem MEI?\nR: Sim! Temos plano específico para MEI...'
            }
            helperText="Anexadas ao comportamento do bot em toda conversa. Aqui entram perguntas e respostas frequentes, regras internas e o tom de voz."
          />

          <Stack direction="row" spacing={1.5}>
            <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
              Salvar
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
