import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';

export function InvoiceNewEditPayment({ currentInvoice }) {
  const { setValue, watch } = useFormContext();
  const [loading, setLoading] = useState(false);

  const paymentMethod = watch('formaPagamento');
  const cobrancas = currentInvoice?.cobrancas || [];

  useEffect(() => {
    if (currentInvoice?.formaPagamento) {
      setValue('formaPagamento', currentInvoice.formaPagamento);
    }
  }, [currentInvoice, setValue]);

  const handleGenerateBoleto = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/generate-boleto', { invoiceId: currentInvoice._id });
      setValue('boleto', response.data.boleto);
      toast.success('Boleto gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/generate-payment-link', {
        invoiceId: currentInvoice._id,
      });
      setValue('paymentUrl', response.data.paymentLink);
      toast.success('Link de pagamento gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar link de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = (boleto) => {
    const message = `Boleto gerado com sucesso:

  Código de Barras: ${boleto.codigoBarras}
  Linha Digitável: ${boleto.linhaDigitavel}
  Nosso Número: ${boleto.nossoNumero}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (currentInvoice?.status === 'orçamento' || !currentInvoice) {
    return null; // Não mostrar nada se o status for 'orçamento'
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Método de Pagamento
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          name="formaPagamento"
          value={paymentMethod || 'boleto'}
          onChange={(e) => setValue('formaPagamento', e.target.value)}
        >
          <FormControlLabel value="boleto" control={<Radio />} label="Boleto" />
          <FormControlLabel value="pix" control={<Radio />} label="PIX" />
          <FormControlLabel value="cartao" control={<Radio />} label="Cartão de Crédito" />
        </RadioGroup>
      </FormControl>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        {paymentMethod === 'boleto' &&
          currentInvoice &&
          currentInvoice.status === 'aprovada' &&
          cobrancas.length === 0 && (
            <Button variant="contained" onClick={handleGenerateBoleto} disabled={loading}>
              Gerar Boleto
            </Button>
          )}
        {paymentMethod === 'boleto' &&
          cobrancas.length > 0 &&
          cobrancas.map((cobranca, index) => {
            const DadosBoleto = cobranca.boleto ? JSON.parse(cobranca.boleto) : null;
            return (
              DadosBoleto && (
                <Accordion key={index}>
                  <AccordionSummary
                    expandIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
                  >
                    <Typography>Boleto {index + 1}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="Código de Barras"
                      value={DadosBoleto.codigoBarras}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <TextField
                      label="Linha Digitável"
                      value={DadosBoleto.linhaDigitavel}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <TextField
                      label="Nosso Número"
                      value={DadosBoleto.nossoNumero}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Iconify width={16} icon="mdi:whatsapp" />}
                      onClick={() => handleSendWhatsApp(DadosBoleto)}
                      sx={{ mt: 2 }}
                    >
                      Enviar via WhatsApp
                    </Button>
                  </AccordionDetails>
                </Accordion>
              )
            );
          })}
        {paymentMethod === 'cartao' &&
          currentInvoice &&
          currentInvoice.status === 'aprovada' &&
          cobrancas.length === 0 && (
            <Button variant="contained" onClick={handleGeneratePaymentLink} disabled={loading}>
              Gerar Link de Pagamento
            </Button>
          )}
        {paymentMethod === 'cartao' &&
          cobrancas.length > 0 &&
          cobrancas.map(
            (cobranca, index) =>
              cobranca.urlPagamentoCartao && (
                <Accordion key={index}>
                  <AccordionSummary
                    expandIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
                  >
                    <Typography>Link de Pagamento {index + 1}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="URL de Pagamento"
                      value={cobranca.urlPagamentoCartao}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              )
          )}
      </Stack>
    </Card>
  );
}
