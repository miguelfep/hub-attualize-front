'use client';

import { useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Stack,
  Button,
  Divider,
  Collapse,
  TextField,
  Container,
  Typography,
  ToggleButton,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// Cálculo do Fator R compartilhado com a landing de psicólogos (módulo puro, sem UI)
import {
  fBRL,
  fPct,
  parseMoedaBR,
  mascaraMoedaBR,
  calcularFatorR,
  LIMIAR_FATOR_R,
} from 'src/sections/psicologos-curitiba/fator-r';

import { CORES, whatsappLink } from './dados';

// ----------------------------------------------------------------------
// Medidor do Fator R: escala 0 → 56% com a linha dos 28% marcada.

const ESCALA_MAX = 0.56;

function MedidorFatorR({ fatorR, animar }) {
  const posicao = Math.min(fatorR / ESCALA_MAX, 1) * 100;
  const marca28 = (LIMIAR_FATOR_R / ESCALA_MAX) * 100;
  const acima = fatorR >= LIMIAR_FATOR_R;

  return (
    <Box aria-hidden="true" sx={{ mt: 1 }}>
      <Box sx={{ position: 'relative', pt: 3.5, pb: 4 }}>
        {/* Trilha */}
        <Box
          sx={{
            height: 14,
            borderRadius: 7,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#E4EDF2',
          }}
        >
          {/* Preenchimento até o resultado */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${posicao}%`,
              borderRadius: 7,
              bgcolor: acima ? CORES.verde : CORES.azul,
              transition: animar ? 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          />
        </Box>

        {/* Linha dos 28% */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            bottom: 12,
            left: `${marca28}%`,
            width: '2px',
            bgcolor: CORES.tinta,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: 0,
            left: `${marca28}%`,
            transform: 'translateX(-50%)',
            fontWeight: 700,
            color: CORES.tinta,
            whiteSpace: 'nowrap',
          }}
        >
          28% — linha do Fator R
        </Typography>

        {/* Ponteiro do resultado */}
        <Box
          sx={{
            position: 'absolute',
            top: 30,
            left: `${posicao}%`,
            transform: 'translateX(-50%)',
            transition: animar ? 'left 900ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: `9px solid ${acima ? CORES.verde : CORES.azul}`,
          }}
        />

        {/* Zonas */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        >
          <Typography variant="caption" sx={{ color: CORES.grafite }}>
            Abaixo de 28% → Anexo V
          </Typography>
          <Typography variant="caption" sx={{ color: CORES.grafite }}>
            28% ou mais → Anexo III
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CartaoAnexo({ titulo, subtitulo, efetiva, impostoMensal, ativo }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: ativo ? CORES.azul : '#DCE7ED',
        bgcolor: ativo ? '#FFFFFF' : 'transparent',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography component="h4" variant="subtitle1" sx={{ color: CORES.tinta }}>
          {titulo}
        </Typography>
        {ativo && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontWeight: 700,
              color: '#FFFFFF',
              bgcolor: CORES.azul,
            }}
          >
            seu enquadramento
          </Typography>
        )}
      </Stack>
      <Typography variant="caption" sx={{ color: CORES.grafite }}>
        {subtitulo}
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
        <Typography variant="body2" sx={{ color: CORES.grafite }}>
          Alíquota efetiva:{' '}
          <Box component="strong" sx={{ color: CORES.tinta }}>
            {fPct(efetiva)}
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: CORES.grafite }}>
          Imposto mensal estimado:{' '}
          <Box component="strong" sx={{ color: CORES.tinta }}>
            {fBRL(impostoMensal)}
          </Box>
        </Typography>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function CalculadoraFatorR() {
  const reduzirMovimento = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [modo, setModo] = useState('anual'); // 'anual' | 'mensal'
  const [receitaInput, setReceitaInput] = useState('');
  const [folhaInput, setFolhaInput] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const handleCalcular = () => {
    const receitaBase = parseMoedaBR(receitaInput);
    const receita12 = modo === 'mensal' ? receitaBase * 12 : receitaBase;
    const folha12 = parseMoedaBR(folhaInput);

    if (receita12 <= 0) {
      setErro('Informe a receita para calcular.');
      setResultado(null);
      return;
    }
    setErro('');
    setResultado(calcularFatorR({ receita12, folha12 }));
  };

  const mensagemWhats = resultado
    ? `Olá! Simulei meu Fator R na página de Médicos em Curitiba: receita 12m ${fBRL(resultado.receita12)}, folha 12m ${fBRL(resultado.folha12)} → Fator R ${fPct(resultado.fatorR)} (Anexo ${resultado.anexo}, alíquota efetiva ${fPct(resultado.anexo === 'III' ? resultado.efetivaIII : resultado.efetivaV)}). Quero otimizar meu Fator R com a Attualize.`
    : '';

  const noAnexoV = resultado?.anexo === 'V';

  return (
    <Box
      component="section"
      id="calculadora-fator-r"
      aria-labelledby="titulo-calculadora"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: CORES.azulSuave, scrollMarginTop: 96 }}
    >
      <Container maxWidth="md">
        <Stack spacing={1} sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: CORES.azul, letterSpacing: 1.5, fontWeight: 700 }}
          >
            Calculadora gratuita
          </Typography>
          <Typography id="titulo-calculadora" component="h2" variant="h3" sx={{ color: CORES.tinta }}>
            Descubra seu Fator R em 30 segundos
          </Typography>
          <Typography variant="body1" sx={{ color: CORES.grafite, maxWidth: 560, mx: 'auto' }}>
            O Fator R define se sua empresa médica paga imposto pelo Anexo III (a partir de 6%) ou
            pelo Anexo V (a partir de 15,5%) do Simples Nacional. Simule com seus números.
          </Typography>
        </Stack>

        <Box
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: `1px solid #DCEAF2`,
            boxShadow: '0 16px 40px -24px rgba(15, 36, 48, 0.35)',
          }}
        >
          <Stack spacing={2.5}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={modo}
              onChange={(_, valor) => valor && setModo(valor)}
              aria-label="Como você quer informar a receita"
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                '& .MuiToggleButton-root.Mui-selected': {
                  bgcolor: CORES.azulSuave,
                  color: CORES.azul,
                  fontWeight: 700,
                },
              }}
            >
              <ToggleButton value="anual">Receita dos últimos 12 meses</ToggleButton>
              <ToggleButton value="mensal">Receita mensal média</ToggleButton>
            </ToggleButtonGroup>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                id="calc-receita"
                label={
                  modo === 'anual'
                    ? 'Receita bruta dos últimos 12 meses'
                    : 'Receita mensal média (multiplicamos por 12)'
                }
                value={receitaInput}
                onChange={(e) => setReceitaInput(mascaraMoedaBR(e.target.value))}
                inputMode="decimal"
                placeholder={modo === 'anual' ? '480.000,00' : '40.000,00'}
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                error={!!erro}
                helperText={erro || ' '}
              />
              <TextField
                fullWidth
                id="calc-folha"
                label="Folha de pagamento dos últimos 12 meses"
                value={folhaInput}
                onChange={(e) => setFolhaInput(mascaraMoedaBR(e.target.value))}
                inputMode="decimal"
                placeholder="140.000,00"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                helperText="Inclua pró-labore + INSS patronal + FGTS"
              />
            </Stack>

            <Button
              onClick={handleCalcular}
              size="large"
              variant="contained"
              startIcon={<Iconify icon="solar:calculator-bold" />}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                px: 4,
                bgcolor: CORES.azul,
                color: '#FFFFFF',
                '&:hover': { bgcolor: CORES.azulEscuro },
                '&:focus-visible': { outline: `3px solid ${CORES.tinta}`, outlineOffset: 2 },
              }}
            >
              Calcular meu Fator R
            </Button>

            <Collapse in={!!resultado} timeout={reduzirMovimento ? 0 : 400}>
              {resultado && (
                <Stack spacing={3} sx={{ pt: 1 }}>
                  <Divider sx={{ borderColor: '#DCEAF2' }} />

                  {/* Resultado principal */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ sm: 'baseline' }}
                    justifyContent="space-between"
                  >
                    <Typography component="h3" variant="h4" sx={{ color: CORES.tinta }}>
                      Seu Fator R:{' '}
                      <Box
                        component="span"
                        sx={{ color: noAnexoV ? CORES.azul : CORES.verde }}
                      >
                        {fPct(resultado.fatorR)}
                      </Box>
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: CORES.grafite }}>
                      Enquadramento: <strong>Anexo {resultado.anexo}</strong>
                    </Typography>
                  </Stack>

                  <MedidorFatorR fatorR={resultado.fatorR} animar={!reduzirMovimento} />

                  {/* Comparativo lado a lado */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <CartaoAnexo
                      titulo="Anexo III"
                      subtitulo="Fator R ≥ 28%"
                      efetiva={resultado.efetivaIII}
                      impostoMensal={resultado.impostoMensalIII}
                      ativo={resultado.anexo === 'III'}
                    />
                    <CartaoAnexo
                      titulo="Anexo V"
                      subtitulo="Fator R < 28%"
                      efetiva={resultado.efetivaV}
                      impostoMensal={resultado.impostoMensalV}
                      ativo={resultado.anexo === 'V'}
                    />
                  </Stack>

                  {/* Economia potencial (só no Anexo V) */}
                  {noAnexoV && resultado.economiaAnual > 0 && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: '#EAF5EE',
                        border: `1px solid ${CORES.verde}33`,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Iconify
                          icon="solar:graph-up-bold"
                          width={24}
                          sx={{ color: CORES.verde, mt: 0.25, flexShrink: 0 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: CORES.tinta }}>
                            Você poderia economizar {fBRL(resultado.economiaAnual)} por ano no
                            Anexo III
                          </Typography>
                          <Typography variant="body2" sx={{ color: CORES.grafite, mt: 0.5 }}>
                            Para atingir 28% de Fator R, sua folha anual precisaria aumentar{' '}
                            {fBRL(resultado.proLaboreAnualNecessario)} — cerca de{' '}
                            {fBRL(resultado.proLaboreMensalNecessario)} por mês em pró-labore. O
                            ajuste ideal considera também o INSS: é o cálculo que fazemos no
                            diagnóstico.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* CTA contextual */}
                  <Button
                    component="a"
                    href={whatsappLink(mensagemWhats)}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="large"
                    variant="contained"
                    startIcon={<Iconify icon="ic:baseline-whatsapp" />}
                    sx={{
                      alignSelf: { xs: 'stretch', sm: 'center' },
                      px: 4,
                      bgcolor: CORES.tinta,
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#1D3D50' },
                      '&:focus-visible': { outline: `3px solid ${CORES.azul}`, outlineOffset: 2 },
                    }}
                  >
                    Quer que a Attualize otimize seu Fator R? Fale com um especialista
                  </Button>

                  <Typography variant="caption" sx={{ color: CORES.grafite, textAlign: 'center' }}>
                    Simulação simplificada, não substitui análise contábil individualizada. Para
                    clínicas no Lucro Presumido, avaliamos também a equiparação hospitalar.
                  </Typography>
                </Stack>
              )}
            </Collapse>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
