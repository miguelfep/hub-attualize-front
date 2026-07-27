import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { useGetSimulacao } from 'src/actions/fator-r';

import { Label } from 'src/components/label';

export function FatorRSimulacao({ clienteId, ano, mes }) {
  const [mesesParaAjustar, setMesesParaAjustar] = useState(1);

  const { simulacao, simulacaoLoading } = useGetSimulacao(clienteId, {
    ano,
    mes,
    mesesParaAjustar,
  });

  if (simulacaoLoading) {
    return (
      <Card>
        <CardHeader title="Simulação de pró-labore" />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={180} />
        </Box>
      </Card>
    );
  }

  if (!simulacao) return null;

  const jaEstaNoAnexoIII = simulacao.folhaAdicionalNecessaria === 0;

  return (
    <Card>
      <CardHeader
        title="Simulação de pró-labore"
        subheader="Quanto de folha falta para atingir 28% e se o ajuste compensa"
      />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        {jaEstaNoAnexoIII ? (
          <Alert severity="success">
            O cliente já atinge os 28% com a folha atual. Nenhum ajuste é necessário nesta
            competência.
          </Alert>
        ) : (
          <>
            <TextField
              type="number"
              label="Diluir o ajuste em quantos meses"
              value={mesesParaAjustar}
              onChange={(e) => setMesesParaAjustar(Math.max(1, Number(e.target.value) || 1))}
              helperText="O acréscimo feito num mês só entra na janela a partir do período seguinte."
              inputProps={{ min: 1 }}
              sx={{ maxWidth: 320 }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              divider={<Divider orientation="vertical" flexItem />}
              spacing={3}
            >
              <Metrica
                titulo="Folha faltante na janela"
                valor={fCurrency(simulacao.folhaAdicionalNecessaria)}
              />
              <Metrica
                titulo="Pró-labore adicional por mês"
                valor={fCurrency(simulacao.proLaboreMensalAdicional)}
                destaque
              />
            </Stack>

            <Divider />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              divider={<Divider orientation="vertical" flexItem />}
              spacing={3}
            >
              <Metrica
                titulo="Economia anual no Simples"
                valor={fCurrency(simulacao.economiaAnualEstimada)}
                cor="success.main"
              />
              <Metrica
                titulo="Custo de INSS do sócio"
                valor={fCurrency(simulacao.custoInssEstimado)}
                cor="error.main"
              />
            </Stack>

            <Alert severity={simulacao.valeAPena ? 'success' : 'warning'}>
              {simulacao.valeAPena
                ? 'A economia no Simples supera o custo de INSS do sócio — o ajuste compensa.'
                : 'O custo de INSS do sócio anula a economia no Simples. Reveja antes de recomendar.'}
            </Alert>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              A estimativa não inclui o IRPF incidente sobre o pró-labore adicional, que reduz o
              ganho líquido do sócio.
            </Typography>
          </>
        )}
      </Stack>
    </Card>
  );
}

function Metrica({ titulo, valor, cor, destaque }) {
  return (
    <Stack spacing={0.5} sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {titulo}
      </Typography>
      {destaque ? (
        <Label variant="soft" color="primary" sx={{ alignSelf: 'flex-start', height: 32, px: 1.5 }}>
          <Typography variant="subtitle1">{valor}</Typography>
        </Label>
      ) : (
        <Typography variant="h6" sx={{ color: cor }}>
          {valor}
        </Typography>
      )}
    </Stack>
  );
}
