import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LocalizationProvider } from 'src/locales/localization-provider';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// LocalizationProvider (@mui/x-date-pickers) fica aqui, não no layout raiz:
// os date pickers só existem nas áreas autenticadas.
export default function Layout({ children }) {
  if (CONFIG.auth.skip) {
    return (
      <LocalizationProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </LocalizationProvider>
    );
  }

  return (
    <AuthGuard>
      <LocalizationProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </LocalizationProvider>
    </AuthGuard>
  );
}
