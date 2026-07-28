import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ListSubheader from '@mui/material/ListSubheader';

import { GRUPOS_ATIVIDADE_PGDAS } from '../atividades-pgdas';

/**
 * Seletor da atividade do PGDAS-D.
 *
 * O código combina natureza da receita, anexo, retenção de ISS e município de
 * destino — não dá para deduzir do CNAE. Por isso a lista mostra o agrupamento:
 * a mesma descrição aparece com id diferente conforme o grupo (por exemplo,
 * "sem substituição tributária" é 1 na revenda e 4 na industrialização).
 */
export function AtividadePgdasSelect({ value, onChange, size = 'small', helperText, ...other }) {
  return (
    <TextField
      select
      fullWidth
      size={size}
      label="Atividade no PGDAS-D"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      helperText={
        helperText ??
        'Confira no extrato do PGDAS-D do cliente: a descrição da atividade aparece por extenso.'
      }
      SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 420 } } } }}
      {...other}
    >
      <MenuItem value="">
        <em>Não definida</em>
      </MenuItem>

      {GRUPOS_ATIVIDADE_PGDAS.map((grupo) => [
        <ListSubheader key={grupo.grupo} sx={{ lineHeight: 1.6, py: 1 }}>
          {grupo.grupo}
        </ListSubheader>,
        ...grupo.atividades.map((a) => (
          <MenuItem key={a.id} value={a.id} sx={{ whiteSpace: 'normal' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 28 }}>
                {a.id}
              </Typography>
              <Typography variant="body2">{a.descricao}</Typography>
              {a.fatorR && <Chip size="small" variant="soft" color="warning" label="Fator R" />}
            </Stack>
          </MenuItem>
        )),
      ])}
    </TextField>
  );
}
