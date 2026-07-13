'use client';

import { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Chip,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Container,
  Typography,
  ToggleButton,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';

import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// Helpers de moeda compartilhados (módulo puro, sem UI)
import { fBRL, fPct, parseMoedaBR, mascaraMoedaBR } from 'src/sections/psicologos-curitiba/fator-r';

import { gerarPlano } from './motor-planejador';
import { ATUACOES, SEGMENTOS, whatsappLink } from './dados';

// ----------------------------------------------------------------------

const PASSOS = ['Seu segmento', 'Sua situação', 'Seus números', 'Seu plano'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PlanejadorWizard() {
  const [passo, setPasso] = useState(0);

  const [segmentoId, setSegmentoId] = useState(null);
  const [atuacao, setAtuacao] = useState(null);
  const [faturamentoInput, setFaturamentoInput] = useState('');
  const [temEquipe, setTemEquipe] = useState(false);
  const [temParceiros, setTemParceiros] = useState(false);
  const [erroFaturamento, setErroFaturamento] = useState('');

  const [plano, setPlano] = useState(null);

  // Lead gate
  const [lead, setLead] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    urgencia: '',
  });
  const [errosLead, setErrosLead] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [leadEnviado, setLeadEnviado] = useState(false);

  const segmento = SEGMENTOS.find((s) => s.id === segmentoId) || null;

  // Preset via query param (?segmento=psicologia) — links das landings
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('segmento');
    if (param && SEGMENTOS.some((s) => s.id === param)) {
      setSegmentoId(param);
    }
  }, []);

  const handleGerarPlano = () => {
    const faturamentoMensal = parseMoedaBR(faturamentoInput);
    if (faturamentoMensal <= 0) {
      setErroFaturamento('Informe o faturamento para montar o plano.');
      return;
    }
    setErroFaturamento('');
    setPlano(gerarPlano({ segmento, atuacao, faturamentoMensal, temEquipe, temParceiros }));
    setPasso(3);
  };

  const validarLead = () => {
    const novos = {};
    if (!lead.nome.trim()) novos.nome = 'Informe seu nome';
    if (!EMAIL_REGEX.test(lead.email)) novos.email = 'Informe um e-mail válido';
    if (lead.telefone.replace(/\D/g, '').length < 10) novos.telefone = 'WhatsApp com DDD';
    setErrosLead(novos);
    return Object.keys(novos).length === 0;
  };

  const handleEnviarLead = async () => {
    if (!validarLead()) return;
    try {
      setEnviando(true);
      await criarLead({
        nome: lead.nome.trim(),
        email: lead.email.trim(),
        telefone: lead.telefone.trim(),
        ...(lead.cidade.trim() && { cidade: lead.cidade.trim() }),
        ...(lead.estado.trim() && { estado: lead.estado.trim().toUpperCase() }),
        segment: segmento.segmentApi,
        origem: 'site-planejador-empresa',
        observacoes: `${plano.resumo}${lead.urgencia ? ` · Quando: ${lead.urgencia}` : ''} (Planejador de Empresa)`,
      });
      setLeadEnviado(true);
      toast.success('Plano garantido! Um especialista vai falar com você em breve.');
    } catch (error) {
      toast.error('Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  const mensagemWhats = plano
    ? `Olá! Montei meu plano no Planejador de Empresa da Attualize. ${plano.resumo}. Quero validar com um especialista.`
    : 'Olá! Estou no Planejador de Empresa da Attualize e quero falar com um especialista.';

  // ------------------------------------------------------------------

  return (
    <Box
      component="section"
      id="planejador"
      aria-label="Planejador de empresa"
      sx={{ py: { xs: 4, md: 6 }, scrollMarginTop: 96 }}
    >
      <Container maxWidth="md">
        {/* Progresso */}
        <Stack direction="row" spacing={1} sx={{ mb: 4 }} aria-hidden="true">
          {PASSOS.map((rotulo, index) => (
            <Box key={rotulo} sx={{ flex: 1 }}>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: index <= passo ? 'primary.main' : (theme) => alpha(theme.palette.grey[500], 0.2),
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  mt: 0.75,
                  display: { xs: index === passo ? 'block' : 'none', sm: 'block' },
                  color: index <= passo ? 'primary.main' : 'text.disabled',
                  fontWeight: index === passo ? 700 : 400,
                }}
              >
                {rotulo}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Passo 0 — Segmento */}
        {passo === 0 && (
          <Stack spacing={3}>
            <Typography component="h2" variant="h4">
              Qual é o seu segmento?
            </Typography>
            <Grid container spacing={2}>
              {SEGMENTOS.map((item) => {
                const ativo = segmentoId === item.id;
                return (
                  <Grid key={item.id} xs={6} sm={3}>
                    <Button
                      fullWidth
                      onClick={() => setSegmentoId(item.id)}
                      aria-pressed={ativo}
                      sx={{
                        p: 2,
                        height: 1,
                        minHeight: 96,
                        flexDirection: 'column',
                        gap: 1,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: ativo ? 'primary.main' : (theme) => alpha(theme.palette.grey[500], 0.2),
                        bgcolor: ativo ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        color: 'text.primary',
                      }}
                    >
                      <Iconify icon={item.icone} width={28} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle2">{item.label}</Typography>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
            <Button
              size="large"
              variant="contained"
              disabled={!segmentoId}
              onClick={() => setPasso(1)}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              sx={{ alignSelf: 'flex-end', px: 4 }}
            >
              Continuar
            </Button>
          </Stack>
        )}

        {/* Passo 1 — Situação atual */}
        {passo === 1 && (
          <Stack spacing={3}>
            <Typography component="h2" variant="h4">
              Como você atua hoje?
            </Typography>
            <Stack spacing={1.5}>
              {ATUACOES.map((item) => {
                const ativo = atuacao === item.id;
                return (
                  <Button
                    key={item.id}
                    onClick={() => setAtuacao(item.id)}
                    aria-pressed={ativo}
                    sx={{
                      p: 2,
                      justifyContent: 'flex-start',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: ativo ? 'primary.main' : (theme) => alpha(theme.palette.grey[500], 0.2),
                      bgcolor: ativo ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      color: 'text.primary',
                      fontWeight: ativo ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Button onClick={() => setPasso(0)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                Voltar
              </Button>
              <Button
                size="large"
                variant="contained"
                disabled={!atuacao}
                onClick={() => setPasso(2)}
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                sx={{ px: 4 }}
              >
                Continuar
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Passo 2 — Números */}
        {passo === 2 && (
          <Stack spacing={3}>
            <Typography component="h2" variant="h4">
              Seus números
            </Typography>
            <TextField
              fullWidth
              id="planejador-faturamento"
              label="Faturamento mensal (real ou esperado)"
              value={faturamentoInput}
              onChange={(e) => setFaturamentoInput(mascaraMoedaBR(e.target.value))}
              inputMode="decimal"
              placeholder="10.000,00"
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              error={!!erroFaturamento}
              helperText={erroFaturamento || 'Pode ser uma estimativa — dá para ajustar depois'}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Você terá funcionários CLT (recepção, apoio)?
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={temEquipe}
                onChange={(_, valor) => valor !== null && setTemEquipe(valor)}
                aria-label="Terá funcionários CLT"
              >
                <ToggleButton value={false}>Não</ToggleButton>
                <ToggleButton value>Sim</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {segmento?.leiSalaoParceiro && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Você trabalha (ou vai trabalhar) com profissionais parceiros?
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={temParceiros}
                  onChange={(_, valor) => valor !== null && setTemParceiros(valor)}
                  aria-label="Trabalha com profissionais parceiros"
                >
                  <ToggleButton value={false}>Não</ToggleButton>
                  <ToggleButton value>Sim</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            <Stack direction="row" justifyContent="space-between">
              <Button onClick={() => setPasso(1)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                Voltar
              </Button>
              <Button
                size="large"
                variant="contained"
                onClick={handleGerarPlano}
                endIcon={<Iconify icon="solar:magic-stick-3-bold" />}
                sx={{ px: 4 }}
              >
                Montar meu plano
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Passo 3 — Resultado */}
        {passo === 3 && plano && (
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h3">
                Seu plano inicial está pronto
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Estimativas simplificadas com base nas suas respostas — o plano definitivo é
                validado com um especialista, grátis.
              </Typography>
            </Stack>

            {/* Formato + regime */}
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Box sx={{ p: 3, height: 1, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    Formato recomendado
                  </Typography>
                  <Typography component="h3" variant="h4" sx={{ my: 0.5 }}>
                    {plano.formato.sigla}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {plano.formato.nome}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {plano.formato.justificativa}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={6}>
                <Box sx={{ p: 3, height: 1, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    Regime tributário
                  </Typography>
                  <Typography component="h3" variant="h5" sx={{ my: 0.5 }}>
                    {plano.regime.nome}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {plano.regime.justificativa}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Cenários de imposto */}
            <Box>
              <Typography component="h3" variant="h5" sx={{ mb: 2 }}>
                Estimativa de imposto
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {plano.cenarios.map((cenario) => (
                  <Box
                    key={cenario.rotulo}
                    sx={{
                      flex: 1,
                      p: 2.5,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: cenario.destaque ? 'success.main' : (theme) => alpha(theme.palette.grey[500], 0.24),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{cenario.rotulo}</Typography>
                      {cenario.destaque && <Chip size="small" color="success" label="recomendado" />}
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {cenario.descricao}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {cenario.impostoMensal === null ? 'Valor fixo' : `${fBRL(cenario.impostoMensal)}/mês`}
                    </Typography>
                    {cenario.aliquota !== null && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Alíquota efetiva: {fPct(cenario.aliquota)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Alertas */}
            {plano.alertas.length > 0 && (
              <Stack spacing={1.5}>
                {plano.alertas.map((alerta) => (
                  <Stack key={alerta} direction="row" spacing={1.5} alignItems="flex-start">
                    <Iconify
                      icon="solar:lightbulb-bolt-bold-duotone"
                      width={22}
                      sx={{ color: 'warning.main', mt: 0.25, flexShrink: 0 }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {alerta}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Checklist */}
            <Box>
              <Typography component="h3" variant="h5" sx={{ mb: 2 }}>
                Próximos passos
              </Typography>
              <Stack spacing={1.25}>
                {plano.checklist.map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
                    <Iconify
                      icon="solar:check-circle-bold"
                      width={22}
                      sx={{ color: 'success.main', mt: 0.25, flexShrink: 0 }}
                    />
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Gate de lead — plano completo */}
            {!leadEnviado ? (
              <Box
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
                  Receba o plano completo e a validação de um especialista
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Enviamos o detalhamento (custos de abertura na sua cidade, pró-labore ideal e
                  comparativo com a sua situação atual) e um contador especialista revisa com você
                  — grátis e sem compromisso.
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={lead.nome}
                      onChange={(e) => setLead((p) => ({ ...p, nome: e.target.value }))}
                      error={!!errosLead.nome}
                      helperText={errosLead.nome || ' '}
                      autoComplete="name"
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      value={lead.email}
                      onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                      error={!!errosLead.email}
                      helperText={errosLead.email || ' '}
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="WhatsApp (com DDD)"
                      value={lead.telefone}
                      onChange={(e) => setLead((p) => ({ ...p, telefone: e.target.value }))}
                      error={!!errosLead.telefone}
                      helperText={errosLead.telefone || ' '}
                      inputMode="tel"
                      placeholder="(41) 99999-9999"
                      autoComplete="tel"
                    />
                  </Grid>
                  <Grid xs={8} sm={4}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      value={lead.cidade}
                      onChange={(e) => setLead((p) => ({ ...p, cidade: e.target.value }))}
                      helperText=" "
                      autoComplete="address-level2"
                    />
                  </Grid>
                  <Grid xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="UF"
                      value={lead.estado}
                      onChange={(e) =>
                        setLead((p) => ({ ...p, estado: e.target.value.slice(0, 2) }))
                      }
                      helperText=" "
                      placeholder="PR"
                      autoComplete="address-level1"
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Quando pretende abrir / regularizar?"
                      value={lead.urgencia}
                      onChange={(e) => setLead((p) => ({ ...p, urgencia: e.target.value }))}
                      helperText=" "
                    >
                      {[
                        'O quanto antes',
                        'Em até 30 dias',
                        'Nos próximos 3 meses',
                        'Ainda estou pesquisando',
                      ].map((opcao) => (
                        <MenuItem key={opcao} value={opcao}>
                          {opcao}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      variant="contained"
                      loading={enviando}
                      onClick={handleEnviarLead}
                      startIcon={<Iconify icon="solar:letter-bold" />}
                      sx={{ py: 1.5 }}
                    >
                      Quero receber meu plano completo grátis
                    </LoadingButton>
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                  Usamos seus dados apenas para enviar o plano e retornar o contato — nada de spam.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 3,
                  textAlign: 'center',
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={40} sx={{ color: 'success.main', mb: 1 }} />
                <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
                  Plano garantido!
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Um especialista vai falar com você em breve. Quer adiantar? Chame a gente agora:
                </Typography>
                <Button
                  component="a"
                  href={whatsappLink(mensagemWhats)}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="large"
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="ic:baseline-whatsapp" />}
                >
                  Falar no WhatsApp agora
                </Button>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Button
                onClick={() => {
                  setPasso(0);
                  setPlano(null);
                  setLeadEnviado(false);
                }}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Refazer simulação
              </Button>
              {!leadEnviado && (
                <Button
                  component="a"
                  href={whatsappLink(mensagemWhats)}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Iconify icon="ic:baseline-whatsapp" />}
                  sx={{ color: 'success.main' }}
                >
                  Prefiro falar direto no WhatsApp
                </Button>
              )}
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
              Simulação simplificada (Simples Nacional), não substitui análise contábil
              individualizada. Valores de ISS e taxas variam por município.
            </Typography>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
