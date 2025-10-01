import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { BannerCard } from './banner-card';

// ----------------------------------------------------------------------

export function BannersSection({ banners = [], title = "Anúncios e Novidades" }) {
  const [visibleBanners, setVisibleBanners] = useState(banners);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setVisibleBanners(banners);
  }, [banners]);

  const handleBannerClose = (bannerId) => {
    setVisibleBanners(prev => prev.filter(banner => banner.id !== bannerId));
  };

  if (visibleBanners.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
        >
          <Iconify 
            icon={isExpanded ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} 
            width={20} 
          />
        </IconButton>
      </Stack>

      <Collapse in={isExpanded}>
        <Grid container spacing={3}>
          {visibleBanners.map((banner) => (
            <Grid key={banner.id} item xs={12} sm={6} md={4}>
              <BannerCard 
                banner={banner} 
                onClose={handleBannerClose}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Box>
  );
}
