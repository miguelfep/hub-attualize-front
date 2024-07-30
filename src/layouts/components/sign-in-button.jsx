import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }) {
  return (
    <Button
      component={RouterLink}
      href={CONFIG.auth.redirectPath}
      variant="contained"
      sx={sx}
      {...other}
    >
      Acessar HUB
    </Button>
  );
}
