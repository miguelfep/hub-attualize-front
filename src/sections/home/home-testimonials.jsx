import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { _mock } from 'src/_mock';
import { maxLine, varAlpha, textGradient } from 'src/theme/styles';

import { varFade, MotionViewport, AnimateCountUp } from 'src/components/animate';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  carouselBreakpoints,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatTriangleDownIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

export function HomeTestimonials({ sx, ...other }) {
  const theme = useTheme();

  const renderLines = (
    <>
      <Stack
        spacing={8}
        alignItems="center"
        sx={{ top: 64, left: 80, position: 'absolute', transform: 'translateX(-15px)' }}
      >
        <FloatTriangleDownIcon sx={{ position: 'static', opacity: 0.12 }} />
        <FloatTriangleDownIcon sx={{ width: 30, height: 15, opacity: 0.24, position: 'static' }} />
      </Stack>
      <FloatLine vertical sx={{ top: 0, left: 80 }} />
    </>
  );

  const carousel = useCarousel({
    align: 'start',
    slidesToShow: { xs: 1, sm: 2, md: 3, lg: 4 },
    breakpoints: {
      [carouselBreakpoints.sm]: { slideSpacing: '24px' },
      [carouselBreakpoints.md]: { slideSpacing: '40px' },
      [carouselBreakpoints.lg]: { slideSpacing: '64px' },
    },
  });

  const renderDescription = (
    <SectionTitle
      caption="Avaliações"
      title="O que nossos clientes"
      txtGradient="Dizem..."
      sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
    />
  );

  const horizontalDivider = (position) => (
    <Divider
      component="div"
      sx={{
        width: 1,
        opacity: 0.16,
        height: '1px',
        border: 'none',
        position: 'absolute',
        background: `linear-gradient(to right, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 0%, ${theme.vars.palette.grey[500]} 50%, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 100%)`,
        ...(position === 'top' && { top: 0 }),
        ...(position === 'bottom' && { bottom: 0 }),
      }}
    />
  );

  const verticalDivider = (
    <Divider
      component="div"
      orientation="vertical"
      flexItem
      sx={{
        opacity: 0.16,
        border: 'none',
        width: '1px',
        background: `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 0%, ${theme.vars.palette.grey[500]} 50%, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 100%)`,
        display: { xs: 'none', md: 'block' },
      }}
    />
  );

  const renderContent = (
    <Stack sx={{ position: 'relative', py: { xs: 5, md: 8 } }}>
      {horizontalDivider('top')}

      <Carousel carousel={carousel}>
        {TESTIMONIALS.map((item) => (
          <Stack key={item.id} component={m.div} variants={varFade().in}>
            <Stack spacing={1} sx={{ typography: 'subtitle2' }}>
              <Rating size="small" name="read-only" value={item.rating} precision={0.5} readOnly />
              {item.category}
            </Stack>

            <Typography
              sx={{ ...maxLine({ line: 4, persistent: theme.typography.body1 }), mt: 2, mb: 3 }}
            >
              {item.content}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar alt={item.name} src={item.avatar} sx={{ width: 48, height: 48 }} />
              <Stack sx={{ typography: 'subtitle1' }}>
                <Box component="span">{item.name}</Box>
                <Box component="span" sx={{ typography: 'body2', color: 'text.disabled' }}>
                  {fToNow(new Date(item.postedAt))}
                </Box>
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Carousel>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: { xs: 5, md: 8 } }}
      >
        <CarouselDotButtons
          fallback
          variant="rounded"
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
        />

        <CarouselArrowBasicButtons {...carousel.arrows} options={carousel.options} />
      </Stack>
    </Stack>
  );

  const renderNumber = (
    <Stack sx={{ py: { xs: 5, md: 8 }, position: 'relative' }}>
      {horizontalDivider('top')}

      <Stack spacing={5} direction={{ xs: 'column', md: 'row' }} divider={verticalDivider}>
        {[
          { label: 'Clientes', value: 500 },
          { label: 'Profissionais Regularizados', value: 800 },
          { label: 'Estados atendidos', value: 21 },
        ].map((item) => (
          <Stack key={item.label} spacing={2} sx={{ textAlign: 'center', width: 1 }}>
            <m.div variants={varFade({ distance: 24 }).inUp}>
              <AnimateCountUp
                to={item.value}
                unit="+"
                toFixed={item.label === 'Clientes' ? 0 : 0}
                sx={{
                  fontWeight: 'fontWeightBold',
                  fontSize: { xs: 40, md: 64 },
                  lineHeight: { xs: 50 / 40, md: 80 / 64 },
                  fontFamily: theme.typography.fontSecondaryFamily,
                }}
              />
            </m.div>

            <m.div variants={varFade({ distance: 24 }).inUp}>
              <Box
                component="span"
                sx={{
                  ...textGradient(
                    `90deg, ${theme.vars.palette.text.primary}, ${varAlpha('0 0 0', 0.9)}`
                  ),
                  opacity: 0.4,
                  typography: 'h6',
                }}
              >
                {item.label}
              </Box>
            </m.div>
          </Stack>
        ))}
      </Stack>

      {horizontalDivider('bottom')}
    </Stack>
  );

  return (
    <Stack component="section" sx={{ py: 10, position: 'relative', ...sx }} {...other}>
      <MotionViewport>
        {renderLines}

        <Container>
          {renderDescription}

          {renderContent}

          {renderNumber}
        </Container>
      </MotionViewport>
    </Stack>
  );
}

// ----------------------------------------------------------------------

const base = (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatar: _mock.image.avatar(index),
  rating: 5,
});

