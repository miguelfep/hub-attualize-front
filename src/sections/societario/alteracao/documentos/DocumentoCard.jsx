'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import axios, { baseUrl } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

export function DocumentoCard({ documento }) {
  const theme = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  
  const isMobile = useResponsive('down', 'sm', 'md');

  const hasFile = !!documento.fileUrl;
  const fullFileUrl = hasFile ? `${baseUrl}${documento.fileUrl}` : '#';
  const fileName = hasFile ? documento.fileUrl.split('/').pop() : '';

  const BotaoDownload = (
    <Button
      fullWidth
      variant="contained"
      color="primary"
      disabled={!hasFile}
      startIcon={<Iconify icon="solar:download-bold" />}
    >
      {hasFile ? 'Visualizar' : 'Indisponível'}
    </Button>
  );

  const handleShareClick = async () => {
    if (navigator.share && hasFile) {
      setIsSharing(true);
      try {
        const response = await axios.get(fullFileUrl, {
          responseType: 'blob',
        });
        
        const blob = response.data;
        
        const file = new File([blob], fileName, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: documento.nome,
            text: `Aqui está seu ${documento.nome}`,
          });
        } else {
          await navigator.share({
            title: documento.nome,
            text: `Aqui está seu ${documento.nome}`,
            url: fullFileUrl,
          });
        }
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      } finally {
        setIsSharing(false);
      }
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        opacity: hasFile ? 1 : 0.6,
        transition: theme.transitions.create(['box-shadow', 'border-color', 'opacity']),
        '&:hover': hasFile ? {
          boxShadow: theme.customShadows.z16,
          borderColor: alpha(theme.palette.primary.main, 0.5),
        } : {},
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: hasFile ? 'primary.main' : 'text.disabled',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon={documento.icon} width={24} />
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {documento.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {documento.descricao}
            </Typography>
          </Box>
        </Stack>

        {hasFile && (
          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>
            <a
              href={fullFileUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', flex: 1 }}
            >
              {BotaoDownload}
            </a>
            
            {isMobile && navigator.share && (
              <Button
                variant="outlined"  
                color="primary"
                onClick={handleShareClick}
                disabled={isSharing}
                sx={{ flex: 1 }}
              >
                {isSharing ? 'Preparando...' : 'Compartilhar'}
              </Button>
            )}
          </Stack>
        )}
        {!hasFile && (
           <Box sx={{ width: { xs: '100%', sm: 'auto' }, maxWidth: '170px', flexShrink: 0 }}>
             {BotaoDownload}
           </Box>
        )}
      </Stack>
    </Paper>
  );
}
