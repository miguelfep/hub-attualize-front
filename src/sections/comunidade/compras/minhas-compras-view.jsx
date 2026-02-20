'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMinhasCompras } from 'src/actions/comunidade';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_LABEL = {
  pendente: { label: 'Pendente', color: 'warning' },
  aprovado: { label: 'Aprovado', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
  reembolsado: { label: 'Reembolsado', color: 'default' },
};

// ----------------------------------------------------------------------

export function MinhasComprasView() {
  const { comprasMateriais, comprasCursos, isLoading } = useMinhasCompras();

  const hasCompras = (comprasMateriais?.length ?? 0) > 0 || (comprasCursos?.length ?? 0) > 0;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Minhas compras"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Comunidade', href: paths.cliente.comunidade.root },
          { name: 'Minhas compras' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography>Carregando...</Typography>
        </Box>
      ) : !hasCompras ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon="solar:cart-large-2-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Nenhuma compra encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Materiais e cursos que você comprar aparecerão aqui. Acesse a biblioteca para ver o que está disponível.
          </Typography>
          <Button
            component={RouterLink}
            href={paths.cliente.comunidade.materiais.root}
            variant="contained"
            startIcon={<Iconify icon="solar:book-bookmark-bold-duotone" />}
          >
            Ver materiais
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          {(comprasMateriais?.length ?? 0) > 0 && (
            <Card>
              <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                Compras de materiais
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprasMateriais.map((compra) => {
                      const material = compra.material ?? compra;
                      const materialId = material._id ?? compra.material;
                      const titulo = material.titulo ?? compra.titulo ?? '—';
                      const statusInfo = STATUS_LABEL[compra.status] || {
                        label: compra.status || '—',
                        color: 'default',
                      };
                      return (
                        <TableRow key={compra._id}>
                          <TableCell>{titulo}</TableCell>
                          <TableCell>
                            {compra.valorPago != null
                              ? `R$ ${Number(compra.valorPago).toFixed(2).replace('.', ',')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Label variant="soft" color={statusInfo.color}>
                              {statusInfo.label}
                            </Label>
                          </TableCell>
                          <TableCell align="right">
                            {compra.status === 'aprovado' && materialId && (
                              <Button
                                size="small"
                                component={RouterLink}
                                href={paths.cliente.comunidade.materiais.details(materialId)}
                                startIcon={<Iconify icon="eva:eye-fill" />}
                              >
                                Acessar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {(comprasCursos?.length ?? 0) > 0 && (
            <Card>
              <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                Compras de cursos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprasCursos.map((compra) => {
                      const curso = compra.curso ?? compra;
                      const cursoId = curso._id ?? compra.curso;
                      const titulo = curso.titulo ?? compra.titulo ?? '—';
                      const statusInfo = STATUS_LABEL[compra.status] || {
                        label: compra.status || '—',
                        color: 'default',
                      };
                      return (
                        <TableRow key={compra._id}>
                          <TableCell>{titulo}</TableCell>
                          <TableCell>
                            {compra.valorPago != null
                              ? `R$ ${Number(compra.valorPago).toFixed(2).replace('.', ',')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Label variant="soft" color={statusInfo.color}>
                              {statusInfo.label}
                            </Label>
                          </TableCell>
                          <TableCell align="right">
                            {compra.status === 'aprovado' && cursoId && (
                              <Button
                                size="small"
                                component={RouterLink}
                                href={paths.cliente.comunidade.cursos.details(cursoId)}
                                startIcon={<Iconify icon="eva:eye-fill" />}
                              >
                                Acessar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Stack>
      )}
    </DashboardContent>
  );
}
