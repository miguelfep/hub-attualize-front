'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { baseUrl, endpoints } from 'src/utils/axios';

import { useGetPlanosIr, iniciarCheckout, useGetMeusPedidosIr } from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import PixCopiaCola from 'src/components/ir/PixCopiaCola';
import IrStatusBadge from 'src/components/ir/IrStatusBadge';
import BoletoLinhaDigitavel from 'src/components/ir/BoletoLinhaDigitavel';

const boletoUrl = `${baseUrl}contratos/cobrancas/faturas/`;

// ─── Metadados estáticos dos planos ──────────────────────────────────────────

const PLANO_META = {
  basica: {
    nome: 'Básica',
    destaque: false,
    inclusos: [
      'Assalariado com 1 fonte de renda',
      'Sem dependentes',
      'Até 3 bens e direitos',
      'Deduções padrão',
      'Envio à Receita Federal',
      'Suporte via WhatsApp',
    ],
    naoInclusos: ['Carnê-leão', 'Ganho de capital', 'Bolsa de valores'],
  },
  intermediaria: {
    nome: 'Intermediária',
    destaque: true,
    inclusos: [
      'Até 3 fontes de renda',
      'Até 3 dependentes',
      'Bens, aluguéis e investimentos',
      'Deduções com saúde e educação',
      'Envio à Receita Federal',
      'Suporte via WhatsApp',
    ],
    naoInclusos: ['Carnê-leão', 'Ganho de capital', 'Bolsa de valores'],
  },
  completa: {
    nome: 'Completa',
    destaque: false,
    inclusos: [
      'Profissional liberal / MEI',
      'Fontes de renda ilimitadas',
      'Dependentes ilimitados',
      'Bens e direitos ilimitados',
      'Carnê-leão incluso',
      'Ganho de capital incluso',
      'Bolsa de valores incluso',
      'Suporte prioritário',
    ],
    naoInclusos: [],
  },
};

const ANO_IR = 'IR2026';

// ─── Dialog de pagamento (para usuário autenticado) ───────────────────────────

