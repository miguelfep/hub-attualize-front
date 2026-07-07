'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { updateInvoice } from 'src/actions/invoices';
import { useInvoice } from 'src/contexts/InvoiceContext';
import { abrirPdfNota, baixarXmlNota } from 'src/actions/notafiscal';

import { Iconify } from 'src/components/iconify';

import { OrcamentoPago } from './orcamento-pago';
import { OrcamentoAprovado } from './orcamento-aprovado';
import { OrcamentoPendente } from './orcamento-pendente';
import { CheckoutSteps } from '../checkout/checkout-steps';

// ----------------------------------------------------------------------

const ORCAMENTO_CHECKOUT_STEPS = ['Proposta', 'Pagamento', 'Confirmação'];

const STATUS_CONFIG = {
  orcamento: { label: 'Aguardando aprovação', color: 'warning', step: 0 },
  aprovada: { label: 'Aprovado · aguardando pagamento', color: 'info', step: 1 },
  pago: { label: 'Pago', color: 'success', step: 3 },
  perdida: { label: 'Recusado', color: 'error', step: 0 },
};

export function OrcamentoView({ invoice: initialInvoice, nfses }) {
  const { invoice: currentInvoice, loading, updateInvoiceData } = useInvoice();

  const [currentNfses] = useState(nfses);
  const [status, setStatus] = useState(currentInvoice?.status || initialInvoice?.status || 'orcamento');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (currentInvoice?.status) {
      setStatus(currentInvoice.status);
    }
  }, [currentInvoice]);

  const handleApproval = async (newStatus, reason = '') => {
    try {
      await updateInvoice(currentInvoice._id, { status: newStatus, motivoPerda: reason });
      setStatus(newStatus);
      toast.success(newStatus === 'aprovada' ? 'Orçamento aprovado!' : 'Resposta registrada.');
      await updateInvoiceData(500);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  if (!currentInvoice && !initialInvoice) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Iconify icon="solar:file-corrupted-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
        <Typography variant="h4">Orçamento não encontrado</Typography>
        <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
          Verifique o link recebido e tente novamente.
        </Typography>
      </Container>
    );
  }

  const invoice = currentInvoice || initialInvoice;
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.orcamento;
  const isPendente = status === 'orcamento';
  // Proposta vale até o fim do dia do vencimento
  const expirado =
    isPendente &&
    invoice?.dataVencimento &&
    new Date(invoice.dataVencimento).setHours(23, 59, 59, 999) < Date.now();

  const nfseAtiva = Array.isArray(currentNfses)
    ? currentNfses.find(
        (n) => n?.status === 'autorizada' || String(n?.eNotasStatus || '').toLowerCase() === 'autorizada'
      )
    : null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Faixa superior com identidade */}
      <Box
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(
            theme.palette.primary.main,
            0.01
          )})`,
        })}
      >
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="img" alt="Attualize" src="/logo/hub-tt.png" sx={{ width: 36, height: 36 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                  Attualize Contábil
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Proposta {invoice?.invoiceNumber}
                </Typography>
              </Box>
            </Stack>
            <Chip size="small" variant="soft" color={statusCfg.color} label={statusCfg.label} />
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          pt: { xs: 3, md: 5 },
          // Espaço extra no mobile para a barra fixa de aprovação
          pb: { xs: isPendente ? 14 : 8, md: 10 },
        }}
      >
        <CheckoutSteps activeStep={statusCfg.step} steps={ORCAMENTO_CHECKOUT_STEPS} />

        {/* NFSe emitida */}
        {nfseAtiva && (
          <NfseBanner
            nfse={nfseAtiva}
            onVerNota={() => abrirPdfNota(nfseAtiva).catch((err) => toast.error(err?.message || 'Erro ao abrir a nota'))}
            onBaixarXml={() => baixarXmlNota(nfseAtiva).catch((err) => toast.error(err?.message || 'Erro ao baixar o XML'))}
          />
        )}

        {isPendente && (
          <>
            {expirado && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Esta proposta venceu em {fDate(invoice?.dataVencimento)}. Você ainda pode aprová-la, mas os
                valores podem ser revisados pelo nosso time.
              </Alert>
            )}

            <OrcamentoPendente invoice={invoice} />

            {/* Ações — desktop */}
            <Paper
              variant="outlined"
              sx={{
                mt: 3,
                p: { xs: 2.5, sm: 3 },
                borderRadius: 2,
                textAlign: 'center',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Vamos começar?
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Ao aprovar, você escolhe a forma de pagamento na próxima etapa — PIX, boleto ou cartão.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={!loading && <Iconify width={20} icon="solar:check-circle-bold" />}
                  onClick={() => handleApproval('aprovada')}
                  disabled={loading}
                  sx={{ minWidth: 240, minHeight: 48 }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : `Aprovar · ${fCurrency(invoice?.total)}`}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={loading}
                  sx={{ minHeight: 48 }}
                >
                  Recusar
                </Button>
              </Stack>
            </Paper>
          </>
        )}

        {status === 'aprovada' && (
          <OrcamentoAprovado
            key={invoice?._id || invoice?.cobrancas?.length || 'aprovada'}
            invoice={invoice}
            paymentMethod={paymentMethod}
            handlePaymentMethodChange={handlePaymentMethodChange}
            updateInvoiceData={updateInvoiceData}
            loading={loading}
          />
        )}

        {status === 'pago' && <OrcamentoPago invoice={invoice} nfse={nfseAtiva} />}

        {status === 'perdida' && <OrcamentoRecusado />}
      </Container>

      {/* Barra fixa de aprovação — mobile */}
      {isPendente && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            p: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
            borderRadius: '16px 16px 0 0',
            display: { xs: 'block', sm: 'none' },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total
            </Typography>
            <Typography variant="h6">{fCurrency(invoice?.total)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setRejectDialogOpen(true)}
              disabled={loading}
              sx={{ minHeight: 48, flexShrink: 0 }}
            >
              Recusar
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={!loading && <Iconify width={20} icon="solar:check-circle-bold" />}
              onClick={() => handleApproval('aprovada')}
              disabled={loading}
              sx={{ minHeight: 48 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Aprovar proposta'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Dialog de recusa */}
      <Dialog
        open={rejectDialogOpen}
        onClose={loading ? undefined : () => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Recusar proposta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Que pena! Conte pra gente o motivo — isso nos ajuda a montar uma proposta melhor para você.
          </Typography>
          <TextField
            autoFocus
            label="Motivo da recusa"
            fullWidth
            multiline
            minRows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setRejectDialogOpen(false)} disabled={loading}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await handleApproval('perdida', rejectionReason);
              setRejectDialogOpen(false);
            }}
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar recusa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ----------------------------------------------------------------------

function NfseBanner({ nfse, onVerNota, onBaixarXml }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 2, borderStyle: 'dashed' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:document-add-bold-duotone" width={28} sx={{ color: 'success.main' }} />
          <Box>
            <Typography variant="subtitle2">Nota Fiscal de Serviço emitida</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Nº {nfse.numeroNota || '—'}
              {nfse.codigoVerificacao ? ` · Verificação ${nfse.codigoVerificacao}` : ''}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {nfse.linkNota && (
            <Button size="small" variant="outlined" onClick={onVerNota} startIcon={<Iconify width={16} icon="solar:eye-bold" />}>
              Ver nota
            </Button>
          )}
          {nfse.linkXml && (
            <Button size="small" variant="outlined" color="inherit" onClick={onBaixarXml}>
              XML
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

// ----------------------------------------------------------------------

function OrcamentoRecusado() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
      <Iconify icon="solar:sad-circle-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 1 }}>
        Proposta recusada
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Sentimos muito não ter atendido às suas expectativas desta vez. Nosso time adoraria entender o que
        faltou e montar uma nova proposta para você.
      </Typography>
      <Button
        variant="contained"
        color="success"
        size="large"
        startIcon={<Iconify width={20} icon="mdi:whatsapp" />}
        onClick={() => window.open('https://wa.me/5541996982267', '_blank')}
        sx={{ minHeight: 48, px: 4 }}
      >
        Falar com nosso time
      </Button>
    </Paper>
  );
}
