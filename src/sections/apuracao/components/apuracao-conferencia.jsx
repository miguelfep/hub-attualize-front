import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

import { anexoLabel, tributoLabel } from '../../fator-r/utils';

/**
 * Confronto entre o que a Receita apurou na simulação e o que a nossa base diz.
 *
 * Sem isto, aprovar a apuração é referendar um número que ninguém verificou. Os
 * três blocos são eixos independentes de divergência, e é a COMBINAÇÃO deles que
 * diz onde está o problema: RBT12 divergente com partilha fechando é faturamento
 * faltando na nossa base; partilha divergente com RBT12 batendo é anexo ou
 * atividade errados na declaração.
 */
export function ApuracaoConferencia({ conferencia }) {
  if (!conferencia) return null;

  const { conferido, ok, alertas = [], tributos = [] } = conferencia;

  return (
    <Card>
      <CardHeader
        title="Conferência da simulação"
        subheader="A apuração da Receita comparada com a nossa, pelas tabelas da LC 123/2006"
        action={
          <Label variant="soft" color={!conferido ? 'default' : ok ? 'success' : 'warning'}>
            {!conferido ? 'Não conferida' : ok ? 'Confere' : 'Divergente'}
          </Label>
        }
      />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        {ok && (
          <Alert severity="success">
            Os valores da Receita batem com a nossa apuração do{' '}
            {anexoLabel(conferencia.anexo)} — base de cálculo, total e partilha por tributo.
          </Alert>
        )}

        {alertas.map((alerta) => (
          <Alert key={alerta} severity={conferido ? 'warning' : 'info'}>
            {alerta}
          </Alert>
        ))}

        {!ok && conferido && (
          <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <AlertTitle>Como ler a divergência</AlertTitle>
            <Typography variant="body2">
              Divergiu o RBT12 mas a partilha fechou: falta faturamento na nossa base, ou há
              declaração retificadora que não conhecemos — a conta da Receita está certa.
              Divergiu a partilha: o anexo aplicável ou a atividade (idAtividade) declarada
              não correspondem ao que a Receita usou.
            </Typography>
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Comparacao
            titulo="RBT12 (base de cálculo)"
            nosso={fCurrency(conferencia.rbt12Nosso)}
            receita={
              conferencia.rbt12Receita !== null && conferencia.rbt12Receita !== undefined
                ? `≈ ${fCurrency(conferencia.rbt12Receita)}`
                : 'indeterminado na 1ª faixa'
            }
          />
          <Comparacao
            titulo="Alíquota efetiva"
            nosso={pct(conferencia.aliquotaEfetivaNossa)}
            receita={pct(conferencia.aliquotaEfetivaReceita)}
          />
          <Comparacao
            titulo="Total devido"
            nosso={fCurrency(conferencia.totalNosso)}
            receita={fCurrency(conferencia.totalReceita)}
            destaque={
              conferencia.diferencaTotal
                ? `diferença de ${fCurrency(conferencia.diferencaTotal)}`
                : null
            }
          />
        </Stack>

        {conferencia.faixaReceita && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            A Receita aplicou a {conferencia.faixaReceita}ª faixa do{' '}
            {anexoLabel(conferencia.anexo)}
            {conferencia.rbt12ReceitaPrecisao
              ? `. O RBT12 é deduzido da alíquota efetiva, com precisão de ± ${fCurrency(conferencia.rbt12ReceitaPrecisao)}`
              : ''}
            .
          </Typography>
        )}
      </Stack>

      {!!tributos.length && (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tributo</TableCell>
                <TableCell align="right">Partilha do anexo</TableCell>
                <TableCell align="right">Receita</TableCell>
                <TableCell align="right">Diferença</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tributos.map((t) => (
                <TableRow key={t.codigoTributo}>
                  <TableCell>{tributoLabel(t.codigoTributo)}</TableCell>
                  <TableCell align="right">{fCurrency(t.esperado)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">{fCurrency(t.recebido)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: t.ok ? 'text.disabled' : 'error.main' }}
                    >
                      {t.ok ? '—' : fCurrency(t.diferenca)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

/** Decimal (0.060584) para percentual legível. Null vira travessão, nunca 0%. */
function pct(valor) {
  if (valor === null || valor === undefined) return '—';
  return `${(valor * 100).toFixed(4).replace('.', ',')}%`;
}

function Comparacao({ titulo, nosso, receita, destaque }) {
  return (
    <Stack spacing={0.5} sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Box>
        <Typography variant="subtitle1">{receita}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          nossa base: {nosso}
        </Typography>
      </Box>
      {destaque && (
        <Typography variant="caption" sx={{ color: 'warning.dark' }}>
          {destaque}
        </Typography>
      )}
    </Stack>
  );
}
