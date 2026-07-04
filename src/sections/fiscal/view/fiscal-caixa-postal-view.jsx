'use client';

import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  sincronizarCaixaPostal,
  useGetCaixaPostalDetalhe,
  useGetCaixaPostalMensagens,
} from 'src/actions/caixa-postal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const FILTROS = [
  { value: '0', label: 'Todas' },
  { value: '2', label: 'Não lidas' },
  { value: '1', label: 'Lidas' },
];

function apiErrMsg(err) {
  if (!err) return '';
  return err.response?.data?.message || err.message || 'Erro ao carregar mensagens';
}

function isApiUnavailable(err) {
  const status = err?.response?.status;
  return status === 404 || status === 501;
}

const corpoMensagemSx = {
  lineHeight: 1.7,
  color: 'text.primary',
  wordBreak: 'break-word',
  '& p': { mb: 1.5, '&:last-child': { mb: 0 } },
  '& a': { color: 'primary.main', textDecoration: 'underline' },
  '& u': { textDecoration: 'underline' },
};

// ----------------------------------------------------------------------

export function FiscalCaixaPostalView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const clienteParam = searchParams.get('cliente') || '';
  const isnParam = searchParams.get('isn') || '';

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [filtroLeitura, setFiltroLeitura] = useState('0');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingClientes(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        if (!cancelled) setClientes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setClientes([]);
      } finally {
        if (!cancelled) setLoadingClientes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCliente = useMemo(
    () => clientes.find((c) => c._id === clienteParam) ?? null,
    [clientes, clienteParam]
  );

  const {
    mensagens,
    meta,
    isLoading: loadingMensagens,
    error: mensagensError,
    mutate: mutateMensagens,
  } = useGetCaixaPostalMensagens(clienteParam, { statusLeitura: filtroLeitura });

  const {
    mensagem: detalhe,
    isLoading: loadingDetalhe,
    error: detalheError,
  } = useGetCaixaPostalDetalhe(clienteParam, isnParam);

  const novasCount = meta?.quantidadeNaoLidas ?? 0;

  const ultimaSyncLabel = useMemo(() => {
    if (!meta?.ultimaSincronizacaoEm) return 'Nunca sincronizado';
    const parsed = dayjs(meta.ultimaSincronizacaoEm);
    return parsed.isValid()
      ? `Última sincronização: ${parsed.format('DD/MM/YYYY HH:mm')}`
      : 'Nunca sincronizado';
  }, [meta?.ultimaSincronizacaoEm]);

  const corpoHtml = detalhe?.corpoFormatado || detalhe?.corpoModelo || '';

  const handleClienteChange = useCallback(
    (_, value) => {
      const id = value?._id || '';
      const params = new URLSearchParams();
      if (id) params.set('cliente', id);
      const qs = params.toString();
      router.replace(
        qs ? `${paths.dashboard.fiscal.caixaPostal}?${qs}` : paths.dashboard.fiscal.caixaPostal
      );
    },
    [router]
  );

  const handleSelectMensagem = useCallback(
    (isn) => {
      const params = new URLSearchParams(searchParams.toString());
      if (clienteParam) params.set('cliente', clienteParam);
      if (isn) params.set('isn', isn);
      else params.delete('isn');
      router.replace(`${paths.dashboard.fiscal.caixaPostal}?${params.toString()}`);
    },
    [router, searchParams, clienteParam]
  );

  const handleSincronizar = async () => {
    if (!clienteParam) return;
    setSyncing(true);
    try {
      await sincronizarCaixaPostal(clienteParam);
      toast.success('Caixa postal sincronizada.');
      await mutateMensagens();
    } catch (err) {
      if (isApiUnavailable(err)) {
        toast.info('Sincronização disponível quando a API do Hub for publicada.');
      } else {
        toast.error(apiErrMsg(err) || 'Erro ao sincronizar');
      }
    } finally {
      setSyncing(false);
    }
  };

  const apiPending = mensagensError && isApiUnavailable(mensagensError);

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Caixa Postal"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Caixa Postal' },
        ]}
        action={
          <Button
            variant="outlined"
            disabled={!clienteParam || syncing}
            onClick={handleSincronizar}
            startIcon={
              syncing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="solar:refresh-circle-bold" />
              )
            }
          >
            Sincronizar
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Stack spacing={3}>
        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mensagens da Receita Federal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Integra Contador · Caixa Postal por contribuinte
                </Typography>
                {clienteParam ? (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {ultimaSyncLabel}
                  </Typography>
                ) : null}
              </Box>
              {clienteParam && novasCount > 0 ? (
                <Chip
                  color="warning"
                  variant="soft"
                  label={`${novasCount} nova(s)`}
                  icon={<Iconify icon="solar:letter-bold" />}
                />
              ) : null}
            </Stack>

            <Autocomplete
              options={clientes}
              loading={loadingClientes}
              value={selectedCliente}
              onChange={handleClienteChange}
              getOptionLabel={(option) => formatClienteCodigoRazao(option)}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" placeholder="Código ou razão social" />
              )}
            />
          </Stack>
        </Card>

        {!clienteParam ? (
          <Alert severity="info">Selecione um cliente para visualizar a caixa postal.</Alert>
        ) : null}

        {apiPending ? (
          <Alert severity="warning">
            A API de Caixa Postal ainda não está publicada no Hub. A interface já está pronta;
            quando o backend for liberado, as mensagens aparecerão aqui automaticamente.
          </Alert>
        ) : null}

        {clienteParam && mensagensError && !apiPending ? (
          <Alert severity="error">{apiErrMsg(mensagensError)}</Alert>
        ) : null}

        {clienteParam ? (
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <Tabs
              value={filtroLeitura}
              onChange={(_, value) => {
                setFiltroLeitura(value);
                handleSelectMensagem('');
              }}
              sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              {FILTROS.map((f) => (
                <Tab key={f.value} value={f.value} label={f.label} />
              ))}
            </Tabs>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{
                minHeight: 420,
                height: { md: 520 },
                maxHeight: { md: 520 },
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: { xs: 1, md: 360 },
                  flexShrink: 0,
                  borderRight: { md: 1 },
                  borderColor: 'divider',
                  overflow: 'auto',
                  minHeight: { xs: 200, md: 0 },
                  maxHeight: { xs: 280, md: 'none' },
                  height: { md: '100%' },
                }}
              >
                {loadingMensagens ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : mensagens.length === 0 ? (
                  <EmptyContent
                    filled
                    title="Nenhuma mensagem"
                    description={
                      apiPending
                        ? 'Aguardando integração com a API do Hub.'
                        : 'Nenhuma mensagem para o filtro selecionado.'
                    }
                    sx={{ py: 6 }}
                  />
                ) : (
                  <Stack divider={<Divider flexItem />}>
                    {mensagens.map((msg) => {
                      const isn = msg.isn || msg.id;
                      const selected = isnParam === isn;
                      const assunto = msg.assuntoFormatado || msg.assuntoModelo || 'Sem assunto';
                      const dataEnvio = msg.dataEnvio
                        ? dayjs(msg.dataEnvio).format('DD/MM/YYYY')
                        : msg.dataEnvio || '-';
                      const lida = msg.indicadorLeitura === true;

                      return (
                        <Box
                          key={isn}
                          onClick={() => handleSelectMensagem(isn)}
                          sx={{
                            px: 2,
                            py: 1.75,
                            cursor: 'pointer',
                            bgcolor: selected ? 'action.selected' : 'transparent',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: lida ? 500 : 700 }}
                                noWrap
                              >
                                {assunto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {msg.descricaoOrigem || 'Receita Federal'} · {dataEnvio}
                              </Typography>
                            </Box>
                            {!lida ? (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  mt: 0.75,
                                  flexShrink: 0,
                                }}
                              />
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: { xs: 280, md: 0 },
                  height: { md: '100%' },
                  overflow: 'auto',
                  p: 3,
                }}
              >
                {!isnParam ? (
                  <EmptyContent
                    title="Selecione uma mensagem"
                    description="Clique em um item da lista para ver o detalhe."
                    sx={{ py: 8 }}
                  />
                ) : loadingDetalhe ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : detalheError && !isApiUnavailable(detalheError) ? (
                  <Alert severity="error">{apiErrMsg(detalheError)}</Alert>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="h6">
                      {detalhe?.assuntoFormatado ||
                        detalhe?.assuntoModelo ||
                        'Detalhe da mensagem'}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {detalhe?.descricaoOrigem ? (
                        <Chip size="small" label={detalhe.descricaoOrigem} variant="soft" />
                      ) : null}
                      {detalhe?.numeroControle ? (
                        <Chip size="small" label={`Controle ${detalhe.numeroControle}`} variant="outlined" />
                      ) : null}
                      {detalhe?.indicadorLeitura ? (
                        <Chip size="small" color="success" label="Lida" variant="soft" />
                      ) : (
                        <Chip size="small" color="warning" label="Não lida" variant="soft" />
                      )}
                    </Stack>
                    <Divider />
                    {corpoHtml ? (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={corpoMensagemSx}
                        // HTML da Receita Federal (Integra Contador)
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: corpoHtml }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {apiPending
                          ? 'O conteúdo completo será exibido após a publicação da API.'
                          : 'Conteúdo não disponível.'}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </DashboardContent>
  );
}
