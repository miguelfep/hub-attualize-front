import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { avatarUrl } from 'src/utils/avatar';

import { getUsersInternos } from 'src/actions/users';

// ----------------------------------------------------------------------
// Responsáveis por setor do bot: quando o agente transfere um atendimento ou
// cria uma tarefa para um setor, ela já chega atribuída ao usuário escolhido
// aqui (tarefa + conversa). Sem responsável, cai na fila geral do setor.
// ----------------------------------------------------------------------

const SETORES_PADRAO = ['fiscal', 'financeiro', 'departamento_pessoal', 'societario', 'comercial', 'geral'];

const LABEL_SETOR = {
  fiscal: 'Fiscal',
  financeiro: 'Financeiro',
  departamento_pessoal: 'Departamento Pessoal',
  societario: 'Societário',
  comercial: 'Comercial',
  geral: 'Geral',
};

const idOf = (v) => (v && typeof v === 'object' ? v._id || v.id : v);

export function WaBotResponsaveis({ value, onChange, setores }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    getUsersInternos()
      .then((res) => {
        // getUsersInternos devolve a RESPOSTA do axios: corpo em res.data, lista em res.data.data.
        const body = res?.data ?? res;
        const arr = Array.isArray(body) ? body : body?.data ?? body?.usuarios ?? [];
        setUsuarios(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setUsuarios([]));
  }, []);

  const lista = setores?.length ? setores : SETORES_PADRAO;
  const usuarioPorId = (id) => usuarios.find((u) => String(idOf(u)) === String(id)) || null;

  const handleSetor = (setor, usuario) => {
    const novo = { ...value };
    if (usuario) novo[setor] = String(idOf(usuario));
    else delete novo[setor];
    onChange(novo);
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2">Responsáveis por setor</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Quando o bot transferir um atendimento (ou criar uma tarefa) para um setor, a conversa e a
          tarefa já chegam atribuídas ao responsável escolhido — com notificação. Sem responsável, o
          atendimento cai na fila geral do setor.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        }}
      >
        {lista.map((setor) => (
          <Autocomplete
            key={setor}
            options={usuarios}
            value={usuarioPorId(value?.[setor])}
            onChange={(_, v) => handleSetor(setor, v)}
            getOptionLabel={(o) => o?.name || o?.email || ''}
            isOptionEqualToValue={(o, v) => idOf(o) === idOf(v)}
            renderOption={(props, o) => {
              const { key, ...optionProps } = props;
              return (
                <Stack
                  component="li"
                  key={key ?? o._id}
                  {...optionProps}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Avatar src={avatarUrl(o) || undefined} sx={{ width: 26, height: 26, fontSize: 13 }}>
                    {(o?.name || '?')[0]?.toUpperCase()}
                  </Avatar>
                  {o?.name || o?.email}
                </Stack>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label={LABEL_SETOR[setor] || setor} placeholder="Fila geral" />
            )}
          />
        ))}
      </Box>
    </Stack>
  );
}
