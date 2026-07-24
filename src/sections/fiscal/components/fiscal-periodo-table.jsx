'use client';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import { getOperacaoIcon, getDasPagoChipProps } from '../utils/serpro-declaracoes';

// ----------------------------------------------------------------------

// 'AAAAMM' -> 'MM/AAAA' (rótulo do período de apuração, como na página oficial)
function formatPaLabel(periodoApuracao) {
  const digits = String(periodoApuracao || '').replace(/\D/g, '');
  if (digits.length !== 6) return periodoApuracao || '';
  return `${digits.slice(4, 6)}/${digits.slice(0, 4)}`;
}

function PagoCell({ dasPago }) {
  const chip = getDasPagoChipProps(dasPago);
  if (dasPago === true) {
    return <Chip size="small" variant="soft" color="success" label="Sim" />;
  }
  if (dasPago === false) {
    return <Chip size="small" variant="soft" color="warning" label="Em aberto" />;
  }
  // dasPago === null (operação sem DAS)
  return (
    <Typography component="span" variant="body2" color="text.disabled">
      {chip?.label ?? '-'}
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function FiscalPeriodoTable({ grupo, onEmitDas, onExtrato }) {
  const theme = useTheme();

  const paLabel = formatPaLabel(grupo.periodoApuracao);

  return (
    <Box sx={{ borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      {/* Cabeçalho do período (faixa verde, estilo página oficial) */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
          PA {paLabel}
          {grupo.competenciaLabel && grupo.competenciaLabel !== grupo.periodoApuracao ? (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {grupo.competenciaLabel}
            </Typography>
          ) : null}
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'background.neutral', fontWeight: 600, whiteSpace: 'nowrap' } }}>
              <TableCell>Operação</TableCell>
              <TableCell>Nº Declaração</TableCell>
              <TableCell>Data/hora Transmissão</TableCell>
              <TableCell>Nº DAS</TableCell>
              <TableCell>Data/hora Emissão</TableCell>
              <TableCell align="center">Extrato</TableCell>
              <TableCell align="center">Pago</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {grupo.items.map((row, rowIndex) => {
              const emitLabel = row.numeroDas || row.dasPago === false ? 'Reemitir DAS' : 'Emitir DAS';
              // O extrato é do DAS, mas o ícone fica na linha da declaração (Original/Retificadora).
              // Associa a declaração ao Nº DAS da geração de DAS que vem logo depois dela no período
              // (fallback: qualquer DAS do período).
              const isDeclaracao = !row.isDas && Boolean(row.numeroDeclaracao);
              const numeroDasExtrato = isDeclaracao
                ? grupo.items.slice(rowIndex + 1).find((r) => r.numeroDas)?.numeroDas ||
                  grupo.items.find((r) => r.numeroDas)?.numeroDas ||
                  null
                : null;
              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify
                        icon={getOperacaoIcon(row.tipoOperacao, row.isDas)}
                        width={20}
                        sx={{ color: row.isDas ? 'warning.dark' : 'primary.main', flexShrink: 0 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.tipoOperacao}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.numeroDeclaracao || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataHoraTransmissao || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.numeroDas || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataHoraEmissaoDas || '-'}</TableCell>

                  <TableCell align="center">
                    {numeroDasExtrato && onExtrato ? (
                      <Tooltip title="Extrato do DAS">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onExtrato({ ...row, numeroDas: numeroDasExtrato })}
                        >
                          <Iconify icon="solar:file-download-bold-duotone" width={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography component="span" variant="body2" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <PagoCell dasPago={row.dasPago} />
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {row.canEmitDas ? (
                      <Stack spacing={0.25} alignItems="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          color={row.numeroDas ? 'warning' : 'primary'}
                          startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
                          onClick={() => onEmitDas?.({ mes: row.mes, ano: row.ano })}
                          sx={{ borderRadius: 1.5, whiteSpace: 'nowrap' }}
                        >
                          {emitLabel}
                        </Button>
                        {row.ultimaEmissao ? (
                          <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                            {`Emitido por ${row.ultimaEmissao.usuarioNome || row.ultimaEmissao.usuarioEmail}`}
                            {' · '}
                            {dayjs(row.ultimaEmissao.emissaoEm).format('DD/MM/YYYY HH:mm')}
                          </Typography>
                        ) : null}
                      </Stack>
                    ) : (
                      <Typography component="span" variant="body2" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
