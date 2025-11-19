import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function ClienteLeadDialog({
    clientes = [],
    leads = [],
    open,
    action,
    onClose,
    selected,
    onSelect,
    title = 'Clientes e Leads',
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const tabs = useTabs('clientes');

    // Normalizar as listas para garantir que sejam arrays
    const normalizedClientes = useMemo(() => {
        if (Array.isArray(clientes)) return clientes;
        if (clientes?.data && Array.isArray(clientes.data)) return clientes.data;
        if (clientes?.clientes && Array.isArray(clientes.clientes)) return clientes.clientes;
        return [];
    }, [clientes]);

    const normalizedLeads = useMemo(() => {
        if (Array.isArray(leads)) return leads;
        if (leads?.leads && Array.isArray(leads.leads)) return leads.leads;
        if (leads?.data && Array.isArray(leads.data)) return leads.data;
        return [];
    }, [leads]);

    const dataFiltered = useMemo(() => {
        const listaClientes = normalizedClientes.map((c) => ({ ...c, __type: 'cliente' }));
        const listaLeads = normalizedLeads.map((l) => ({ ...l, __type: 'lead' }));

        if (!searchQuery) {
            return tabs.value === 'clientes' ? listaClientes : listaLeads;
        }

        const termo = searchQuery.toLowerCase().trim();

        return [...listaClientes, ...listaLeads]
            .filter((item) => {
                const dadosCombinados = `${item.nome} ${item.razaoSocial} ${item.cnpj} ${item.email} ${item.telefone || ''} ${item.whatsapp || ''}`;
                return dadosCombinados.toLowerCase().includes(termo);
            })
            .sort((a, b) => {
                const aComeca = a.nome?.toLowerCase().startsWith(termo);
                const bComeca = b.nome?.toLowerCase().startsWith(termo);
                return (bComeca ? 1 : 0) - (aComeca ? 1 : 0);
            });
    }, [searchQuery, tabs.value, normalizedClientes, normalizedLeads]);

    const notFound = !dataFiltered.length && !!searchQuery;

    const handleSearch = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    const handleSelect = useCallback(
        (item) => {
            onSelect(item);
            setSearchQuery('');
            onClose();
        },
        [onClose, onSelect]
    );

    const handleTabChange = useCallback(
        (event, newValue) => {
            tabs.onChange(event, newValue);
            setSearchQuery('');
        },
        [tabs]
    );

    const renderList = (
        <Scrollbar sx={{ p: 0.5, maxHeight: 480 }}>
            {dataFiltered.map((item) => {
                const itemId = item._id || item.id;
                const isLead = item.__type === 'lead';
                const isCliente = item.__type === 'cliente';

                return (
                    <ButtonBase
                        key={itemId}
                        onClick={() => handleSelect(item)}
                        sx={{
                            py: 1,
                            my: 0.5,
                            px: 1.5,
                            gap: 0.5,
                            width: 1,
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            ...(selected?.(`${itemId}`) && {
                                bgcolor: 'action.selected',
                            }),
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ width: 1 }}>
                            <Typography variant="subtitle2">
                                {item.nome}
                            </Typography>
                            {searchQuery && (
                                <Chip
                                    size="small"
                                    label={isLead ? 'Lead' : 'Cliente'}
                                    color={isLead ? 'info' : 'primary'}
                                    variant="soft"
                                    sx={{ height: 20, fontSize: '0.6875rem' }}
                                />
                            )}
                        </Stack>

                        {item.razaoSocial && (
                            <Box sx={{ color: 'primary.main', typography: 'caption' }}>
                                {item.razaoSocial}
                            </Box>
                        )}

                        {item.cnpj && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.cnpj}
                            </Typography>
                        )}

                        {/* Mostrar whatsapp para clientes e telefone para leads */}
                        {isCliente && item.whatsapp && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.whatsapp}
                            </Typography>
                        )}

                        {isLead && item.telefone && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.telefone}
                            </Typography>
                        )}

                        {item.email && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.email}
                            </Typography>
                        )}
                    </ButtonBase>
                );
            })}
        </Scrollbar>
    );

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 3, pr: 1.5 }}
            >
                <Typography variant="h6">{title}</Typography>

                {action && action}
            </Stack>

            <Stack sx={{ p: 2, pt: 0, pb: 0 }}>
                <TextField
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Buscar..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>

            <Stack sx={{ px: 2, pt: 2 }}>
                <CustomTabs value={tabs.value} onChange={handleTabChange} variant="fullWidth">
                    <Tab label="Clientes" value="clientes" />
                    <Tab label="Leads" value="leads" />
                </CustomTabs>
            </Stack>

            {notFound ? (
                <SearchNotFound query={searchQuery} sx={{ px: 3, pt: 5, pb: 10 }} />
            ) : (
                renderList
            )}
        </Dialog>
    );
}

function applyFilter({ inputData, query, type }) {
    // Garantir que inputData seja sempre um array
    const data = Array.isArray(inputData) ? inputData : [];

    if (!query) {
        return data;
    }

    const queryLower = query.toLowerCase();

    return data.filter((item) => {
        const nomeMatch = item.nome?.toLowerCase().indexOf(queryLower) !== -1;
        const razaoSocialMatch = item.razaoSocial?.toLowerCase().indexOf(queryLower) !== -1;
        const cnpjMatch = item.cnpj?.toLowerCase().indexOf(queryLower) !== -1;
        const emailMatch = item.email?.toLowerCase().indexOf(queryLower) !== -1;

        // Para clientes, buscar em whatsapp
        // Para leads, buscar em telefone
        const telefoneMatch =
            type === 'lead'
                ? item.telefone?.toLowerCase().indexOf(queryLower) !== -1
                : item.whatsapp?.toLowerCase().indexOf(queryLower) !== -1;

        return nomeMatch || razaoSocialMatch || cnpjMatch || emailMatch || telefoneMatch;
    });
}
