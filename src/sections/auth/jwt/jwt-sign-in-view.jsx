'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { Turnstile } from 'src/components/turnstile';
import { Form, Field } from 'src/components/hook-form';
import { AppStoreModal } from 'src/components/app-store-modal';

import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/auth/context/jwt/utils';
import { signInWithPassword } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatorio!' })
    .email({ message: 'Email deve ser um email valido!' }),
  password: zod
    .string()
    .min(1, { message: 'Senha é obrigatória!' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres!' }),
});

// ----------------------------------------------------------------------
// Throttle de tentativas no cliente (camada de UX contra força bruta casual).
// A proteção autoritativa é o rate limit do backend — aqui apenas desaceleramos
// o abuso no navegador e damos feedback claro de espera ao usuário.
// ----------------------------------------------------------------------

const THROTTLE_KEY = 'hub_login_throttle';
const FREE_ATTEMPTS = 5; // tentativas sem bloqueio
const BASE_COOLDOWN_S = 30; // 1º bloqueio: 30s, depois dobra (60s, 120s...)
const MAX_COOLDOWN_S = 600; // teto de 10 minutos

function readThrottle() {
  try {
    const raw = localStorage.getItem(THROTTLE_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function saveThrottle(value) {
  try {
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function clearThrottle() {
  try {
    localStorage.removeItem(THROTTLE_KEY);
  } catch {
    /* ignore */
  }
}

function cooldownSeconds(attempts) {
  const lockIndex = attempts - FREE_ATTEMPTS; // 1º bloqueio => 1
  return Math.min(BASE_COOLDOWN_S * 2 ** Math.max(0, lockIndex - 1), MAX_COOLDOWN_S);
}

function formatWait(totalSeconds) {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  if (min > 0) return `${min}min ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
}

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  const { checkUserSession, user } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [waitSeconds, setWaitSeconds] = useState(0);

  const turnstileEnabled = !!CONFIG.turnstile.siteKey;
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef(null);

  const password = useBoolean();

  const resetCaptcha = useCallback(() => {
    // Tokens do Turnstile são de uso único: renova após cada tentativa
    setCaptchaToken('');
    turnstileRef.current?.reset();
  }, []);

  // Restaura um bloqueio em andamento (sobrevive a refresh da página)
  useEffect(() => {
    const { lockedUntil } = readThrottle();
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
    if (remaining > 0) setWaitSeconds(remaining);
  }, []);

  // Contagem regressiva do bloqueio
  useEffect(() => {
    if (waitSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setWaitSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [waitSeconds]);

  const registerFailure = useCallback(() => {
    const throttle = readThrottle();
    const attempts = (throttle.attempts || 0) + 1;

    if (attempts >= FREE_ATTEMPTS) {
      const cooldown = cooldownSeconds(attempts);
      saveThrottle({ attempts, lockedUntil: Date.now() + cooldown * 1000 });
      setWaitSeconds(cooldown);
    } else {
      saveThrottle({ attempts, lockedUntil: 0 });
    }
  }, []);

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    // Bloqueio do throttle em andamento: não envia a requisição
    if (waitSeconds > 0) return;

    if (turnstileEnabled && !captchaToken) {
      setErrorMsg('Confirme a verificação de segurança para continuar.');
      return;
    }

    try {
      await signInWithPassword({
        email: data.email,
        password: data.password,
        turnstileToken: turnstileEnabled ? captchaToken : undefined,
      });

      clearThrottle();
      setErrorMsg('');

      await checkUserSession?.();

      // Aguarda um pouco para garantir que o user foi atualizado
      setTimeout(() => {
        const currentUser = getUser();

        // Determina o userType baseado no role se não estiver definido
        const userType = currentUser?.userType ?? (currentUser?.role === 'cliente' ? 'cliente' : 'interno');

        if (userType === 'cliente') {
          router.replace(paths.cliente.dashboard);
        } else {
          router.replace(paths.dashboard.root);
        }
      }, 100);
    } catch (error) {
      console.error(error);

      if (turnstileEnabled) {
        resetCaptcha();
      }

      const status = error?.status;

      if (status === 429) {
        // Rate limit do backend: respeita e ativa a espera local também
        registerFailure();
        setErrorMsg('Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.');
      } else if (status && status >= 400 && status < 500) {
        // Mensagem genérica: não revela se o e-mail existe ou se a senha está errada
        registerFailure();
        setErrorMsg('E-mail ou senha incorretos. Confira seus dados e tente novamente.');
      } else {
        // Erro de rede/servidor: não conta como tentativa de credencial
        setErrorMsg('Não foi possível entrar agora. Tente novamente em instantes.');
      }
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Box component="img" src="/logo/hub-tt.png" alt="Hub TT" sx={{ height: 48 }} />
      </Box>
      <Typography variant="h5" textAlign="center">Acessar Attualize HUB</Typography>

      <Stack direction="row" spacing={0.5}>
        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Não possui uma conta?
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Solicitar Acesso
        </Link> */}
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email"
        placeholder="Digite seu email"
        InputLabelProps={{ shrink: true }}
      />

      <Stack spacing={1.5}>
        <Link
          component={RouterLink}
          href={paths.auth.jwt.resetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Perdeu a senha?
        </Link>

        <Field.Text
          name="password"
          label="Senha"
          placeholder="Digite sua senha"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {turnstileEnabled && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Turnstile
            ref={turnstileRef}
            siteKey={CONFIG.turnstile.siteKey}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={() => setCaptchaToken('')}
          />
        </Box>
      )}

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="acessando..."
        disabled={waitSeconds > 0 || (turnstileEnabled && !captchaToken)}
      >
        {waitSeconds > 0 ? `Aguarde ${formatWait(waitSeconds)}` : 'Logar'}
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {waitSeconds > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Muitas tentativas seguidas. Por segurança, aguarde{' '}
          <strong>{formatWait(waitSeconds)}</strong> para tentar novamente — ou{' '}
          <Link component={RouterLink} href={paths.auth.jwt.resetPassword} color="inherit">
            <strong>redefina sua senha</strong>
          </Link>
          .
        </Alert>
      )}

      {!!errorMsg && waitSeconds === 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <AppStoreModal />
    </>
  );
}
