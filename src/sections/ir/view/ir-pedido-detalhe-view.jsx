'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { useGetMeuPedidoIr, downloadDeclaracao } from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import PixCopiaCola from 'src/components/ir/PixCopiaCola';
import IrStatusBadge from 'src/components/ir/IrStatusBadge';
import IrDocumentList from 'src/components/ir/IrDocumentList';
import IrStatusStepper from 'src/components/ir/IrStatusStepper';
import IrPaymentPoller from 'src/components/ir/IrPaymentPoller';
import IrDocumentUpload from 'src/components/ir/IrDocumentUpload';
import BoletoLinhaDigitavel from 'src/components/ir/BoletoLinhaDigitavel';

// ----------------------------------------------------------------------

export default function IrPedidoDetalheView({ id }) {
  const router = useRouter();
  const { data: order, isLoading, error, mutate } = useGetMeuPedidoIr(id);
  const [downloadingDeclaracao, setDownloadingDeclaracao] = useState(false);

  const handlePaid = (updatedOrder) => {
    mutate({ order: updatedOrder }, false);
    toast.success('Pagamento confirmado! Agora você pode enviar seus documentos.');
  };

  const handleDocumentoEnviado = (updatedOrder) => {
    if (updatedOrder) {
      mutate({ order: updatedOrder }, false);
    } else {
      mutate();
    }
  };

  const handleDownloadDeclaracao = async () => {
    setDownloadingDeclaracao(true);
    try {
      await downloadDeclaracao(id, `declaracao-ir-${order?.year || ''}.pdf`);
      toast.success('Download iniciado!');
    } catch (err) {
      toast.error(err?.message || 'Erro ao baixar declaração.');
    } finally {
      setDownloadingDeclaracao(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">
          {error?.status === 404
            ? 'Pedido não encontrado.'
            : 'Erro ao carregar pedido. Tente novamente.'}
        </Alert>
      </Container>
    );
  }

  const showPaymentBlock =
    order.status === 'iniciada' || order.status === 'pendente_pagamento';
  const showDocumentBlock =
    order.status === 'coletando_documentos' || order.status === 'em_processo';
  const showDeclaracaoBlock = order.status === 'finalizada';

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <IrPaymentPoller
        orderId={id}
        paymentType={order.paymentType}
        currentStatus={order.status}
        onPaid={handlePaid}
        enabled={showPaymentBlock}
      />

      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5">
              Declaração IR {order.year} — {order.ano}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pedido #{order.codigoSolicitacao || order._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IrStatusBadge status={order.status} size="medium" />
            <Typography variant="subtitle2">{fCurrency(order.valor)}</Typography>
          </Stack>
        </Stack>

        {/* Stepper de status */}
        <Card>
          <CardContent>
            <IrStatusStepper
              status={order.status}
              historicoStatus={order.historicoStatus || []}
            />
          </CardContent>
        </Card>

        {/* Bloco de pagamento */}
        {showPaymentBlock && (
          <Card>
            <CardHeader
              title={order.paymentType === 'pix' ? 'Pagamento via PIX' : 'Pagamento via Boleto'}
              subheader="Realize o pagamento para iniciar sua declaração"
              avatar={
                <Iconify
                  icon={order.paymentType === 'pix' ? 'eva:flash-fill' : 'eva:file-text-outline'}
                  width={24}
                  color="primary.main"
                />
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {order.paymentType === 'pix' && order.pixCopiaECola && (
                  <>
                    <PixCopiaCola code={order.pixCopiaECola} />
                    <Alert severity="info" icon={<Iconify icon="eva:clock-outline" />}>
                      Aguardando confirmação do pagamento... (verificando a cada 5s)
                    </Alert>
                  </>
                )}

                {order.paymentType === 'boleto' && order.linhaDigitavel && (
                  <>
                    <BoletoLinhaDigitavel code={order.linhaDigitavel} />
                    <Alert severity="info" icon={<Iconify icon="eva:clock-outline" />}>
                      Pague em qualquer banco ou app. Aguardando confirmação... (verificando a cada
                      10s)
                    </Alert>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Confirmação de pagamento */}
        {(order.status === 'paga' || order.status === 'coletando_documentos') && (
          <Alert
            severity="success"
            icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            action={
              order.status === 'coletando_documentos' && (
                <Button
                  size="small"
                  color="inherit"
                  href={order.collectionLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acessar portal
                </Button>
              )
            }
          >
            Pagamento confirmado! Agora você pode enviar seus documentos.
          </Alert>
        )}

        {/* Bloco de documentos */}
        {showDocumentBlock && (
          <Card>
            <CardHeader
              title="Seus documentos"
              subheader="Envie os documentos necessários para sua declaração"
            />
            <CardContent>
              <Stack spacing={3}>
                <IrDocumentList documents={order.documents || []} />

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Enviar novo documento
                  </Typography>
                  <IrDocumentUpload orderId={id} onSuccess={handleDocumentoEnviado} />
                </Box>

                {order.collectionLinkUrl && (
                  <Button
                    variant="text"
                    startIcon={<Iconify icon="eva:external-link-outline" />}
                    href={order.collectionLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    Acessar portal de coleta de documentos
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Bloco de declaração finalizada */}
        {showDeclaracaoBlock && (
          <Card sx={{ border: '2px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" py={2}>
                <Iconify
                  icon="eva:checkmark-circle-2-fill"
                  width={64}
                  sx={{ color: 'success.main' }}
                />
                <Typography variant="h5" textAlign="center">
                  Sua declaração está pronta!
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Sua declaração de IR {order.year} foi concluída. Faça o download abaixo.
                </Typography>
                <LoadingButton
                  variant="contained"
                  color="success"
                  size="large"
                  loading={downloadingDeclaracao}
                  startIcon={<Iconify icon="eva:download-fill" />}
                  onClick={handleDownloadDeclaracao}
                >
                  Baixar minha declaração
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Histórico de documentos (em_processo e finalizada) */}
        {(order.status === 'em_processo' || order.status === 'finalizada') &&
          order.documents?.length > 0 && (
            <Card>
              <CardHeader title="Documentos do pedido" />
              <CardContent>
                <IrDocumentList documents={order.documents} />
              </CardContent>
            </Card>
          )}

        <Button
          variant="text"
          startIcon={<Iconify icon="eva:arrow-back-outline" />}
          onClick={() => router.push(paths.cliente.impostoRenda.meusPedidos)}
        >
          Voltar para meus pedidos
        </Button>
      </Stack>
    </Container>
  );
}
