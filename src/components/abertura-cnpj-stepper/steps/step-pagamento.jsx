'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { updateLeadProgress } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StepPagamento({ formData, orcamento, onClose, temAberturaGratuita, leadId }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [periodicidade, setPeriodicidade] = useState('anual'); // anual ou mensal
  const [metodoPagamento, setMetodoPagamento] = useState('pix'); // pix, boleto (apenas mensal)
  const [numeroParcelas, setNumeroParcelas] = useState(12); // Para plano anual
  const [mostrarFormCartao, setMostrarFormCartao] = useState(false);
  
  // Dados do cartão
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
  });

  // Quando mudar para mensal, volta para pix como padrão
  useEffect(() => {
    if (periodicidade === 'mensal') {
      setMetodoPagamento('pix');
      setMostrarFormCartao(false);
    } else {
      setMostrarFormCartao(false); // Reset form cartão ao trocar
    }
  }, [periodicidade]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const valorTotal = orcamento
    ? periodicidade === 'anual'
      ? orcamento.valor * 12
      : orcamento.valor
    : 0;

  const descontoAnual = orcamento ? orcamento.valor * 12 * 0.1 : 0; // 10% desconto anual
  const valorComDesconto = periodicidade === 'anual' ? valorTotal - descontoAnual : valorTotal;
  
  // Custo de abertura (se aplicável)
  const custoAbertura = orcamento?.custoAbertura || 0;
  const valorTotalComAbertura = valorComDesconto + custoAbertura;

  const handleEnviarOrcamento = async () => {
    setLoading(true);
    try {
      // Atualizar lead com informações finais
      if (leadId) {
        // Se tem bloqueio (análise comercial), envia dados diferentes
        if (orcamento?.bloqueioCompraOnline) {
          await updateLeadProgress(leadId, {
            receberOrcamento: 'sim',
            observacoes: `Necessita análise comercial - ${orcamento.motivoBloqueio}`,
            additionalInfo: {
              etapa: 'aguardando-contato-comercial',
              analiseComercial: {
                motivo: orcamento.motivoBloqueio,
                planoDetectado: orcamento.plano,
                solicitadoEm: new Date().toISOString(),
                status: 'aguardando-agendamento',
              },
            },
          }, 'aguardando-contato-comercial');
        } else {
          // Fluxo normal - orçamento com valores
          await updateLeadProgress(leadId, {
            receberOrcamento: 'sim',
            observacoes: `Solicitou orçamento - Periodicidade: ${periodicidade} - Método: ${metodoPagamento}${custoAbertura > 0 ? ` - Custo abertura: R$ ${custoAbertura}` : ''}`,
            additionalInfo: {
              etapa: 'orcamento-solicitado',
              orcamento: {
                periodicidade,
                metodoPagamento,
                valorMensal: orcamento.valor,
                valorTotal: valorComDesconto,
                custoAbertura,
                valorTotalComAbertura,
                tipo: orcamento ? 'orcamento-automatico' : 'orcamento-manual',
                temAberturaGratuita,
                solicitadoEm: new Date().toISOString(),
              },
            },
          }, 'orcamento-solicitado');
        }
      }

      toast.success('Solicitação enviada com sucesso! Em breve entraremos em contato.');
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar. Tente novamente.');
    }
    setLoading(false);
  };

  const handlePagar = async () => {
    setLoading(true);
    try {
      // Preparar dados do pagamento
      const dadosPagamento = {
        periodicidade,
        metodoPagamento: periodicidade === 'anual' ? 'cartao' : metodoPagamento,
        valorMensal: orcamento.valor,
        valorTotal: valorComDesconto,
        custoAbertura,
        valorTotalComAbertura,
        tipo: 'pagamento-direto',
        temAberturaGratuita,
        finalizadoEm: new Date().toISOString(),
        status: 'aguardando-processamento',
      };

      // Se for plano anual, incluir dados do cartão e parcelas
      if (periodicidade === 'anual') {
        dadosPagamento.numeroParcelas = numeroParcelas;
        dadosPagamento.valorParcela = valorComDesconto / numeroParcelas;
        dadosPagamento.cartao = {
          numero: dadosCartao.numero.replace(/\s/g, ''),
          nome: dadosCartao.nome,
          validade: dadosCartao.validade,
          // CVV não deve ser salvo por segurança
        };
      }

      // Atualizar lead com informações finais de pagamento
      if (leadId) {
        await updateLeadProgress(leadId, {
          receberOrcamento: 'nao',
          observacoes: `Finalizou pagamento - ${periodicidade === 'anual' ? `${numeroParcelas}x de ${formatCurrency(valorComDesconto / numeroParcelas)}` : `Mensal via ${metodoPagamento.toUpperCase()}`} - Total: R$ ${valorTotalComAbertura.toFixed(2)}`,
          additionalInfo: {
            etapa: 'pagamento-finalizado',
            pagamento: dadosPagamento,
          },
        }, 'pagamento-finalizado');
      }

      // Simular envio para API de pagamento
      console.log('📤 Enviando para API de pagamento:', {
        leadId,
        ...dadosPagamento,
        // CVV é enviado mas não salvo
        cvv: periodicidade === 'anual' ? dadosCartao.cvv : null,
      });

      // Simular processamento (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(
        periodicidade === 'anual' 
          ? `Pagamento aprovado! ${numeroParcelas}x de ${formatCurrency(valorComDesconto / numeroParcelas)} no cartão.`
          : `Cadastro realizado! Você receberá o ${metodoPagamento === 'pix' ? 'PIX' : 'boleto'} por email todo mês.`
      );
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    }
    setLoading(false);
  };

  // Fluxo bloqueado: Análise comercial obrigatória
  if (!orcamento || orcamento.bloqueioCompraOnline) {
    return (
      <Box>
        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', py: 4 }}>
          <Iconify icon="solar:calendar-mark-bold-duotone" width={80} sx={{ color: '#0096D9' }} />
          
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Agendamento de Reunião Comercial
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
            {orcamento?.motivoBloqueio || 'Seu perfil requer uma análise mais detalhada para garantir o melhor custo-benefício.'}
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
            Nossa equipe comercial entrará em contato em até <strong>24 horas</strong> para agendar 
            uma reunião e apresentar a melhor proposta para o seu negócio.
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: alpha('#0096D9', 0.08),
              border: `2px solid #0096D9`,
              maxWidth: 500,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="solar:user-speak-rounded-bold-duotone" width={28} sx={{ color: '#0096D9' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0096D9' }}>
                  O que acontece agora?
                </Typography>
              </Stack>
              <Stack spacing={1} alignItems="flex-start" textAlign="left">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ✅ Seus dados foram salvos com sucesso
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  📞 Nosso time comercial vai entrar em contato
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  📅 Vamos agendar uma reunião no Google Meet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  💼 Apresentaremos a proposta personalizada
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Button
            onClick={handleEnviarOrcamento}
            disabled={loading}
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#FEC615',
              color: '#333',
              fontWeight: 700,
              px: 6,
              py: 2,
              '&:hover': {
                bgcolor: '#e5b213',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#333' }} />
            ) : (
              'Confirmar e Aguardar Contato'
            )}
          </Button>

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Resposta em até 24 horas úteis
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Fluxo com orçamento automático - opção de pagar
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Finalize sua contratação
      </Typography>

      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Escolha a periodicidade e forma de pagamento preferida.
      </Typography>

      {/* Periodicidade */}
      <Card sx={{ mb: 3, p: 3, overflow: 'visible' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
          Escolha seu Plano
        </Typography>

        <RadioGroup value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)}>
          {/* DESTAQUE: Plano Anual Parcelado */}
          <Card
            sx={{
              mb: 2,
              p: 3,
              cursor: 'pointer',
              border: `3px solid ${periodicidade === 'anual' ? '#FEC615' : alpha('#FEC615', 0.3)}`,
              bgcolor: periodicidade === 'anual' ? alpha('#FEC615', 0.12) : alpha('#FEC615', 0.04),
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'visible',
              mt: 2,
              '&:hover': {
                borderColor: '#FEC615',
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha('#FEC615', 0.3)}`,
              },
            }}
            onClick={() => setPeriodicidade('anual')}
          >
            {/* Badge Recomendado */}
            <Chip
              label="RECOMENDADO"
              size="small"
              sx={{
                position: 'absolute',
                top: -14,
                right: 16,
                bgcolor: '#28a745',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                zIndex: 1,
              }}
            />

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <FormControlLabel
                  value="anual"
                  control={<Radio />}
                  label={
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                          Plano Anual
                        </Typography>
                        <Chip 
                          label="ECONOMIZE 10%" 
                          size="small" 
                          sx={{ bgcolor: '#28a745', color: 'white', fontWeight: 700 }} 
                        />
                        {temAberturaGratuita && (
                          <Chip 
                            label="🎁 CNPJ GRÁTIS" 
                            size="small" 
                            sx={{ bgcolor: '#FEC615', color: '#333', fontWeight: 700 }} 
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                        💳 Pagamento à vista parcelado no cartão
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Pague o ano todo em até 12x sem juros com 10% de desconto
                      </Typography>
                    </Box>
                  }
                />
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                    12 parcelas de
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#FEC615', lineHeight: 1 }}>
                    {formatCurrency(orcamento.valor * 0.9)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    por mês
                  </Typography>
                </Box>
              </Stack>

              {/* Benefícios do Plano Anual */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  pt: 2, 
                  borderTop: `1px dashed ${alpha('#333', 0.2)}` 
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#28a745' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Economize {formatCurrency(descontoAnual)} ao ano
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify icon="solar:card-bold" width={18} sx={{ color: '#0096D9' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Parcelado em até 12x sem juros
                  </Typography>
                </Stack>
                {!temAberturaGratuita && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: '#8B5CF6' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Cancele quando quiser
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {/* Aviso de multa quando tem abertura gratuita */}
              {temAberturaGratuita && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: 'warning.main', mt: 0.25 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        ⚠️ Abertura CNPJ Gratuita
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        Como você tem direito à abertura gratuita (PR), caso cancele antes de 12 meses, 
                        será cobrada uma multa proporcional ao tempo restante.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Card>

          {/* Opção Mensal */}
          <Card
            sx={{
              p: 2,
              cursor: 'pointer',
              border: `2px solid ${periodicidade === 'mensal' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
              bgcolor: periodicidade === 'mensal' ? alpha('#0096D9', 0.08) : 'background.paper',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#0096D9',
              },
            }}
            onClick={() => setPeriodicidade('mensal')}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                value="mensal"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Pagamento Mensal
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Flexibilidade total • PIX ou Boleto recorrente
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0096D9' }}>
                  {formatCurrency(orcamento.valor)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  por mês
                </Typography>
              </Box>
            </Stack>
          </Card>
        </RadioGroup>
      </Card>

      {/* Resumo de Valores */}
      {custoAbertura > 0 && (
        <Card
          sx={{
            mb: 3,
            p: 3,
            bgcolor: alpha('#FF6B35', 0.08),
            border: `2px solid #FF6B35`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:file-text-bold-duotone" width={24} sx={{ color: '#FF6B35' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FF6B35' }}>
                📋 Resumo Financeiro
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  Mensalidade {periodicidade === 'anual' ? '(12 meses com 10% desconto)' : ''}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCurrency(valorComDesconto)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                  Abertura de CNPJ (pagamento único):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {formatCurrency(custoAbertura)}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total a Pagar:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0096D9' }}>
                  {formatCurrency(valorTotalComAbertura)}
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                * A abertura será cobrada apenas uma vez. Após isso, apenas a mensalidade.
              </Typography>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Método de Pagamento - Apenas para Plano Mensal */}
      {periodicidade === 'mensal' && (
        <Card sx={{ mb: 3, p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
            Escolha a Forma de Pagamento
          </Typography>

          <RadioGroup value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
            <Stack spacing={2}>
              <Card
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: `2px solid ${metodoPagamento === 'pix' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
                  bgcolor: metodoPagamento === 'pix' ? alpha('#0096D9', 0.08) : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#0096D9',
                  },
                }}
                onClick={() => setMetodoPagamento('pix')}
              >
                <FormControlLabel
                  value="pix"
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                      <Iconify icon="solar:wallet-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          PIX Mensal
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Aprovação instantânea • Pague todo mês via PIX
                        </Typography>
                      </Box>
                      {metodoPagamento === 'pix' && (
                        <Chip label="Mais rápido" size="small" sx={{ bgcolor: '#28a745', color: 'white' }} />
                      )}
                    </Stack>
                  }
                />
              </Card>

              <Card
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: `2px solid ${metodoPagamento === 'boleto' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
                  bgcolor: metodoPagamento === 'boleto' ? alpha('#0096D9', 0.08) : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#0096D9',
                  },
                }}
                onClick={() => setMetodoPagamento('boleto')}
              >
                <FormControlLabel
                  value="boleto"
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                      <Iconify icon="solar:bill-list-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Boleto Mensal
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Vencimento todo dia 10 • Fácil de pagar
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Card>
            </Stack>
          </RadioGroup>
        </Card>
      )}

      {/* Seletor de Parcelas - Apenas para Plano Anual */}
      {periodicidade === 'anual' && (
        <Card sx={{ mb: 3, p: 3, bgcolor: alpha('#FEC615', 0.08), border: `2px solid #FEC615` }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:card-bold-duotone" width={28} sx={{ color: '#FEC615' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FEC615' }}>
                💳 Escolha o número de parcelas
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {[1, 2, 3, 6, 9, 12].map((parcelas) => {
                const valorParcela = valorComDesconto / parcelas;
                return (
                  <Card
                    key={parcelas}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: `2px solid ${numeroParcelas === parcelas ? '#FEC615' : alpha(theme.palette.grey[500], 0.12)}`,
                      bgcolor: numeroParcelas === parcelas ? alpha('#FEC615', 0.12) : 'background.paper',
                      transition: 'all 0.2s ease',
                      minWidth: 120,
                      textAlign: 'center',
                      '&:hover': {
                        borderColor: '#FEC615',
                      },
                    }}
                    onClick={() => setNumeroParcelas(parcelas)}
                  >
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                      {parcelas}x de
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: numeroParcelas === parcelas ? '#FEC615' : 'text.primary' }}>
                      {formatCurrency(valorParcela)}
                    </Typography>
                    {parcelas === 12 && (
                      <Chip label="Melhor opção" size="small" sx={{ mt: 0.5, bgcolor: '#28a745', color: 'white', fontSize: '0.65rem' }} />
                    )}
                  </Card>
                );
              })}
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              * Valor total à vista com 10% de desconto: {formatCurrency(valorComDesconto)}
            </Typography>
          </Stack>
        </Card>
      )}

      {/* Formulário de Cartão - Apenas para Plano Anual */}
      {periodicidade === 'anual' && mostrarFormCartao && (
        <Card sx={{ mb: 3, p: 3, bgcolor: alpha('#0096D9', 0.04), border: `2px solid #0096D9` }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:card-bold-duotone" width={28} sx={{ color: '#0096D9' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0096D9' }}>
                Dados do Cartão de Crédito
              </Typography>
            </Stack>

            <TextField
              fullWidth
              label="Número do Cartão"
              value={dadosCartao.numero}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 16) {
                  const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                  setDadosCartao(prev => ({ ...prev, numero: formatted }));
                }
              }}
              placeholder="0000 0000 0000 0000"
              InputProps={{
                startAdornment: (
                  <Iconify icon="solar:card-bold" width={20} sx={{ mr: 1, color: 'text.disabled' }} />
                ),
              }}
            />

            <TextField
              fullWidth
              label="Nome no Cartão"
              value={dadosCartao.nome}
              onChange={(e) => setDadosCartao(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              InputProps={{
                startAdornment: (
                  <Iconify icon="solar:user-bold" width={20} sx={{ mr: 1, color: 'text.disabled' }} />
                ),
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Validade"
                value={dadosCartao.validade}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = `${value.substring(0, 2)  }/${  value.substring(2, 4)}`;
                  }
                  if (value.length <= 5) {
                    setDadosCartao(prev => ({ ...prev, validade: value }));
                  }
                }}
                placeholder="MM/AA"
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <Iconify icon="solar:calendar-bold" width={20} sx={{ mr: 1, color: 'text.disabled' }} />
                  ),
                }}
              />

              <TextField
                label="CVV"
                value={dadosCartao.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setDadosCartao(prev => ({ ...prev, cvv: value }));
                  }
                }}
                placeholder="000"
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <Iconify icon="solar:lock-password-bold" width={20} sx={{ mr: 1, color: 'text.disabled' }} />
                  ),
                }}
              />
            </Stack>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha('#28a745', 0.08),
                border: `1px solid ${alpha('#28a745', 0.3)}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:shield-check-bold" width={20} sx={{ color: '#28a745' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  🔒 Pagamento 100% seguro e criptografado
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Botão de ação */}
      {periodicidade === 'anual' && !mostrarFormCartao ? (
        <Button
          onClick={() => setMostrarFormCartao(true)}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            bgcolor: '#FEC615',
            color: '#333',
            fontWeight: 700,
            py: 2,
            fontSize: '1.125rem',
            '&:hover': {
              bgcolor: '#e5b213',
            },
          }}
        >
          Continuar para Pagamento
        </Button>
      ) : (
        <Button
          onClick={handlePagar}
          disabled={loading || (periodicidade === 'anual' && (!dadosCartao.numero || !dadosCartao.nome || !dadosCartao.validade || !dadosCartao.cvv))}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            bgcolor: '#FEC615',
            color: '#333',
            fontWeight: 700,
            py: 2,
            fontSize: '1.125rem',
            '&:hover': {
              bgcolor: '#e5b213',
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.grey[500], 0.3),
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#333' }} /> : 'Finalizar Contratação'}
        </Button>
      )}

      {/* Garantias */}
      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 3 }} flexWrap="wrap">
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Iconify icon="solar:shield-check-bold-duotone" width={20} sx={{ color: '#28a745' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Pagamento 100% Seguro
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Iconify icon="solar:refresh-bold-duotone" width={20} sx={{ color: '#0096D9' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Garantia de 30 dias
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: '#FEC615' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Dados Criptografados
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

