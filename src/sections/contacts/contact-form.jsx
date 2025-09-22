'use client';

import { useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { createContact } from 'src/actions/contacts';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function ContactForm({ onSuccess, onCancel }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    whatsappNumber: '',
    name: '',
    pushName: '',
    instanceType: 'operacional',
    notes: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await createContact(formData);
      if (data.success) {
        toast.success('Contato criado com sucesso!');
        onSuccess?.();
        router.push(paths.dashboard.contacts || '/dashboard/contacts');
      } else {
        toast.error(`Erro ao criar contato: ${  data.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      toast.error('Erro ao criar contato');
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess, router]);

  const handleAddTag = useCallback(() => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
      <Typography variant="h4">Criar Novo Contato</Typography>
      
      <TextField
        label="Número do WhatsApp"
        value={formData.whatsappNumber}
        onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
        required
        fullWidth
        placeholder="5511999999999"
      />

      <TextField
        label="Nome"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Nome do WhatsApp (Push Name)"
        value={formData.pushName}
        onChange={(e) => handleInputChange('pushName', e.target.value)}
        fullWidth
      />

      <FormControl fullWidth required>
        <InputLabel>Instância</InputLabel>
        <Select
          value={formData.instanceType}
          onChange={(e) => handleInputChange('instanceType', e.target.value)}
        >
          <MenuItem value="operacional">Operacional</MenuItem>
          <MenuItem value="financeiro-comercial">Financeiro/Comercial</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Observações"
        value={formData.notes}
        onChange={(e) => handleInputChange('notes', e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      {/* Tags */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Tags</Typography>
        
        <Stack direction="row" spacing={1}>
          <TextField
            label="Adicionar tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            size="small"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            sx={{ flex: 1 }}
          />
          <Button 
            onClick={handleAddTag} 
            variant="outlined" 
            size="small"
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Adicionar
          </Button>
        </Stack>
        
        <Stack direction="row" flexWrap="wrap" spacing={0.5}>
          {formData.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              size="small"
              variant="soft"
            />
          ))}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ flex: 1 }}
        >
          {loading ? 'Criando...' : 'Criar Contato'}
        </Button>
        
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          sx={{ flex: 1 }}
        >
          Cancelar
        </Button>
      </Stack>
    </Stack>
  );
}
