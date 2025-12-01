// Importe o Swiper e seus estilos
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { BannerCard } from './banner-card';

export function BannersSection({ banners = [] }) {
  const theme = useTheme();

  if (banners.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        '& .swiper': {
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        },
        '& .swiper-wrapper': {
          width: '100%',
          maxWidth: '100%',
        },
        '& .swiper-slide': {
          width: '100%',
          maxWidth: '100%',
        },
        '& .swiper-pagination-bullet': {
          bgcolor: 'rgba(255, 255, 255, 0.48)',
        },
        '& .swiper-pagination-bullet-active': {
          bgcolor: 'common.white',
        },
      }}
    >
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop
        style={{ 
          height: '100%', 
          width: '100%',
          maxWidth: '100%',
          borderRadius: theme.shape.borderRadius * 2,
          overflow: 'hidden',
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} style={{ width: '100%', maxWidth: '100%' }}>
            <BannerCard banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
