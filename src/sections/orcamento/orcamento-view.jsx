'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { updateInvoice } from 'src/actions/invoices';
import { useInvoice } from 'src/contexts/InvoiceContext';

import { Iconify } from 'src/components/iconify';

import { OrcamentoPago } from './orcamento-pago';
import { OrcamentoAprovado } from './orcamento-aprovado';
import { OrcamentoPendente } from './orcamento-pendente';
import { CheckoutSteps } from '../checkout/checkout-steps';
import { CheckoutOrderComplete } from '../checkout/checkout-order-complete';

const ORCAMENTO_CHECKOUT_STEPS = ['Aprovação', 'Pagamento'];

export function OrcamentoView({ invoice: initialInvoice, nfses }) {
  // Usar contexto para gerenciar invoice e polling automático
  const { invoice: currentInvoice, loading, updateInvoiceData } = useInvoice();
  
  const [currentNfses, setCurrentNfses] = useState(nfses);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // PIX pré-selecionado por padrão
  const [status, setStatus] = useState(currentInvoice?.status || initialInvoice?.status || 'orcamento');
  const [rejectionReason, setRejectionReason] = useState(''); // Estado para o motivo da recusa
  const [showRejectionInput, setShowRejectionInput] = useState(false); // Controle para mostrar input

  // Atualizar status quando invoice do contexto mudar
  useEffect(() => {
    if (currentInvoice?.status) {
      setStatus(currentInvoice.status);
    }
    
    if (currentInvoice?.status !== 'orcamento') {
      setActiveStep(1);
    }

    // Se tem cobrancas, atualizar o activeStep para mostrar a cobrança
    if (currentInvoice?.cobrancas && Array.isArray(currentInvoice.cobrancas) && currentInvoice.cobrancas.length > 0) {
      setActiveStep(1); // Garantir que está no step de pagamento
    }
  }, [currentInvoice]);

  const handleApproval = async (newStatus, reason = '') => {
    try {
      const data = {
        status: newStatus,
        motivoPerda: reason, // Incluindo o motivo da recusa, se houver
      };

      await updateInvoice(currentInvoice._id, data);
      setStatus(newStatus);
      toast.success(`Status atualizado para ${newStatus}`);
      
      // Atualizar invoice no contexto
      await updateInvoiceData(500);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePayment = async () => {
    try {
      await axios.post('/api/process-payment', {
        invoiceId: currentInvoice._id,
        paymentMethod,
      });
      toast.success(`Pagamento processado com ${paymentMethod}`);
      await updateInvoiceData(500);
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    }
  };

  if (!currentInvoice && !initialInvoice) {
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
    <Container
      maxWidth="lg"
      sx={{
        mb: { xs: 8, sm: 10 },
        px: { xs: 2, sm: 2, md: 3 },
        minHeight: '100vh',
      }}
    >
      <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, pt: { xs: 3, md: 5 } }}>
        <Box
          component="img"
          alt="logo"
          src="/logo/hub-tt.png"
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mt: 1.5 }}>
          Orçamento {currentInvoice?.invoiceNumber}
        </Typography>
      </Box>

      {/* NFSe emitida/autorizada */}
      {Array.isArray(currentNfses) && currentNfses.length > 0 && (() => {
        const nfseAtiva = currentNfses.find((n) => n?.status === 'autorizada' || String(n?.eNotasStatus || '').toLowerCase() === 'autorizada');
        if (!nfseAtiva) return null;
        return (
          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              p: { xs: 2, sm: 2.5 },
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Nota Fiscal de Serviço (NFSe)
                </Typography>
                <Chip size="small" label={nfseAtiva.status || nfseAtiva.eNotasStatus} color={(nfseAtiva.status === 'emitida' || String(nfseAtiva.eNotasStatus || '').toLowerCase() === 'autorizada') ? 'success' : 'default'} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {nfseAtiva.linkNota && (
                  <Button size="small" variant="outlined" href={nfseAtiva.linkNota} target="_blank" rel="noopener noreferrer" fullWidth sx={{ minWidth: { sm: 'auto' } }}>
                    Ver Nota
                  </Button>
                )}
                {nfseAtiva.linkXml && (
                  <Button size="small" variant="outlined" href={nfseAtiva.linkXml} target="_blank" rel="noopener noreferrer" fullWidth sx={{ minWidth: { sm: 'auto' } }}>
                    Ver XML
                  </Button>
                )}
              </Stack>
            </Stack>
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Número</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.numeroNota || '-'}</Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Série</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.serie || '-'}</Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Código Verificação</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{nfseAtiva.codigoVerificacao || '-'}</Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor Serviços</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorServicos ?? nfseAtiva.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor ISS</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorIss ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valor Líquido</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(nfseAtiva.valorLiquido ?? nfseAtiva.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      })()}

      <Grid container spacing={2} justifyContent="center" sx={{ mt: { xs: 2, md: 3 } }}>
        <Grid xs={12}>
          <CheckoutSteps activeStep={activeStep} steps={ORCAMENTO_CHECKOUT_STEPS} />
        </Grid>
      </Grid>

      {/* Etapa: exibir orçamento + aprovar/reprovar */}
      {status === 'orcamento' && (
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, my: { xs: 2, md: 3 } }}>
          <OrcamentoPendente invoice={currentInvoice} />
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
              Deseja aprovar este orçamento?
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="stretch"
              sx={{ flexWrap: 'wrap' }}
            >
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<Iconify width={18} icon="mingcute:thumb-up-2-fill" />}
                onClick={() => handleApproval('aprovada')}
                disabled={loading}
                fullWidth
                sx={{ maxWidth: { sm: 200 }, minHeight: 48 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Aprovar'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<Iconify width={18} icon="mingcute:thumb-down-2-fill" />}
                onClick={() => setShowRejectionInput(true)}
                disabled={loading}
                fullWidth
                sx={{ maxWidth: { sm: 200 }, minHeight: 48 }}
              >
                Reprovar
              </Button>
            </Stack>
          </Box>
          {showRejectionInput && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <TextField
                label="Motivo da recusa"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{ sx: { minHeight: 56 } }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="stretch">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleApproval('perdida', rejectionReason)}
                  disabled={loading || !rejectionReason.trim()}
                  startIcon={!loading && <Iconify width={18} icon="mingcute:thumb-down-2-fill" />}
                  fullWidth
                  sx={{ maxWidth: { sm: 260 }, minHeight: 48 }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Confirmar reprovação'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { setShowRejectionInput(false); setRejectionReason(''); }}
                  disabled={loading}
                  fullWidth
                  sx={{ maxWidth: { sm: 160 }, minHeight: 48 }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          )}
        </Card>
      )}

      <Box sx={{ my: { xs: 2, md: 3 } }}>
        {status === 'aprovada' && (
          <OrcamentoAprovado
            key={currentInvoice?._id || currentInvoice?.cobrancas?.length || 'aprovada'}
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
        {activeStep === 2 && (
          <CheckoutOrderComplete open onReset={() => setActiveStep(0)} onDownloadPDF={() => { }} />
        )}

        {status === 'perdida' && (
          <Box textAlign="center" sx={{ mt: { xs: 4, md: 5 }, px: { xs: 1, sm: 0 } }}>
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
              <Iconify width={48} height={48} icon="mdi:emoticon-sad-outline" color="error.main" />
            </Box>
            <Typography variant="h6" color="error.main" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Infelizmente, o orçamento foi recusado.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Sentimos muito que não conseguimos atender às suas expectativas. Entre em contato com
              o nosso time para discutirmos outras opções.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<Iconify width={18} icon="mdi:whatsapp" />}
              onClick={() => window.open('https://wa.me/5541996982267', '_blank')}
              sx={{ maxWidth: 320, mx: 'auto', minHeight: 48 }}
            >
              Fale com nosso time
            </Button>
          </Box>
        )}
      </>
    </Container>
  );
}
