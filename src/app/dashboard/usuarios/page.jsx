'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { getUsersCliente, criarUserCliente, editarUserCliente, deletarUserCliente } from 'src/actions/users';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { UsuarioModal } from 'src/sections/usuarios/usuario-modal';
import { UsuariosTable } from 'src/sections/usuarios/usuarios-table';
import { UsuariosStats } from 'src/sections/usuarios/usuarios-stats';



// ----------------------------------------------------------------------

export default function DashboardUsuariosView() {

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
      const response = await getUsersCliente();

      console.log("response", response.data.data);
      if (response.data.success) {
        setUsuarios(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
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
      const response = await deletarUserCliente({ id: usuarioId });
      
      if (response.data.success) {
        toast.success('Usuário excluído com sucesso!');
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setUsuarioEditando(null);
  };

  const handleModalSave = async (usuarioData) => {
    try {
      if (usuarioEditando) {
        // Editar usuário existente
           const response = await editarUserCliente(usuarioData);

        
        if (response.data.success) {
          toast.success('Usuário atualizado com sucesso!');
        }
      } else {
        // Criar novo usuário cliente
        const response = await criarUserCliente(usuarioData);
        
        if (response.data.success) {
          toast.success('Usuário cliente criado com sucesso!');
        }
      }
      
      handleModalClose();
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message);
    }
  };

  // Função para filtrar usuários por nome e empresa
  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Busca por nome
    const nameMatch = usuario.name?.toLowerCase().includes(searchLower);
    
    // Busca por empresa
    const empresaMatch = usuario.empresasId?.some((empresa) => {
      const empresaNome = typeof empresa === 'string' ? empresa : empresa.nome;
      return empresaNome?.toLowerCase().includes(searchLower);
    });
    
    return nameMatch || empresaMatch;
  });

  return (
    <SimplePaper>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Gerenciamento de Usuários Clientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie os usuários que têm acesso ao portal do cliente
            </Typography>
          </Stack>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:person-add-fill" />}
            onClick={handleCreateUsuario}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            Novo Usuário Cliente
          </Button>
        </Stack>

        {/* Estatísticas */}
        <UsuariosStats usuarios={filteredUsuarios} />

        {/* Campo de Pesquisa */}
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Pesquisar por nome ou empresa..."
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
          
          {/* Indicador de resultados */}
          {searchTerm && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:info-fill" width={16} color="primary.main" />
              <Typography variant="body2" color="text.secondary">
                {filteredUsuarios.length === 0 
                  ? 'Nenhum usuário encontrado' 
                  : `${filteredUsuarios.length} usuário${filteredUsuarios.length !== 1 ? 's' : ''} encontrado${filteredUsuarios.length !== 1 ? 's' : ''}`
                }
                {searchTerm && ` para "${searchTerm}"`}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Tabela de Usuários */}
        <UsuariosTable
          usuarios={filteredUsuarios}
          loading={loading}
          onEdit={handleEditUsuario}
          onDelete={handleDeleteUsuario}
        />

        {/* Modal de Usuário */}
        <UsuarioModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          usuario={usuarioEditando}
        />
      </Stack>
    </SimplePaper>
  );
}