function PaymentDialog({ open, plano, onClose, onSuccess }) {
  const theme = useTheme();
  const router = useRouter();
  const [paymentType, setPaymentType] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [activePaymentTab, setActivePaymentTab] = useState('pix');
  const pollingIntervalRef = useRef(null);

  const handleConfirm = async () => {
    if (!plano) return;
    setLoading(true);
    try {
      const result = await iniciarCheckout({
        ano: plano.ano ?? ANO_IR,
        year: plano.year ?? 2026,
        modalidade: plano.modalidade,
        ...(plano.valorFinal != null ? { valor: plano.valorFinal } : {}),
        paymentType,
      });
      const orderData = result.order || result;
      setOrder(orderData);
      setActivePaymentTab(orderData.paymentType || 'pix');
      onSuccess?.(); // apenas atualiza a lista, sem redirecionar
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message;
      toast.error(msg || 'Erro ao gerar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    clearInterval(pollingIntervalRef.current);
    onClose();
    setTimeout(() => { setOrder(null); setPaymentType('pix'); setActivePaymentTab('pix'); }, 300);
  };

  // ─── Polling de pagamento (autenticado) ───────────────────────────────────
  useEffect(() => {
    if (!order?._id) return undefined;
    const needsPolling =
      (order.paymentType === 'pix' && !order.pixCopiaECola) ||
      (order.paymentType === 'boleto' && !order.linhaDigitavel);
    if (!needsPolling) return undefined;

    let attempts = 0;
    const intervalMs = order.paymentType === 'pix' ? 3000 : 5000;

    pollingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      if (attempts < 10) {
        try {
          const res = await axiosInstance.get(endpoints.ir.order(order._id));
          const updated = res.data?.order || res.data;
          const hasData =
            (order.paymentType === 'pix' && updated.pixCopiaECola) ||
            (order.paymentType === 'boleto' && updated.linhaDigitavel);
          if (hasData) {
            setOrder((prev) => ({ ...prev, ...updated }));
            clearInterval(pollingIntervalRef.current);
          }
        } catch {
          // continuar tentando
        }
      } else {
        clearInterval(pollingIntervalRef.current);
      }
    }, intervalMs);

    return () => clearInterval(pollingIntervalRef.current);
  }, [order?._id, order?.paymentType]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = plano ? (PLANO_META[plano.modalidade] ?? { nome: plano.modalidade }) : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={order ? 'md' : 'xs'}
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Cabeçalho */}
      <Box
        sx={{
          px: 3, pt: 3, pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'common.white' }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          {order ? 'Pagamento gerado!' : `Contratar ${meta?.nome}`}
        </Typography>
        {plano && !order && (
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            IR 2026{plano.valorFinal != null ? ` — R$ ${plano.valorFinal.toFixed(2).replace('.', ',')}` : ''}
          </Typography>
        )}
        {order && (
          <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
            {order.valor && (
              <Chip
                label={`R$ ${Number(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
              />
            )}
            {order.modalidade && (
              <Chip
                label={{ basica: 'IR Básica', intermediaria: 'IR Intermediária', completa: 'IR Completa' }[order.modalidade] ?? order.modalidade}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)' }}
              />
            )}
          </Stack>
        )}
      </Box>

      <DialogContent sx={{ pt: 3 }}>

        {/* ── Seleção de forma de pagamento ── */}
        {!order && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Como você prefere pagar?
            </Typography>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {[
                { value: 'pix', label: 'PIX', icon: 'eva:flash-fill', desc: 'Aprovação imediata' },
                { value: 'boleto', label: 'Boleto', icon: 'eva:file-text-outline', desc: 'Vence em 3 dias úteis' },
                { value: 'credit_card', label: 'Cartão', icon: 'eva:credit-card-outline', desc: 'Parcelado (em breve)', emBreve: true },
              ].map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => !opt.emBreve && setPaymentType(opt.value)}
                  sx={{
                    flex: 1, minWidth: 120, p: 2, border: '2px solid', borderRadius: 1.5,
                    cursor: opt.emBreve ? 'not-allowed' : 'pointer',
                    opacity: opt.emBreve ? 0.7 : 1,
                    borderColor: paymentType === opt.value ? 'primary.main' : 'divider',
                    bgcolor: paymentType === opt.value ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={opt.icon} width={22} color={paymentType === opt.value ? 'primary.main' : 'text.secondary'} />
                    <Box>
                      <Typography variant="body2" fontWeight={paymentType === opt.value ? 700 : 400}>{opt.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
              <Button variant="outlined" onClick={handleClose} disabled={loading}>Cancelar</Button>
              <LoadingButton
                variant="contained"
                loading={loading}
                onClick={handleConfirm}
                endIcon={<Iconify icon="eva:flash-fill" />}
              >
                Gerar pagamento
              </LoadingButton>
            </Stack>
          </Stack>
        )}

        {/* ── Tela de pagamento ── */}
        {order && (
          <Stack spacing={3}>

            {/* Tabs de método (exibidas somente quando o alternativo também está disponível) */}
            {((activePaymentTab === 'pix' && order.linhaDigitavel) ||
              (activePaymentTab === 'boleto' && order.pixCopiaECola)) && (
              <Tabs
                value={activePaymentTab}
                onChange={(_, v) => setActivePaymentTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  value="pix"
                  label="PIX"
                  icon={<Iconify icon="eva:flash-fill" width={16} />}
                  iconPosition="start"
                />
                <Tab
                  value="boleto"
                  label="Boleto"
                  icon={<Iconify icon="eva:file-text-outline" width={16} />}
                  iconPosition="start"
                />
              </Tabs>
            )}

            {/* Conteúdo: PIX */}
            {activePaymentTab === 'pix' && (
              order.pixCopiaECola ? (
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    border: '2px solid', borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:flash-fill" width={20} color="primary.main" />
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
                        Pague com PIX
                      </Typography>
                      <Chip label="Imediato" color="primary" size="small" variant="soft" />
                    </Stack>

                    <Box
                      sx={{
                        p: 2, bgcolor: '#fff', borderRadius: 2,
                        border: '1px solid', borderColor: 'divider',
                        display: 'inline-flex', boxShadow: 1,
                      }}
                    >
                      <QRCodeSVG value={order.pixCopiaECola} size={190} level="M" />
                    </Box>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Abra o app do seu banco → PIX → Ler QR Code
                    </Typography>

                    <Divider flexItem>
                      <Typography variant="caption" color="text.disabled">ou copie o código</Typography>
                    </Divider>

                    <Box sx={{ width: '100%' }}>
                      <PixCopiaCola code={order.pixCopiaECola} />
                    </Box>
                  </Stack>
                </Box>
              ) : (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  <Typography variant="body2">Gerando código PIX…</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Você também receberá o código por WhatsApp.
                  </Typography>
                </Alert>
              )
            )}

            {/* Conteúdo: Boleto */}
            {activePaymentTab === 'boleto' && (
              order.linhaDigitavel ? (
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    border: '2px solid', borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:file-text-outline" width={20} color="primary.main" />
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
                        Pague com Boleto
                      </Typography>
                      <Chip label="Vence em 3 dias úteis" size="small" variant="soft" />
                    </Stack>

                    <BoletoLinhaDigitavel code={order.linhaDigitavel} />

                    {order.codigoSolicitacao && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<Iconify icon="eva:download-outline" />}
                        href={`${boletoUrl}${order.codigoSolicitacao}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Baixar boleto PDF
                      </Button>
                    )}

                    <Typography variant="caption" color="text.disabled" textAlign="center">
                      Vencimento em até 3 dias úteis
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  <Typography variant="body2">Gerando boleto…</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Você também receberá os dados por WhatsApp.
                  </Typography>
                </Alert>
              )
            )}

            <Alert severity="info" icon={<Iconify icon="eva:message-circle-outline" />}>
              Após o pagamento você receberá o link para envio de documentos por WhatsApp e e-mail.
            </Alert>

            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" fullWidth onClick={handleClose}>Fechar</Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Iconify icon="eva:external-link-fill" />}
                onClick={() => { handleClose(); router.push(paths.cliente.impostoRenda.pedido(order._id)); }}
              >
                Ver meu pedido
              </Button>
            </Stack>

          </Stack>
        )}

      </DialogContent>
    </Dialog>
  );
}

