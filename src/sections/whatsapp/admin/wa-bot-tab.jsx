import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { getAgenteConfig, salvarAgenteConfig } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { WaBotVendas } from './wa-bot-vendas';
import { WaBotConhecimento } from './wa-bot-conhecimento';
import { WaBotResponsaveis } from './wa-bot-responsaveis';

// ----------------------------------------------------------------------
// Aba "Bot": agente de IA embarcado do atendimento. Liga/desliga, escolhe o
// provider (Claude/Gemini/OpenRouter) e o modelo, define responsáveis por
// setor, o modo vendas/SDR e instruções adicionais anexadas ao comportamento
// do agente (regras da casa, respostas padrão).
// ----------------------------------------------------------------------

const PROVIDERS = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'gemini', label: 'Gemini (Google)' },
  { value: 'openrouter', label: 'OpenRouter (vários modelos)' },
];

const ENV_POR_PROVIDER = {
  claude: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
};

export function WaBotTab() {
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [habilitado, setHabilitado] = useState(false);
  const [provider, setProvider] = useState('claude');
  const [modelo, setModelo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [responsaveis, setResponsaveis] = useState({});
  const [vendas, setVendas] = useState({ habilitado: false, servicos: [] });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await getAgenteConfig();
      setConfig(res || {});
      setHabilitado(Boolean(res?.habilitado));
      setProvider(res?.provider || 'claude');
      setModelo(res?.modelo || '');
      setInstrucoes(res?.instrucoes || '');
      setResponsaveis(res?.responsaveisSetor || {});
      setVendas({
        habilitado: Boolean(res?.vendas?.habilitado),
        servicos: res?.vendas?.servicos || [],
      });
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
    (provider === 'gemini' && config && !config.geminiDisponivel) ||
    (provider === 'openrouter' && config && !config.openrouterDisponivel);

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
        responsaveisSetor: responsaveis,
        vendas,
      });
      setConfig(res || {});
      toast.success('Configuração do bot salva.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
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
              A chave de API do provedor selecionado ({ENV_POR_PROVIDER[provider]}) não está
              configurada no servidor — o bot não vai responder até ela ser definida.
            </Alert>
          )}

          <Divider />

          <WaBotResponsaveis
            value={responsaveis}
            onChange={setResponsaveis}
            setores={config?.setoresDisponiveis}
          />

          <Divider />

          <WaBotVendas value={vendas} onChange={setVendas} />

          <Divider />

          <WaBotConhecimento />

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
