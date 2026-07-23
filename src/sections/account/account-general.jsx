'use client';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { avatarUrl } from 'src/utils/avatar';
import { fData } from 'src/utils/format-number';

import { uploadMeuAvatar } from 'src/actions/users';

import { toast } from 'src/components/snackbar';
import { UploadAvatar } from 'src/components/upload';

import { useAuthContext } from 'src/auth/hooks';
import { getUser, setUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------
// Minha conta: foto de perfil (upload real → POST /users/me/avatar) e dados
// básicos (somente leitura — nome/e-mail são gerenciados pelo admin).
// A foto aparece no chat interno, menções e no menu do usuário.
// ----------------------------------------------------------------------

const MAX_AVATAR = 3 * 1024 * 1024; // 3MB

export function AccountGeneral() {
  const { user, checkUserSession } = useAuthContext();

  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const fotoAtual = preview || avatarUrl(user);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > MAX_AVATAR) {
        toast.error(`Imagem acima de ${fData(MAX_AVATAR)}.`);
        return;
      }

      // Preview imediato enquanto envia.
      const url = URL.createObjectURL(file);
      setPreview(url);
      setEnviando(true);
      try {
        const res = await uploadMeuAvatar(file);
        // Atualiza a sessão local para a foto refletir em todo o app (menu, chat).
        const atual = getUser();
        if (atual) await setUser({ ...atual, imgprofile: res.imgprofile });
        await checkUserSession?.();
        toast.success('Foto de perfil atualizada!');
      } catch (error) {
        setPreview(null);
        toast.error(error?.response?.data?.message || 'Falha ao enviar a foto.');
      } finally {
        setEnviando(false);
      }
    },
    [checkUserSession]
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Card sx={{ pt: 8, pb: 5, px: 3, textAlign: 'center' }}>
          <UploadAvatar
            value={fotoAtual}
            onDrop={handleDrop}
            disabled={enviando}
            maxSize={MAX_AVATAR}
            helperText={
              <Typography
                variant="caption"
                sx={{ mt: 3, mx: 'auto', display: 'block', textAlign: 'center', color: 'text.disabled' }}
              >
                *.jpeg, *.jpg, *.png, *.webp, *.gif
                <br /> tamanho máximo de {fData(MAX_AVATAR)}
              </Typography>
            }
          />

          <LoadingButton loading={enviando} sx={{ mt: 2 }} disabled>
            {enviando ? 'Enviando…' : 'Clique na foto para trocar'}
          </LoadingButton>
        </Card>
      </Grid>

      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Meus dados
          </Typography>
          <Stack spacing={2.5}>
            <TextField label="Nome" value={user?.name || ''} InputProps={{ readOnly: true }} />
            <TextField label="E-mail" value={user?.email || ''} InputProps={{ readOnly: true }} />
            <TextField
              label="Setores"
              value={(user?.setores || []).map((s) => s?.nome || s).join(', ') || '—'}
              InputProps={{ readOnly: true }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Nome, e-mail e setores são gerenciados pelos administradores em Usuários.
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
