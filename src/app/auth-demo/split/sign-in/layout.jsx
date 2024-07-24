import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <AuthSplitLayout section={{ title: 'Bem vindo novamente' }}>{children}</AuthSplitLayout>;
}
