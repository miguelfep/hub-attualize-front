import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { useGetAuditoria } from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import { anexoLabel, fatorRPercent, competenciaLabel } from '../utils';

const TABLE_HEAD = [
  { id: 'competencia', label: 'Competência', width: 130 },
  { id: 'fatorR', label: 'Fator R apurado', width: 150 },
  { id: 'apurado', label: 'Anexo apurado', width: 150 },
  { id: 'cadastro', label: 'Anexo no cadastro', width: 170 },
  { id: 'diferenca', label: 'Diferença estimada' },
];

export function FatorRAuditoria({ clienteId }) {
  const { achados, inversos, inconclusivos, totalRecuperavel, auditoriaLoading } =
    useGetAuditoria(clienteId);

  if (auditoriaLoading) {
    return (
      <Card>
        <CardHeader title="Auditoria retroativa" />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </Card>
    );
  }

  const nadaAApurar = !achados.length && !inversos.length && !inconclusivos.length;

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Auditoria retroativa"
          subheader="Períodos em que o anexo apurado divergiu do que constava no cadastro"
        />

        <Stack spacing={2.5} sx={{ p: 3 }}>
          {nadaAApurar ? (
            <Alert severity="info">
              Não há apurações gravadas para este cliente ainda. A auditoria lê os snapshots
              mensais — ela fica disponível conforme o recálculo for rodando.
            </Alert>
          ) : (
            <>
              {achados.length > 0 ? (
                <Alert severity="success" icon={<Iconify icon="solar:hand-money-bold" />}>
                  {achados.length} período(s) com direito ao Anexo III enquanto o cadastro indicava
                  Anexo V. Recuperável estimado:{' '}
                  <strong>{fCurrency(totalRecuperavel)}</strong>.
                </Alert>
              ) : (
                <Alert severity="info">Nenhum período recuperável encontrado.</Alert>
              )}

              {inversos.length > 0 && (
                <Alert severity="warning">
                  {inversos.length} período(s) no sentido inverso: o cadastro indicava Anexo III sem
                  o Fator R atingir 28%. Isso é exposição fiscal, não crédito — não entra no total
                  recuperável.
                </Alert>
              )}

              {inconclusivos.length > 0 && (
                <Alert severity="info">
                  {inconclusivos.length} período(s) inconclusivo(s) por janela incompleta. Complete
                  as competências de folha antes de tratar como achado.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </Card>

      {achados.length > 0 && (
        <Card>
          <CardHeader title="Períodos recuperáveis" />
          <Scrollbar>
            <TableContainer sx={{ overflow: 'auto' }}>
              <Table size="small" sx={{ minWidth: 760 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />
                <TableBody>
                  {achados.map((item) => (
                    <TableRow key={`${item.ano}-${item.mes}`} hover>
                      <TableCell>{competenciaLabel(item.ano, item.mes)}</TableCell>
                      <TableCell>{fatorRPercent(item.fatorR)}</TableCell>
                      <TableCell>
                        <Label variant="soft" color="success">
                          {anexoLabel(item.anexoApurado)}
                        </Label>
                      </TableCell>
                      <TableCell>{item.anexoCadastro?.join(', ') || '—'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">
                            {fCurrency(item.diferencaEstimada)}
                          </Typography>
                          {item.ressalvaHibrido && (
                            <Tooltip title="Cliente híbrido: só parte da receita cai nos anexos III/V, então a estimativa está superestimada">
                              <Iconify
                                icon="solar:info-circle-bold"
                                sx={{ color: 'warning.main' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              A diferença é anualizada, calculada sobre o RBT12 do período pela distância entre as
              alíquotas efetivas dos dois anexos. Confirme período a período antes de levar ao
              cliente.
            </Typography>
          </Box>
        </Card>
      )}
    </Stack>
  );
}
