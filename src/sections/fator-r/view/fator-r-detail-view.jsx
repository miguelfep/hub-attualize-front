'use client';

import { useMemo, useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetFatorRCliente } from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FatorRChart } from '../components/fator-r-chart';
import { FatorRFolha } from '../components/fator-r-folha';
import { FatorRApuracao } from '../components/fator-r-apuracao';
import { FatorRProjecao } from '../components/fator-r-projecao';
import { FatorRAuditoria } from '../components/fator-r-auditoria';
import { FatorRSimulacao } from '../components/fator-r-simulacao';
import { FatorRFaturamento } from '../components/fator-r-faturamento';
import {
  MESES,
  riscoColor,
  riscoLabel,
  anexoColor,
  anexoLabel,
  fatorRPercent,
  anosDisponiveis,
  competenciaAtual,
  distanciaDoLimiar,
} from '../utils';

const TABS = [
  { value: 'resumo', label: 'Visão geral' },
  { value: 'folha', label: 'Folha' },
  { value: 'faturamento', label: 'Faturamento' },
  { value: 'projecao', label: 'Projeção' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'apuracao', label: 'Apuração' },
];

export function FatorRDetailView({ id }) {
  const inicial = competenciaAtual();
  const [ano, setAno] = useState(inicial.ano);
  const [mes, setMes] = useState(inicial.mes);
  const [tab, setTab] = useState('resumo');

  const { atual, risco, serie, fatorRLoading, refetchFatorR } = useGetFatorRCliente(id, {
    ano,
    mes,
  });

  // Médias da janela viram sugestão inicial da projeção — melhor ponto de
  // partida que zero, e o usuário ajusta.
  const sugestoes = useMemo(() => {
    if (!atual) return { receita: 0, folha: 0 };
    return {
      receita: atual.mesesComFaturamento ? atual.rbt12 / 12 : 0,
      folha: atual.mesesComFolha ? atual.fs12 / 12 : 0,
    };
  }, [atual]);

  const handleCompetencia = useCallback(
    (setter) => (event) => setter(Number(event.target.value)),
    []
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Fator R do cliente"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Fator R', href: paths.dashboard.fiscal.fatorR.root },
          { name: 'Detalhe' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          sx={{ p: 2.5 }}
        >
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={handleCompetencia(setAno)}>
              {anosDisponiveis().map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 170 }}>
            <InputLabel>Período de apuração</InputLabel>
            <Select value={mes} label="Período de apuração" onChange={handleCompetencia(setMes)}>
              {MESES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {fatorRLoading ? (
            <Skeleton variant="text" width={280} />
          ) : (
            atual && <ResumoCabecalho atual={atual} risco={risco} />
          )}
        </Stack>
      </Card>

      {atual?.dadosIncompletos && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          A janela de 12 meses está incompleta ({atual.mesesComFolha}/12 de folha e{' '}
          {atual.mesesComFaturamento}/12 de faturamento). O Fator R acima é indicativo e não deve
          ser tratado como definitivo nem levado ao cliente.
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_e, novo) => setTab(novo)}
        sx={{ mb: 3, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}` }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {tab === 'resumo' && (
        <Grid container spacing={3}>
          <Grid xs={12} md={7}>
            <FatorRChart serie={serie} />
          </Grid>
          <Grid xs={12} md={5}>
            <FatorRSimulacao clienteId={id} ano={ano} mes={mes} />
          </Grid>
        </Grid>
      )}

      {tab === 'folha' && <FatorRFolha clienteId={id} onChanged={refetchFatorR} />}

      {tab === 'faturamento' && <FatorRFaturamento clienteId={id} onChanged={refetchFatorR} />}

      {tab === 'projecao' && (
        <FatorRProjecao
          clienteId={id}
          ano={ano}
          mes={mes}
          receitaSugerida={sugestoes.receita}
          folhaSugerida={sugestoes.folha}
        />
      )}

      {tab === 'auditoria' && <FatorRAuditoria clienteId={id} />}

      {tab === 'apuracao' && <FatorRApuracao clienteId={id} ano={ano} mes={mes} />}
    </DashboardContent>
  );
}

function ResumoCabecalho({ atual, risco }) {
  const distancia = distanciaDoLimiar(atual.fatorR);

  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Stack spacing={0.5} alignItems="flex-end">
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Fator R
        </Typography>
        <Label variant="soft" color={riscoColor(risco)} sx={{ height: 32, px: 1.5 }}>
          <Typography variant="subtitle1">{fatorRPercent(atual.fatorR)}</Typography>
        </Label>
        {distancia !== null && (
          <Typography
            variant="caption"
            sx={{ color: distancia < 0 ? 'error.main' : 'text.secondary' }}
          >
            {distancia >= 0 ? '+' : ''}
            {distancia.toFixed(1).replace('.', ',')} p.p. do limite
          </Typography>
        )}
      </Stack>

      <Stack spacing={0.5} alignItems="flex-end">
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Anexo apurado
        </Typography>
        <Label variant="soft" color={anexoColor(atual.anexoAplicavel)}>
          {anexoLabel(atual.anexoAplicavel)}
        </Label>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {riscoLabel(risco)}
        </Typography>
      </Stack>

      <Stack spacing={0.5} alignItems="flex-end">
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Folha 12m / Receita 12m
        </Typography>
        <Typography variant="subtitle2">{fCurrency(atual.fs12)}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fCurrency(atual.rbt12)}
        </Typography>
      </Stack>
    </Stack>
  );
}
