import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { getClientes } from 'src/actions/clientes';
import { addCommentToTask, deleteCommentFromTask } from 'src/actions/kanban';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanDetailsToolbar } from './kanban-details-toolbar';
import { KanbanInputName } from '../components/kanban-input-name';
import { KanbanDetailsPriority } from './kanban-details-priority';
import { KanbanOrcamentosInput } from './kanban-orcamentos-input';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export function KanbanDetails({ task, openDetails, onUpdateTask, onDeleteTask, onCloseDetails }) {
  const tabs = useTabs('geral');
  const [priority, setPriority] = useState(task.prioridade);
  const [taskName, setTaskName] = useState(task.titulo);
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(task.cliente || null);
  const [valorPotencial, setValorPotencial] = useState(task.valorPotencial || '');
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState(task.labels || []); // Novo estado para labels
  const like = useBoolean();
  const contactsDialog = useBoolean();
  const [taskDescription, setTaskDescription] = useState(task.descricao);
  const [comentarios, setComentarios] = useState(task.comentarios || []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };
    fetchClientes();
  }, []);
  
  const rangePicker = useDateRangePicker(
    task.dataFollowUp ? dayjs(task.dataFollowUp) : dayjs(), // Sugere a data atual se `dataFollowUp` estiver indefinida
    task.dataFollowUp ? dayjs(task.dataFollowUp) : dayjs()
  );
  const handleChangeTaskName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleChangeCliente = useCallback((selectedClient) => {
    setCliente(selectedClient); // Define o cliente selecionado
    contactsDialog.onFalse(); // Fecha o diálogo após seleção
  }, [contactsDialog]);


  const handleUpdateTask = useCallback(
    (event) => {
      if (event.key === 'Enter' && taskName) {
        onUpdateTask({ ...task, titulo: taskName });
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangeTaskDescription = useCallback((event) => {
    setTaskDescription(event.target.value);
  }, []);

  const handleChangePriority = useCallback((newValue) => {
    setPriority(newValue);
  }, []);

  // Manipulador para labels múltiplas
  const handleLabelChange = (event) => {
    setLabels(event.target.value);
  };

  // Manipulador para valorPotencial com formatação em real
  const handleValorPotencialChange = (event) => {
    const formattedValue = event.target.value.replace(/\D/g, '');
    setValorPotencial((parseFloat(formattedValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }));
  };

  const handleAddComment = async (newComment) => {
    await addCommentToTask(task.id, newComment);      

  };

  const handleDeleteComment = async (commentId) => {
      await deleteCommentFromTask(task.id, commentId);
  };
  
  const handleSave = async () => {
    setLoading(true);
    

    try {
      await onUpdateTask({
        ...task,
        titulo: taskName,
        descricao: taskDescription,
        prioridade: priority,
        cliente,
        labels,
        dataFollowUp: rangePicker.startDate,
        id: task.id,
        valorPotencial,
      });
      
      toast.success('Tarefa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar a tarefa:', error);
      toast.error('Erro ao atualizar a tarefa');
    } finally {
      setLoading(false);
    }
  };

  const renderToolbar = (
    <KanbanDetailsToolbar
      liked={like.value}
      taskName={task.titulo}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      taskStatus={task.status}
      onClose={onCloseDetails}
    />
  );

  const renderTabs = (
    <CustomTabs value={tabs.value} onChange={tabs.onChange} variant="fullWidth">
      {[
        { value: 'geral', label: 'Dados' },
        { value: 'comentarios', label: `Comentarios (${task.comentarios.length})` },
        { value: 'orcamentos', label: 'Orçamentos' },

      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabOverview = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <KanbanInputName
        placeholder="Nome"
        value={taskName}
        onChange={handleChangeTaskName}
        onKeyUp={handleUpdateTask}
        inputProps={{ id: `input-task-${taskName}` }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Vendedor</StyledLabel>
        <StyledLabel>{task.responsavel}</StyledLabel>
      </Box>

      {/* Assignee */}
      <Box sx={{ display: 'flex' }}>
  <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Cliente</StyledLabel>
  <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
    
    {/* Renderiza o Avatar do cliente se task.cliente estiver definido */}
    {cliente ? (
      <Tooltip title={cliente.nome}>
        <Avatar
          src={cliente.avatarUrl}
          alt={cliente.nome}
        />
      </Tooltip>
    ) : null}

    {/* Botão para adicionar ou alterar cliente */}
    <Tooltip title="Adicionar cliente">
      <IconButton
        onClick={contactsDialog.onTrue}
        sx={{
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
        }}
      >
        <Iconify icon="mingcute:add-line" />
      </IconButton>
    </Tooltip>

    {/* Componente de diálogo para selecionar cliente */}
    <KanbanContactsDialog
      clientes={clientes}
      cliente={cliente} // Passa o cliente atual da tarefa
      handleChangeCliente={handleChangeCliente}
      open={contactsDialog.value}
      onClose={contactsDialog.onFalse}
    />
  </Box>
</Box>

      {/* Multiple Labels Selector */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel>Labels</StyledLabel>
        <Select
          multiple
          value={labels}
          onChange={handleLabelChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {selected.map((label) => (
                <Chip key={label} label={label} size="small" />
              ))}
            </Box>
          )}
          sx={{ minWidth: 200 }}
        >
          {['Site', 'Youtube', 'Instagram', 'Anne Monteiro', 'Outros'].map((label) => (
            <MenuItem key={label} value={label}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      {/* Input para Valor Potencial */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Valor Potencial</StyledLabel>
        <TextField
          fullWidth
          size="small"
          value={valorPotencial}
          onChange={handleValorPotencialChange}
          placeholder="R$ 0,00"
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Data FollowUp</StyledLabel>
        {rangePicker.selected ? (
          <Button size="small" onClick={rangePicker.onOpen}>
            {rangePicker.shortLabel}
          </Button>
        ) : (
          <Tooltip title="Adicionar data de follow-up">
            <IconButton onClick={rangePicker.onOpen}>
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        )}
        <CustomDateRangePicker
          variant="calendar"
          startDate={rangePicker.startDate}
          endDate={rangePicker.endDate}
          onChangeStartDate={rangePicker.onChangeStartDate}
          onChangeEndDate={rangePicker.onChangeEndDate}
          open={rangePicker.open}
          onClose={rangePicker.onClose}
          selected={rangePicker.selected}
          error={rangePicker.error}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Prioridade</StyledLabel>
        <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
      </Box>
      <Box sx={{ display: 'flex' }}>
        <StyledLabel>Descrição</StyledLabel>
        <TextField
          fullWidth
          multiline
          size="small"
          minRows={4}
          value={taskDescription}
          onChange={handleChangeTaskDescription}
          InputProps={{ sx: { typography: 'body2' } }}
        />
      </Box>
    </Box>
  );


  return (
    <Drawer
      open={openDetails}
      onClose={onCloseDetails}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: { xs: 1, sm: 680 } } }}
    >
      {renderToolbar}
      {renderTabs}
      <Scrollbar fillContent sx={{ py: 3, px: 2.5 }}>
        {tabs.value === 'geral' && renderTabOverview}
      </Scrollbar>
      {tabs.value === 'comentarios' && <KanbanDetailsCommentInput comentarios={task.comentarios} onAddComment={handleAddComment}  onDeleteComment={handleDeleteComment}/>}
      {tabs.value === 'orcamentos' && <KanbanOrcamentosInput task={task} />}

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </Box>
    </Drawer>
  );
}
