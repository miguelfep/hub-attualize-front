'use client';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { updateGuiaFiscal, useGetGuiaFiscalById } from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, RHFSelect, RHFTextField, RHFDatePicker } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const TIPO_GUIA_OPTIONS = [
  { value: 'DAS', label: 'DAS' },
  { value: 'EXTRATO_PGDAS', label: 'Extrato PGDAS' },
  { value: 'INSS', label: 'INSS' },
  { value: 'HOLERITE', label: 'Holerite' },
  { value: 'DARF', label: 'DARF' },
  { value: 'ICMS', label: 'ICMS' },
  { value: 'ISS', label: 'ISS' },
  { value: 'FGTS', label: 'FGTS' },
  { value: 'PIS', label: 'PIS' },
  { value: 'COFINS', label: 'COFINS' },
];

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
];

const schema = zod.object({
  tipoGuia: zod.string().min(1, 'Tipo de guia é obrigatório'),
  cnpj: zod.string().optional(),
  dataVencimento: zod.date().nullable().optional(),
  status: zod.string().min(1, 'Status é obrigatório'),
  observacoes: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function GuiaFiscalEditView({ id }) {
  const router = useRouter();

  const { data: guia, isLoading } = useGetGuiaFiscalById(id);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoGuia: '',
      cnpj: '',
      dataVencimento: null,
      status: 'pendente',
      observacoes: '',
    },
    values: guia
      ? {
          tipoGuia: guia.tipoGuia || '',
          cnpj: guia.cnpj || '',
          dataVencimento: guia.dataVencimento ? new Date(guia.dataVencimento) : null,
          status: guia.status || 'pendente',
          observacoes: guia.observacoes || '',
        }
      : undefined,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data) => {
      try {
        await updateGuiaFiscal(id, {
          ...data,
          dataVencimento: data.dataVencimento ? data.dataVencimento.toISOString() : undefined,
        });

        toast.success('Guia atualizada com sucesso!');
        router.push(paths.dashboard.guiasFiscais.details(id));
      } catch (error) {
        console.error('Erro ao atualizar guia:', error);
        toast.error(error?.message || 'Erro ao atualizar guia');
      }
    },
    [id, router]
  );

  if (isLoading) {
    return (
      <DashboardContent>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Documento"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Guias e Documentos', href: paths.dashboard.guiasFiscais.list },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <RHFSelect name="tipoGuia" label="Tipo de Guia" required>
              {TIPO_GUIA_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="cnpj" label="CNPJ" />

            <RHFDatePicker name="dataVencimento" label="Data de Vencimento" />

            <RHFSelect name="status" label="Status" required>
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              name="observacoes"
              label="Observações"
              multiline
              rows={4}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                component={RouterLink}
                href={paths.dashboard.guiasFiscais.details(id)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Iconify icon="eva:checkmark-fill" />}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </DashboardContent>
  );
}
