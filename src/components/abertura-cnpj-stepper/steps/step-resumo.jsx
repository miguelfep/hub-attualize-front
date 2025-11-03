'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function InfoRow({ icon, label, value, onEditClick, step, onEdit, theme }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 2,
        px: 2,
        borderRadius: 1,
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[500], 0.04),
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Iconify icon={icon} width={24} sx={{ color: '#0096D9' }} />
        <Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
      {onEditClick && (
        <Button
          size="small"
          onClick={() => onEdit(step)}
          startIcon={<Iconify icon="solar:pen-bold-duotone" width={16} />}
        >
          Editar
        </Button>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function StepResumo({ formData, orcamento, onEdit, temAberturaGratuita, onSelectPlano }) {
  const theme = useTheme();
  const [planoSelecionado, setPlanoSelecionado] = useState(orcamento?.plano || null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  // Definir os planos disponíveis
  const planosDisponiveis = [
    {
      nome: 'START',
      valor: 199,
      faturamentoMax: 20000,
      features: ['Até R$ 20mil/mês', 'Simples Nacional', 'Suporte básico', 'Portal do cliente'],
      color: '#0096D9',
    },
    {
      nome: 'PLENO',
      valor: 349,
      faturamentoMax: 100000,
      features: ['Até R$ 100mil/mês', 'Simples Nacional', 'Suporte prioritário', 'Consultoria mensal'],
      color: '#FEC615',
      popular: true,
    },
    {
      nome: 'PREMIUM',
      valor: 549,
      faturamentoMax: 300000,
      features: ['Até R$ 300mil/mês', 'Qualquer regime', 'Suporte VIP 24/7', 'Planejamento tributário'],
      color: '#8B5CF6',
    },
  ];

  const handleSelectPlano = (plano) => {
    setPlanoSelecionado(plano.nome);
    if (onSelectPlano) {
      onSelectPlano(plano);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Confirme suas informações
      </Typography>

      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Revise os dados antes de continuar. Você pode editar qualquer informação.
      </Typography>

      {/* Dados Pessoais */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
          Dados Pessoais
        </Typography>
        <InfoRow icon="solar:user-bold-duotone" label="Nome" value={formData.nome} onEditClick step={0} onEdit={onEdit} theme={theme} />
        <InfoRow icon="solar:card-bold-duotone" label="CPF" value={formData.cpf} onEditClick step={0} onEdit={onEdit} theme={theme} />
        <InfoRow icon="solar:letter-bold-duotone" label="E-mail" value={formData.email} onEditClick step={0} onEdit={onEdit} theme={theme} />
        <InfoRow icon="solar:phone-bold-duotone" label="Telefone" value={formData.telefone} onEditClick step={0} onEdit={onEdit} theme={theme} />
      </Card>

      {/* Dados da Empresa */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
          Dados da Empresa
        </Typography>
        <InfoRow
          icon="solar:buildings-bold-duotone"
          label="Nome da Empresa"
          value={formData.nomeEmpresa}
          onEditClick
          step={1}
          onEdit={onEdit}
          theme={theme}
        />
        <InfoRow
          icon="solar:dollar-bold-duotone"
          label="Faturamento Mensal"
          value={formatCurrency(formData.faturamentoMensal)}
          onEditClick
          step={1}
          onEdit={onEdit}
          theme={theme}
        />
        <InfoRow
          icon="solar:users-group-rounded-bold-duotone"
          label="Número de Sócios"
          value={formData.numeroSocios}
          onEditClick
          step={1}
          onEdit={onEdit}
          theme={theme}
        />
      </Card>

      {/* Endereço */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
          Endereço
        </Typography>
        {formData.usarEnderecoFiscal ? (
          <InfoRow
            icon="solar:buildings-2-bold-duotone"
            label="Tipo de Endereço"
            value="Endereço Fiscal da Attualize (Curitiba - PR)"
            onEditClick
            step={2}
            onEdit={onEdit}
            theme={theme}
          />
        ) : (
          <>
            <InfoRow
              icon="solar:map-point-bold-duotone"
              label="Endereço Completo"
              value={`${formData.endereco}, ${formData.numero}${formData.complemento ? ` - ${formData.complemento}` : ''}`}
              onEditClick
              step={2}
              onEdit={onEdit}
              theme={theme}
            />
            <InfoRow
              icon="solar:city-bold-duotone"
              label="Cidade/UF"
              value={`${formData.cidade} - ${formData.estado}`}
              onEditClick
              step={2}
              onEdit={onEdit}
              theme={theme}
            />
          </>
        )}
      </Card>

      {/* Atividades */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
          Atividades
        </Typography>
        <InfoRow
          icon="solar:laptop-bold-duotone"
          label="Forma de Atuação"
          value={
            formData.formaAtuacao === 'online' ? 'Atendimento Online' :
            formData.formaAtuacao === 'presencial' ? 'Atendimento Presencial' :
            formData.formaAtuacao === 'ambos' ? 'Online e Presencial' : '-'
          }
          onEditClick
          step={3}
          onEdit={onEdit}
          theme={theme}
        />
        {formData.descricaoAtividade && (
          <InfoRow
            icon="solar:document-text-bold-duotone"
            label="Descrição"
            value={formData.descricaoAtividade}
            onEditClick
            step={3}
            onEdit={onEdit}
            theme={theme}
          />
        )}
      </Card>

      {/* Escolha de Planos - Apenas se não tiver bloqueio */}
      {orcamento && !orcamento.bloqueioCompraOnline && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Iconify icon="solar:star-bold-duotone" width={32} sx={{ color: '#FEC615' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Escolha seu Plano
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Recomendamos o plano <strong>{orcamento.plano}</strong> para seu faturamento, mas você pode escolher outro.
          </Typography>

          {/* Grid de Planos */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            {planosDisponiveis.map((plano) => {
              const isRecomendado = plano.nome === orcamento.plano;
              const isSelecionado = plano.nome === planoSelecionado;
              const valorFinal = plano.valor + 
                (orcamento.detalhes.adicionalFuncionarios || 0) + 
                (orcamento.detalhes.adicionalEnderecoFiscal || 0);

              return (
                <Card
                  key={plano.nome}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: `2px solid ${
                      isSelecionado 
                        ? plano.color 
                        : alpha(theme.palette.grey[500], 0.12)
                    }`,
                    bgcolor: isSelecionado ? alpha(plano.color, 0.08) : 'background.paper',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: plano.color,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(plano.color, 0.2)}`,
                    },
                  }}
                  onClick={() => handleSelectPlano(plano)}
                >
                  {/* Badge de Recomendado */}
                  {isRecomendado && (
                    <Chip
                      label="RECOMENDADO PARA VOCÊ"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#28a745',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}

                  {/* Badge Popular */}
                  {plano.popular && !isRecomendado && (
                    <Chip
                      label="MAIS POPULAR"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: plano.color,
                        color: '#333',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}

                  <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: plano.color, mb: 0.5 }}>
                        {plano.nome}
                      </Typography>
                      <Stack spacing={0.5}>
                        {plano.features.map((feature) => (
                          <Stack key={feature} direction="row" spacing={1} alignItems="center">
                            <Iconify 
                              icon="solar:check-circle-bold" 
                              width={16} 
                              sx={{ color: plano.color }} 
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                        A partir de
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: plano.color }}>
                        {formatCurrency(valorFinal)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        por mês
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {/* Adicionais e Custos */}
          {(orcamento.detalhes.adicionalFuncionarios > 0 || 
            orcamento.detalhes.adicionalEnderecoFiscal > 0 || 
            orcamento.custoAbertura > 0) && (
            <Card
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'info.dark' }}>
                📋 Detalhamento de custos:
              </Typography>
              <Stack spacing={0.5}>
                {orcamento.detalhes.adicionalFuncionarios > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    • Funcionários CLT: {formatCurrency(orcamento.detalhes.adicionalFuncionarios)}/mês
                  </Typography>
                )}
                {orcamento.detalhes.adicionalEnderecoFiscal > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    • Endereço Fiscal: {formatCurrency(orcamento.detalhes.adicionalEnderecoFiscal)}/mês
                  </Typography>
                )}
                {orcamento.custoAbertura > 0 && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                    • Abertura de CNPJ: {formatCurrency(orcamento.custoAbertura)} (pagamento único)
                  </Typography>
                )}
              </Stack>
            </Card>
          )}

          {/* Resumo de valores */}
          <Card
            sx={{
              p: 2,
              bgcolor: alpha('#0096D9', 0.08),
              border: `2px solid #0096D9`,
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Mensalidade do plano selecionado:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0096D9' }}>
                  {formatCurrency(planosDisponiveis.find(p => p.nome === planoSelecionado)?.valor || orcamento.valor)}/mês
                </Typography>
              </Stack>
              
              {orcamento.custoAbertura > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Abertura de CNPJ (única vez):
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatCurrency(orcamento.custoAbertura)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Benefício destacado - CONDICIONAL APENAS PARA PR */}
          {temAberturaGratuita && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha('#28a745', 0.1),
                border: `1px solid ${alpha('#28a745', 0.3)}`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="solar:gift-bold-duotone" width={24} sx={{ color: '#28a745' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#28a745' }}>
                  🎉 Parabéns! Você tem direito à Abertura de CNPJ GRÁTIS! (Exclusivo PR)
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* Caso especial: Análise Comercial Obrigatória */}
      {orcamento?.bloqueioCompraOnline && (
        <Card
          sx={{
            mb: 3,
            p: 3,
            bgcolor: alpha('#0096D9', 0.08),
            border: `2px solid #0096D9`,
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Iconify icon="solar:user-speak-rounded-bold-duotone" width={64} sx={{ color: '#0096D9' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0096D9' }}>
              Análise Comercial Necessária
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500, lineHeight: 1.8 }}>
              {orcamento.motivoBloqueio}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500, lineHeight: 1.8 }}>
              Nossa equipe comercial entrará em contato em até <strong>24 horas</strong> para agendar 
              uma reunião e apresentar a melhor proposta para o seu negócio.
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha('#28a745', 0.1),
                border: `1px solid ${alpha('#28a745', 0.3)}`,
                width: '100%',
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#28a745' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#28a745' }}>
                    O que vamos fazer por você:
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ✓ Análise detalhada do seu perfil e necessidades<br />
                  ✓ Proposta personalizada com melhor custo-benefício<br />
                  ✓ Consultoria especializada em planejamento tributário<br />
                  ✓ Suporte VIP dedicado ao seu negócio
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      )}

      {!orcamento && (
        <Card
          sx={{
            mb: 3,
            p: 3,
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={32} sx={{ color: 'warning.main' }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Orçamento Personalizado
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                Seu caso requer uma análise mais detalhada. Nossa equipe entrará em contato em até
                24 horas com um orçamento personalizado para suas necessidades.
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Elemento de urgência */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.error.main, 0.08),
          border: `1px dashed ${theme.palette.error.main}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:clock-circle-bold-duotone" width={24} sx={{ color: 'error.main' }} />
          <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 600 }}>
            ⏰ <strong>Últimas vagas</strong> com desconto especial! Finalize hoje e economize.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

