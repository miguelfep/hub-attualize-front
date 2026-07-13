'use client';

import { useState } from 'react';

import {
  Box,
  Stack,
  Button,
  Slider,
  Divider,
  Collapse,
  TextField,
  Container,
  Typography,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// Tabela do Anexo III e helpers de moeda compartilhados (módulo puro, sem UI)
import {
  fBRL,
  fPct,
  ANEXO_III,
  parseMoedaBR,
  mascaraMoedaBR,
  aliquotaEfetiva,
} from 'src/sections/psicologos-curitiba/fator-r';

import { whatsappLink } from './dados-compartilhados';

// ----------------------------------------------------------------------
// Simulador: quanto o estabelecimento economiza de Simples Nacional quando a
// cota-parte repassada aos parceiros sai da receita bruta (Lei 13.352/2016).

const LIMITE_MEI_ANUAL = 81000;

export function calcularEconomiaParceria({ receitaMensal, percentualRepasse }) {
  const receita12 = receitaMensal * 12;
  const repasse12 = receita12 * percentualRepasse;
  const base12ComLei = receita12 - repasse12;

  const efetivaSemLei = aliquotaEfetiva(ANEXO_III, receita12);
  const efetivaComLei = aliquotaEfetiva(ANEXO_III, base12ComLei);

  const impostoAnualSemLei = receita12 * efetivaSemLei;
  const impostoAnualComLei = base12ComLei * efetivaComLei;

  return {
    receita12,
    repasse12,
    base12ComLei,
    efetivaSemLei,
    efetivaComLei,
    impostoAnualSemLei,
    impostoAnualComLei,
    impostoMensalSemLei: impostoAnualSemLei / 12,
    impostoMensalComLei: impostoAnualComLei / 12,
    economiaAnual: Math.max(0, impostoAnualSemLei - impostoAnualComLei),
  };
}

// ----------------------------------------------------------------------

function CartaoCenario({ cores, titulo, subtitulo, efetiva, impostoMensal, ativo }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: ativo ? cores.verde : cores.suave,
        bgcolor: '#FFFFFF',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography component="h4" variant="subtitle1" sx={{ color: cores.tinta }}>
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
              bgcolor: cores.verde,
            }}
          >
            com a lei
          </Typography>
        )}
      </Stack>
      <Typography variant="caption" sx={{ color: cores.grafite }}>
        {subtitulo}
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
        <Typography variant="body2" sx={{ color: cores.grafite }}>
          Alíquota efetiva:{' '}
          <Box component="strong" sx={{ color: cores.tinta }}>
            {fPct(efetiva)}
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: cores.grafite }}>
          Imposto mensal estimado:{' '}
          <Box component="strong" sx={{ color: cores.tinta }}>
            {fBRL(impostoMensal)}
          </Box>
        </Typography>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function CalculadoraSalaoParceiro({ segmento }) {
  const { cores } = segmento;

  const [receitaInput, setReceitaInput] = useState('');
  const [repasse, setRepasse] = useState(50);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const handleCalcular = () => {
    const receitaMensal = parseMoedaBR(receitaInput);
    if (receitaMensal <= 0) {
      setErro('Informe o faturamento para calcular.');
      setResultado(null);
      return;
    }
    setErro('');
    setResultado(calcularEconomiaParceria({ receitaMensal, percentualRepasse: repasse / 100 }));
  };

  const mensagemWhats = resultado
    ? `Olá! Simulei a Lei do Salão Parceiro na página de ${segmento.nome}: faturamento anual ${fBRL(resultado.receita12)}, repasse de ${repasse}% aos parceiros → imposto cai de ${fBRL(resultado.impostoMensalSemLei)} para ${fBRL(resultado.impostoMensalComLei)} por mês (economia de ${fBRL(resultado.economiaAnual)} por ano). Quero implantar com a Attualize.`
    : '';

  const podeSerMei = resultado && resultado.receita12 <= LIMITE_MEI_ANUAL;

  return (
    <Box
      component="section"
      id="calculadora-parceria"
      aria-labelledby="titulo-calculadora"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: '#FFFFFF', scrollMarginTop: 96 }}
    >
      <Container maxWidth="md">
        <Stack spacing={1} sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: cores.destaque, letterSpacing: 1.5, fontWeight: 700 }}
          >
            Calculadora gratuita
          </Typography>
          <Typography id="titulo-calculadora" component="h2" variant="h3" sx={{ color: cores.tinta }}>
            Quanto você economiza com a Lei do Salão Parceiro?
          </Typography>
          <Typography variant="body1" sx={{ color: cores.grafite, maxWidth: 620, mx: 'auto' }}>
            Sem o contrato de parceria, o Simples Nacional incide sobre o valor cheio dos serviços.
            Com a lei, o repasse aos parceiros sai da base. Simule com seus números.
          </Typography>
        </Stack>

        <Box
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            bgcolor: cores.papel,
            border: `1px solid ${cores.suave}`,
            boxShadow: '0 16px 40px -24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
              <TextField
                fullWidth
                id="calc-receita"
                label="Faturamento mensal do estabelecimento"
                value={receitaInput}
                onChange={(e) => setReceitaInput(mascaraMoedaBR(e.target.value))}
                inputMode="decimal"
                placeholder="30.000,00"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                error={!!erro}
                helperText={erro || 'Total dos serviços, antes dos repasses'}
              />
              <Box sx={{ width: '100%', px: 1 }}>
                <Typography variant="body2" sx={{ color: cores.grafite, mb: 1 }}>
                  Repasse aos profissionais parceiros: <strong>{repasse}%</strong>
                </Typography>
                <Slider
                  value={repasse}
                  onChange={(_, valor) => setRepasse(valor)}
                  min={0}
                  max={80}
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 40, label: '40%' },
                    { value: 80, label: '80%' },
                  ]}
                  aria-label="Percentual repassado aos parceiros"
                  sx={{
                    color: cores.destaque,
                    '& .MuiSlider-markLabel': { color: cores.grafite },
                  }}
                />
              </Box>
            </Stack>

            <Button
              onClick={handleCalcular}
              size="large"
              variant="contained"
              startIcon={<Iconify icon="solar:calculator-bold" />}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                px: 4,
                bgcolor: cores.destaque,
                color: '#FFFFFF',
                '&:hover': { bgcolor: cores.destaqueEscuro },
                '&:focus-visible': { outline: `3px solid ${cores.tinta}`, outlineOffset: 2 },
              }}
            >
              Calcular minha economia
            </Button>

            <Collapse in={!!resultado}>
              {resultado && (
                <Stack spacing={3} sx={{ pt: 1 }}>
                  <Divider sx={{ borderColor: cores.suave }} />

                  <Typography component="h3" variant="h4" sx={{ color: cores.tinta, textAlign: 'center' }}>
                    Economia estimada:{' '}
                    <Box component="span" sx={{ color: cores.verde }}>
                      {fBRL(resultado.economiaAnual)}/ano
                    </Box>
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <CartaoCenario
                      cores={cores}
                      titulo="Sem a lei"
                      subtitulo="Imposto sobre o valor cheio dos serviços"
                      efetiva={resultado.efetivaSemLei}
                      impostoMensal={resultado.impostoMensalSemLei}
                      ativo={false}
                    />
                    <CartaoCenario
                      cores={cores}
                      titulo="Com a Lei do Salão Parceiro"
                      subtitulo="Imposto apenas sobre a sua cota-parte"
                      efetiva={resultado.efetivaComLei}
                      impostoMensal={resultado.impostoMensalComLei}
                      ativo
                    />
                  </Stack>

                  {podeSerMei && (
                    <Typography variant="body2" sx={{ color: cores.grafite, textAlign: 'center' }}>
                      Com esse faturamento, vale avaliar também o enquadramento como MEI — fazemos
                      essa comparação no diagnóstico gratuito.
                    </Typography>
                  )}

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
                      bgcolor: cores.tinta,
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: cores.destaqueEscuro },
                      '&:focus-visible': { outline: `3px solid ${cores.destaque}`, outlineOffset: 2 },
                    }}
                  >
                    Quero implantar a Lei do Salão Parceiro
                  </Button>

                  <Typography variant="caption" sx={{ color: cores.grafite, textAlign: 'center' }}>
                    Simulação simplificada (Simples Nacional, Anexo III), não substitui análise
                    contábil individualizada. A implantação exige contratos e requisitos da Lei
                    13.352/2016.
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
