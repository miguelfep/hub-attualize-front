'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';

import { consultarCobrancaPix } from 'src/actions/pix';

import { Iconify } from 'src/components/iconify';

import { QrCodePix } from './qrcode-pix';

// ----------------------------------------------------------------------

/**
 * Componente para processar pagamento PIX em invoices/orçamentos
 * @param {string} invoiceId - ID da invoice
 * @param {number} valor - Valor a pagar
 * @param {Function} onPagamentoConfirmado - Callback quando pagamento for confirmado
 * @param {Function} onAtualizarInvoice - Callback para atualizar invoice após gerar PIX
 * @param {boolean} forcarNovoPix - Se true, força gerar novo PIX mesmo se já existir um válido
 * @param {boolean} exibirQrCodeAqui - Se false, não exibe QR Code aqui, apenas atualiza invoice (padrão: false)
 */
export function PagamentoPix({ invoiceId, valor, onPagamentoConfirmado, onAtualizarInvoice, forcarNovoPix = false, exibirQrCodeAqui = false }) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const gerarPix = async (forcarNovo = false) => {
    if (!invoiceId) {
      toast.error('ID da invoice não fornecido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${baseUrl}checkout/orcamento/${invoiceId}`, {
        paymentMethod: 'pix',
        forcarNovoPix: Boolean(forcarNovo || forcarNovoPix),
      });

      const data = response.data || response;
      
      // Verificar se já existe PIX gerado
      if (data.cobrancaId && data.pix) {
        // Normalizar dados PIX seguindo a documentação da API
        // Campo principal: pixCopiaECola (ou qrcode como alias)
        console.log('📦 Dados PIX recebidos da API:', data.pix);
        
        const pixNormalizado = {
          ...data.pix,
          // QR Code: pixCopiaECola é o campo principal, qrcode é alias
          pixCopiaECola: data.pix.pixCopiaECola || data.pix.qrcode || data.pix.pixQrCode,
          qrcode: data.pix.pixCopiaECola || data.pix.qrcode || data.pix.pixQrCode,
          qrcodeBase64: data.pix.qrcodeBase64,
          // Valor: pode ser objeto com original/final ou número
          valor: typeof data.pix.valor === 'object' 
            ? (data.pix.valor?.original || data.pix.valor?.final || valor || 0)
            : (data.pix.valor || valor || 0),
          // Campos obrigatórios
          txid: data.pix.txid || '',
          chave: data.pix.chave || '',
          status: data.pix.status || 'ATIVA',
          // Calendário (vencimento)
          calendario: data.pix.calendario || {},
          // Campos auxiliares da documentação
          expirado: data.pix.expirado || false,
          podeGerarNovo: data.pix.podeGerarNovo !== false,
          expiraEm: data.pix.expiraEm,
        };
        
        console.log('✅ Dados PIX normalizados:', {
          temPixCopiaECola: !!pixNormalizado.pixCopiaECola,
          temQrcode: !!pixNormalizado.qrcode,
          temQrcodeBase64: !!pixNormalizado.qrcodeBase64,
          pixCopiaEColaLength: pixNormalizado.pixCopiaECola?.length,
          pixNormalizado,
        });
        
        // Se exibirQrCodeAqui for false, não armazenar pixData (não exibir aqui)
        if (exibirQrCodeAqui) {
          setPixData(pixNormalizado);
        }
        
        toast.success('QR Code PIX gerado com sucesso!');
        
        // Se temos TXID, buscar dados imediatamente da API para garantir que temos o QR Code
        if (pixNormalizado.txid && !exibirQrCodeAqui) {
          try {
            console.log('🔍 Buscando dados PIX imediatamente após gerar com TXID:', pixNormalizado.txid);
            const { consultarCobrancaPix: consultarCobrancaPixAction } = await import('src/actions/pix');
            const cobrancaPix = await consultarCobrancaPixAction(pixNormalizado.txid);
            
            console.log('📥 Resposta da consulta imediata:', cobrancaPix);
            
            if (cobrancaPix && (cobrancaPix.pixCopiaECola || cobrancaPix.qrcode || cobrancaPix.qrcodeBase64)) {
              console.log('✅ QR Code encontrado imediatamente após gerar:', {
                pixCopiaECola: !!cobrancaPix.pixCopiaECola,
                qrcode: !!cobrancaPix.qrcode,
                qrcodeBase64: !!cobrancaPix.qrcodeBase64,
                cobrancaPix,
              });
              // Os dados serão salvos na cobrança pelo backend, então vamos atualizar a invoice
            } else {
              console.log('⚠️ QR Code ainda não disponível na API, será buscado depois');
            }
          } catch (err) {
            console.log('⚠️ Erro ao buscar QR Code imediatamente (normal, pode estar processando):', err.message);
          }
        }
        
        // Aguardar um pouco antes de atualizar para garantir que backend salvou
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Atualizar invoice se callback fornecido - isso vai fazer a página mudar para CobrancaExistente
        if (onAtualizarInvoice) {
          await onAtualizarInvoice();
          // Aguardar mais um pouco após atualizar para garantir que dados estão disponíveis
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Iniciar verificação automática apenas se não exibir QR Code aqui
        // (se exibir aqui, a verificação será feita no componente CobrancaExistente)
        if (exibirQrCodeAqui && pixNormalizado.txid) {
          verificarPagamentoPeriodicamente(pixNormalizado.txid);
        }
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
      
      // Verificar se é erro de PIX já existente
      const errorData = err.response?.data || err;
      if (err.response?.status === 400 && errorData.cobrancaId) {
        if (errorData.pixQrCode || errorData.pixTxid) {
          // Usar dados existentes
          setPixData({
            qrcode: errorData.pixQrCode,
            txid: errorData.pixTxid,
            valor,
            chave: errorData.pixChave || '',
          });
          toast.info('Já existe um QR Code PIX gerado para esta invoice');
          verificarPagamentoPeriodicamente(errorData.pixTxid);
        } else {
          setError(errorData.message || 'Erro ao gerar QR Code PIX');
          toast.error(errorData.message || 'Erro ao gerar QR Code PIX');
        }
      } else {
        setError(errorData.message || 'Erro ao gerar QR Code PIX. Tente novamente.');
        toast.error(errorData.message || 'Erro ao gerar QR Code PIX');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers que não recebem o evento do React
  const handleGerarPix = () => {
    gerarPix(false);
  };

  const handleGerarNovoPix = () => {
    setPixData(null);
    setError(null);
    gerarPix(true);
  };

  const verificarPagamentoPeriodicamente = (txid) => {
    if (!txid) return;

    setVerificando(true);
    let tentativas = 0;
    const maxTentativas = 120; // 10 minutos (120 * 5 segundos)

    const interval = setInterval(async () => {
      try {
        const cobranca = await consultarCobrancaPix(txid);
        
        if (cobranca.status === 'CONCLUIDA') {
          clearInterval(interval);
          setVerificando(false);
          toast.success('Pagamento confirmado!');
          
          if (onPagamentoConfirmado) {
            // Garantir que passamos apenas dados serializáveis
            onPagamentoConfirmado({
              status: cobranca.status,
              txid: cobranca.txid,
              valor: cobranca.valor,
            });
          }
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
      }

      tentativas += 1;
      if (tentativas >= maxTentativas) {
        clearInterval(interval);
        setVerificando(false);
      }
    }, 5000); // Verificar a cada 5 segundos
  };

  const verificarPagamentoManual = async () => {
    if (!pixData?.txid) return;

    setVerificando(true);
    try {
      const cobranca = await consultarCobrancaPix(pixData.txid);
      
      if (cobranca.status === 'CONCLUIDA') {
        toast.success('Pagamento confirmado!');
        if (onPagamentoConfirmado) {
          // Garantir que passamos apenas dados serializáveis
          onPagamentoConfirmado({
            status: cobranca.status,
            txid: cobranca.txid,
            valor: cobranca.valor,
          });
        }
      } else {
        toast.info(`Status atual: ${cobranca.status}`);
      }
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      toast.error('Erro ao verificar pagamento');
    } finally {
      setVerificando(false);
    }
  };

  // Se exibirQrCodeAqui for false, apenas mostrar botão de gerar
  if (!exibirQrCodeAqui) {
    return (
      <Box>
        <Stack spacing={2}>
          <Alert severity="info">
            Clique no botão abaixo para gerar o QR Code PIX. O QR Code será exibido na seção &quot;Detalhes da Cobrança&quot;.
          </Alert>
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={handleGerarPix}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:qr-code-bold" />}
          >
            {loading ? 'Gerando QR Code PIX...' : 'Gerar QR Code PIX'}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Se exibirQrCodeAqui for true, exibir QR Code aqui (comportamento antigo)
  return (
    <Box>
      {!pixData ? (
        <Stack spacing={2}>
          <Alert severity="info">
            Clique no botão abaixo para gerar o QR Code PIX e realizar o pagamento.
          </Alert>
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={handleGerarPix}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:qr-code-bold" />}
          >
            {loading ? 'Gerando QR Code PIX...' : 'Gerar QR Code PIX'}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <QrCodePix pixData={pixData} autoVerificar={false} />
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={verificarPagamentoManual}
              disabled={verificando}
              startIcon={verificando ? <CircularProgress size={16} /> : <Iconify icon="solar:refresh-bold" />}
            >
              {verificando ? 'Verificando...' : 'Verificar Pagamento'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleGerarNovoPix}
              startIcon={<Iconify icon="solar:refresh-bold" />}
            >
              Gerar Novo QR Code
            </Button>
          </Stack>

          {verificando && (
            <Alert severity="info">
              Verificando pagamento automaticamente...
            </Alert>
          )}
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
