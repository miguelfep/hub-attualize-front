'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'src/routes/hooks';

import { Box, Card, Stack, Button, Typography, LinearProgress, Alert, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, Divider, Grid, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';

import { getAulasOnboarding, atualizarProgressoAula } from 'src/actions/onboarding';

import { Iconify } from 'src/components/iconify';

import { AulaVideo } from '../components/aula-video';
import { AulaQuiz } from '../components/aula-quiz';
import { AulaTexto } from '../components/aula-texto';
import { AulaArquivo } from '../components/aula-arquivo';

// ----------------------------------------------------------------------

export function OnboardingView({ aulasData: initialData, error: initialError }) {
  const router = useRouter();
  const [aulasData, setAulasData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(initialError);
  const [aulaAtual, setAulaAtual] = useState(0);
  const [inicializado, setInicializado] = useState(false);
  const [verificandoProximo, setVerificandoProximo] = useState(false);

  // Função auxiliar para encontrar a primeira aula não concluída
  const encontrarProximaAulaNaoConcluida = (aulas) => {
    if (!aulas || aulas.length === 0) return 0;
    
    const primeiraNaoConcluida = aulas.findIndex((aula) => !aula.concluida);
    // Se não encontrar nenhuma não concluída, retorna a última aula
    return primeiraNaoConcluida !== -1 ? primeiraNaoConcluida : aulas.length - 1;
  };

  // Verifica quando o onboarding atual é concluído
  // A API já retorna temProximoOnboarding e proximoOnboarding em getAulasOnboarding
  useEffect(() => {
    const verificarProximo = async () => {
      if (aulasData?.concluido && !verificandoProximo) {
        setVerificandoProximo(true);
        try {
          console.log('🔄 [STATUS] Onboarding concluído. Verificando próximo...');
          
          // Aguardar um pouco para garantir que o backend processou
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Recarrega dados (a API já retorna se tem próximo)
          await carregarAulas();
          
          // Se ainda tem próximo onboarding, reseta para primeira aula
          // Usa o estado atualizado após carregar
          const dadosAtualizados = await getAulasOnboarding();
          if (dadosAtualizados?.data?.success) {
            const novosDados = dadosAtualizados.data.data;
            if (novosDados?.temProximoOnboarding) {
              setAulaAtual(0);
              setInicializado(false);
            }
          }
        } catch (err) {
          console.error('Erro ao verificar próximo onboarding:', err);
        } finally {
          setVerificandoProximo(false);
        }
      }
    };

    verificarProximo();
  }, [aulasData?.concluido]);

  useEffect(() => {
    if (!initialData && !initialError) {
      carregarAulas();
    }
  }, []);

  // Atualiza a aula atual apenas no carregamento inicial para ir direto para a primeira não concluída
  // Permite que o usuário navegue livremente entre todas as aulas, mesmo as já concluídas
  useEffect(() => {
    if (aulasData?.aulas && aulasData.aulas.length > 0) {
      if (!inicializado) {
        // Primeira vez: vai para primeira não concluída
        const proximaAulaIndex = encontrarProximaAulaNaoConcluida(aulasData.aulas);
        setAulaAtual(proximaAulaIndex);
        setInicializado(true);
      }
      // Removido: auto-avanço quando aula é concluída
      // Agora o usuário pode navegar livremente entre todas as aulas
    }
  }, [aulasData?.aulas, inicializado]);

  const carregarAulas = async () => {
    setLoading(true);
    try {
      const response = await getAulasOnboarding();
      if (response.data?.success) {
        const novosDados = response.data.data || null;
        setAulasData(novosDados);
        setError(null);
        
        // Se os dados mudaram (ex: novo onboarding), reseta flags
        if (novosDados && (!aulasData || novosDados.onboarding?._id !== aulasData.onboarding?._id)) {
          console.log('🔄 [CARREGAR] Novo onboarding detectado. Resetando flags...');
          setVerificandoProximo(false);
        }
        
        console.log('✅ [CARREGAR] Aulas carregadas:', {
          totalAulas: novosDados?.aulas?.length,
          concluidas: novosDados?.aulas?.filter(a => a.concluida).length,
          progresso: novosDados?.progressoPercentual,
          concluido: novosDados?.concluido,
          temProximoOnboarding: novosDados?.temProximoOnboarding,
          todosOnboardingsConcluidos: novosDados?.todosOnboardingsConcluidos,
        });
      } else {
        setError(new Error('Erro ao carregar aulas do onboarding'));
      }
    } catch (err) {
      console.error('❌ [CARREGAR] Erro ao carregar aulas:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza o progresso de uma aula
   * CRÍTICO: Sempre recarrega dados após atualizar para garantir sincronização
   */
  const handleAtualizarProgresso = async (aulaIdOrIndex, dadosProgresso) => {
    try {
      console.log('🔄 [PROGRESSO] Atualizando progresso da aula:', {
        indice: aulaIdOrIndex,
        dados: dadosProgresso,
        aulaAtual: aulasData?.aulas?.[aulaIdOrIndex],
      });

      // Atualização otimista - atualiza UI imediatamente para feedback visual
      let estadoAnterior = null;
      if (aulasData?.aulas && typeof aulaIdOrIndex === 'number') {
        estadoAnterior = JSON.parse(JSON.stringify(aulasData)); // Deep copy para rollback
        
        const aulasAtualizadas = [...aulasData.aulas];
        if (aulasAtualizadas[aulaIdOrIndex]) {
          aulasAtualizadas[aulaIdOrIndex] = {
            ...aulasAtualizadas[aulaIdOrIndex],
            ...dadosProgresso,
            // Incrementa tentativas otimisticamente (backend faz isso automaticamente)
            tentativas: (aulasAtualizadas[aulaIdOrIndex].tentativas || 0) + 1,
          };
          
          setAulasData({
            ...aulasData,
            aulas: aulasAtualizadas,
          });
          
          console.log('🎨 [PROGRESSO] Atualização otimista aplicada');
        }
      }

      // ⚠️ CRÍTICO: A API aceita tanto aulaId quanto índice
      // O índice é relativo ao onboarding atual, então deve funcionar corretamente
      // ⚠️ IMPORTANTE: A API agora busca automaticamente o onboarding atual (próximo pendente)
      // e filtra o progresso por onboardingId. Isso garante que estamos sempre atualizando
      // o progresso do onboarding correto, mesmo quando há múltiplos onboardings.
      const aulaParaAtualizar = aulasData?.aulas?.[aulaIdOrIndex];
      
      console.log('🔍 [PROGRESSO] Identificador da aula:', {
        indice: aulaIdOrIndex,
        aulaId: aulaParaAtualizar?._id || aulaParaAtualizar?.id,
        aula: aulaParaAtualizar,
        onboardingId: aulasData?.onboarding?._id,
        onboardingNome: aulasData?.onboarding?.nome,
        // A API usa este onboardingId para buscar o progresso correto
      });

      // A API aceita o índice (0, 1, 2...) que é relativo ao onboarding atual
      // A API internamente:
      // 1. Busca o próximo onboarding pendente (onboarding atual)
      // 2. Busca o progresso específico desse onboarding (filtra por onboardingId)
      // 3. Atualiza a aula no progresso correto
      const identificadorAula = aulaIdOrIndex; // Índice relativo ao onboarding atual
      
      console.log('📤 [PROGRESSO] Enviando requisição:', {
        identificador: identificadorAula,
        tipo: 'índice (relativo ao onboarding atual)',
        onboardingEsperado: aulasData?.onboarding?.nome,
      });

      // Chama a API - ela identifica automaticamente o onboarding atual
      const response = await atualizarProgressoAula(identificadorAula, dadosProgresso);
      
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const progresso = data.progresso;
        
        console.log('✅ [PROGRESSO] API respondeu com sucesso:', {
          progressoPercentual: progresso?.progressoPercentual,
          concluido: progresso?.concluido,
          totalAulas: progresso?.progressoAulas?.length,
          dataCompleta: data,
        });
        
        // ⚠️ CRÍTICO: Aguardar um pouco para garantir que o backend processou completamente
        // Antes de recarregar, para evitar pegar dados antigos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recarregar dados da API para garantir sincronização completa
        console.log('🔄 [PROGRESSO] Recarregando dados da API para sincronização...');
        await carregarAulas();
        
        console.log('✅ [PROGRESSO] Dados recarregados com sucesso');
        
        return response;
      } else {
        console.warn('⚠️ [PROGRESSO] API retornou success: false:', response.data);
        
        // Rollback em caso de erro
        if (estadoAnterior) {
          setAulasData(estadoAnterior);
          console.log('↩️ [PROGRESSO] Rollback aplicado');
        }
      }
      return null;
    } catch (err) {
      console.error('❌ [PROGRESSO] Erro ao atualizar progresso:', err);
      console.error('❌ [PROGRESSO] Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // Rollback em caso de erro
      if (estadoAnterior) {
        setAulasData(estadoAnterior);
        console.log('↩️ [PROGRESSO] Rollback aplicado devido a erro');
      }
      
      return null;
    }
  };

  /**
   * Marca uma aula como concluída
   * Usa a nova estrutura da API que retorna onboardingFinalizado, temProximoOnboarding, etc.
   */
  const handleAulaConcluida = async (aulaIdOrIndex, dadosAdicionais = {}) => {
    // Estado anterior para rollback em caso de erro
    let estadoAnterior = null;
    
    try {
      const aulaParaLog = aulasData?.aulas?.[aulaIdOrIndex];
      console.log('🎯 [CONCLUSÃO] Concluindo aula:', {
        indice: aulaIdOrIndex,
        aulaId: aulaParaLog?._id || aulaParaLog?.id,
        aula: aulaParaLog,
        onboardingId: aulasData?.onboarding?._id,
        onboardingNome: aulasData?.onboarding?.nome,
        totalAulas: aulasData?.aulas?.length,
        dadosAdicionais,
      });
      
      // ⚠️ IMPORTANTE: A API agora busca automaticamente o onboarding atual
      // e filtra o progresso por onboardingId. Não precisamos enviar o onboardingId,
      // apenas o índice da aula (0, 1, 2...) que é relativo ao onboarding atual.

      // Atualização otimista - atualiza UI imediatamente
      if (aulasData?.aulas && typeof aulaIdOrIndex === 'number') {
        estadoAnterior = JSON.parse(JSON.stringify(aulasData)); // Deep copy para rollback
        
        const aulasAtualizadas = [...aulasData.aulas];
        if (aulasAtualizadas[aulaIdOrIndex]) {
          aulasAtualizadas[aulaIdOrIndex] = {
            ...aulasAtualizadas[aulaIdOrIndex],
            concluida: true,
            dataConclusao: new Date().toISOString(),
            tentativas: (aulasAtualizadas[aulaIdOrIndex].tentativas || 0) + 1,
            ...dadosAdicionais,
          };
          
          setAulasData({
            ...aulasData,
            aulas: aulasAtualizadas,
          });
          
          console.log('🎨 [CONCLUSÃO] Atualização otimista aplicada');
        }
      }

      // ⚠️ IMPORTANTE: A API agora busca automaticamente o onboarding atual (próximo pendente)
      // e filtra o progresso por onboardingId. Isso garante que estamos sempre atualizando
      // o progresso do onboarding correto, mesmo quando há múltiplos onboardings.
      const aulaParaAtualizar = aulasData?.aulas?.[aulaIdOrIndex];
      
      console.log('🔍 [CONCLUSÃO] Identificador da aula:', {
        indice: aulaIdOrIndex,
        aulaId: aulaParaAtualizar?._id || aulaParaAtualizar?.id,
        aula: aulaParaAtualizar,
        onboardingId: aulasData?.onboarding?._id,
        onboardingNome: aulasData?.onboarding?.nome,
        // A API usa este onboardingId para buscar o progresso correto
      });

      // A API aceita o índice (0, 1, 2...) que é relativo ao onboarding atual
      // A API internamente:
      // 1. Busca o próximo onboarding pendente (onboarding atual)
      // 2. Busca o progresso específico desse onboarding (filtra por onboardingId)
      // 3. Atualiza a aula no progresso correto
      const identificadorAula = aulaIdOrIndex; // Índice relativo ao onboarding atual
      
      console.log('📤 [CONCLUSÃO] Enviando requisição:', {
        identificador: identificadorAula,
        tipo: 'índice (relativo ao onboarding atual)',
        onboardingEsperado: aulasData?.onboarding?.nome,
      });

      // Chama a API - ela identifica automaticamente o onboarding atual
      const response = await atualizarProgressoAula(identificadorAula, {
        concluida: true,
        ...dadosAdicionais,
      });

      if (response?.data?.success && response.data?.data) {
        const data = response.data.data;
        
        console.log('✅ [CONCLUSÃO] API respondeu com sucesso:', {
          onboardingFinalizado: data.onboardingFinalizado,
          temProximoOnboarding: data.temProximoOnboarding,
          todosOnboardingsConcluidos: data.todosOnboardingsConcluidos,
          progressoPercentual: data.progressoPercentual,
        });

        // ⚠️ CRÍTICO: Aguardar um pouco antes de recarregar para garantir que o backend processou
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recarregar dados da API para garantir sincronização completa
        console.log('🔄 [CONCLUSÃO] Recarregando dados da API...');
        await carregarAulas();

        // Verificar se onboarding foi finalizado
        if (data.onboardingFinalizado) {
          if (data.temProximoOnboarding && data.proximoOnboarding) {
            // Ainda tem onboarding pendente
            console.log('➡️ [CONCLUSÃO] Há próximo onboarding:', data.proximoOnboarding);
            
            // Aguardar um pouco para garantir que o backend processou
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Recarrega as aulas do próximo onboarding
            await carregarAulas();
            
            // Reseta para primeira aula não concluída
            setAulaAtual(0);
            setInicializado(false);
            
            return;
          } else if (data.todosOnboardingsConcluidos) {
            // Todos os onboardings foram concluídos
            console.log('🎉 [CONCLUSÃO] TODOS os onboardings concluídos!');
            
            // Recarrega dados finais
            await carregarAulas();
            return;
          }
        }

        // Se não concluiu o onboarding, avança para próxima aula não concluída
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Recarrega novamente para pegar o estado atualizado
        const dadosAtualizados = await getAulasOnboarding();
        if (dadosAtualizados?.data?.success) {
          const novasAulas = dadosAtualizados.data.data?.aulas || [];
          
          // Avança para próxima aula não concluída se houver
          const proximaAulaIndex = novasAulas.findIndex(
            (aula, index) => index > aulaAtual && !aula.concluida
          );
          
          if (proximaAulaIndex !== -1) {
            console.log('➡️ [CONCLUSÃO] Avançando para próxima aula não concluída:', proximaAulaIndex);
            setAulaAtual(proximaAulaIndex);
          } else {
            // Se não há próxima aula não concluída, vai para a próxima em ordem
            const proximaAula = aulaAtual + 1;
            if (proximaAula < novasAulas.length) {
              console.log('➡️ [CONCLUSÃO] Avançando para próxima aula em ordem:', proximaAula);
              setAulaAtual(proximaAula);
            } else {
              console.log('✅ [CONCLUSÃO] Todas as aulas foram visualizadas.');
            }
          }
        }
      } else {
        console.warn('⚠️ [CONCLUSÃO] API retornou success: false:', response?.data);
        
        // Rollback em caso de erro
        if (estadoAnterior) {
          setAulasData(estadoAnterior);
          console.log('↩️ [CONCLUSÃO] Rollback aplicado');
        }
      }
    } catch (err) {
      console.error('❌ [CONCLUSÃO] Erro ao concluir aula:', err);
      console.error('❌ [CONCLUSÃO] Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // Rollback em caso de erro
      if (estadoAnterior) {
        setAulasData(estadoAnterior);
        console.log('↩️ [CONCLUSÃO] Rollback aplicado devido a erro');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando onboarding...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error?.message || 'Erro ao carregar o onboarding. Tente novamente mais tarde.'}
        </Alert>
      </Box>
    );
  }

  // Se não há onboarding
  if (!aulasData || !aulasData.temOnboarding) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify icon="eva:checkmark-circle-2-fill" width={64} sx={{ color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Nenhum Onboarding Pendente
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Você não possui onboardings pendentes no momento.
          </Typography>
          <Button variant="contained" onClick={() => router.push(paths.cliente.dashboard)}>
            Acessar Portal
          </Button>
        </Card>
      </Box>
    );
  }

  // Se está verificando próximo onboarding
  if (aulasData?.concluido && verificandoProximo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Verificando próximo onboarding...</Typography>
      </Box>
    );
  }

  // Se todos os onboardings foram concluídos
  if (aulasData?.todosOnboardingsConcluidos) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" width={80} sx={{ color: 'success.main' }} />
          </Box>
          
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
            Obrigado!
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Todos os Onboardings Concluídos com Sucesso
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
            Parabéns! Você concluiu todas as aulas de todos os onboardings. Agora você tem acesso completo ao portal.
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push(paths.cliente.dashboard)}
            startIcon={<Iconify icon="solar:home-2-bold-duotone" />}
            sx={{ px: 4, py: 1.5 }}
          >
            Acessar Portal
          </Button>
        </Card>
      </Box>
    );
  }

  // Se o onboarding atual foi concluído mas há próximo, mostra mensagem de transição
  if (aulasData?.concluido && aulasData?.temProximoOnboarding && aulasData?.proximoOnboarding) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Card sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Iconify icon="eva:checkmark-circle-2-fill" width={64} sx={{ color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Onboarding Concluído!
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
            Parabéns! Você concluiu este onboarding.
          </Typography>
          {aulasData.proximoOnboarding?.nome && (
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontWeight: 'medium' }}>
              Próximo: {aulasData.proximoOnboarding.nome}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Carregando próximo onboarding...
          </Typography>
          <CircularProgress />
        </Card>
      </Box>
    );
  }

  const aulas = aulasData.aulas || [];
  const aula = aulas[aulaAtual];
  const progresso = aulasData.progressoPercentual || 0;

  if (!aula) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Nenhuma aula disponível.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Lista de Aulas - Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, position: 'sticky', top: 24 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {aulasData.onboarding?.nome || 'Onboarding'}
                </Typography>
                {aulasData.onboarding?.descricao && (
                  <Typography variant="caption" color="text.secondary">
                    {aulasData.onboarding.descricao}
                  </Typography>
                )}
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progresso deste Onboarding
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progresso)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progresso} sx={{ height: 8, borderRadius: 1 }} />
              </Box>
              
              {aulasData?.proximoOnboarding && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Próximo Onboarding
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {aulasData.proximoOnboarding.nome || aulasData.proximoOnboarding.onboarding?.nome || 'Próximo Onboarding'}
                  </Typography>
                </Box>
              )}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <List sx={{ p: 0 }}>
              {aulas.map((aulaItem, index) => (
                <ListItem key={aulaItem._id || index} disablePadding>
                  <ListItemButton
                    selected={index === aulaAtual}
                    onClick={() => setAulaAtual(index)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.lighter',
                        '&:hover': {
                          backgroundColor: 'primary.lighter',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {aulaItem.concluida ? (
                        <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                      ) : (
                        <Iconify icon="eva:radio-button-off-outline" sx={{ color: 'text.disabled' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" noWrap>
                            {aulaItem.ordem || index + 1}. {aulaItem.titulo}
                          </Typography>
                          {aulaItem.tipo && (
                            <Chip
                              label={aulaItem.tipo}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        aulaItem.concluida && aulaItem.dataConclusao ? (
                          <Typography variant="caption" color="text.secondary">
                            Concluída em {new Date(aulaItem.dataConclusao).toLocaleDateString('pt-BR')}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Conteúdo da Aula */}
        <Grid item xs={12} md={8}>
          {/* Status e informações gerais (só para tipos que não são vídeo) */}
          {aula.tipo !== 'video' && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack spacing={3}>
                {/* Header */}
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {aula.titulo}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip
                      label={aula.concluida ? 'Concluída' : 'Pendente'}
                      color={aula.concluida ? 'success' : 'default'}
                      size="small"
                    />
                    {aula.tipo && (
                      <Chip label={aula.tipo} variant="outlined" size="small" />
                    )}
                    {aula.tentativas > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Tentativas: {aula.tentativas}
                      </Typography>
                    )}
                  </Stack>
                  {aula.descricao && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {aula.descricao}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Card>
          )}

          {/* Conteúdo da Aula */}
          <Card sx={{ p: 3 }}>
        {aula.tipo === 'video' && (
          <AulaVideo
            aula={aula}
            progressoAula={aula}
            onConcluir={(dados) => handleAulaConcluida(aulaAtual, dados)}
            onProgresso={(dados) => handleAtualizarProgresso(aulaAtual, dados)}
          />
        )}

        {aula.tipo === 'quiz' && (
          <AulaQuiz
            aula={aula}
            progressoAula={aula}
            onConcluir={(dados) => handleAulaConcluida(aulaAtual, dados)}
          />
        )}

        {aula.tipo === 'texto' && (
          <AulaTexto
            aula={aula}
            progressoAula={aula}
            onConcluir={() => handleAulaConcluida(aulaAtual)}
          />
        )}

        {aula.tipo === 'arquivo' && (
          <AulaArquivo
            aula={aula}
            progressoAula={aula}
            onConcluir={() => handleAulaConcluida(aulaAtual)}
          />
        )}

            {/* Navegação */}
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setAulaAtual(Math.max(0, aulaAtual - 1))}
                disabled={aulaAtual === 0}
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
              >
                Aula Anterior
              </Button>
              <Button
                variant="contained"
                onClick={() => setAulaAtual(Math.min(aulas.length - 1, aulaAtual + 1))}
                disabled={aulaAtual === aulas.length - 1}
                endIcon={<Iconify icon="eva:arrow-forward-fill" />}
              >
                Próxima Aula
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

