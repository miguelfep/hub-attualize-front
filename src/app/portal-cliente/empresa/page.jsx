'use client';

import { toast } from 'sonner';
import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, LazyMotion, domAnimation } from 'framer-motion';

import axios from 'src/utils/axios';

// MUI Imports

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

// App Utils & Components
import { formatCNPJ } from 'src/utils/formatter';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';

const MotionStack = motion(Stack);
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

const CustomDivider = () => {
  const theme = useTheme();
  return (
    <Divider
      sx={{
        borderStyle: 'dashed',
        borderColor: () => alpha(theme.palette.primary.main, 0.4),
        background: `linear-gradient(90deg, transparent, ${alpha(
          theme.palette.primary.main,
          0.2
        )}, transparent)`,
      }}
    />
  );
};

// Componente de animação para feedback de cópia
const CopyFeedbackIcon = ({ isCopied }) => (
  <motion.div
    initial={{ scale: 1 }}
    animate={{ scale: isCopied ? 1.2 : 1 }}
    transition={{ duration: 0.2 }}
  >
    <Iconify icon={isCopied ? 'mdi:check' : 'mdi:content-copy'} width={16} />
  </motion.div>
);

/**
 * @component Section
 * @description Wrapper reutilizável para criar seções com título e ícone.
 */
const Section = ({ icon, title, children, sx }) => (
  // 3. Usa MotionStack diretamente, eliminando um <div> desnecessário
  <MotionStack
    spacing={2}
    sx={{ p: 3, bgcolor: 'background.paper', boxShadow: 1, ...sx }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Iconify icon={icon} width={28} color="primary.main" />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
    </Stack>
    <Box>{children}</Box>
  </MotionStack>
);

const InfoRow = ({ icon, label, value, isCopyable = false }) => {
  const [tooltipTitle, setTooltipTitle] = useState('Copiar');
  const [isCopied, setIsCopied] = useState(false);
  const theme = useTheme();
  const copyTimeoutRef = useRef(null);

  const displayValue = value ?? '—';

  const canBeCopied = isCopyable && (typeof value === 'string' || typeof value === 'number') && value !== null && value !== '';

  const handleCopy = () => {
    if (!canBeCopied) return;

    if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
    }
    navigator.clipboard.writeText(String(value)); 
    setTooltipTitle('Copiado!');
    setIsCopied(true);
    
    copyTimeoutRef.current = setTimeout(() => {
      setTooltipTitle('Copiar');
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  return (
    <MotionStack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        bgcolor: 'background.default',
        transition: 'all 0.3s ease',
        '& .copy-button': { opacity: 0, transition: 'opacity 0.2s' },
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.2)}`,
          '& .copy-button': { opacity: 1 },
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
        <Iconify icon={icon} width={22} sx={{ color: 'primary.main', flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}
        >
          {displayValue}
        </Typography>
        {canBeCopied && (
          <Tooltip title={tooltipTitle} placement="top" arrow>
            <IconButton className="copy-button" onClick={handleCopy} size="small">
              <CopyFeedbackIcon isCopied={isCopied} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </MotionStack>
  );
};

const InfoChip = ({ icon, label, color = 'default', tooltipText }) => {
  const theme = useTheme();

  const chip = (
    <Chip
      icon={<Iconify icon={icon} sx={{ ml: '6px !important', color: 'inherit' }} />}
      label={label}
      size="small"
      sx={{
        color: `${color}.contrastText`,
        bgcolor: `${color}.main`,
        fontWeight: 'medium',
        borderRadius: 1.5,
        boxShadow: `0 2px 4px ${alpha(theme.palette[color]?.main || theme.palette.grey[500], 0.3)}`,
        transition: 'transform 0.2s ease',
        padding: 0.5,
        '&:hover': {
          transform: 'scale(1.05)',
          bgcolor: `${color}.dark`,
        },
      }}
    />
  );

  return tooltipText ? (
    <Tooltip title={tooltipText} placement="top" arrow>
      {chip}
    </Tooltip>
  ) : (
    chip
  );
};

/**
 * @component EmptyState
 * @description Componente para exibir quando não há dados.
 */
const EmptyState = ({ icon, text }) => (
  <MotionStack
    alignItems="center"
    spacing={2}
    sx={{ py: 5 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <Iconify icon={icon} width={56} sx={{ color: 'text.disabled', opacity: 0.7 }} />
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {text}
    </Typography>
  </MotionStack>
);

/**
 * @component ActivitySection
 * @description Seção para exibir atividades da empresa.
 */
const ActivitySection = ({ title, activities, color = 'primary' }) => {
  const theme = useTheme();

  return (
    <MotionStack
      spacing={2}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h6"
        sx={{
          color: `${color}.main`,
          pb: 1,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '50px',
            height: '2px',
            bgcolor: `${color}.main`,
          },
        }}
      >
        {title}
      </Typography>
      {activities && activities.length > 0 ? (
        activities.map((atividade, index) => (
          <MotionBox
            key={index}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette[color].main, 0.08),
              borderRadius: 2,
              boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.1)}`,
            }}
          >
            <Stack spacing={1}>
              <Chip
                label={atividade.code}
                color={color}
                size="small"
                sx={{ alignSelf: 'flex-start', fontWeight: 'medium' }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {atividade.text}
              </Typography>
            </Stack>
          </MotionBox>
        ))
      ) : (
        <EmptyState icon="mdi:briefcase-off-outline" text="Nenhuma atividade cadastrada" />
      )}
    </MotionStack>
  );
};

