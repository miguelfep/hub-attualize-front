'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// Tentar importar QRCode (pode não estar instalado)
let QRCode = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  QRCode = require('qrcode.react').default;
} catch (e) {
  console.warn('qrcode.react não disponível, QR Code será gerado via API online ou apenas código copia e cola');
}

// ----------------------------------------------------------------------

/**
 * Componente para exibir QR Code PIX
 * @param {Object} pixData - Dados do PIX (qrcode, qrcodeBase64, valor, chave, txid)
 * @param {Function} onVerificarPagamento - Callback para verificar pagamento (opcional)
 * @param {boolean} autoVerificar - Se deve verificar pagamento automaticamente
 */
export function QrCodePix({ pixData, onVerificarPagamento, autoVerificar = false }) {
  const [copied, setCopied] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (autoVerificar && pixData?.txid && onVerificarPagamento) {
      const interval = setInterval(async () => {
        setVerificando(true);
        try {
          await onVerificarPagamento(pixData.txid);
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error);
        } finally {
          setVerificando(false);
        }
      }, 5000); // Verificar a cada 5 segundos

      // Parar após 10 minutos
      const timeout = setTimeout(() => clearInterval(interval), 600000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [autoVerificar, pixData?.txid, onVerificarPagamento]);

  if (!pixData) {
    return null;
  }

  const handleCopy = (text, type) => {
    setCopied(true);
    toast.success(`${type} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Escaneie o QR Code com seu app de pagamento
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Ou copie o código PIX abaixo
          </Typography>
        </Box>

        {/* QR Code */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          {pixData.qrcodeBase64 ? (
            <Box
              component="img"
              src={pixData.qrcodeBase64}
              alt="QR Code PIX"
              sx={{
                width: 300,
                height: 300,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 1,
                bgcolor: 'background.paper',
              }}
            />
          ) : (pixData.qrcode || pixData.pixCopiaECola) && QRCode ? (
            <Box
              sx={{
                width: 300,
                height: 300,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCode
                value={pixData.qrcode || pixData.pixCopiaECola}
                size={260}
                level="H"
                includeMargin={false}
              />
            </Box>
          ) : (pixData.qrcode || pixData.pixCopiaECola) ? (
            <Box
              sx={{
                width: 300,
                height: 300,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Box
                component="img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixData.qrcode || pixData.pixCopiaECola)}`}
                alt="QR Code PIX"
                sx={{
                  width: 260,
                  height: 260,
                }}
                onError={(e) => {
                  // Se falhar, mostrar ícone
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="text-align: center;"><svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 9h6v6H9z"/></svg><p>Use o código PIX abaixo</p></div>';
                }}
              />
            </Box>
          ) : null}
        </Box>

        <Divider />

        {/* Informações do PIX */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Valor:
            </Typography>
            <Typography variant="h5" color="primary">
              {fCurrency(
                typeof pixData.valor === 'object' 
                  ? (pixData.valor?.original || pixData.valor?.final || 0)
                  : (pixData.valor || 0)
              )}
            </Typography>
          </Stack>
          
          {pixData.calendario?.dataDeVencimento && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Vencimento:
              </Typography>
              <Typography variant="body2">
                {new Date(pixData.calendario.dataDeVencimento).toLocaleDateString('pt-BR')}
              </Typography>
            </Stack>
          )}
          
          {pixData.status && (
            <Box>
              <Label 
                variant="soft" 
                color={
                  pixData.status === 'CONCLUIDA' ? 'success' :
                  pixData.status === 'ATIVA' ? 'info' :
                  'warning'
                }
              >
                Status: {pixData.status}
              </Label>
            </Box>
          )}

          {(pixData.qrcode || pixData.pixCopiaECola) && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Código PIX (Copia e Cola):
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  maxHeight: 150,
                  overflow: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {pixData.qrcode || pixData.pixCopiaECola}
                </Typography>
              </Box>
              <CopyToClipboard text={pixData.qrcode || pixData.pixCopiaECola} onCopy={() => handleCopy(pixData.qrcode || pixData.pixCopiaECola, 'Código PIX')}>
                <Button variant="contained" size="medium" fullWidth startIcon={<Iconify icon="solar:copy-bold" />}>
                  Copiar Código PIX (Copia e Cola)
                </Button>
              </CopyToClipboard>
            </Stack>
          )}

        </Stack>

        {verificando && (
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Verificando pagamento...
            </Typography>
          </Box>
        )}

        <Box sx={{ pt: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
            O pagamento será processado automaticamente quando confirmado
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
