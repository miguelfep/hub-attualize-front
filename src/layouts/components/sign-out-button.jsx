import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

// NB: mesma regra do layout raiz — só o método jwt é importado. Este botão vive
// no header, ou seja, em TODA página (inclusive blog e landings públicas).
// Importar os quatro `signOut` (+ o `useAuth0`) fazia o bundler incluir firebase,
// aws-amplify, @supabase e @auth0 no bundle de todas elas, mesmo com
// CONFIG.auth.method fixo em 'jwt'. Para trocar de método, troque este import
// (e o CONFIG.auth.method) juntos.

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [checkUserSession, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      {...other}
    >
      Logout
    </Button>
  );
}