const AddressDisplay = ({ endereco }) => {
  const addressString = `${endereco.rua}, ${endereco.numero}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`;
  const [tooltipTitle, setTooltipTitle] = useState('Copiar Endereço Completo');
  const [isCopied, setIsCopied] = useState(false);
  const theme = useTheme();

  const copyTimeoutRef = useRef(null);

  const handleCopy = () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    
    navigator.clipboard.writeText(addressString);
    setTooltipTitle('Copiado!');
    setIsCopied(true);
    
    copyTimeoutRef.current = setTimeout(() => {
      setTooltipTitle('Copiar Endereço Completo');
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  return (
    <MotionStack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '& .copy-button': { opacity: 0, transition: 'opacity 0.2s' },
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.2)}`,
          '& .copy-button': { opacity: 1 },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1.5}
        sx={{ minWidth: 0, flexGrow: 1 }}
      >
        <Iconify
          icon="mdi:map-marker-outline"
          width={22}
          sx={{ color: 'primary.main', flexShrink: 0, mt: 0.25 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
            {`${endereco.rua}, ${endereco.numero}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {`${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`}
          </Typography>
        </Box>
      </Stack>
      <Tooltip title={tooltipTitle} placement="top" arrow>
        <IconButton className="copy-button" onClick={handleCopy} size="small">
          <CopyFeedbackIcon isCopied={isCopied} />
        </IconButton>
      </Tooltip>
    </MotionStack>
  );
};

/**
 * @component SocioCard
 * @description Card para exibir informações de um sócio.
 */
const SocioCard = ({ socio }) => {
  const theme = useTheme();

  return (
    <MotionPaper
      variant="outlined"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        boxShadow: `0 4px 12px ${alpha(theme.palette.grey[500], 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 6px 16px ${alpha(theme.palette.grey[500], 0.2)}`,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {socio.nome || 'Nome não informado'}
          </Typography>
          <Chip
            label={socio.administrador ? 'Admin' : 'Sócio'}
            color={socio.administrador ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 'medium', borderRadius: 1 }}
          />
        </Stack>
        <CustomDivider />
        <Stack spacing={1}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500 }}
          >
            CPF
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {socio.cpf || '—'}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500 }}
          >
            RG
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {socio.rg || '—'}
          </Typography>
        </Stack>
      </Stack>
    </MotionPaper>
  );
};

// ----------------------------------------------------------------------
// 4. COMPONENTE PRINCIPAL DA VIEW
// ----------------------------------------------------------------------

