import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContactEditModal({ 
  contact, 
  onClose, 
  onSave, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    instanceType: 'operacional',
    tags: [],
    notes: '',
    clienteId: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        whatsappNumber: contact.whatsappNumber || '',
        instanceType: contact.instanceType || 'operacional',
        tags: contact.tags || [],
        notes: contact.notes || '',
        clienteId: contact.clienteId?._id || ''
      });
    }
  }, [contact]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    onSave(contact?._id, formData);
  };

  const isEditing = !!contact?._id;

  return (
    <Dialog 
      open 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEditing ? 'Editar Contato' : 'Novo Contato'}
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* Nome */}
          <TextField
            fullWidth
            label="Nome"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          {/* Número do WhatsApp */}
          <TextField
            fullWidth
            label="Número do WhatsApp"
            value={formData.whatsappNumber}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            required
            disabled={isEditing}
            helperText={isEditing ? "Número não pode ser alterado" : ""}
          />

          {/* Tipo de instância */}
          <FormControl fullWidth>
            <InputLabel>Tipo de Instância</InputLabel>
            <Select
              value={formData.instanceType}
              label="Tipo de Instância"
              onChange={(e) => handleInputChange('instanceType', e.target.value)}
            >
              <MenuItem value="operacional">Operacional</MenuItem>
              <MenuItem value="financeiro-comercial">Financeiro/Comercial</MenuItem>
            </Select>
          </FormControl>

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                placeholder="Adicionar tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Adicionar
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          {/* Notas */}
          <TextField
            fullWidth
            label="Notas"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Adicione observações sobre este contato..."
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !formData.name || !formData.whatsappNumber}
        >
          {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

```
