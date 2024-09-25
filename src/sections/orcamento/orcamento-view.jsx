'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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

export function OrcamentoView({ invoice }) {
  const [currentInvoice, setCurrentInvoice] = useState(invoice);
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
    <Container sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', my: { xs: 3, md: 5 } }}>
        <Box
          component="img"
          alt="logo"
          src="/logo/hub-tt.png"
          sx={{
            width: 48,
            height: 48,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Typography variant="h4">Orçamento {currentInvoice?.invoiceNumber}</Typography>
      </Box>

      <Grid container justifyContent={activeStep === 2 ? 'center' : 'flex-start'}>
        <Grid item xs={12} md={12}>
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
              onClick={() => window.open('https://wa.me/554130681800', '_blank')}
            >
              Fale com nosso time
            </Button>
          </Box>
        )}
      </>
    </Container>
  );
}
