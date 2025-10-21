'use client';

import { useMemo } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { useDocumentos } from 'src/hooks/use-documentos';

import { DocumentoCard } from 'src/sections/societario/alteracao/documentos/DocumentoCard';

const DOCUMENTOS_MODELO = [
  {
    nome: 'Contrato Social',
    descricao: 'Documento de constituição da sua empresa.',
    icon: 'solar:file-text-bold-duotone',
    fileUrl: null, 
  },
  {
    nome: 'Cartão CNPJ',
    descricao: 'Comprovante de Inscrição e Situação Cadastral.',
    icon: 'solar:card-2-bold-duotone',
    fileUrl: null, 
  },
];

export default function MeusDocumentosView() {
  const theme = useTheme();
  const { documentos, loading } = useDocumentos();
  const listaDeDocumentosDinamica = useMemo(() => {
    if (loading) return [];

    return DOCUMENTOS_MODELO.map(doc => {
      if (doc.nome === 'Contrato Social') {
        return { ...doc, fileUrl: documentos.contratoSocialUrl };
      }
      if (doc.nome === 'Cartão CNPJ') {
        return { ...doc, fileUrl: documentos.cartaoCnpjUrl };
      }
      return doc;
    });
  }, [loading, documentos]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.neutral',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Meus Documentos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Acesse os documentos de sua empresa.
              </Typography>
            </Box>
          </Box>
          
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              {loading ? (
                <>
                  <Skeleton variant="rounded" height={96} animation="wave" />
                  <Skeleton variant="rounded" height={96} animation="wave" />
                </>
              ) : (
                listaDeDocumentosDinamica.map((documento, index) => (
                   <m.div
                      key={documento.nome}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <DocumentoCard documento={documento} />
                   </m.div>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
