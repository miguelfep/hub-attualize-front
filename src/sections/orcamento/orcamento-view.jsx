'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { updateInvoice, getInvoiceById } from 'src/actions/invoices';

import { Iconify } from 'src/components/iconify';

import { OrcamentoPago } from './orcamento-pago';
import { OrcamentoAprovado } from './orcamento-aprovado';
import { OrcamentoPendente } from './orcamento-pendente';
import { CheckoutSteps } from '../checkout/checkout-steps';
import { CheckoutOrderComplete } from '../checkout/checkout-order-complete';

const ORCAMENTO_CHECKOUT_STEPS = ['Aprovação', 'Pagamento'];

export function OrcamentoView({ invoice, nfses }) {

  const [currentInvoice, setCurrentInvoice] = useState(invoice);
  const [currentNfses, setCurrentNfses] = useState(nfses);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('boleto');
  const [status, setStatus] = useState(invoice?.status || 'orcamento');
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(''); // Estado para o motivo da recusa
  const [showRejectionInput, setShowRejectionInput] = useState(false); // Controle para mostrar input

  useEffect(() => {
    if (status !== 'orcamento') {
      setActiveStep(1);
    }
  }, [status]);

  const updateInvoiceData = async () => {
    setLoading(true);
    try {
      const updatedInvoice = await getInvoiceById(currentInvoice._id);
      setCurrentInvoice(updatedInvoice);
      setStatus(updatedInvoice.status);
    } catch (error) {
      toast.error('Erro ao atualizar invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (newStatus, reason = '') => {
    setLoading(true);
    try {
      const data = {
        status: newStatus,
        motivoPerda: reason, // Incluindo o motivo da recusa, se houver
      };

      await updateInvoice(currentInvoice._id, data);
      setStatus(newStatus);
      toast.success(`Status atualizado para ${newStatus}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await axios.post('/api/process-payment', {
        invoiceId: currentInvoice._id,
        paymentMethod,
      });
      toast.success(`Pagamento processado com ${paymentMethod}`);
      await updateInvoiceData();
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Box>
          <Typography variant="h4" color="error">
            Erro
          </Typography>
          <Typography variant="h6" sx={{ my: 2 }}>
            Venda não encontrada. Por favor, verifique o ID e tente novamente.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mb: 10, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: 'center', my: { xs: 2, md: 5 } }}>
        <Box
          component="img"
          alt="logo"
          src="/logo/hub-tt.png"
          sx={{
            width: { xs: 32, sm: 48 },
            height: { xs: 32, sm: 48 },
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Typography variant="h4">Orçamento {currentInvoice?.invoiceNumber}</Typography>
      </Box>
      {/* NFSe emitida/autorizada */}
      {Array.isArray(currentNfses) && currentNfses.length > 0 && (() => {
        console.log('currentNfses', currentNfses);
        const nfseAtiva = currentNfses.find((n) => n?.status === 'autorizada' || String(n?.eNotasStatus || '').toLowerCase() === 'autorizada');
        if (!nfseAtiva) return null;
        return (
          <Box sx={{ mt: 4, p: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1">Nota Fiscal de Serviço (NFSe)</Typography>
                <Chip size="small" label={nfseAtiva.status || nfseAtiva.eNotasStatus} color={(nfseAtiva.status === 'emitida' || String(nfseAtiva.eNotasStatus || '').toLowerCase() === 'autorizada') ? 'success' : 'default'} />
              </Stack>
              <Stack direction="row" spacing={1}>
                {nfseAtiva.linkNota && (
                  <Button size="small" variant="outlined" href={nfseAtiva.linkNota} target="_blank" rel="noopener noreferrer">
                    Ver Nota
                  </Button>
                )}
                {nfseAtiva.linkXml && (
                  <Button size="small" variant="outlined" href={nfseAtiva.linkXml} target="_blank" rel="noopener noreferrer">
                    Ver XML
                  </Button>
                )}
              </Stack>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Número</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.numeroNota || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Série</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.serie || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Código Verificação</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.codigoVerificacao || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor Serviços</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorServicos ?? nfseAtiva.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor ISS</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorIss ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor Líquido</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorLiquido ?? nfseAtiva.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      })()}

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <CheckoutSteps activeStep={activeStep} steps={ORCAMENTO_CHECKOUT_STEPS} />
        </Grid>
      </Grid>

      <Box sx={{ my: 3 }}>
        {status === 'orcamento' && <OrcamentoPendente invoice={currentInvoice} />}
        {status === 'aprovada' && (
          <OrcamentoAprovado
            invoice={currentInvoice}
            paymentMethod={paymentMethod}
            handlePaymentMethodChange={handlePaymentMethodChange}
            handlePayment={handlePayment}
            updateInvoiceData={updateInvoiceData}
            loading={loading}
          />
        )}
        {status === 'pago' && <OrcamentoPago />}
      </Box>
      <>
        {activeStep === 0 && status === 'orcamento' && (
          <Box textAlign="center" sx={{ mt: 5 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify width={16} icon="mingcute:thumb-up-2-fill" />}
              onClick={() => handleApproval('aprovada')}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
              Aprovar
            </Button>
            <Button
              variant="contained"
              color="grey"
              startIcon={<Iconify width={16} icon="mingcute:thumb-down-2-fill" />}
              onClick={() => setShowRejectionInput(true)} // Mostrar o campo de recusa
              disabled={loading}
            >
              {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
              Reprovar
            </Button>
          </Box>
        )}

        {showRejectionInput && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <TextField
              label="Motivo da recusa"
              variant="outlined"
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => handleApproval('perdida', rejectionReason)} // Passar o motivo da recusa
              disabled={loading || !rejectionReason}
              startIcon={<Iconify width={16} icon="mingcute:thumb-down-2-fill" />}
            >
              {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
              Confirmar Reprovação
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <CheckoutOrderComplete open onReset={() => setActiveStep(0)} onDownloadPDF={() => {}} />
        )}

        {status === 'perdida' && (
          <Box textAlign="center" sx={{ mt: 5 }}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <Iconify width={48} height={48} icon="mdi:emoticon-sad-outline" color="error.main" />
            </Box>
            <Typography variant="h6" color="error.main" sx={{ mb: 3 }}>
              Infelizmente, o orçamento foi recusado.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Sentimos muito que não conseguimos atender às suas expectativas. Entre em contato com
              o nosso time para discutirmos outras opções.
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify width={16} icon="mdi:whatsapp" />}
              onClick={() => window.open('https://wa.me/5541996982267', '_blank')}
            >
              Fale com nosso time
            </Button>
          </Box>
        )}
      </>
    </Container>
  );
}
