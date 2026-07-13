'use client';

import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Link,
  Stack,
  Container,
  Typography,
  LinearProgress,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import { obterMigracaoPorToken, enviarDocumentosPorToken } from 'src/actions/migracao';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Página pública onde o contador anterior envia os documentos da migração.
// Sem login: o acesso é pelo token do link (validado no backend).

function ColetaShell({ maxWidth = 'md', children }) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 5, md: 8 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="img"
        src="/logo/hub-tt.png"
        alt="Attualize Contábil"
        sx={{ height: 48, mx: 'auto', mb: { xs: 4, md: 5 } }}
      />

      <Box sx={{ flex: 1 }}>{children}</Box>

      <Box component="footer" sx={{ mt: 6, textAlign: 'center', typography: 'caption', color: 'text.disabled' }}>
        © Todos os direitos reservados
        <br /> Feito por
        <Link href="https://www.attualize.com.br/" color="inherit" target="_blank" rel="noopener">
          {' '}
          Attualize TECH{' '}
        </Link>
      </Box>
    </Container>
  );
}

export function MigracaoColetaView({ token }) {
  const [migracao, setMigracao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [invalido, setInvalido] = useState(false);

  const [arquivos, setArquivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await obterMigracaoPorToken(token);
      setMigracao(dados);
    } catch {
      setInvalido(true);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleDrop = useCallback((novos) => {
    setArquivos((prev) => [...prev, ...novos]);
  }, []);

  const handleEnviar = async () => {
    if (!arquivos.length) {
      toast.error('Selecione ao menos um arquivo para enviar.');
      return;
    }
    try {
      setEnviando(true);
      setProgresso(0);
      const dados = await enviarDocumentosPorToken(token, arquivos, setProgresso);
      setMigracao((prev) => ({ ...prev, ...dados }));
      setArquivos([]);
      toast.success('Documentos enviados com sucesso. Obrigado!');
    } catch (error) {
      toast.error(error?.message || 'Não foi possível enviar agora. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // ------------------------------------------------------------------

  if (carregando) {
    return (
      <ColetaShell maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <LinearProgress sx={{ maxWidth: 320, mx: 'auto' }} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Carregando informações da migração...
          </Typography>
        </Box>
      </ColetaShell>
    );
  }

  if (invalido || !migracao) {
    return (
      <ColetaShell maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="solar:link-broken-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 1 }}>
            Link inválido ou encerrado
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Este link de coleta não está mais disponível. Se você recebeu este endereço da
            Attualize, entre em contato com o nosso time para gerar um novo link.
          </Typography>
        </Box>
      </ColetaShell>
    );
  }

  return (
    <ColetaShell>
      <Stack spacing={4}>
        {/* Cabeçalho */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography component="h1" variant="h3" sx={{ mb: 1 }}>
            Documentos da migração — {migracao.empresaNome}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto' }}>
            Olá, {migracao.contadorNome}! A empresa está migrando a contabilidade para a Attualize.
            Envie por aqui os documentos da transição — sem cadastro e sem senha.
          </Typography>
        </Box>

        {/* Checklist */}
        <Card sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Documentos necessários
          </Typography>
          <Stack spacing={1}>
            {(migracao.documentosSolicitados || []).map((item) => (
              <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify
                  icon="solar:check-circle-linear"
                  width={20}
                  sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}
                />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
            Não tem algum item? Envie o que estiver disponível — o nosso time entra em contato para
            o restante.
          </Typography>
        </Card>

        {/* Upload */}
        <Card sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Enviar arquivos
          </Typography>
          <Upload
            multiple
            value={arquivos}
            onDrop={handleDrop}
            onRemove={(arquivo) => setArquivos((prev) => prev.filter((f) => f !== arquivo))}
            onRemoveAll={() => setArquivos([])}
            helperText="PDF, Word, Excel ou imagens — até 20 arquivos por envio (20MB cada)."
          />
          {enviando && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progresso} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Enviando... {progresso}%
              </Typography>
            </Box>
          )}
          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            loading={enviando}
            onClick={handleEnviar}
            startIcon={<Iconify icon="solar:upload-bold" />}
            sx={{ mt: 3 }}
            disabled={!arquivos.length}
          >
            Enviar {arquivos.length > 0 ? `${arquivos.length} arquivo(s)` : 'documentos'}
          </LoadingButton>
        </Card>

        {/* Já enviados */}
        {migracao.documentosEnviados?.length > 0 && (
          <Card
            sx={{
              p: { xs: 2.5, md: 4 },
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.06),
            }}
          >
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              Já recebidos ({migracao.documentosEnviados.length})
            </Typography>
            <Stack spacing={1}>
              {migracao.documentosEnviados.map((doc, index) => (
                <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                    {doc.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fDateTime(doc.enviadoEm)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        )}

        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
          Os arquivos são recebidos diretamente pela equipe da Attualize Contábil e usados apenas
          para a transição contábil da empresa. Dúvidas? Responda o e-mail ou a mensagem que trouxe
          você até aqui.
        </Typography>
      </Stack>
    </ColetaShell>
  );
}
