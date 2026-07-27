'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { formatCNPJ } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetVinculos, solicitarRenuncia, sincronizarVinculos } from 'src/actions/procuracoes';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

/** Renúncia é irreversível pela API — mesmo conjunto que o backend exige. */
const ROLES_RENUNCIA = ['admin', 'gerencial'];

const apiErrMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const TABLE_HEAD = [
  { id: 'cnpj', label: 'Empresa' },
  { id: 'carteira', label: 'Na carteira', width: 170 },
  { id: 'procuracao', label: 'Procuração', width: 180 },
  { id: 'acoes', label: '', width: 140 },
];

export function VinculosListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const podeRenunciar = ROLES_RENUNCIA.includes(user?.role);

  const { vinculos, total, sincronizadoEm, vinculosLoading, refetchVinculos } = useGetVinculos();
  const [renunciando, setRenunciando] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const foraDaCarteira = vinculos.filter((v) => v.foraDaCarteira).length;

  const handleSincronizar = useCallback(async () => {
    setSincronizando(true);
    try {
      const res = await sincronizarVinculos();
      const partes = [`${res.encontrados} vínculo(s) ativo(s)`];
      if (res.novos) partes.push(`${res.novos} novo(s)`);
      if (res.desaparecidos) partes.push(`${res.desaparecidos} encerrado(s)`);
      toast.success(partes.join(' · '));
      refetchVinculos();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao sincronizar com a Serpro'));
    } finally {
      setSincronizando(false);
    }
  }, [refetchVinculos]);

  const handleRenunciar = useCallback(
    async (cnpj, cpfContador) => {
      try {
        // O mesmo CPF serve de preenchedor quando o perfil do usuário não tem
        // um cadastrado; o backend dá preferência ao do perfil.
        const res = await solicitarRenuncia({
          cnpj,
          cpfContador,
          cpfPreenchedor: cpfContador,
        });
        const protocolo = res?.solicitacao?.idSolicitacao;
        toast.success(
          protocolo
            ? `Renúncia solicitada. Protocolo ${protocolo} — o desfecho sai em alguns instantes.`
            : 'Renúncia solicitada.'
        );
        setRenunciando(null);
        refetchVinculos();
      } catch (error) {
        toast.error(apiErrMsg(error, 'Falha ao solicitar renúncia'));
      }
    },
    [refetchVinculos]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vínculos e procurações"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Vínculos' },
        ]}
        action={
          <LoadingButton
            variant="contained"
            loading={sincronizando}
            startIcon={<Iconify icon="eva:cloud-download-fill" />}
            onClick={handleSincronizar}
          >
            Consultar todas na Receita
          </LoadingButton>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>O que esta lista mostra</AlertTitle>
        As empresas em que o escritório consta como contabilista <strong>na Receita</strong>, que
        não é a mesma coisa que a carteira do sistema. Empresa que aparece aqui e não está na
        carteira costuma ser vínculo esquecido — candidata a renúncia.
        <Box component="span" sx={{ display: 'block', mt: 1 }}>
          A tela lê de um cache local. Só o botão acima vai à Receita.
        </Box>
      </Alert>

      {!vinculosLoading && !sincronizadoEm && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Nenhuma sincronização feita ainda. Use “Consultar todas na Receita” para preencher a
          lista.
        </Alert>
      )}

      {!vinculosLoading && foraDaCarteira > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {foraDaCarteira} empresa(s) com vínculo ativo na Receita não estão cadastradas no sistema.
        </Alert>
      )}

      <Card>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={1}
          sx={{ p: 2.5 }}
        >
          <Typography variant="subtitle2">{total} empresa(s) com vínculo ativo</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {sincronizadoEm
              ? `Última consulta à Receita em ${fDateTime(sincronizadoEm)}`
              : 'Nunca consultado'}
          </Typography>
        </Stack>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'auto' }}>
            <Table size="medium" sx={{ minWidth: 820 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {vinculosLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {TABLE_HEAD.map((col) => (
                          <TableCell key={col.id}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : vinculos.map((v) => (
                      <TableRow key={v.cnpj} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2">
                              {v.nomeCliente || 'Empresa não cadastrada'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatCNPJ(v.cnpj) || v.cnpj}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {v.foraDaCarteira ? (
                            <Tooltip title="Vínculo ativo na Receita sem cliente correspondente no sistema">
                              <Label variant="soft" color="warning">
                                Fora da carteira
                              </Label>
                            </Tooltip>
                          ) : (
                            <Label variant="soft" color="success">
                              Cadastrada
                            </Label>
                          )}
                        </TableCell>

                        <TableCell>
                          {v.foraDaCarteira ? (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                              —
                            </Typography>
                          ) : (
                            <Label
                              variant="soft"
                              color={v.procuracaoVigente ? 'success' : 'default'}
                            >
                              {v.procuracaoVigente === undefined
                                ? 'Não consultada'
                                : v.procuracaoVigente
                                  ? 'Vigente'
                                  : 'Sem vigência'}
                            </Label>
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {v.clienteId && (
                              <Button
                                size="small"
                                onClick={() =>
                                  router.push(paths.dashboard.fiscal.fatorR.details(v.clienteId))
                                }
                              >
                                Abrir
                              </Button>
                            )}
                            {podeRenunciar && (
                              <Button
                                size="small"
                                color="error"
                                onClick={() => setRenunciando(v)}
                              >
                                Renunciar
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {renunciando && (
        <RenunciaDialog
          vinculo={renunciando}
          onClose={() => setRenunciando(null)}
          onConfirm={handleRenunciar}
        />
      )}
    </DashboardContent>
  );
}

function RenunciaDialog({ vinculo, onClose, onConfirm }) {
  const [cpfContador, setCpfContador] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const handle = async () => {
    setConfirmando(true);
    await onConfirm(vinculo.cnpj, cpfContador);
    setConfirmando(false);
  };

  return (
    <Dialog open fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>Renunciar ao vínculo?</DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Ação irreversível</AlertTitle>
          A API da Receita não oferece serviço para desfazer uma renúncia. Refazer o vínculo é
          processo manual.
        </Alert>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Empresa: <strong>{vinculo.nomeCliente || vinculo.cnpj}</strong>
        </Typography>

        <TextField
          fullWidth
          label="CPF do contador responsável"
          value={cpfContador}
          onChange={(e) => setCpfContador(e.target.value)}
          helperText="A Serpro exige o CPF de quem solicita. Se o seu perfil já tiver CPF cadastrado, ele é usado e este campo é ignorado."
        />
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" color="error" loading={confirmando} onClick={handle}>
          Renunciar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
