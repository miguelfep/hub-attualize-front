import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { getConfig, salvarConfig, testarConfig } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Configuração global da API oficial. Os segredos (verifyToken/appSecret) são
// write-only: a leitura só informa se estão definidos; o campo fica em branco e
// só é enviado quando o admin digita um novo valor.
// ----------------------------------------------------------------------

export function WaConfigTab() {
  const { copy } = useCopyToClipboard();

  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);

  const [graphApiVersion, setGraphApiVersion] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [mostrarSegredos, setMostrarSegredos] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await getConfig();
      setConfig(res || {});
      setGraphApiVersion(res?.graphApiVersion || '');
      setVerifyToken('');
      setAppSecret('');
    } catch (error) {
      toast.error(error?.message || 'Falha ao carregar a configuração.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async () => {
    const payload = { graphApiVersion: graphApiVersion.trim() || undefined };
    if (verifyToken.trim()) payload.verifyToken = verifyToken.trim();
    if (appSecret.trim()) payload.appSecret = appSecret.trim();

    setSalvando(true);
    try {
      await salvarConfig(payload);
      toast.success('Configuração salva.');
      carregar();
    } catch (error) {
      toast.error(error?.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleTestar = async () => {
    setTestando(true);
    try {
      const res = await testarConfig();
      if (res?.ok === false) toast.error(res?.message || 'Conexão falhou.');
      else toast.success('Conexão OK com a Meta.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao testar.');
    } finally {
      setTestando(false);
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
        <Typography variant="h6">Configuração da API oficial</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Parâmetros globais da integração. As credenciais de cada número ficam no canal
          correspondente.
        </Typography>
      </Box>

      {/* Webhook (read-only, para configurar no painel da Meta) */}
      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Webhook (configure no App da Meta)
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Callback URL"
            value={config?.webhookUrl || '—'}
            InputProps={{
              readOnly: true,
              endAdornment: config?.webhookUrl ? (
                <InputAdornment position="end">
                  <Tooltip title="Copiar">
                    <IconButton onClick={() => copy(config.webhookUrl)} edge="end">
                      <Iconify icon="solar:copy-bold" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            }}
          />
          <Alert severity="info" variant="outlined">
            O <b>Verify Token</b> abaixo precisa ser o mesmo cadastrado no webhook do App da Meta.
          </Alert>
        </Stack>
      </Card>

      {/* Parâmetros editáveis */}
      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Versão da Graph API"
            value={graphApiVersion}
            onChange={(e) => setGraphApiVersion(e.target.value)}
            placeholder="v21.0"
            sx={{ maxWidth: 240 }}
          />

          <Divider />
          <Typography variant="subtitle2">Segredos</Typography>

          <TextField
            label="Verify Token"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            type={mostrarSegredos ? 'text' : 'password'}
            placeholder={config?.verifyTokenDefinido ? '•••••• (definido)' : 'Defina um valor'}
            helperText={
              config?.verifyTokenDefinido ? 'Deixe em branco para manter o atual.' : undefined
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMostrarSegredos((v) => !v)} edge="end">
                    <Iconify icon={mostrarSegredos ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="App Secret"
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            type={mostrarSegredos ? 'text' : 'password'}
            placeholder={config?.appSecretDefinido ? '•••••• (definido)' : 'Defina um valor'}
            helperText={
              config?.appSecretDefinido ? 'Deixe em branco para manter o atual.' : undefined
            }
          />

          <Stack direction="row" spacing={1.5}>
            <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
              Salvar
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              loading={testando}
              startIcon={<Iconify icon="solar:test-tube-bold" />}
              onClick={handleTestar}
            >
              Testar conexão
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
