'use client';

import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Divider,
  CardHeader,
  Typography,
  CardContent,
} from '@mui/material';

import { fPercent, fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const fMoney = (value) => (value === null || value === undefined ? '—' : fCurrency(value));

const fFraction = (value) =>
  value === null || value === undefined
    ? '—'
    : fPercent(Number(value) * 100, { maximumFractionDigits: 2 });

function Item({ label, value }) {
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ItemsGrid({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

/** Leitura das entradas e premissas do diagnóstico, com atalho para edição. */
export function DiagnosticoDadosCard({ diagnostico, onEditar }) {
  const entradas = diagnostico?.entradas || {};
  const premissas = diagnostico?.premissas || {};

  const semReceita =
    entradas.receitaMensalProjetada === null || entradas.receitaMensalProjetada === undefined;

  return (
    <Card>
      <CardHeader
        title="Dados e premissas"
        subheader="Valores usados no comparativo entre Simples tradicional e híbrido (IBS/CBS)"
        titleTypographyProps={{ variant: 'subtitle1' }}
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={onEditar}
          >
            Editar dados
          </Button>
        }
      />
      <CardContent>
        <Stack spacing={3}>
          {semReceita && (
            <Alert severity="warning" variant="outlined">
              Informe a receita mensal projetada para conseguir calcular o diagnóstico.
            </Alert>
          )}

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Dados do negócio
            </Typography>
            <ItemsGrid>
              <Item label="Receita mensal projetada" value={fMoney(entradas.receitaMensalProjetada)} />
              <Item label="Mix de vendas B2B" value={fFraction(entradas.mixB2B)} />
              <Item label="Margem de lucro alvo" value={fFraction(entradas.margemLucroAlvo)} />
              <Item label="Custos fixos mensais" value={fMoney(entradas.custosFixosMensais)} />
              <Item label="Custos variáveis mensais" value={fMoney(entradas.custosVariaveisMensais)} />
              <Item label="Folha mensal" value={fMoney(entradas.folhaMensal)} />
              <Item label="Crédito sobre insumos" value={fFraction(entradas.percentualCreditoInsumos)} />
            </ItemsGrid>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Premissas do cálculo
            </Typography>
            <ItemsGrid>
              <Item label="Alíquota efetiva — Simples" value={fFraction(premissas.aliquotaSimplesEfetiva)} />
              <Item label="Alíquota efetiva — Híbrido" value={fFraction(premissas.aliquotaHibridoEfetiva)} />
              <Item label="Crédito aproveitável B2B" value={fFraction(premissas.percentualCreditoB2B)} />
              <Item
                label="Custo compliance híbrido (mensal)"
                value={fMoney(premissas.custoComplianceHibridoMensal)}
              />
              <Item label="Fonte das alíquotas" value={premissas.fonteAliquotas || '—'} />
            </ItemsGrid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
