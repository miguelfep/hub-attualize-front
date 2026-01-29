import axios from 'axios';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import {
  Grid,
  Card,
  Stack,
  Alert,
  Button,
  Divider,
  Container,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fCurrency } from 'src/utils/format-number';

import { consultarCobrancaPix } from 'src/actions/pix';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { QrCodePix } from 'src/components/pix/qrcode-pix';

const statusColors = {
  EMABERTO: 'warning',
  VENCIDO: 'error',
  CANCELADO: 'info',
  RECEBIDO: 'success',
};

const statusTexts = {
  EMABERTO: 'Aguardando pagamento',
  VENCIDO: 'Vencida',
  CANCELADO: 'Cancelado',
  RECEBIDO: 'Pago',
};

// Componente para exibir dados PIX da cobrança
function PixCobrancaDisplay({ cobranca, invoice, onPagamentoConfirmado }) {
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Tentar encontrar TXID em outras cobranças da invoice se não estiver nesta
  const encontrarTxidNaInvoice = () => {
    if (!invoice?.cobrancas || !Array.isArray(invoice.cobrancas)) {
      return null;
    }

    // Procurar TXID em todas as cobranças PIX da invoice
    const cobrancaPix = invoice.cobrancas.find((cob) => cob.metodoPagamento === 'pix');
    if (cobrancaPix) {
      const cob = cobrancaPix;
      const txid = cob.pixTxid 
        || cob.txid 
        || cob.pix?.txid 
        || cob.pix?.pixTxid
        || (typeof cob.pix === 'string' ? (() => {
          try {
            return JSON.parse(cob.pix)?.txid || JSON.parse(cob.pix)?.pixTxid;
          } catch {
            return null;
          }
        })() : null);
      
      if (txid) {
        console.log('🔑 TXID encontrado em outra cobrança da invoice:', txid);
        return txid;
      }
    }
    
    return null;
  };

  // Função para extrair dados PIX da cobrança
  const extrairDadosPix = (cobrancaParam) => {
    let dadosPix = null;

    console.log('🔍 Extraindo dados PIX da cobrança:', {
      metodoPagamento: cobrancaParam.metodoPagamento,
      temPix: !!cobrancaParam.pix,
      temBoleto: !!cobrancaParam.boleto,
      pixTxid: cobrancaParam.pixTxid,
      txid: cobrancaParam.txid,
    });

    // 1. Verificar se há dados PIX diretamente na cobrança (campo pix)
    if (cobrancaParam.pix) {
      try {
        dadosPix = typeof cobrancaParam.pix === 'string' 
          ? JSON.parse(cobrancaParam.pix) 
          : cobrancaParam.pix;
        
        console.log('📦 Dados PIX extraídos do campo pix:', dadosPix);
        
        // Normalizar estrutura
        if (dadosPix) {
          // Normalizar valor (pode vir como objeto ou número)
          let valorNormalizado = cobrancaParam.valor;
          if (dadosPix.valor) {
            if (typeof dadosPix.valor === 'object') {
              valorNormalizado = dadosPix.valor.original || dadosPix.valor.final || cobrancaParam.valor;
            } else {
              valorNormalizado = dadosPix.valor;
            }
          }

          const resultado = {
            // Seguindo documentação: pixCopiaECola é o campo principal, qrcode é alias
            pixCopiaECola: dadosPix.pixCopiaECola || dadosPix.qrcode || dadosPix.pixQrCode,
            qrcode: dadosPix.pixCopiaECola || dadosPix.qrcode || dadosPix.pixQrCode,
            qrcodeBase64: dadosPix.qrcodeBase64,
            valor: valorNormalizado,
            chave: dadosPix.chave || dadosPix.pixChave || '',
            txid: dadosPix.txid || dadosPix.pixTxid || '',
            status: dadosPix.status,
            calendario: dadosPix.calendario || {},
            // Campos auxiliares da documentação
            expirado: dadosPix.expirado || false,
            podeGerarNovo: dadosPix.podeGerarNovo !== false,
            expiraEm: dadosPix.expiraEm,
          };

          console.log('✅ Dados PIX normalizados:', resultado);
          return resultado;
        }
      } catch (error) {
        console.error('❌ Erro ao processar campo pix:', error);
      }
    }

    // 2. Verificar se há dados PIX no campo boleto (legado)
    if (cobrancaParam.boleto) {
      try {
        const boletoData = typeof cobrancaParam.boleto === 'string'
          ? JSON.parse(cobrancaParam.boleto)
          : cobrancaParam.boleto;
        
        if (boletoData.pixCopiaECola || boletoData.pixQrCode || boletoData.qrcode) {
          return {
            // Seguindo documentação: pixCopiaECola é o campo principal
            pixCopiaECola: boletoData.pixCopiaECola || boletoData.pixQrCode || boletoData.qrcode,
            qrcode: boletoData.pixCopiaECola || boletoData.pixQrCode || boletoData.qrcode,
            qrcodeBase64: boletoData.qrcodeBase64,
            valor: cobrancaParam.valor,
            chave: boletoData.pixChave || boletoData.chave || '',
            txid: boletoData.pixTxid || boletoData.txid || '',
            status: boletoData.status,
            calendario: boletoData.calendario || {},
          };
        }
      } catch (error) {
        console.error('Erro ao processar campo boleto:', error);
      }
    }

    // 3. Verificar se há txid na cobrança para buscar da API
    // Verificar múltiplos campos possíveis onde o TXID pode estar
    let txid = cobrancaParam.pixTxid 
      || cobrancaParam.txid 
      || cobrancaParam.pix?.txid 
      || cobrancaParam.pix?.pixTxid;
    
    // Tentar parsear se for string
    if (!txid && typeof cobrancaParam.pix === 'string') {
      try {
        const pixParsed = JSON.parse(cobrancaParam.pix);
        txid = pixParsed.txid || pixParsed.pixTxid;
      } catch (e) {
        // Ignorar erro de parse
      }
    }
    
    // Tentar buscar no boleto também
    if (!txid && cobrancaParam.boleto) {
      try {
        const boletoParsed = typeof cobrancaParam.boleto === 'string' 
          ? JSON.parse(cobrancaParam.boleto) 
          : cobrancaParam.boleto;
        txid = boletoParsed.pixTxid || boletoParsed.txid;
      } catch (e) {
        // Ignorar erro de parse
      }
    }
    
    // Se ainda não encontrou, tentar buscar em outras cobranças da invoice
    if (!txid && invoice?.cobrancas) {
      txid = encontrarTxidNaInvoice();
    }
    
    if (txid) {
      console.log('🔑 TXID encontrado, precisa buscar da API:', txid);
      return {
        txid,
        valor: cobrancaParam.valor,
        chave: cobrancaParam.pixChave || cobrancaParam.chave || '',
        precisaBuscar: true, // Flag para indicar que precisa buscar da API
      };
    }

    console.log('⚠️ Nenhum dado PIX encontrado na cobrança. Cobrança completa:', cobrancaParam);
    return null;
  };

  // Buscar dados PIX da API usando TXID
  const buscarPixDaApi = async (txid, silent = false) => {
    if (!txid) {
      console.log('❌ TXID não fornecido para busca');
      return null;
    }

    if (!silent) {
      setBuscando(true);
    }
    
    console.log(`🔎 Buscando PIX da API com TXID: ${txid} (silent: ${silent})`);
    
    try {
      const cobrancaPix = await consultarCobrancaPix(txid);
      console.log('📥 Resposta da API:', cobrancaPix);
      
      if (cobrancaPix && (cobrancaPix.pixCopiaECola || cobrancaPix.qrcode || cobrancaPix.qrcodeBase64)) {
        // Normalizar valor (pode vir como objeto ou número)
        let valorNormalizado = cobranca.valor;
        if (cobrancaPix.valor) {
          if (typeof cobrancaPix.valor === 'object') {
            valorNormalizado = cobrancaPix.valor.original || cobrancaPix.valor.final || cobranca.valor;
          } else {
            valorNormalizado = cobrancaPix.valor;
          }
        }

        const dadosNormalizados = {
          // Seguindo documentação: pixCopiaECola é o campo principal
          pixCopiaECola: cobrancaPix.pixCopiaECola || cobrancaPix.qrcode || '',
          qrcode: cobrancaPix.pixCopiaECola || cobrancaPix.qrcode || '',
          qrcodeBase64: cobrancaPix.qrcodeBase64,
          valor: valorNormalizado,
          chave: cobrancaPix.chave || '',
          txid: cobrancaPix.txid || txid,
          status: cobrancaPix.status,
          calendario: cobrancaPix.calendario || {},
          // Campos auxiliares da documentação
          expirado: cobrancaPix.expirado || false,
          podeGerarNovo: cobrancaPix.podeGerarNovo !== false,
          expiraEm: cobrancaPix.expiraEm,
        };
        
        console.log('📊 Dados normalizados da API:', {
          temPixCopiaECola: !!dadosNormalizados.pixCopiaECola,
          temQrcode: !!dadosNormalizados.qrcode,
          pixCopiaEColaLength: dadosNormalizados.pixCopiaECola?.length,
          dadosNormalizados,
        });
        
        setPixData(dadosNormalizados);
        console.log('✅ Dados PIX carregados com sucesso e salvos no estado:', dadosNormalizados);
        console.log('✅ Verificação de QR Code:', {
          temPixCopiaECola: !!dadosNormalizados.pixCopiaECola,
          temQrcode: !!dadosNormalizados.qrcode,
          temQrcodeBase64: !!dadosNormalizados.qrcodeBase64,
          pixCopiaEColaLength: dadosNormalizados.pixCopiaECola?.length,
        });
        
        // Se o status for CONCLUIDA, atualizar invoice para pago
        if (dadosNormalizados.status === 'CONCLUIDA' && onPagamentoConfirmado) {
          console.log('💰 Pagamento confirmado! Atualizando invoice...');
          onPagamentoConfirmado(dadosNormalizados);
        }
        
        if (!silent) {
          toast.success('QR Code PIX carregado!');
        }
        return dadosNormalizados;
      } 
        console.log('⚠️ Resposta da API não contém QR Code ainda');
      
    } catch (error) {
      console.error('❌ Erro ao buscar PIX da API:', error);
      if (!silent) {
        // Não mostrar erro em polling silencioso
        if (error.response?.status !== 404) {
          toast.error('Erro ao buscar dados do PIX');
        }
      }
    } finally {
      if (!silent) {
        setBuscando(false);
      }
    }
    
    return null;
  };

  // Efeito para extrair dados PIX quando componente monta ou cobrança muda
  useEffect(() => {
    console.log('🔄 Efeito executado - Cobrança atualizada:', {
      cobrancaId: cobranca._id,
      metodoPagamento: cobranca.metodoPagamento,
      temPix: !!cobranca.pix,
      pixTxid: cobranca.pixTxid,
      txid: cobranca.txid,
      cobrancaCompleta: cobranca,
    });
    
    // Buscar imediatamente sem delay
    const dados = extrairDadosPix(cobranca);
    
    if (dados) {
      console.log('📊 Dados extraídos:', dados);
      
      if (dados.precisaBuscar && dados.txid && !buscando) {
        // Se tem TXID mas não tem QR Code, buscar da API imediatamente
        console.log('🔍 Buscando PIX da API com TXID:', dados.txid);
        buscarPixDaApi(dados.txid, true).then((resultado) => {
          if (resultado) {
            console.log('✅ Dados PIX obtidos da API:', resultado);
          }
        });
      } else if (dados.pixCopiaECola || dados.qrcode || dados.qrcodeBase64) {
        // Se já tem QR Code, usar diretamente
        console.log('✅ Usando dados PIX da cobrança (tem QR Code):', dados);
        setPixData(dados);
      } else {
        console.log('⚠️ Dados extraídos mas sem QR Code, precisa buscar');
      }
    } else {
      console.log('⚠️ Nenhum dado PIX encontrado na cobrança');
      
      // Se não encontrou dados, tentar buscar TXID em outras cobranças
      const txidAlternativo = encontrarTxidNaInvoice();
      if (txidAlternativo && !buscando) {
        console.log('🔍 TXID encontrado em outra cobrança, buscando:', txidAlternativo);
        buscarPixDaApi(txidAlternativo, true).then((resultado) => {
          if (resultado) {
            console.log('✅ Dados PIX obtidos da API (outra cobrança):', resultado);
          }
        });
      } else {
        // Tentar encontrar TXID diretamente na cobrança atual
        const txidDireto = cobranca.pixTxid || cobranca.txid;
        if (txidDireto && !buscando) {
          console.log('🔍 TXID encontrado diretamente na cobrança, buscando:', txidDireto);
          buscarPixDaApi(txidDireto, true).then((resultado) => {
            if (resultado) {
              console.log('✅ Dados PIX obtidos da API (TXID direto):', resultado);
            }
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobranca._id, cobranca.pix, cobranca.boleto, cobranca.pixTxid, cobranca.txid, cobranca.metodoPagamento]);

  // Verificar pagamento periodicamente quando temos dados PIX
  useEffect(() => {
    if (!(pixData?.txid && pixData.status !== 'CONCLUIDA' && cobranca.status !== 'RECEBIDO')) {
      return undefined;
    }
    
    const interval = setInterval(async () => {
      try {
        const cobrancaPix = await consultarCobrancaPix(pixData.txid);
        
        if (cobrancaPix?.status === 'CONCLUIDA') {
          clearInterval(interval);
          console.log('💰 Pagamento confirmado via polling!');
          
          // Atualizar dados locais
          setPixData((prev) => ({ ...prev, status: 'CONCLUIDA' }));
          
          // Atualizar invoice para pago
          if (onPagamentoConfirmado) {
            onPagamentoConfirmado({
              status: 'CONCLUIDA',
              txid: pixData.txid,
              valor: pixData.valor,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Parar após 10 minutos
    const timeout = setTimeout(() => clearInterval(interval), 600000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixData?.txid, pixData?.status, cobranca.status]);

  // Polling mais agressivo para buscar dados PIX se ainda não estiverem disponíveis
  useEffect(() => {
    // Tentar encontrar TXID de múltiplas formas
    let txid = cobranca.pixTxid || cobranca.txid;
    
    if (!txid && cobranca.pix) {
      try {
        const pixParsed = typeof cobranca.pix === 'string' ? JSON.parse(cobranca.pix) : cobranca.pix;
        txid = pixParsed.txid || pixParsed.pixTxid;
      } catch (e) {
        // Ignorar
      }
    }
    
    // Se ainda não encontrou, buscar em outras cobranças
    if (!txid) {
      txid = encontrarTxidNaInvoice();
    }
    
    console.log('🔄 Polling - Estado atual:', {
      temPixData: !!pixData,
      temQrcode: !!(pixData?.pixCopiaECola || pixData?.qrcode || pixData?.qrcodeBase64),
      txid,
      buscando,
      metodoPagamento: cobranca.metodoPagamento,
    });
    
    if (!(!pixData && txid && !buscando && cobranca.metodoPagamento === 'pix')) {
      return undefined;
    }
    
    let tentativas = 0;
    const maxTentativas = 60; // Máximo de 60 tentativas (2 minutos)
    
    // Primeira tentativa imediata
    buscarPixDaApi(txid, true).then((dados) => {
      if (dados && (dados.pixCopiaECola || dados.qrcode || dados.qrcodeBase64)) {
        console.log('✅ QR Code encontrado na primeira tentativa!');
        tentativas = maxTentativas; // Parar polling
      }
    });
    
    // Depois tentar a cada 2 segundos (mais agressivo)
    const interval = setInterval(async () => {
      if (!pixData && tentativas < maxTentativas) {
        tentativas += 1;
        console.log(`🔄 Tentativa ${tentativas}/${maxTentativas} de buscar PIX com TXID: ${txid}`);
        const dados = await buscarPixDaApi(txid, true); // Busca silenciosa
        if (dados && (dados.pixCopiaECola || dados.qrcode || dados.qrcodeBase64)) {
          console.log('✅ QR Code encontrado na tentativa', tentativas);
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 2000); // Tentar a cada 2 segundos

    // Parar após 2 minutos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('⏱️ Timeout: parando busca de PIX após 2 minutos');
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixData, cobranca.pixTxid, cobranca.txid, cobranca.metodoPagamento, cobranca.pix]);

  // Se temos dados PIX completos, exibir componente
  // Verificar se tem QR Code (pixCopiaECola, qrcode ou qrcodeBase64)
  if (pixData && (pixData.pixCopiaECola || pixData.qrcode || pixData.qrcodeBase64)) {
    console.log('✅ Exibindo QR Code PIX - Dados completos:', {
      temPixCopiaECola: !!pixData.pixCopiaECola,
      temQrcode: !!pixData.qrcode,
      temQrcodeBase64: !!pixData.qrcodeBase64,
      pixData,
    });
    return (
      <>
        <Divider sx={{ mb: 2 }} />
        <QrCodePix pixData={pixData} />
      </>
    );
  }

  // Se está buscando, mostrar loading
  if (buscando || loading) {
    return (
      <>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Buscando dados do QR Code PIX...
          </Typography>
        </Stack>
      </>
    );
  }

  // Fallback: exibir informações básicas com botão para buscar
  const txidParaBuscar = cobranca.pixTxid || cobranca.txid || encontrarTxidNaInvoice();
  
  console.log('⚠️ Estado atual do PIX (fallback):', {
    temPixData: !!pixData,
    temQrcode: !!(pixData?.qrcode || pixData?.qrcodeBase64),
    buscando,
    loading,
    txidCobranca: cobranca.pixTxid || cobranca.txid,
    txidEncontrado: txidParaBuscar,
    metodoPagamento: cobranca.metodoPagamento,
  });
  
  return (
    <>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        <Alert severity="info">
          QR Code PIX sendo gerado. Aguarde alguns instantes...
        </Alert>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Valor:
          </Typography>
          <Typography variant="h6">{fCurrency(cobranca.valor)}</Typography>
        </Stack>
        {txidParaBuscar ? (
          <>
            <Button
              variant="outlined"
              onClick={() => buscarPixDaApi(txidParaBuscar, false)}
              disabled={buscando}
              startIcon={buscando ? <CircularProgress size={16} /> : <Iconify icon="solar:refresh-bold" />}
              fullWidth
            >
              {buscando ? 'Buscando QR Code PIX...' : 'Buscar QR Code PIX'}
            </Button>
            <Alert severity="info">
              Buscando QR Code PIX automaticamente... (TXID: {txidParaBuscar.substring(0, 20)}...)
            </Alert>
          </>
        ) : (
          <Alert severity="warning">
            TXID não encontrado. O QR Code PIX pode estar sendo processado. 
            Aguarde alguns instantes ou recarregue a página.
          </Alert>
        )}
      </Stack>
    </>
  );
}

export function CobrancaExistente({ invoice, onPagamentoConfirmado }) {
  const { copy } = useCopyToClipboard();

  const handleDownload = async (codigoSolicitacao) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );

      const { pdf } = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      link.click();
      toast.success('Download concluído!');
    } catch (error) {
      toast.error('Erro ao baixar o boleto.');
    }
  };

  const handleCopy = async (text, successMessage) => {
    if (!text || text === 'null' || text === 'undefined') {
      toast.error('Dados de pagamento não disponíveis. Tente novamente em alguns instantes.');
      return;
    }

    try {
      const result = await copy(text);
      if (result) {
        toast.success(successMessage);
      } else {
        toast.error('Erro ao copiar para a área de transferência.');
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  return (
    <Container sx={{ pt: 5, pb: 10, maxWidth: '800px' }}>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Detalhes da Cobrança
      </Typography>
      {invoice.cobrancas.map((cobranca, index) => (
        <Grid container spacing={3} justifyContent="center" key={cobranca._id || index}>
          <Grid item xs={12}>
            <Card sx={{ margin: 'auto', maxWidth: '600px' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {`Cobrança: ${cobranca.metodoPagamento.toUpperCase()}`}
                </Typography>
                <Label color={statusColors[cobranca.status]} variant="filled" sx={{ mb: 3 }}>
                  {statusTexts[cobranca.status]}
                </Label>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Valor
                    </Typography>
                    <Typography variant="h4" color="warning">
                      {fCurrency(cobranca.valor)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Data de Vencimento
                    </Typography>
                    <Typography variant="subtitle1">
                      {new Date(cobranca.dataVencimento).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>

                {cobranca.metodoPagamento === 'boleto' && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      {(() => {
                        try {
                          const boletoData = typeof cobranca.boleto === 'string'
                            ? JSON.parse(cobranca.boleto)
                            : cobranca.boleto;
                          const pixCopiaECola = boletoData?.pixCopiaECola;

                          if (pixCopiaECola && pixCopiaECola !== 'null' && pixCopiaECola !== null) {
                            return (
                              <Button
                                variant="contained"
                                startIcon={<Iconify width={16} icon="eva:copy-outline" />}
                                onClick={() =>
                                  handleCopy(
                                    pixCopiaECola,
                                    'Chave pix copiada!'
                                  )
                                }
                                fullWidth
                              >
                                Pagar com Pix Copia e cola
                              </Button>
                            );
                          }
                          return null;
                        } catch (error) {
                          console.error('Erro ao processar boleto:', error);
                          return null;
                        }
                      })()}

                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:copy-outline" />}
                        onClick={() =>
                          handleCopy(
                            JSON.parse(cobranca.boleto).linhaDigitavel,
                            'Linha Digitável copiada!'
                          )
                        }
                        fullWidth
                      >
                        Pagar com Linha Digitável
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:file-outline" />}
                        onClick={() =>
                          handleDownload(JSON.parse(cobranca.boleto).codigoSolicitacao)
                        }
                        fullWidth
                      >
                        Download do Boleto
                      </Button>
                    </Stack>
                  </>
                )}
                {cobranca.metodoPagamento === 'pix' && (
                  <PixCobrancaDisplay 
                    cobranca={cobranca} 
                    invoice={invoice}
                    onPagamentoConfirmado={onPagamentoConfirmado}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ))}
    </Container>
  );
}
