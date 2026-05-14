'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

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
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Gerenciamento de Usuários Internos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie os usuários internos com acesso ao portal administrativo do sistema
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:person-add-fill" />}
              onClick={handleCreateUsuario}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
              }}
            >
              Novo Usuário Interno
            </Button>
          </Stack>
        </Stack>

        {/* Estatísticas */}
        <UsuariosInternosStats usuarios={filteredUsuarios} />

        {/* Campo de Pesquisa */}
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
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
            {searchTerm && (
              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
                startIcon={<Iconify icon="eva:close-fill" />}
                sx={{ borderRadius: 2, px: 2 }}
              >
                Limpar
              </Button>
            )}
          </Stack>

          {searchTerm && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:info-fill" width={16} color="primary.main" />
              <Typography variant="body2" color="text.secondary">
                {filteredUsuarios.length === 0
                  ? 'Nenhum usuário encontrado'
                  : `${filteredUsuarios.length} usuário${filteredUsuarios.length !== 1 ? 's' : ''} encontrado${filteredUsuarios.length !== 1 ? 's' : ''}`}
                {searchTerm && ` para "${searchTerm}"`}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Tabela de Usuários */}
        <UsuariosInternosTable
          usuarios={filteredUsuarios}
          loading={loading}
          onEdit={handleEditUsuario}
          onDelete={handleDeleteUsuario}
        />

        {/* Modal de Usuário */}
        <UsuarioInternoModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          usuario={usuarioEditando}
        />
      </Stack>
    </SimplePaper>
  );
}
