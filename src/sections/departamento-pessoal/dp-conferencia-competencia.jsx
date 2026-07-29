'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { CODIGOS_RUBRICA_SUGERIDOS } from 'src/types/departamento-pessoal';

// ----------------------------------------------------------------------

const LABEL_POR_CODIGO = Object.fromEntries(
  CODIGOS_RUBRICA_SUGERIDOS.map((c) => [c.value, c.label])
);

function rubricaLabel(codigo) {
  return LABEL_POR_CODIGO[codigo] || codigo || '—';
}

/** Horas decimais → "1h30" (mesma leitura do formulário de lançamento). */
function horasLabel(horas) {
  const totalMin = Math.round(horas * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** Uma linha por rubrica: o que foi lançado, na unidade em que foi lançado. */
function detalheItem(item) {
  const partes = [];
  if (item.codigo === 'FALTA') {
    const dias = item.dias?.length ?? item.quantidade ?? 0;
    partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
    if (item.dias?.length) {
      partes.push(item.dias.map((d) => String(d).slice(8, 10)).join(', '));
    }
  } else {
    if (typeof item.horas === 'number') partes.push(horasLabel(item.horas));
    else if (typeof item.quantidade === 'number') partes.push(String(item.quantidade));
    if (typeof item.valor === 'number') partes.push(fCurrency(item.valor));
  }
  if (item.descricao) partes.push(item.descricao);
  return partes.filter(Boolean).join(' · ');
}

function TotaisChips({ totais }) {
  if (!totais) return null;
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip
        size="small"
        variant="soft"
        color="primary"
        label={`${totais.colaboradoresComLancamento} com lançamento`}
      />
      <Chip
        size="small"
        variant="soft"
        color={totais.colaboradoresSemLancamento > 0 ? 'warning' : 'default'}
        label={`${totais.colaboradoresSemLancamento} sem lançamento`}
      />
      {totais.diasFalta > 0 && (
        <Chip size="small" variant="outlined" label={`${totais.diasFalta} dia(s) de falta`} />
      )}
      {totais.horas > 0 && (
        <Chip size="small" variant="outlined" label={`${horasLabel(totais.horas)} em horas`} />
      )}
      {totais.valor > 0 && (
        <Chip size="small" variant="outlined" label={`${fCurrency(totais.valor)} em valores`} />
      )}
    </Stack>
  );
}

/**
 * Conferência de uma competência: todos os colaboradores e o que foi lançado
 * para cada um. Serve tanto ao cliente (antes de validar o mês) quanto à equipe
 * (antes de exportar o TXT) — por isso o texto de apoio é parametrizado.
 *
 * @param {object} props
 * @param {object} [props.data] — resposta do endpoint de conferência; `null` = rota indisponível
 * @param {boolean} [props.isLoading]
 * @param {string} [props.descricao]
 * @param {(funcionarioId: string) => void} [props.onAbrirColaborador]
 * @param {boolean} [props.embedded] — sem Card externo, para uso dentro de diálogo
 */
export function DpConferenciaCompetencia({
  data,
  isLoading = false,
  descricao,
  onAbrirColaborador,
  embedded = false,
}) {
  const colaboradores = data?.colaboradores || [];

  const corpo = (
    <>
      {descricao && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {descricao}
        </Typography>
      )}

      {isLoading && <Skeleton variant="rounded" height={180} />}

      {!isLoading && data === null && (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          A conferência da competência ainda não está disponível neste ambiente.
        </Alert>
      )}

      {!isLoading && data && (
        <>
          <Box sx={{ mb: 1.5 }}>
            <TotaisChips totais={data.totais} />
          </Box>

          {colaboradores.length === 0 ? (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              Nenhum colaborador ativo nesta competência.
            </Alert>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Colaborador</TableCell>
                    <TableCell>Apontamentos</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      Totais
                    </TableCell>
                    {onAbrirColaborador && <TableCell align="right" />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colaboradores.map((c) => {
                    const semLancamento = c.totalItens === 0;
                    return (
                      <TableRow key={c.funcionarioId} hover>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="subtitle2">{c.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[c.codigoFolha != null ? `Cód. ${c.codigoFolha}` : null, c.cargo]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </Typography>
                          {c.statusVinculo !== 'ativo' && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip size="small" label="Inativo" variant="soft" />
                            </Box>
                          )}
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'top' }}>
                          {semLancamento ? (
                            <Typography variant="body2" color="warning.main">
                              Nenhum apontamento lançado
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {c.itens.map((item, idx) => (
                                <Typography key={idx} variant="body2">
                                  <strong>{rubricaLabel(item.codigo)}</strong>
                                  {detalheItem(item) ? ` — ${detalheItem(item)}` : ''}
                                  {item.observacao ? (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {' '}
                                      ({item.observacao})
                                    </Typography>
                                  ) : null}
                                </Typography>
                              ))}
                              {c.observacoesGerais && (
                                <Typography variant="caption" color="text.secondary">
                                  Recado: {c.observacoesGerais}
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </TableCell>

                        <TableCell align="right" sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <Stack spacing={0.25} alignItems="flex-end">
                            {c.totalDiasFalta > 0 && (
                              <Typography variant="caption">{c.totalDiasFalta} dia(s)</Typography>
                            )}
                            {c.totalHoras > 0 && (
                              <Typography variant="caption">{horasLabel(c.totalHoras)}</Typography>
                            )}
                            {c.totalValor > 0 && (
                              <Typography variant="caption">{fCurrency(c.totalValor)}</Typography>
                            )}
                            {semLancamento && (
                              <Typography variant="caption" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {onAbrirColaborador && (
                          <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                            <Button size="small" onClick={() => onAbrirColaborador(c.funcionarioId)}>
                              Abrir
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </>
  );

  if (embedded) return corpo;

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, sm: 2.5 }, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
        Conferência da competência
      </Typography>
      {corpo}
    </Card>
  );
}
