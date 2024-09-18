import { CONFIG } from 'src/config-global';

import { JwtSignInView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: `Login | Sistema - ${CONFIG.site.name}` };

export default function Page() {
  return <JwtSignInView />;
}
