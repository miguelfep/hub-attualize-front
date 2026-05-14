'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import {
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import {
  getUsersInternos,
  criarUserInterno,
  editarUserInterno,
  deletarUserInterno,
} from 'src/actions/users';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { UsuarioInternoModal } from 'src/sections/usuarios/internos/usuario-interno-modal';
import { UsuariosInternosStats } from 'src/sections/usuarios/internos/usuarios-internos-stats';
import { UsuariosInternosTable } from 'src/sections/usuarios/internos/usuarios-internos-table';

// ----------------------------------------------------------------------

export default function DashboardUsuariosInternosView() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsersInternos();

      if (response?.data?.success) {
        setUsuarios(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários internos:', error);
      const message =
        error?.response?.data?.message || 'Erro ao carregar usuários internos';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = () => {
    setUsuarioEditando(null);
    setModalOpen(true);
  };

  const handleEditUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setModalOpen(true);
  };

  const handleDeleteUsuario = async (usuarioId) => {
    try {
      const response = await deletarUserInterno({ id: usuarioId });

      if (response?.data?.success) {
        toast.success('Usuário interno excluído com sucesso!');
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário interno:', error);
      const message =
        error?.response?.data?.message || 'Erro ao excluir usuário interno';
      toast.error(message);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setUsuarioEditando(null);
  };

  const handleModalSave = async (usuarioData) => {
    try {
      if (usuarioEditando) {
        const response = await editarUserInterno(usuarioData);

        if (response?.data?.success) {
          toast.success('Usuário interno atualizado com sucesso!');
        }
      } else {
        const response = await criarUserInterno(usuarioData);

        if (response?.data?.success) {
          toast.success('Usuário interno criado com sucesso!');
        }
      }

      handleModalClose();
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário interno:', error);
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao salvar usuário interno';
      toast.error(message);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    const nameMatch = usuario.name?.toLowerCase().includes(searchLower);
    const emailMatch = usuario.email?.toLowerCase().includes(searchLower);
    const roleMatch =
      Array.isArray(usuario.role) &&
      usuario.role.some((r) => r?.toLowerCase().includes(searchLower));
    const empresaMatch = usuario.empresasId?.some((empresa) => {
      const empresaNome =
        typeof empresa === 'string' ? empresa : empresa.razaoSocial || empresa.nome;
      return empresaNome?.toLowerCase().includes(searchLower);
    });

    return nameMatch || emailMatch || roleMatch || empresaMatch;
  });

  return (
    <SimplePaper>
      <Grid container spacing={2} sx={{ mb: 3, '& > *': { p: 2 } }}>
        {/* Cabeçalho */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            spacing={2}
          >
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Gerenciamento de Usuários Internos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os usuários internos com acesso ao portal administrativo do sistema
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:person-add-fill" />}
              onClick={handleCreateUsuario}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'center' },
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              Novo Usuário Interno
            </Button>
          </Stack>
        </Grid>

        {/* Estatísticas */}
        <Grid item xs={12}>
          <UsuariosInternosStats usuarios={filteredUsuarios} />
        </Grid>

        {/* Pesquisa */}
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={searchTerm ? 9 : 12} md={searchTerm ? 10 : 12}>
              <TextField
                fullWidth
                placeholder="Pesquisar por nome, email, perfil ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            {searchTerm ? (
              <Grid item xs={12} sm={3} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  startIcon={<Iconify icon="eva:close-fill" />}
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Limpar
                </Button>
              </Grid>
            ) : null}
          </Grid>

          {searchTerm ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <Iconify icon="eva:info-fill" width={16} color="primary.main" />
              <Typography variant="body2" color="text.secondary">
                {filteredUsuarios.length === 0
                  ? 'Nenhum usuário encontrado'
                  : `${filteredUsuarios.length} usuário${filteredUsuarios.length !== 1 ? 's' : ''} encontrado${filteredUsuarios.length !== 1 ? 's' : ''}`}
                {` para "${searchTerm}"`}
              </Typography>
            </Stack>
          ) : null}
        </Grid>

        {/* Tabela */}
        <Grid item xs={12}>
          <UsuariosInternosTable
            usuarios={filteredUsuarios}
            loading={loading}
            onEdit={handleEditUsuario}
            onDelete={handleDeleteUsuario}
          />
        </Grid>
      </Grid>

      <UsuarioInternoModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        usuario={usuarioEditando}
      />
    </SimplePaper>
  );
}
