import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { Image } from 'src/components/image';
import { SocialIcon } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const { assetURL } = CONFIG.site;


// Dados reais dos membros
const teamMembers = [
  {
    id: 1,
    name: 'Anne Monteiro',
    role: 'CEO',
    avatarUrl: `/assets/images/about/anne.jpg`,
    socials: [
      { name: 'instagram', url: 'https://instagram.com/euannemonteiro' },
      { name: 'youtube', url: 'https://www.youtube.com/c/AttualizeCont%C3%A1bil' },
      { name: 'facebook', url: 'https://www.facebook.com/anne.contadora' },

    ],
  },
  {
    id: 2,
    name: 'Miguel Fernando Pereira',
    role: 'CTO',
    avatarUrl: '/assets/images/about/miguel.jpg',
    socials: [
      { name: 'youtube', url: 'https://www.youtube.com/c/AttualizeCont%C3%A1bil' },

    ],
  },
  // {
  //   id: 3,
  //   name: 'Geremias',
  //   role: 'Head de operação',
  //   avatarUrl: '/path/to/bob-johnson.jpg',
  //   socials: [
  //     { name: 'instagram', url: 'https://instagram.com/bobjohnson' },
  //     { name: 'linkedin', url: 'https://linkedin.com/in/bobjohnson' },
  //   ],
  // },
];

export function AboutTeam() {
  return (
    <Container component={MotionViewport} sx={{ textAlign: 'center', py: { xs: 10, md: 15 } }}>
      <m.div variants={varFade().inDown}>
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          Nosso time
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant="h2" sx={{ my: 3 }}>
          Peças Chave da Attualize
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography sx={{ mx: 'auto', maxWidth: 640, color: 'text.secondary' }}>
          Conheça um pouco mais das peças chave da Attualize Contábil.
        </Typography>
      </m.div>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="center"
        alignItems="center"
        spacing={3}
        sx={{ mt: 5 }}
      >
        {teamMembers.map((member) => (
          <Box
            key={member.id}
            component={m.div}
            variants={varFade().in}
            sx={{ width: { xs: '100%', md: '30%' } }}
          >
            <MemberCard member={member} />
          </Box>
        ))}
      </Stack>
    </Container>
  );
}

function MemberCard({ member }) {
  return (
    <Card>
      <Typography variant="subtitle1" sx={{ mt: 2.5, mb: 0.5 }}>
        {member.name}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary' }}>
        {member.role}
      </Typography>

      <Box sx={{ px: 1 }}>
        <Image alt={member.name} src={member.avatarUrl} ratio="1/1" sx={{ borderRadius: 2 }} />
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2 }}>
        {member.socials.map((social) => (
          <IconButton key={social.name} href={social.url} target="_blank">
            <SocialIcon icon={social.name} />
          </IconButton>
        ))}
      </Stack>
    </Card>
  );
}
