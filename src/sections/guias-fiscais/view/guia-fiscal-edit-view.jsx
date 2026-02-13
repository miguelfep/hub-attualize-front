'use client';

import dayjs from 'dayjs';
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

import { getCompetencia } from '../utils';

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
  { value: 'IRPJ', label: 'IRPJ' },
  { value: 'CSLL', label: 'CSLL' },
];

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
];

const schema = zod.object({
  nomeArquivo: zod.string().min(1, 'Nome do arquivo é obrigatório'),
  tipoGuia: zod.string().min(1, 'Tipo de guia é obrigatório'),
  cnpj: zod.string().optional(),
  // RHFDatePicker retorna string formatada (dayjs format), então aceitamos string ou null
  dataVencimento: zod.string().nullable().optional(),
  competencia: zod.string().optional().refine(
    (val) => !val || /^\d{2}\/\d{4}$/.test(val),
    { message: 'Competência deve estar no formato MM/AAAA (ex: 01/2025)' }
  ),
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
      nomeArquivo: '',
      tipoGuia: '',
      cnpj: '',
      dataVencimento: null,
      competencia: '',
      status: 'pendente',
      observacoes: '',
    },
    values: guia
      ? {
          nomeArquivo: guia.nomeArquivo || '',
          tipoGuia: guia.tipoGuia || '',
          cnpj: guia.cnpj || '',
          // Data de vencimento: sempre tentar carregar, mesmo que seja null
          dataVencimento: guia.dataVencimento ? dayjs(guia.dataVencimento).format() : null,
          // Competência: usar helper para obter do lugar certo (campo direto ou dadosExtraidos)
          competencia: getCompetencia(guia) || '',
          status: guia.status || guia.statusProcessamento || 'pendente',
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
        // Converter dataVencimento de string (dayjs format) para Date se necessário
        let {dataVencimento} = data;
        if (dataVencimento) {
          if (typeof dataVencimento === 'string') {
            dataVencimento = new Date(dataVencimento);
          }
          dataVencimento = dataVencimento.toISOString();
        }

        // Tratar competência: enviar undefined se vazio, senão enviar o valor
        const competencia = data.competencia?.trim() || undefined;

        await updateGuiaFiscal(id, {
          ...data,
          dataVencimento: dataVencimento || undefined,
          competencia, // Enviar competência (undefined se vazio)
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
            <RHFTextField name="nomeArquivo" label="Nome do Documento" required />

            <RHFSelect name="tipoGuia" label="Tipo de Guia" required>
              {TIPO_GUIA_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="cnpj" label="CNPJ" />

            <RHFTextField
              name="competencia"
              label="Competência"
              placeholder="MM/AAAA (ex: 01/2025)"
              helperText="Formato: MM/AAAA (ex: 01/2025)"
              fullWidth
            />

            <RHFDatePicker 
              name="dataVencimento" 
              label="Data de Vencimento"
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Opcional - Apenas para guias com vencimento',
                },
              }}
            />

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
