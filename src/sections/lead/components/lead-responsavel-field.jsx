import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';

import { podePegarLead, podeReatribuir, temResponsavel } from '../lead-permissions';

// ----------------------------------------------------------------------

/**
 * Campo de responsável do lead, com regras de permissão:
 * - gestor (admin/gerencial/superadmin): Autocomplete para escolher/trocar qualquer responsável.
 * - comercial: botão "Pegar lead" quando o lead não tem responsável; caso contrário, leitura.
 *
 * @param {object[]} usuarios  internos elegíveis (já filtrados por role)
 * @param {object}   user      usuário logado (getUser/useAuthContext)
 * @param {object}   lead      lead atual
 * @param {string}   owner     nome do responsável (form)
 * @param {string}   ownerId   id do responsável (form)
 * @param {(u: object|null) => void} onSelect   seleção no Autocomplete (gestor)
 * @param {() => void} onPegar  ação de "Pegar lead" (comercial)
 * @param {boolean}  pegando   loading do botão "Pegar lead"
 */
export function LeadResponsavelField({
  usuarios = [],
  user,
  lead,
  owner,
  ownerId,
  onSelect,
  onPegar,
  pegando = false,
}) {
  const podeTrocar = podeReatribuir(user);
  const podePegar = podePegarLead(user, lead);

  // ---- Gestor: Autocomplete ----
  if (podeTrocar) {
    const selected =
      usuarios.find((u) => (ownerId ? u._id === ownerId : u.name === owner)) ||
      (owner ? { name: owner, _id: ownerId } : null);

    return (
      <Autocomplete
        fullWidth
        options={usuarios}
        value={selected}
        onChange={(e, value) => onSelect?.(value)}
        getOptionLabel={(o) => o?.name || o?.email || ''}
        isOptionEqualToValue={(o, v) => o._id === v?._id || o.name === v?.name}
        renderInput={(params) => (
          <TextField {...params} label="Responsável" placeholder="Selecione um responsável" />
        )}
        renderOption={(props, option) => (
          <Stack component="li" direction="row" spacing={1} alignItems="center" {...props}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
              {option.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <span>{option.name}</span>
          </Stack>
        )}
      />
    );
  }

  // ---- Comercial sem responsável: botão Pegar lead ----
  if (podePegar) {
    return (
      <Stack
        spacing={1.5}
        alignItems="flex-start"
        sx={{ p: 2, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette.info.main, 0.08) }}
      >
        <Typography variant="body2" color="text.secondary">
          Este lead ainda não tem responsável.
        </Typography>
        <LoadingButton
          variant="contained"
          color="info"
          loading={pegando}
          onClick={onPegar}
          startIcon={<Iconify icon="solar:hand-stars-bold" />}
        >
          Pegar lead
        </LoadingButton>
      </Stack>
    );
  }

  // ---- Demais casos: leitura ----
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon="solar:user-bold" width={20} sx={{ color: 'text.disabled' }} />
      <Typography variant="body2">
        {temResponsavel(lead) ? owner || lead?.owner : 'Sem responsável'}
      </Typography>
    </Stack>
  );
}
