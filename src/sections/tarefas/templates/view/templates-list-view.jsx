'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { getSetores } from 'src/actions/setores';
import { getTemplates } from 'src/actions/tarefas';
import { getUsersInternos } from 'src/actions/users';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TemplateFormDialog } from '../template-form-dialog';
import { GerarRecorrentesDialog } from '../gerar-recorrentes-dialog';
import { setorNome, prioridadeColor, prioridadeLabel } from '../../utils';

// ----------------------------------------------------------------------

function nomeResponsavel(template, usuarios) {
  const id = template.responsavelPadrao?._id ?? template.responsavelPadrao;
  if (template.responsavelPadrao?.name) return template.responsavelPadrao.name;
  const u = usuarios.find((x) => x._id === id);
  return u?.name || u?.email || '—';
}

function TemplateRow({ row, usuarios, setores, onEditar }) {
  const tags = [...(row.tipoEmpresa || []), ...(row.planoEmpresa || [])];
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{row.nome}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.titulo}
        </Typography>
      </TableCell>
      <TableCell>{nomeResponsavel(row, usuarios)}</TableCell>
      <TableCell align="center">{row.diaPrazo ?? '—'}</TableCell>
      <TableCell>
        <Label variant="soft" color={prioridadeColor(row.prioridade)}>
          {prioridadeLabel(row.prioridade)}
        </Label>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {tags.length ? (
            tags.map((t) => (
              <Label key={t} variant="outlined" color="default">
                {t}
              </Label>
            ))
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Todos
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        {row.setores?.length ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.setores.map((s) => (
              <Label key={s} variant="soft" color="info">
                {setorNome(s, setores)}
              </Label>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {row.flowId ? `${row.flowId} (#${row.stepOrder ?? '?'})` : '—'}
      </TableCell>
      <TableCell>
        <Label variant="soft" color={row.ativo ? 'success' : 'default'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </Label>
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => onEditar(row)}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

export function TemplatesListView() {
  const [lista, setLista] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [gerarOpen, setGerarOpen] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar templates.');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    getUsersInternos()
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setUsuarios(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsuarios([]));
    getSetores()
      .then((data) => setSetores(Array.isArray(data) ? data : []))
      .catch(() => setSetores([]));
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setFormOpen(true);
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Templates Recorrentes"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tarefas', href: paths.dashboard.tarefas.minhas },
          { name: 'Templates' },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={() => setGerarOpen(true)}
            >
              Gerar agora
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={abrirNovo}
            >
              Novo template
            </Button>
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Template / Título</TableCell>
                <TableCell>Responsável padrão</TableCell>
                <TableCell align="center">Dia prazo</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Segmentação</TableCell>
                <TableCell>Setores</TableCell>
                <TableCell>Fluxo</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Carregando...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : lista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Nenhum template cadastrado.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                lista.map((row) => (
                  <TemplateRow
                    key={row._id}
                    row={row}
                    usuarios={usuarios}
                    setores={setores}
                    onEditar={abrirEditar}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      <TemplateFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        template={editando}
        usuarios={usuarios}
        templates={lista}
        setores={setores}
        onSuccess={carregar}
      />

      <GerarRecorrentesDialog
        open={gerarOpen}
        onClose={() => setGerarOpen(false)}
        templates={lista.filter((t) => t.ativo)}
      />
    </DashboardContent>
  );
}
