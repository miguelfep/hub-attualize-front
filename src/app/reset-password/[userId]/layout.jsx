import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Redefinir Senha | Attualize',
};

export default function Layout({ children }) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