const TESTIMONIALS = [
  {
    name: "Monica Camozele",
    postedAt: 'April 20, 2024 23:15:30',
    rating: 5,
    avatarUrl: _mock.image.avatar(1),
    content: `“A Attualize foi muito importante ao valorizar o que eu tinha pra contar sobre o meu trabalho. Um outro contador mal me ouviu e disse que não valeria a pena eu abrir empresa. Senti um desdém, não sabia se pelo meu trabalho, por mim, ou por eu ser mulher. A disponibilidade em tirar minhas dúvidas, mesmo que eu pergunte 5 vezes a mesma coisa por não ter entendido ainda, é uma das coisas que me mantém com vocês. A atenção e cuidado de vocês com o cliente, é um baita diferencial. Me sinto respeitada e segura com vocês. Só tenho a agradecer.”`,
  },
  {
    name: "Juliana Romualdo",
    postedAt: 'April 20, 2024 23:15:30',
    category: "Contabilidade",
    rating:5,
    avatarUrl: _mock.image.avatar(2),
    content: `Sou nova por aqui, estou em fase de migração, estou aliviada de ter vcs. Mas preocupadas com as informações que nunca tive acesso. Enfim eu estou me sentindo segura e amparada. Adoro a página, as dicas. Foi através disso que pensei, tem algo errado na minha empresa e procurei vocês.`,
  },
  {
    name: "Celso Marchioretto",
    postedAt: 'April 20, 2024 23:15:30',
    category: "Contabilidade",
    rating: 5,
    avatarUrl: _mock.image.avatar(3),
    content: `Sempre sou muito bem atendido, parabenizo a todo equipe. O Serviço é muito bom, sempre tivemos um ótimo atendimento.`,
  },
  {
    name: "Mauricio Penteado",
    postedAt: 'April 20, 2024 23:15:30',
    category: "Contabilidade",
    rating: 5,
    avatarUrl: _mock.image.avatar(4),
    content: `Um estritório com ótimo atendimento e pessoas super atenciosas.`,
  },
  {
    name: "Tamara resi",
    postedAt: 'April 20, 2024 23:15:30',
    category: "Contabilidade",
    rating: 5,
    avatarUrl: _mock.image.avatar(5),
    content: `A empresa sempre nos atendeu com agilidade e cordialidade, demonstrando conhecimento técnico superior às outras que buscamos. A equipe é proativa e sempre nos oferece informações sobre os processos e pontuam eventuais desconformidades, trazendo também a forma mais viável e fácil de adequar. Muito organizados com as nossas documentações, o que facilita resolver tudo rapidamente e de acordo com o que exige as leis. Ficamos extremamente satisfeitos e indicamos o serviço da Atualize para todos os nossos parceiros.`,
  }, 
];