export default function MinhaEmpresaView() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${user.userId}`
        );
        setEmpresaData(response.data.data.cliente);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) fetchEmpresaData();
  }, [user?.userId]);

  const chipData = useMemo(() => {
    if (!empresaData) return {};

    const statusConfig = empresaData.status
      ? {
          icon: 'mdi:check-circle-outline',
          label: 'Ativo',
          color: 'success',
          tooltipText: 'A empresa está operacional.',
        }
      : {
          icon: 'mdi:close-circle-outline',
          label: 'Inativo',
          color: 'error',
          tooltipText: 'A empresa não está operacional.',
        };

    const regimeMap = {
      simples: {
        icon: 'mdi:scale-balance',
        label: 'Simples Nacional',
        color: 'primary',
        tooltipText: 'Regime tributário de sua empresa.',
      },
      presumido: {
        icon: 'mdi:scale-balance',
        label: 'Lucro Presumido',
        color: 'secondary',
        tooltipText: 'Regime tributário de sua empresa',
      },
      real: {
        icon: 'mdi:scale-balance',
        label: 'Lucro Real',
        color: 'info',
        tooltipText: 'Regime tributário de sua empresa',
      },
      pf: {
        icon: 'mdi:scale-balance',
        label: 'Pessoa Física',
        color: 'success',
        tooltipText: 'Regime tributário de sua empresa',
      }
    };

    const regimeConfig = regimeMap[empresaData.regimeTributario] || {
      icon: 'mdi:help-circle-outline',
      label: 'Não Definido',
      color: 'default',
    };

    const planoMap = {
      carneleao: { icon: 'mdi:star-circle-outline', label: 'Carnê-Leão', color: 'secondary' },
      mei: { icon: 'mdi:star-circle-outline', label: 'MEI', color: 'info' },
      start: { icon: 'mdi:rocket-launch-outline', label: 'Start', color: 'primary' },
      pleno: { icon: 'mdi:star-circle-outline', label: 'Pleno', color: 'success' },
      premium: { icon: 'mdi:star-circle-outline', label: 'Premium', color: 'warning' },
      plus: { icon: 'mdi:star-circle-outline', label: 'Plus', color: 'error' },
    };

    const planoConfig = planoMap[empresaData.planoEmpresa] || {
      icon: 'mdi:star-off-outline',
      label: 'Sem Plano',
      color: 'default',
    };

    planoConfig.tooltipText = `Plano de serviços contratado: ${planoConfig.label}`;
    
    const tributacaoMap = {
      anexo1: { icon: 'mdi:star-circle-outline', label: 'Anexo I', color: 'info' },
      anexo2: { icon: 'mdi:star-circle-outline', label: 'Anexo II', color: 'info' },
      anexo3: { icon: 'mdi:star-circle-outline', label: 'Anexo III', color: 'info' },
      anexo4: { icon: 'mdi:star-circle-outline', label: 'Anexo IV', color: 'info' },
      anexo5: { icon: 'mdi:star-circle-outline', label: 'Anexo V', color: 'info' },
      simei: { icon: 'mdi:star-circle-outline', label: 'SIMEI', color: 'info' },
      autonomo: { icon: 'mdi:star-circle-outline', label: 'Autônomo', color: 'info' },
    };

    const tributacaoConfigs =
      empresaData.tributacao && Array.isArray(empresaData.tributacao)
        ? empresaData.tributacao.map(
            (tributo) =>
              tributacaoMap[tributo] || {
                icon: 'mdi:help-circle-outline',
                label: `Tributo: ${tributo}`,
                color: 'default',
              }
          )
        : [];

    return { statusConfig, regimeConfig, planoConfig, tributacaoConfigs };
  }, [empresaData]);

  if (loading) {
    return (
      <SimplePaper>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Stack>
      </SimplePaper>
    );
  }

  if (!empresaData) {
    return (
      <SimplePaper>
        <Typography variant="body1" color="error">
          Não foi possível carregar os dados da empresa.
        </Typography>
      </SimplePaper>
    );
  }

  return (
    // 5. Envolve todo o componente com LazyMotion
    <LazyMotion features={domAnimation}>
      <Box sx={{ position: 'relative' }}>
        <Card
          sx={{ borderRadius: 3,boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.15)}`  }}
        >
          {/* CABEÇALHO */}
          <CardContent
            sx={{
              p: 4,
              bgcolor: 'background.neutral',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                  >
                  {empresaData.razaoSocial}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {empresaData.nome || 'Nome Fantasia não informado'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <InfoChip {...chipData.statusConfig} />
                <InfoChip {...chipData.regimeConfig} />
                <InfoChip {...chipData.planoConfig} />
                {chipData.tributacaoConfigs.map((config) => (
                  <InfoChip key={config.label} {...config} />
                ))}
              </Stack>
            </Stack>
          </CardContent>

          <CustomDivider />

          {/* SEÇÃO 1: DADOS CADASTRAIS E CONTATO */}
          <Section icon="mdi:office-building-outline" title="Dados Cadastrais e Contato">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack divider={<CustomDivider />}>
                  <InfoRow
                    icon="mdi:card-account-details-outline"
                    label="CNPJ"
                    value={formatCNPJ(empresaData.cnpj)}
                    isCopyable
                  />
                  <InfoRow 
                    icon="mdi:pound" 
                    label="Código" 
                    value={empresaData.codigo} 
                    isCopyable 
                  />
                  <InfoRow
                    icon="mdi:file-document-outline"
                    label="Inscrição Estadual"
                    value={empresaData.ie}
                    isCopyable
                  />
                  <InfoRow
                    icon="mdi:file-document-outline"
                    label="Inscrição Municipal"
                    value={empresaData.im}
                    isCopyable
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack divider={<CustomDivider />}>
                  <InfoRow
                    icon="mdi:email-outline"
                    label="Email Principal"
                    value={(empresaData.email).toLowerCase()}
                    isCopyable
                  />
                  <InfoRow
                    icon="mdi:whatsapp"
                    label="WhatsApp"
                    value={empresaData.whatsapp}
                    isCopyable
                  />
                  <InfoRow
                    icon="mdi:phone-outline"
                    label="Telefone Comercial"
                    value={empresaData.telefoneComercial}
                    isCopyable
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ mt: 2, mb: 1.5, px: 2, color: 'text.secondary', fontWeight: 600 }}
                >
                  Endereços
                </Typography>
                <Stack divider={<CustomDivider />}>
                  {empresaData.endereco?.length > 0 ? (
                    empresaData.endereco.map((end, i) => <AddressDisplay key={i} endereco={end} />)
                  ) : (
                    <EmptyState
                      icon="mdi:map-marker-off-outline"
                      text="Nenhum endereço cadastrado"
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Section>

          <CustomDivider />

          {/* SEÇÃO 2: ATIVIDADES */}
          <Section icon="mdi:briefcase-outline" title="Atividades da Empresa">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ActivitySection
                  title="Atividade Principal"
                  activities={empresaData.atividade_principal}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ActivitySection
                  title="Atividades Secundárias"
                  activities={empresaData.atividades_secundarias}
                  color="secondary"
                />
              </Grid>
            </Grid>
          </Section>

          <CustomDivider />

          {/* SEÇÃO 3: QUADRO SOCIETÁRIO */}
          <Section icon="solar:users-group-rounded-bold-duotone" title="Quadro Societário">
            {empresaData.socios?.length > 0 ? (
              <Grid container spacing={2}>
                {empresaData.socios.map((socio, index) => (
                  <MotionGrid
                    key={index}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <SocioCard socio={socio} />
                  </MotionGrid>
                ))}
              </Grid>
            ) : (
              <EmptyState
                icon="solar:users-group-rounded-bold-duotone"
                text="Nenhum sócio cadastrado"
              />
            )}
          </Section>
        </Card>

        {/* Botão Flutuante para Ações */}
        <Fab
          color="primary"
          aria-label="edit"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => toast.info('Funcionalidade de edição em desenvolvimento!')}
        >
          <Iconify icon="mdi:pencil-outline" />
        </Fab>
      </Box>
    </LazyMotion>
  );
}
