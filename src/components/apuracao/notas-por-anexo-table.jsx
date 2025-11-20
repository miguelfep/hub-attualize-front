'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Box,
  Grid,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NotasPorAnexoTable({ notasPorAnexo }) {
  if (!notasPorAnexo || notasPorAnexo.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma nota fiscal encontrada
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {notasPorAnexo.map((grupo, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
            <Stack direction="row" spacing={2} alignItems="center" flex={1}>
              <Chip label={`Anexo ${grupo.anexo}`} color="primary" />
              {grupo.usaFatorR && (
                <Chip label="Com Fator R" size="small" color="success" variant="outlined" />
              )}
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                <strong>{grupo.quantidadeNotas || 0}</strong> nota(s) - R${' '}
                <strong>
                  {grupo.totalNotas?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Resumo */}
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Alíquota Efetiva
                    </Typography>
                    <Typography variant="subtitle1">
                      {grupo.aliquotaEfetiva?.toFixed(2) || '-'}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Imposto Calculado
                    </Typography>
                    <Typography variant="subtitle1" color="error.main">
                      R${' '}
                      {grupo.impostoCalculado?.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Total de Notas
                    </Typography>
                    <Typography variant="subtitle1">
                      R${' '}
                      {grupo.totalNotas?.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Quantidade
                    </Typography>
                    <Typography variant="subtitle1">{grupo.quantidadeNotas || 0}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabela de Notas */}
              {grupo.notas && grupo.notas.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nº Nota</TableCell>
                        <TableCell>Data Emissão</TableCell>
                        <TableCell align="right">Valor Serviços</TableCell>
                        <TableCell>CNAE</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grupo.notas.map((nota, noteIndex) => (
                        <TableRow key={noteIndex}>
                          <TableCell>{nota.numeroNota || nota.numero_nota || '-'}</TableCell>
                          <TableCell>
                            {nota.dataEmissao || nota.data_emissao
                              ? new Date(nota.dataEmissao || nota.data_emissao).toLocaleDateString(
                                  'pt-BR'
                                )
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            R${' '}
                            {(nota.valorServicos || nota.valor_servicos || 0).toLocaleString(
                              'pt-BR',
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </TableCell>
                          <TableCell>{nota.cnae || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}

