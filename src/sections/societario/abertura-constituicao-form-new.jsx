'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Tab,
  Grid,
  Card,
  Tabs,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { updateAbertura } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

const SITUACOES_ABERTURA = [
  { value: 0, label: 'Solicitando Viabilidade', completed: false },
  { value: 1, label: 'Aprovação da Viabilidade', completed: false },
  { value: 2, label: 'Pagamento taxas de registro', completed: false },
  { value: 3, label: 'Assinatura do processo', completed: false },
  { value: 4, label: 'Protocolo do processo', completed: false },
  { value: 5, label: 'Aguardando deferimento', completed: false },
  { value: 6, label: 'Processo deferido', completed: false },
  { value: 7, label: 'Emissão de certificado Digital', completed: false },
  { value: 8, label: 'Início de licenças e alvarás', completed: false },
  { value: 9, label: 'Autorização de NF e Regime de tributação', completed: false },
  { value: 10, label: 'Abertura concluída', completed: false },
];

export function AberturaConstituicaoFormNew({ currentAbertura, onEtapasChange }) {
  const [situacaoAbertura, setSituacaoAbertura] = useState(
    currentAbertura?.situacaoAbertura ?? 0
  );
  const [etapasCompletadas, setEtapasCompletadas] = useState(
    currentAbertura?.etapasCompletadas || []
  );
  const loading = useBoolean();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Verifica se todas as etapas estão completas (0 a 10)
  // Se a situação atual for 10 (Abertura concluída), considera todas completas
  const todasEtapasCompletas = () => {
    if (situacaoAbertura === 10) return true;
    const todasEtapas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return todasEtapas.every((etapa) => etapasCompletadas.includes(etapa));
  };

  useEffect(() => {
    if (currentAbertura) {
      setSituacaoAbertura(currentAbertura.situacaoAbertura ?? 0);
      setEtapasCompletadas(currentAbertura.etapasCompletadas || []);
    }
  }, [currentAbertura]);

  const handleSituacaoChange = async (event) => {
    const novaSituacao = parseInt(event.target.value, 10);
    const situacaoAnterior = situacaoAbertura;

    setSaving(true);
    try {
      // Atualiza a situação da abertura
      await updateAbertura(currentAbertura._id, {
        situacaoAbertura: novaSituacao,
        somenteAtualizar: false,
      });

      // Marca a etapa anterior como completada se ainda não estiver
      const novasEtapasCompletadas = [...etapasCompletadas];
      if (!novasEtapasCompletadas.includes(situacaoAnterior) && situacaoAnterior >= 0) {
        novasEtapasCompletadas.push(situacaoAnterior);
      }
      // Se a nova situação for a última (10 - Abertura concluída), marca todas as etapas como completadas
      if (novaSituacao === 10) {
        const todasEtapas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        todasEtapas.forEach((etapa) => {
          if (!novasEtapasCompletadas.includes(etapa)) {
            novasEtapasCompletadas.push(etapa);
          }
        });
      }

      // Atualiza as etapas completadas
      await updateAbertura(currentAbertura._id, {
        etapasCompletadas: novasEtapasCompletadas,
        somenteAtualizar: true,
      });

      setSituacaoAbertura(novaSituacao);
      setEtapasCompletadas(novasEtapasCompletadas);

      // Notifica o componente pai sobre a mudança nas etapas
      if (onEtapasChange) {
        onEtapasChange(novasEtapasCompletadas);
      }

      toast.success('Situação da abertura atualizada com sucesso! A mensagem será enviada automaticamente ao cliente.');
    } catch (error) {
      console.error('Erro ao atualizar situação:', error);
      toast.error('Erro ao atualizar situação da abertura');
    } finally {
      setSaving(false);
    }
  };

  const progresso = ((situacaoAbertura + 1) / SITUACOES_ABERTURA.length) * 100;
  const todasCompletas = todasEtapasCompletas();

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Acompanhamento de Etapas" />
        <Tab label="Dados da Abertura" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Em Constituição - Acompanhamento de Etapas
          </Typography>

      {/* Barra de Progresso */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progresso da Abertura
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progresso)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progresso} sx={{ height: 8, borderRadius: 1 }} />
      </Box>

      {/* Select de Situação */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Situação da Abertura"
            value={situacaoAbertura}
            onChange={handleSituacaoChange}
            disabled={saving || loading.value}
            helperText="Ao alterar a situação, uma mensagem será enviada automaticamente ao cliente pelo backend"
          >
            {SITUACOES_ABERTURA.map((situacao) => (
              <MenuItem key={situacao.value} value={situacao.value}>
                {situacao.value}. {situacao.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Lista de Etapas */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Etapas do Processo:
        </Typography>
        <Stack spacing={1}>
          {SITUACOES_ABERTURA.map((situacao, index) => {
            const isCompleted = etapasCompletadas.includes(situacao.value);
            const isCurrent = situacao.value === situacaoAbertura;
            const isPast = situacao.value < situacaoAbertura;
            // Se a situação atual é 10 (Abertura concluída), todas as etapas são consideradas completas
            const isAllCompleted = situacaoAbertura === 10;

            return (
              <Box
                key={situacao.value}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isCurrent
                    ? 'primary.main'
                    : isCompleted || isPast || isAllCompleted
                      ? 'success.lighter'
                      : 'divider',
                  bgcolor: isCurrent
                    ? 'primary.lighter'
                    : isCompleted || isPast || isAllCompleted
                      ? 'success.lighter'
                      : 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCurrent
                      ? 'primary.main'
                      : isCompleted || isPast || isAllCompleted
                        ? 'success.main'
                        : 'grey.300',
                    color: isCurrent || isCompleted || isPast || isAllCompleted ? 'white' : 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  {isCompleted || isPast || isAllCompleted ? (
                    <Iconify icon="eva:checkmark-fill" width={20} />
                  ) : (
                    situacao.value + 1
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      color: isCurrent ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {situacao.label}
                  </Typography>
                </Box>
                {isCurrent && (
                  <Chip label="Atual" size="small" color="primary" />
                )}
                {(isCompleted || (isAllCompleted && !isCurrent)) && (
                  <Chip label="Concluída" size="small" color="success" />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {saving && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Salvando...
          </Typography>
        </Box>
      )}

      {/* Alerta sobre conclusão das etapas */}
      {!todasCompletas && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="eva:alert-circle-fill" width={24} sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: 'warning.darker' }}>
            Para avançar para o próximo status, todas as etapas da abertura devem estar concluídas.
            Etapas completadas: {etapasCompletadas.length} de {SITUACOES_ABERTURA.length}
          </Typography>
        </Box>
      )}

      {todasCompletas && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'success.main' }} />
          <Typography variant="body2" sx={{ color: 'success.darker' }}>
            Todas as etapas foram concluídas! Você pode avançar para o próximo status.
          </Typography>
        </Box>
      )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Dados da Abertura
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Razão Social"
                fullWidth
                value={currentAbertura?.nomeEmpresarial || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Fantasia"
                fullWidth
                value={currentAbertura?.nomeFantasia || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Nome"
                fullWidth
                value={currentAbertura?.nome || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="CPF"
                fullWidth
                value={currentAbertura?.cpf || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Email"
                fullWidth
                value={currentAbertura?.email || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Email Financeiro"
                fullWidth
                value={currentAbertura?.emailFinanceiro || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Telefone"
                fullWidth
                value={currentAbertura?.telefone || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Telefone Comercial"
                fullWidth
                value={currentAbertura?.telefoneComercial || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            {/* Endereço Comercial */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Endereço Comercial
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="CEP"
                fullWidth
                value={currentAbertura?.enderecoComercial?.cep || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Logradouro"
                fullWidth
                value={currentAbertura?.enderecoComercial?.logradouro || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Número"
                fullWidth
                value={currentAbertura?.enderecoComercial?.numero || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Complemento"
                fullWidth
                value={currentAbertura?.enderecoComercial?.complemento || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bairro"
                fullWidth
                value={currentAbertura?.enderecoComercial?.bairro || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cidade"
                fullWidth
                value={currentAbertura?.enderecoComercial?.cidade || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Estado"
                fullWidth
                value={currentAbertura?.enderecoComercial?.estado || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            {/* Sócios */}
            {currentAbertura?.socios && currentAbertura.socios.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Sócios ({currentAbertura.socios.length})
                  </Typography>
                </Grid>
                {currentAbertura.socios.map((socio, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Sócio {index + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Nome"
                        fullWidth
                        value={socio.nome || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="CPF"
                        fullWidth
                        value={socio.cpf || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="RG"
                        fullWidth
                        value={socio.rg || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Porcentagem"
                        fullWidth
                        value={socio.porcentagem ? `${socio.porcentagem}%` : ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Administrador"
                        fullWidth
                        value={socio.administrador ? 'Sim' : 'Não'}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    {index < currentAbertura.socios.length - 1 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}

            {/* Outras Informações */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Outras Informações
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capital Social"
                fullWidth
                value={
                  currentAbertura?.capitalSocial
                    ? `R$ ${Number(currentAbertura.capitalSocial).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ''
                }
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor Mensalidade"
                fullWidth
                value={
                  currentAbertura?.valorMensalidade
                    ? `R$ ${Number(currentAbertura.valorMensalidade).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ''
                }
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pro Labore"
                fullWidth
                value={
                  currentAbertura?.proLabore
                    ? `R$ ${Number(currentAbertura.proLabore).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ''
                }
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Previsão de Faturamento"
                fullWidth
                value={
                  currentAbertura?.previsaoFaturamento
                    ? `R$ ${Number(currentAbertura.previsaoFaturamento).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ''
                }
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Regime Tributário"
                fullWidth
                value={currentAbertura?.regimeTributario || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Forma de Atuação"
                fullWidth
                value={currentAbertura?.formaAtuacao || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            {currentAbertura?.descricaoAtividades && (
              <Grid item xs={12}>
                <TextField
                  label="Descrição das Atividades"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentAbertura.descricaoAtividades}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            )}
            {currentAbertura?.observacoes && (
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  fullWidth
                  multiline
                  rows={3}
                  value={currentAbertura.observacoes}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Card>
  );
}

