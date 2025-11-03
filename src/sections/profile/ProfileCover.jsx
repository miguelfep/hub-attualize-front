import { formatDate } from 'date-fns';

import { Box, Card, Chip, Stack, Badge, Avatar, Divider, Typography, CardContent } from '@mui/material';

import { toTitleCase } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';

export function ProfileCover({ user }) {

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack alignItems="center" spacing={2}>
          
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiBadge-badge': {
                opacity: 0,
                transition: (theme) => theme.transitions.create('opacity'),
              },
              '&:hover .MuiBadge-badge': {
                opacity: 1,
              },
            }}
          >
            <Avatar
              src={user?.imgprofile}
              alt={user?.name}
              sx={{
                width: 128,
                height: 128,
                border: (theme) => `4px solid ${theme.palette.background.default}`,
                boxShadow: (theme) => theme.customShadows.z16,
              }}
            >
              {!user?.imgprofile && <Iconify icon="solar:user-bold-duotone" width={64} />}
            </Avatar>
          </Badge>

          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {toTitleCase(user?.name)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
             <Iconify icon="solar:calendar-bold-duotone" width={16} />
             <Typography variant="caption">Membro desde {formatDate(user.createdAt, 'dd/MM/yyyy')}</Typography>
          </Stack>

          <Divider sx={{ width: '100%', borderStyle: 'dashed', my: 2 }} />

          <Stack direction="row" justifyContent="space-around" sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" component="p">
                  Tipo de Usuário
                </Typography>
                <Chip label="Cliente" color="primary" variant="soft" size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" component="p">
                  Status
                </Typography>
                <Chip
                  label={user?.status ? 'Ativo' : 'Inativo'}
                  color={user?.status ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
