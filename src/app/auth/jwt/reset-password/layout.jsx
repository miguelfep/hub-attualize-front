import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Reset Password | Attualize',
};

export default function Layout({ children }) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
