import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { useGetProjecao } from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import { anexoColor, anexoLabel, fatorRPercent, competenciaLabel } from '../utils';

const TABLE_HEAD = [
  { id: 'competencia', label: 'Competência', width: 130 },
  { id: 'fatorR', label: 'Fator R projetado', width: 160 },
  { id: 'anexo', label: 'Anexo', width: 140 },
  { id: 'rbt12', label: 'RBT12 projetado' },
  { id: 'folhaMinima', label: 'Folha mensal p/ manter 28%' },
];

export function FatorRProjecao({ clienteId, ano, mes, receitaSugerida, folhaSugerida }) {
  const [receitaMensal, setReceitaMensal] = useState(Math.round(receitaSugerida || 0));
  const [folhaMensal, setFolhaMensal] = useState(Math.round(folhaSugerida || 0));
  const [meses, setMeses] = useState(12);

  const { projecao, primeiroMesAbaixo, projecaoLoading } = useGetProjecao(clienteId, {
    ano,
    mes,
    receitaMensal,
    folhaMensal,
    meses,
  });

  return (
    <Card>
      <CardHeader
        title="Projeção"
        subheader="Como o Fator R evolui se a receita e a folha mensais se mantiverem nestes valores"
      />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="number"
            label="Receita mensal assumida"
            value={receitaMensal}
            onChange={(e) => setReceitaMensal(Math.max(0, Number(e.target.value) || 0))}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <TextField
            type="number"
            label="Folha mensal assumida"
            value={folhaMensal}
            onChange={(e) => setFolhaMensal(Math.max(0, Number(e.target.value) || 0))}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <TextField
            type="number"
            label="Meses"
            value={meses}
            onChange={(e) => setMeses(Math.min(24, Math.max(1, Number(e.target.value) || 1)))}
            inputProps={{ min: 1, max: 24 }}
            sx={{ minWidth: 120 }}
          />
        </Stack>

        {primeiroMesAbaixo ? (
          <Alert severity="warning">
            Mantida essa trajetória, o cliente cai para o Anexo V em{' '}
            <strong>{competenciaLabel(primeiroMesAbaixo.ano, primeiroMesAbaixo.mes)}</strong>. O
            ajuste precisa acontecer antes disso para entrar na janela a tempo.
          </Alert>
        ) : (
          projecao.length > 0 && (
            <Alert severity="success">
              Nessa trajetória o cliente permanece no Anexo III durante todo o horizonte projetado.
            </Alert>
          )
        )}
      </Stack>

      <Scrollbar>
        <TableContainer sx={{ overflow: 'auto' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {projecao.map((p) => (
                <TableRow key={`${p.competencia.ano}-${p.competencia.mes}`} hover>
                  <TableCell>{competenciaLabel(p.competencia.ano, p.competencia.mes)}</TableCell>
                  <TableCell>{fatorRPercent(p.fatorRProjetado)}</TableCell>
                  <TableCell>
                    <Label variant="soft" color={anexoColor(p.anexoAplicavel)}>
                      {anexoLabel(p.anexoAplicavel)}
                    </Label>
                  </TableCell>
                  <TableCell>{fCurrency(p.rbt12Projetado)}</TableCell>
                  <TableCell>{fCurrency(p.folhaMinimaParaManter)}</TableCell>
                </TableRow>
              ))}

              {!projecaoLoading && !projecao.length && (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Informe a receita e a folha mensais para projetar.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}
