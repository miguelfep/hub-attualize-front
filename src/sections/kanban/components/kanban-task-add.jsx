import { useMemo, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import { uuidv4 } from 'src/utils/uuidv4';

import { getUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function KanbanTaskAdd({ status, openAddTask, onAddTask, onCloseAddTask }) {
  const [taskName, setTaskName] = useState('');
  const [descricao, setDescription] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const user = getUser();

  const defaultTask = useMemo(
    () => ({
      id: uuidv4(),
      cliente: null,
      titulo: taskName.trim() || 'Untitled',
      descricao,
      status: status || 'prospectando',
      responsavel: responsavel || user.name,
      valorPotencial: null,
      dataCriacao: new Date(),
      dataConclusao: null,
      prioridade: 'média',
      dataFollowUp: null,
      comentarios: [],
      due: null,
      labels: [],
      attachments: [],
    }),
    [taskName, descricao, responsavel, status, user.name]
  );

  const handleChangeName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleKeyUpAddTask = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onAddTask(defaultTask);
        setTaskName('');
      }
    },
    [defaultTask, onAddTask]
  );

  const handleCancel = useCallback(() => {
    setTaskName('');
    onCloseAddTask();
  }, [onCloseAddTask]);

  if (!openAddTask) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleCancel}>
      <div>
        <Paper
          sx={{
            borderRadius: 1.5,
            bgcolor: 'background.default',
            boxShadow: (theme) => theme.customShadows.z1,
          }}
        >
          <InputBase
            autoFocus
            fullWidth
            placeholder="Untitled"
            value={taskName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpAddTask}
            sx={{
              px: 2,
              height: 56,
              [`& .${inputBaseClasses.input}`]: { p: 0, typography: 'subtitle2' },
            }}
          />
        </Paper>

        <FormHelperText sx={{ mx: 1 }}>Aperte Enter para criar a tarefa.</FormHelperText>
      </div>
    </ClickAwayListener>
  );
}
