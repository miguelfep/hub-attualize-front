import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContactFilters({ 
  filters, 
  onFiltersChange, 
  availableTags = [],
  onClearFilters 
}) {
  const mdUp = useResponsive('up', 'md');

  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        {/* Filtros principais */}
        <Stack 
          direction={mdUp ? 'row' : 'column'} 
          spacing={2} 
          alignItems={mdUp ? 'center' : 'stretch'}
        >
          {/* Busca */}
          <TextField
            fullWidth={!mdUp}
            size="small"
            placeholder="Buscar contatos..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <Iconify 
                  icon="eva:search-fill" 
                  sx={{ color: 'text.disabled', mr: 1 }}
                />
              ),
            }}
            sx={{ minWidth: mdUp ? 300 : 'auto' }}
          />

          {/* Filtro por instância */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Instância</InputLabel>
            <Select
              value={filters.instanceType || 'all'}
              label="Instância"
              onChange={(e) => handleFilterChange('instanceType', e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="operacional">Operacional</MenuItem>
              <MenuItem value="financeiro-comercial">Financeiro/Comercial</MenuItem>
            </Select>
          </FormControl>

          {/* Filtro por cliente */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={filters.hasClient === undefined ? 'all' : filters.hasClient ? 'yes' : 'no'}
              label="Cliente"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  handleFilterChange('hasClient', undefined);
                } else {
                  handleFilterChange('hasClient', value === 'yes');
                }
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="yes">Com Cliente</MenuItem>
              <MenuItem value="no">Sem Cliente</MenuItem>
            </Select>
          </FormControl>

          {/* Botão limpar filtros */}
          <IconButton
            onClick={handleClearFilters}
            color="inherit"
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        {/* Tags */}
        {availableTags.length > 0 && (
          <Stack spacing={1}>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              Tags disponíveis:
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant={filters.tags?.includes(tag) ? 'filled' : 'outlined'}
                  onClick={() => handleTagToggle(tag)}
                  color={filters.tags?.includes(tag) ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
} 