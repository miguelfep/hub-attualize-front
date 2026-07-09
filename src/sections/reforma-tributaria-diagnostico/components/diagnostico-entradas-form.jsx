'use client';

import { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { toast } from 'src/components/snackbar';

import {
  compactObject,
  numberToInput,
  numberInputToNumber,
  percentInputToFraction,
  fractionToPercentInput,
} from '../utils';

// ----------------------------------------------------------------------

const buildFormState = (diagnostico) => {
  const entradas = diagnostico?.entradas || {};
  const premissas = diagnostico?.premissas || {};
  return {
    receitaMensalProjetada: numberToInput(entradas.receitaMensalProjetada),
    mixB2B: fractionToPercentInput(entradas.mixB2B),
    margemLucroAlvo: fractionToPercentInput(entradas.margemLucroAlvo),
    custosFixosMensais: numberToInput(entradas.custosFixosMensais),
    custosVariaveisMensais: numberToInput(entradas.custosVariaveisMensais),
    folhaMensal: numberToInput(entradas.folhaMensal),
    percentualCreditoInsumos: fractionToPercentInput(entradas.percentualCreditoInsumos),
    aliquotaSimplesEfetiva: fractionToPercentInput(premissas.aliquotaSimplesEfetiva),
    aliquotaHibridoEfetiva: fractionToPercentInput(premissas.aliquotaHibridoEfetiva),
    percentualCreditoB2B: fractionToPercentInput(premissas.percentualCreditoB2B),
    custoComplianceHibridoMensal: numberToInput(premissas.custoComplianceHibridoMensal),
    fonteAliquotas: premissas.fonteAliquotas || '',
  };
};

const moneyProps = {
  type: 'text',
  inputMode: 'decimal',
  InputProps: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
};

const percentProps = {
  type: 'text',
  inputMode: 'decimal',
  InputProps: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
};

// ----------------------------------------------------------------------

/**
 * Formulário de entradas (e opcionalmente premissas) de um diagnóstico.
 * Monta o payload no formato do PATCH /entradas e delega o envio ao `onSave`.
 */
export function DiagnosticoEntradasForm({ diagnostico, showPremissas = true, onSave, disabled = false }) {
  const [form, setForm] = useState(() => buildFormState(diagnostico));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(buildFormState(diagnostico));
  }, [diagnostico]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const entradas = compactObject({
      receitaMensalProjetada: numberInputToNumber(form.receitaMensalProjetada),
      mixB2B: percentInputToFraction(form.mixB2B),
      margemLucroAlvo: percentInputToFraction(form.margemLucroAlvo),
      custosFixosMensais: numberInputToNumber(form.custosFixosMensais),
      custosVariaveisMensais: numberInputToNumber(form.custosVariaveisMensais),
      folhaMensal: numberInputToNumber(form.folhaMensal),
      percentualCreditoInsumos: percentInputToFraction(form.percentualCreditoInsumos),
    });

    const premissas = showPremissas
      ? compactObject({
          aliquotaSimplesEfetiva: percentInputToFraction(form.aliquotaSimplesEfetiva),
          aliquotaHibridoEfetiva: percentInputToFraction(form.aliquotaHibridoEfetiva),
          percentualCreditoB2B: percentInputToFraction(form.percentualCreditoB2B),
          custoComplianceHibridoMensal: numberInputToNumber(form.custoComplianceHibridoMensal),
          fonteAliquotas: form.fonteAliquotas || undefined,
        })
      : undefined;

    const payload = compactObject({ entradas, premissas });
    if (!payload) {
      toast.error('Preencha ao menos um campo para salvar');
      return;
    }

    try {
      setSaving(true);
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Dados do negócio</Typography>

        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Receita mensal projetada"
              value={form.receitaMensalProjetada}
              onChange={handleChange('receitaMensalProjetada')}
              disabled={disabled}
              {...moneyProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mix de vendas B2B"
              helperText="Percentual da receita vinda de outras empresas"
              value={form.mixB2B}
              onChange={handleChange('mixB2B')}
              disabled={disabled}
              {...percentProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Margem de lucro alvo"
              value={form.margemLucroAlvo}
              onChange={handleChange('margemLucroAlvo')}
              disabled={disabled}
              {...percentProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Custos fixos mensais"
              value={form.custosFixosMensais}
              onChange={handleChange('custosFixosMensais')}
              disabled={disabled}
              {...moneyProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Custos variáveis mensais"
              value={form.custosVariaveisMensais}
              onChange={handleChange('custosVariaveisMensais')}
              disabled={disabled}
              {...moneyProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Folha de pagamento mensal"
              value={form.folhaMensal}
              onChange={handleChange('folhaMensal')}
              disabled={disabled}
              {...moneyProps}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Crédito sobre insumos"
              helperText="Percentual estimado de crédito sobre compras/insumos"
              value={form.percentualCreditoInsumos}
              onChange={handleChange('percentualCreditoInsumos')}
              disabled={disabled}
              {...percentProps}
            />
          </Grid>
        </Grid>

        {showPremissas && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Premissas do cálculo</Typography>

            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Alíquota efetiva — Simples"
                  value={form.aliquotaSimplesEfetiva}
                  onChange={handleChange('aliquotaSimplesEfetiva')}
                  disabled={disabled}
                  {...percentProps}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Alíquota efetiva — Híbrido (IBS/CBS)"
                  value={form.aliquotaHibridoEfetiva}
                  onChange={handleChange('aliquotaHibridoEfetiva')}
                  disabled={disabled}
                  {...percentProps}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Crédito aproveitável B2B"
                  value={form.percentualCreditoB2B}
                  onChange={handleChange('percentualCreditoB2B')}
                  disabled={disabled}
                  {...percentProps}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custo de compliance híbrido (mensal)"
                  value={form.custoComplianceHibridoMensal}
                  onChange={handleChange('custoComplianceHibridoMensal')}
                  disabled={disabled}
                  {...moneyProps}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Fonte das alíquotas"
                  value={form.fonteAliquotas}
                  onChange={handleChange('fonteAliquotas')}
                  disabled={disabled}
                />
              </Grid>
            </Grid>
          </>
        )}

        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton type="submit" variant="contained" loading={saving} disabled={disabled}>
            Salvar dados
          </LoadingButton>
        </Stack>
      </Stack>
    </form>
  );
}
