'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { createLead, updateLeadProgress } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { StepResumo } from './steps/step-resumo';
import { StepEndereco } from './steps/step-endereco';
import { StepPagamento } from './steps/step-pagamento';
import { StepAtividades } from './steps/step-atividades';
import { StepDadosEmpresa } from './steps/step-dados-empresa';
import { StepDadosPessoais } from './steps/step-dados-pessoais';

// ----------------------------------------------------------------------

const STEPS = [
  { label: 'Dados Pessoais', icon: 'solar:user-bold-duotone' },
  { label: 'Dados da Empresa', icon: 'solar:buildings-bold-duotone' },
  { label: 'Endereço', icon: 'solar:map-point-bold-duotone' },
  { label: 'Atividades', icon: 'solar:clipboard-list-bold-duotone' },
  { label: 'Resumo', icon: 'solar:eye-bold-duotone' },
  { label: 'Pagamento', icon: 'solar:card-bold-duotone' },
];

// ----------------------------------------------------------------------

// Componente de ícone customizado do stepper (fora do render para evitar re-criação)
function CustomStepIcon({ active, completed, icon, theme }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: completed
          ? '#28a745'
          : active
            ? '#0096D9'
            : alpha(theme.palette.grey[500], 0.2),
        color: active || completed ? 'white' : 'text.disabled',
        transition: 'all 0.3s ease',
      }}
    >
      {completed ? (
        <Iconify icon="solar:check-circle-bold" width={24} />
      ) : (
        <Iconify icon={icon} width={24} />
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function AberturaCnpjStepper({ onClose }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const contentRef = useRef(null);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    
    // Dados da Empresa
    nomeEmpresa: '',
    faturamentoMensal: '',
    numeroSocios: 1,
    
    // Endereço
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    usarEnderecoFiscal: false, // Novo campo
    
    // Atividades
    atividadePrincipal: 'psicologo',
    descricaoAtividade: '',
    formaAtuacao: '', // online, presencial, ambos
    possuiFuncionarios: false,
    numeroFuncionarios: 0,
    
    // Orçamento
    valorOrcamento: null,
    planoSelecionado: null,
  });

  const [orcamentoAutomatico, setOrcamentoAutomatico] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  
  // Verificar se tem direito à abertura gratuita (apenas PR)
  const temAberturaGratuita = formData.estado === 'PR';

  // Função para rastrear páginas visitadas
  const trackPageVisit = useCallback(async (page) => {
    if (!leadId) return;
    
    try {
      await updateLeadProgress(leadId, {
        paginasVisitadas: [page],
      });
    } catch (error) {
      console.error('Erro ao rastrear página:', error);
    }
  }, [leadId]);

  // Salvar progresso na API
  const salvarProgresso = useCallback(async (etapa, isAutoSave = false) => {
    setSaving(true);
    
    try {
      // Se não tem leadId, criar novo lead (Step 0)
      if (!leadId && activeStep === 0) {
        // Validar campos obrigatórios antes de criar
        if (!formData.nome || !formData.email || !formData.telefone) {
          if (!isAutoSave) {
            toast.warning('Preencha os campos obrigatórios');
          }
          return;
        }

        const result = await createLead({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          dataNascimento: formData.dataNascimento,
          origem: 'landing-psicologo-stepper',
          segment: 'psicologo',
          paginasVisitadas: ['/abertura-cnpj-psicologo'],
        });
        
        console.log('Result:', result);

        if (result.success) {
          setLeadId(result.leadId);
          localStorage.setItem('aberturaCnpj_leadId', result.leadId);
          setLastSaved(new Date());
          console.log('Lead criado:', result.leadId);
        } else {
          throw new Error(result.error || 'Erro ao criar lead');
        }
      } 
      // Se já tem leadId, atualizar
      else if (leadId) {
        const dadosParaEnviar = {};
        
        // Adicionar dados conforme o step
        if (activeStep >= 1) {
          dadosParaEnviar.additionalInfo = {
            nomeEmpresa: formData.nomeEmpresa,
            faturamentoMensal: formData.faturamentoMensal,
            numeroSocios: formData.numeroSocios,
          };
        }
        
        if (activeStep >= 2) {
          dadosParaEnviar.estado = formData.estado;
          dadosParaEnviar.cidade = formData.cidade;
          dadosParaEnviar.additionalInfo = {
            ...dadosParaEnviar.additionalInfo,
            endereco: {
              cep: formData.cep,
              endereco: formData.endereco,
              numero: formData.numero,
              complemento: formData.complemento,
              bairro: formData.bairro,
              usarEnderecoFiscal: formData.usarEnderecoFiscal,
            },
          };
        }
        
        if (activeStep >= 3) {
          dadosParaEnviar.additionalInfo = {
            ...dadosParaEnviar.additionalInfo,
            atividades: {
              atividadePrincipal: formData.atividadePrincipal,
              descricaoAtividade: formData.descricaoAtividade,
              formaAtuacao: formData.formaAtuacao,
              possuiFuncionarios: formData.possuiFuncionarios,
              numeroFuncionarios: formData.numeroFuncionarios,
            },
          };
        }
        
        if (activeStep >= 4 && orcamentoAutomatico) {
          dadosParaEnviar.additionalInfo = {
            ...dadosParaEnviar.additionalInfo,
            orcamento: {
              plano: orcamentoAutomatico.plano,
              valor: orcamentoAutomatico.valor,
              detalhes: orcamentoAutomatico.detalhes,
              temAberturaGratuita,
            },
          };
        }

        const result = await updateLeadProgress(leadId, dadosParaEnviar, etapa);
        
        if (result.success) {
          setLastSaved(new Date());
          console.log('Lead atualizado:', result.leadId);
        } else {
          throw new Error(result.error || 'Erro ao atualizar lead');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar progresso:', error);
      // Não mostra toast de erro para não incomodar o usuário
    } finally {
      setSaving(false);
    }
  }, [leadId, activeStep, formData, orcamentoAutomatico, temAberturaGratuita]);

  // Autosave - salva automaticamente após edições
  const autoSave = useCallback(async () => {
    // Só faz autosave se tiver pelo menos email (pra criar) ou leadId (pra atualizar)
    if (!formData.email && !leadId) return;
    
    // Não faz autosave no step de pagamento
    if (activeStep === 5) return;

    const etapas = ['dados-pessoais', 'dados-empresa', 'endereco', 'atividades', 'resumo'];
    await salvarProgresso(etapas[activeStep], true); // true = autosave silencioso
  }, [formData, leadId, activeStep, salvarProgresso]);

  // Atualizar dados do formulário com autosave
  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Se mudar forma de atuação para presencial ou ambos, desmarcar endereço fiscal
      if (field === 'formaAtuacao' && (value === 'presencial' || value === 'ambos')) {
        newData.usarEnderecoFiscal = false;
      }
      
      return newData;
    });
    
    // Resetar orçamento se mudar campos que afetam o cálculo
    const camposQueAfetamOrcamento = [
      'faturamentoMensal',
      'numeroFuncionarios',
      'estado',
      'usarEnderecoFiscal',
      'formaAtuacao'
    ];
    
    if (camposQueAfetamOrcamento.includes(field)) {
      console.log(`🔄 Campo ${field} mudou, resetando orçamento para recálculo`);
      setOrcamentoAutomatico(null); // Força recálculo no próximo step 4
    }
    
    // Trigger autosave após 2 segundos de inatividade
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);
  }, [autoSave]);

  // Calcular orçamento automaticamente
  const calcularOrcamento = useCallback(() => {
    const { faturamentoMensal, numeroFuncionarios, usarEnderecoFiscal } = formData;
    
    // Converter para número se vier como string
    const faturamento = Number(faturamentoMensal);
    
    console.log('Faturamento original:', faturamentoMensal);
    console.log('Faturamento convertido:', faturamento);
    console.log('Número de funcionários:', numeroFuncionarios);
    
    // Validar se é um número válido
    if (!faturamento || faturamento <= 0) {
      console.log('Faturamento inválido');
      return null;
    }
    
    // REGRA 1: Faturamento >= 300k = análise manual obrigatória
    if (faturamento >= 300000) {
      console.log('Faturamento >= 300k - análise manual obrigatória');
      return {
        valor: null,
        plano: 'ANÁLISE_COMERCIAL',
        bloqueioCompraOnline: true,
        motivoBloqueio: 'Faturamento de R$ 300 mil/mês ou mais requer análise personalizada e planejamento tributário avançado.',
        detalhes: {
          valorBase: 0,
          adicionalFuncionarios: 0,
          adicionalEnderecoFiscal: 0,
        },
      };
    }
    
    // REGRA 2: Faturamento > 150k E mais de 3 funcionários = análise manual obrigatória
    if (faturamento > 150000 && numeroFuncionarios > 3) {
      console.log('Faturamento > 150k com mais de 3 funcionários - análise manual obrigatória');
      return {
        valor: null,
        plano: 'ANÁLISE_COMERCIAL',
        bloqueioCompraOnline: true,
        motivoBloqueio: 'Seu perfil com alto faturamento e equipe requer análise personalizada da equipe comercial.',
        detalhes: {
          valorBase: 0,
          adicionalFuncionarios: 0,
          adicionalEnderecoFiscal: 0,
        },
      };
    }
    
    let valorBase = 0;
    let plano = '';

    // Definir plano baseado no faturamento
    // AJUSTADO: Até 100k = PLENO (não START)
    if (faturamento <= 20000) {
      valorBase = 199;
      plano = 'START';
    } else if (faturamento <= 100000) {
      valorBase = 349;
      plano = 'PLENO';
    } else if (faturamento < 300000) {
      // Entre 100k e 300k = PREMIUM
      valorBase = 549;
      plano = 'PREMIUM';
    } else {
      // Fallback - não deveria chegar aqui
      console.error('ERRO: Faturamento não tratado corretamente');
      return null;
    }

    // Adicionar valor por funcionário CLT
    const adicionalFuncionarios = numeroFuncionarios > 0 ? numeroFuncionarios * 50 : 0;
    
    // Adicionar valor por endereço fiscal
    const adicionalEnderecoFiscal = usarEnderecoFiscal ? 50 : 0;

    // Calcular custo de abertura de CNPJ
    // Abertura é GRATUITA se:
    // 1. Estado é PR (endereço próprio no PR)
    // 2. OU se usar endereço fiscal da Attualize (que fica em PR)
    const { estado } = formData;
    const aberturaGratuita = estado === 'PR' || usarEnderecoFiscal;
    const custoAbertura = aberturaGratuita ? 0 : 800;

    const valorMensal = valorBase + adicionalFuncionarios + adicionalEnderecoFiscal;

    const resultado = {
      valor: valorMensal,
      plano,
      bloqueioCompraOnline: false,
      custoAbertura, // Custo único da abertura (0 se PR ou endereço fiscal)
      temAberturaGratuita: aberturaGratuita,
      detalhes: {
        valorBase,
        adicionalFuncionarios,
        adicionalEnderecoFiscal,
      },
    };

    console.log('Orçamento calculado:', resultado);
    return resultado;
  }, [formData]);

  // Carregar leadId do localStorage ao montar e rastrear página
  useEffect(() => {
    const savedLeadId = localStorage.getItem('aberturaCnpj_leadId');
    if (savedLeadId) {
      setLeadId(savedLeadId);
      console.log('✅ LeadId recuperado do localStorage:', savedLeadId);
    }
    
    // Rastrear visita à página do stepper
    if (typeof window !== 'undefined') {
      trackPageVisit(window.location.pathname);
    }

    // Cleanup do timeout ao desmontar
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [trackPageVisit]);

  // Rastrear mudanças de step
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stepPath = `${window.location.pathname}#step-${activeStep}`;
      trackPageVisit(stepPath);
    }
  }, [activeStep, trackPageVisit]);

  // Calcular orçamento quando chegar no step 4
  useEffect(() => {
    if (activeStep === 4 && !orcamentoAutomatico) {
      console.log('Calculando orçamento no step 4...');
      const orcamento = calcularOrcamento();
      console.log('Resultado:', orcamento);
      setOrcamentoAutomatico(orcamento);
      
      if (orcamento) {
        updateFormData('valorOrcamento', orcamento.valor);
        updateFormData('planoSelecionado', orcamento.plano);
      }
    }
  }, [activeStep, orcamentoAutomatico, calcularOrcamento, updateFormData]);

  const handleNext = async () => {
    console.log('Avançando do step:', activeStep);
    
    // Salvar progresso antes de avançar
    const etapas = ['dados-pessoais', 'dados-empresa', 'endereco', 'atividades', 'resumo'];
    await salvarProgresso(etapas[activeStep]);
    
    setActiveStep((prev) => prev + 1);
    
    // Scroll para o topo do conteúdo
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    
    // Scroll para o topo do conteúdo
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <StepDadosPessoais formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <StepDadosEmpresa formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepEndereco formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepAtividades formData={formData} updateFormData={updateFormData} />;
      case 4:
        return (
          <StepResumo
            formData={formData}
            orcamento={orcamentoAutomatico}
            onEdit={(step) => setActiveStep(step)}
            temAberturaGratuita={temAberturaGratuita}
            onSelectPlano={(plano) => {
              // Atualizar orçamento com o plano selecionado
              const novoOrcamento = {
                ...orcamentoAutomatico,
                plano: plano.nome,
                valor: plano.valor + 
                  (orcamentoAutomatico.detalhes.adicionalFuncionarios || 0) + 
                  (orcamentoAutomatico.detalhes.adicionalEnderecoFiscal || 0),
                detalhes: {
                  ...orcamentoAutomatico.detalhes,
                  valorBase: plano.valor,
                },
              };
              setOrcamentoAutomatico(novoOrcamento);
              updateFormData('valorOrcamento', novoOrcamento.valor);
              updateFormData('planoSelecionado', plano.nome);
            }}
          />
        );
      case 5:
        return (
          <StepPagamento
            formData={formData}
            orcamento={orcamentoAutomatico}
            onClose={onClose}
            temAberturaGratuita={temAberturaGratuita}
            leadId={leadId}
          />
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        // Validação rigorosa - todos os campos obrigatórios
        return (
          formData.nome?.trim() &&
          formData.cpf?.length >= 11 &&
          formData.email?.includes('@') &&
          formData.telefone?.length >= 10 &&
          formData.dataNascimento
        );
      case 1:
        return (
          formData.nomeEmpresa?.trim() &&
          formData.faturamentoMensal > 0 &&
          formData.formaAtuacao &&
          formData.numeroSocios >= 1
        );
      case 2:
        // Se usar endereço fiscal, está válido
        if (formData.usarEnderecoFiscal) {
          return true;
        }
        // Senão, validar campos de endereço
        return (
          formData.cep?.length === 8 &&
          formData.endereco?.trim() &&
          formData.numero?.trim() &&
          formData.bairro?.trim() &&
          formData.cidade?.trim() &&
          formData.estado?.length === 2
        );
      case 3:
        return formData.atividadePrincipal;
      case 4:
        return true; // Resumo sempre válido
      default:
        return false;
    }
  };

  return (
    <Card
      ref={contentRef}
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        p: { xs: 3, md: 6 },
      }}
    >
      {/* Header com viés cognitivo */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
        {/* Indicador de salvamento */}
        <Fade in={saving || lastSaved}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: { xs: 0, md: 16 },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: saving ? alpha('#FEC615', 0.1) : alpha('#28a745', 0.1),
              border: `1px solid ${saving ? '#FEC615' : '#28a745'}`,
            }}
          >
            {saving ? (
              <>
                <CircularProgress size={16} sx={{ color: '#FEC615' }} />
                <Typography variant="caption" sx={{ color: '#FEC615', fontWeight: 600 }}>
                  Salvando...
                </Typography>
              </>
            ) : (
              <>
                <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: '#28a745' }} />
                <Typography variant="caption" sx={{ color: '#28a745', fontWeight: 600 }}>
                  Salvo {lastSaved && `há ${Math.floor((new Date() - lastSaved) / 1000)}s`}
                </Typography>
              </>
            )}
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Iconify icon="solar:rocket-bold-duotone" width={32} sx={{ color: '#FEC615' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Abertura de CNPJ para Psicólogos
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Processo 100% online 
        </Typography>

        {/* Elementos de viés cognitivo */}
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
          <Chip
            icon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={18} />}
            label="47 pessoas abriram CNPJ esta semana"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.dark',
              fontWeight: 600,
            }}
          />
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold-duotone" width={18} />}
            label="Tempo médio: 12 minutos"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.dark',
              fontWeight: 600,
            }}
          />
        </Stack>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        {STEPS.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              StepIconComponent={() => (
                <CustomStepIcon
                  active={activeStep === index}
                  completed={activeStep > index}
                  icon={step.icon}
                  theme={theme}
                />
              )}
            >
              <Typography
                variant="caption"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: activeStep === index ? 700 : 400,
                }}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Conteúdo do Step */}
      <Box sx={{ minHeight: 400 }}>
        {renderStepContent()}
      </Box>

      {/* Navegação */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-left-bold" />}
        >
          Voltar
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep < STEPS.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            variant="contained"
            endIcon={<Iconify icon="solar:arrow-right-bold" />}
            sx={{
              bgcolor: '#FEC615',
              color: '#333',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#e5b213',
              },
              '&:disabled': {
                bgcolor: alpha(theme.palette.grey[500], 0.3),
              },
            }}
          >
            {activeStep === 4 ? 'Ver Orçamento' : 'Continuar'}
          </Button>
        )}
      </Box>

      {/* Barra de progresso visual */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Progresso
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0096D9' }}>
            {Math.round(((activeStep + 1) / STEPS.length) * 100)}% concluído
          </Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: 10,
            bgcolor: alpha(theme.palette.grey[500], 0.12),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${((activeStep + 1) / STEPS.length) * 100}%`,
              bgcolor: '#0096D9',
              transition: 'width 0.5s ease',
              borderRadius: 10,
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