// ─── View principal ───────────────────────────────────────────────────────────

export default function IrCheckoutView() {
  const theme = useTheme();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const { data: planosApiRaw, isLoading: loadingPlanos } = useGetPlanosIr();

  const PLANOS_FALLBACK = [
    { _id: 'basica', modalidade: 'basica', titulo: 'IR Básica', descricao: 'Ideal para assalariados com uma fonte de renda, sem bens ou investimentos.', valorCheio: 299.9, tipoDesconto: 'percentual', desconto: 33, valorFinal: 199.9, loteAtual: 1, loteDescricao: '1º Lote', dataFimLote: '2026-03-31T23:59:59.000Z', vagasRestantes: 18, disponivel: true, ano: 'IR2026', year: 2026 },
    { _id: 'intermediaria', modalidade: 'intermediaria', titulo: 'IR Intermediária', descricao: 'Para quem possui bens, aluguéis, investimentos ou mais de uma fonte de renda.', valorCheio: 449.9, tipoDesconto: 'percentual', desconto: 16, valorFinal: 379.9, loteAtual: 1, loteDescricao: '1º Lote', dataFimLote: '2026-03-31T23:59:59.000Z', vagasRestantes: 25, disponivel: true, ano: 'IR2026', year: 2026 },
    { _id: 'completa', modalidade: 'completa', titulo: 'IR Completa', descricao: 'Para profissionais liberais, MEI, múltiplas fontes de renda e situações complexas.', valorCheio: null, tipoDesconto: null, desconto: null, valorFinal: null, loteAtual: null, loteDescricao: null, dataFimLote: null, vagasRestantes: null, disponivel: false, ano: 'IR2026', year: 2026 },
  ];
  const planosApi = planosApiRaw && planosApiRaw.length > 0 ? planosApiRaw : (!loadingPlanos ? PLANOS_FALLBACK : []);
  const { data: pedidos, mutate } = useGetMeusPedidosIr();

  const pedidosAtivos = Array.isArray(pedidos)
    ? pedidos.filter((p) => p.ano === ANO_IR && p.status !== 'finalizada')
    : [];

  const handleContratar = (plano) => {
    setPlanoSelecionado(plano);
    setDialogOpen(true);
  };

  // Só atualiza a lista de pedidos — o redirect fica no botão "Ver meu pedido" do dialog
  const handleSuccess = () => {
    mutate();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Cabeçalho ── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          px: { xs: 3, md: 5 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Chip
              label="📅 Prazo final: 31/05/2026"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.2),
                color: theme.palette.warning.light,
                fontWeight: 700,
                mb: 1.5,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            />
            <Typography variant="h4" fontWeight={800}>
              Declaração de Imposto de Renda 2026
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
              Escolha o plano ideal e deixe tudo com a Attualize.
            </Typography>
          </Box>
          {pedidosAtivos.length > 0 && (
            <Button
              variant="outlined"
              sx={{ borderColor: alpha('#fff', 0.5), color: 'common.white', '&:hover': { borderColor: '#fff' } }}
              onClick={() => router.push(paths.cliente.impostoRenda.meusPedidos)}
              startIcon={<Iconify icon="eva:list-outline" />}
            >
              Ver meus pedidos
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Banner pedido ativo ── */}
      {pedidosAtivos.length > 0 && (
        <Box px={{ xs: 3, md: 5 }} pt={3}>
          {pedidosAtivos.map((pedido) => (
            <Alert
              key={pedido._id}
              severity="info"
              sx={{ mb: 1.5 }}
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => router.push(paths.cliente.impostoRenda.pedido(pedido._id))}
                >
                  Ver detalhes
                </Button>
              }
            >
              Você já tem um pedido ativo para IR 2026:{' '}
              <IrStatusBadge status={pedido.status} size="small" />
            </Alert>
          ))}
        </Box>
      )}

      {/* ── Cards de planos ── */}
      <Box px={{ xs: 3, md: 5 }} py={4}>
        <Grid container spacing={3} alignItems="stretch">
          {loadingPlanos
            ? [0, 1, 2].map((i) => (
                <Grid key={i} xs={12} md={4}>
                  <Skeleton variant="rounded" height={400} />
                </Grid>
              ))
              : planosApi.map((planoApi) => {
                const meta = PLANO_META[planoApi.modalidade] ?? { destaque: false, inclusos: [], naoInclusos: [] };
                const esgotado = !planoApi.disponivel;
                const temDesconto = planoApi.valorFinal != null && planoApi.valorCheio != null && planoApi.valorFinal < planoApi.valorCheio;
                const badgeDesconto = planoApi.tipoDesconto === 'percentual'
                  ? `${planoApi.desconto}% OFF`
                  : planoApi.tipoDesconto === 'fixo' && planoApi.desconto > 0
                    ? `R$ ${planoApi.desconto} OFF`
                    : null;

                return (
                  <Grid key={planoApi._id ?? planoApi.modalidade} xs={12} md={4}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        overflow: 'visible',
                        border: meta.destaque ? `2px solid ${theme.palette.primary.main}` : 'none',
                        boxShadow: meta.destaque ? theme.shadows[12] : theme.shadows[1],
                        opacity: esgotado ? 0.7 : 1,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': esgotado ? {} : { transform: 'translateY(-4px)', boxShadow: theme.shadows[20] },
                      }}
                    >
                      {esgotado ? (
                        <Chip label="Em breve" color="default" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                      ) : meta.destaque ? (
                        <Chip label="Mais popular" color="primary" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                      ) : badgeDesconto ? (
                        <Chip label={badgeDesconto} color="warning" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                      ) : null}

                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box mb={2}>
                          <Typography variant="h5" fontWeight={700}>{planoApi.titulo}</Typography>
                          <Typography variant="body2" color="text.secondary" mt={0.5}>
                            {planoApi.descricao}
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          {esgotado || planoApi.valorFinal == null ? (
                            <Typography variant="h6" color="text.disabled">Consulte valores</Typography>
                          ) : (
                            <>
                              {temDesconto && (
                                <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                                  R$ {planoApi.valorCheio.toFixed(2).replace('.', ',')}
                                </Typography>
                              )}
                              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">R$</Typography>
                                <Typography variant="h3" fontWeight={800} color="primary.main">
                                  {planoApi.valorFinal.toFixed(2).replace('.', ',')}
                                </Typography>
                              </Stack>
                            </>
                          )}
                          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                            {planoApi.loteDescricao && (
                              <Chip label={planoApi.loteDescricao} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
                            )}
                            {planoApi.vagasRestantes !== null && planoApi.vagasRestantes <= 10 && planoApi.vagasRestantes > 0 && (
                              <Chip label={`${planoApi.vagasRestantes} vagas`} size="small" color="warning" sx={{ fontSize: 10, fontWeight: 700 }} />
                            )}
                            {planoApi.dataFimLote && !esgotado && (
                              <Typography variant="caption" color="text.secondary">
                                até {new Date(planoApi.dataFimLote).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={1} flex={1} mb={3}>
                          {meta.inclusos.map((item) => (
                            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                              <Iconify icon="eva:checkmark-circle-2-fill" width={16} color="success.main" sx={{ mt: 0.3, flexShrink: 0 }} />
                              <Typography variant="body2">{item}</Typography>
                            </Stack>
                          ))}
                          {meta.naoInclusos.map((item) => (
                            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                              <Iconify icon="eva:close-circle-outline" width={16} color="text.disabled" sx={{ mt: 0.3, flexShrink: 0 }} />
                              <Typography variant="body2" color="text.disabled">{item}</Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          variant={meta.destaque ? 'contained' : 'outlined'}
                          fullWidth
                          size="large"
                          disabled={esgotado}
                          onClick={() => handleContratar(planoApi)}
                          endIcon={<Iconify icon={esgotado ? 'eva:clock-outline' : 'eva:arrow-forward-fill'} />}
                        >
                          {esgotado ? 'Em breve' : 'Contratar'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>

        {/* Adicionais */}
        <Box mt={5} p={3} sx={{ bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Precisa de algo a mais?
          </Typography>
          <Grid container spacing={2}>
            {[
              { nome: 'Carnê-Leão', valor: 'a partir de R$ 300', icon: 'solar:leaf-bold-duotone' },
              { nome: 'Ganho de Capital', valor: 'a partir de R$ 450', icon: 'solar:chart-bold-duotone' },
              { nome: 'Bolsa de Valores', valor: 'a partir de R$ 500', icon: 'solar:chart-2-bold-duotone' },
              { nome: 'Retificação', valor: 'sob consulta', icon: 'solar:pen-bold-duotone' },
            ].map((extra) => (
              <Grid key={extra.nome} xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1.5} alignItems="center" p={1.5}
                  sx={{ bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Iconify icon={extra.icon} width={24} color="primary.main" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{extra.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{extra.valor}</Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Dialog de pagamento (autenticado) */}
      <PaymentDialog
        open={dialogOpen}
        plano={planoSelecionado}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </Box>
  );
}
