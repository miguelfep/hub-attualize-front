import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

const SECTORS = [
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'societario', label: 'Societário' },
  { value: 'contabil', label: 'Contábil' },
];

const INSTANCE_CONFIG = {
  operacional: {
    name: 'Operacional',
    icon: 'eva:settings-fill',
    color: '#3B82F6',
  },
  'financeiro-comercial': {
    name: 'Financeiro/Comercial',
    icon: 'eva:credit-card-fill',
    color: '#10B981',
  }
};

export function TransferChatModal({ open, onClose, chatId, currentInstance }) {
  const [transferType, setTransferType] = useState('sector');
  const [selectedSector, setSelectedSector] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetInstance, setTargetInstance] = useState('operacional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const transferData = {};
      
      if (transferType === 'sector') {
        if (!selectedSector) {
          setError('Selecione um setor');
          return;
        }
        transferData.targetSector = selectedSector;
      } else {
        if (!targetUserId) {
          setError('Digite o ID do usuário');
          return;
        }
        transferData.targetUserId = targetUserId;
      }

      // Adicionar instância de destino se diferente da atual
      if (targetInstance !== currentInstance) {
        transferData.targetInstance = targetInstance;
      }

      // Aqui você faria a chamada para a API
      console.log('Transferindo chat:', chatId, transferData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao transferir chat');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTransferType('sector');
    setSelectedSector('');
    setTargetUserId('');
    setTargetInstance('operacional');
    setError('');
    onClose();
  };

  const getInstanceChip = (instanceType) => {
    const config = INSTANCE_CONFIG[instanceType];
    
    return (
      <FormControlLabel
        key={instanceType}
        value={instanceType}
        control={<Radio />}
        label={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={config.icon} width={16} sx={{ color: config.color }} />
            <Typography variant="body2">
              {config.name}
            </Typography>
          </Stack>
        }
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:swap-fill" width={24} />
          <Typography variant="h6">Transferir Chat</Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Stack spacing={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Tipo de Transferência</FormLabel>
            <RadioGroup
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
            >
              <FormControlLabel value="sector" control={<Radio />} label="Para Setor" />
              <FormControlLabel value="user" control={<Radio />} label="Para Usuário Específico" />
            </RadioGroup>
          </FormControl>

          <Divider />

          <FormControl component="fieldset">
            <FormLabel component="legend">Instância de Destino</FormLabel>
            <RadioGroup
              value={targetInstance}
              onChange={(e) => setTargetInstance(e.target.value)}
            >
              {getInstanceChip('operacional')}
              {getInstanceChip('financeiro-comercial')}
            </RadioGroup>
          </FormControl>

          {transferType === 'sector' && (
            <FormControl component="fieldset">
              <FormLabel component="legend">Selecionar Setor</FormLabel>
              <RadioGroup
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {SECTORS.map((sector) => (
                  <FormControlLabel
                    key={sector.value}
                    value={sector.value}
                    control={<Radio />}
                    label={sector.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {transferType === 'user' && (
            <TextField
              fullWidth
              label="ID do Usuário"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Digite o ID do usuário de destino"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleTransfer} 
          variant="contained" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Transferir
        </Button>
      </DialogActions>
    </Dialog>
  );
} 