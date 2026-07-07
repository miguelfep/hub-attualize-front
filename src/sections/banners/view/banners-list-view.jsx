'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { createBanner, updateBanner, useGetBanners } from 'src/actions/banners';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { BannerPreview } from '../components/banner-preview';
import { BannerFormDialog } from '../components/banner-form-dialog';
import { BannerActionsMenu } from '../components/banner-actions-menu';

// ----------------------------------------------------------------------

const PREVIEW_COL_WIDTH = 560;

const TABLE_HEAD = [
  { id: 'titulo', label: 'Título', width: 180 },
  { id: 'preview', label: 'Preview', width: PREVIEW_COL_WIDTH, minWidth: PREVIEW_COL_WIDTH },
  { id: 'dataInicio', label: 'Agendamento', width: 180 },
  { id: 'clientesAlvo', label: 'Direção', width: 140 },
  { id: 'ordem', label: 'Ordem', width: 80, align: 'center' },
  { id: 'ativo', label: 'Situação', width: 100, align: 'center' },
  { id: '', width: 60 },
];

// ----------------------------------------------------------------------

export function BannersListView() {
  const table = useTable({ defaultOrderBy: 'ordem', defaultRowsPerPage: 10 });

  const { banners, isLoading, mutate } = useGetBanners();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const dataInPage = rowInPage(banners, table.page, table.rowsPerPage);
  const denseHeight = table.dense ? 56 : 76;

  const abrirNovo = useCallback(() => {
    setEditingBanner(null);
    setDialogOpen(true);
  }, []);

  const abrirEditar = useCallback((banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        if (editingBanner) {
          await updateBanner(editingBanner._id, payload);
          toast.success('Banner atualizado.');
        } else {
          await createBanner(payload);
          toast.success('Banner criado.');
        }
        setDialogOpen(false);
        mutate();
      } catch (e) {
        toast.error(e?.message || 'Erro ao salvar o banner.');
      } finally {
        setSaving(false);
      }
    },
    [editingBanner, mutate]
  );

  const renderAgendamento = (banner) => {
    const inicio = banner.dataInicio ? dayjs(banner.dataInicio).format('DD/MM/YYYY') : '—';
    const fim = banner.dataFim ? dayjs(banner.dataFim).format('DD/MM/YYYY') : 'Sem fim';

    return (
      <Stack spacing={0.25}>
        <Stack direction="row" spacing={0.75} alignItems="baseline">
          <Typography variant="caption" color="text.disabled" sx={{ minWidth: 36 }}>
            Desde
          </Typography>
          <Typography variant="body2">{inicio}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="baseline">
          <Typography variant="caption" color="text.disabled" sx={{ minWidth: 36 }}>
            Até
          </Typography>
          <Typography variant="body2" color={banner.dataFim ? 'text.primary' : 'text.secondary'}>
            {fim}
          </Typography>
        </Stack>
      </Stack>
    );
  };

  const renderDirecao = (banner) => {
    const regimes = banner.filtroRegime || [];
    const clientes = banner.clientesAlvo || [];
    const parts = [];

    if (regimes.length) {
      const labels = { simples: 'Simples', simei: 'SIMEI', presumido: 'Presumido', real: 'Real', pf: 'PF' };
      parts.push(regimes.map((r) => labels[r] || r).join(', '));
    }
    if (clientes.length) {
      parts.push(`${clientes.length} cliente${clientes.length > 1 ? 's' : ''}`);
    }
    return parts.length ? parts.join(' + ') : 'Todos';
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Banners"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Configurações' },
          { name: 'Banners' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={abrirNovo}
          >
            Novo Banner
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Card>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1300 }}>
            <TableHeadCustom
              order={table.order}
              onSort={table.onSort}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={banners.length}
            />

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length}>
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Typography color="text.secondary">Carregando banners...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {dataInPage
                    .sort(getComparator(table.order, table.orderBy))
                    .map((banner) => (
                      <TableRow key={banner._id} hover sx={{ height: denseHeight }}>
                        <TableCell sx={{ maxWidth: 180 }}>
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {banner.titulo}
                          </Typography>
                          {banner.descricao && (
                            <Tooltip title={banner.descricao} arrow>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{
                                  mt: 0.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  cursor: 'default',
                                }}
                              >
                                {banner.descricao}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            width: PREVIEW_COL_WIDTH,
                            minWidth: PREVIEW_COL_WIDTH,
                            maxWidth: PREVIEW_COL_WIDTH,
                            py: 1,
                          }}
                        >
                          <BannerPreview banner={banner} />
                        </TableCell>

                        <TableCell>{renderAgendamento(banner)}</TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {renderDirecao(banner)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2">{banner.ordem}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Label variant="soft" color={banner.ativo ? 'success' : 'default'}>
                            {banner.ativo ? 'Ativo' : 'Inativo'}
                          </Label>
                        </TableCell>

                        <TableCell align="right" sx={{ pr: 1 }}>
                          <BannerActionsMenu
                            banner={banner}
                            onEdit={() => abrirEditar(banner)}
                            onChanged={mutate}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, banners.length)}
                  />

                  <TableNoData notFound={banners.length === 0} />
                </>
              )}
            </TableBody>
          </Table>
        </Scrollbar>

        <TablePaginationCustom
          rowsPerPageOptions={[10, 50, 100, 150]}
          count={banners.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <BannerFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        loading={saving}
        banner={editingBanner}
        editing={!!editingBanner}
      />
    </DashboardContent>
  );
}
