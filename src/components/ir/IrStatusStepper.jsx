import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import { IR_STATUS_ORDER, IR_STATUS_LABELS } from 'src/actions/ir';

// ----------------------------------------------------------------------

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 12 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.success.main },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 2,
    borderColor: theme.palette.divider,
  },
}));

function formatData(isoString) {
  try {
    return format(parseISO(isoString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '';
  }
}

// ----------------------------------------------------------------------

/**
 * Stepper visual das 6 etapas do pedido IR com datas de transição
 * @param {{ status: string, historicoStatus: Array }} props
 */
export default function IrStatusStepper({ status, historicoStatus = [] }) {
  const activeStep = IR_STATUS_ORDER.indexOf(status);

  // Mapeia cada status para a data em que foi alcançado
  const datasPorStatus = {};
  historicoStatus.forEach((log) => {
    datasPorStatus[log.para] = log.em;
  });
  // O primeiro status (iniciada) usa a data do primeiro log ou da criação
  if (historicoStatus.length > 0 && !datasPorStatus.iniciada) {
    datasPorStatus.iniciada = historicoStatus[0].em;
  }

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      connector={<Connector />}
      sx={{ width: '100%', overflowX: 'auto', py: 1 }}
    >
      {IR_STATUS_ORDER.map((stepStatus, index) => {
        const completed = index < activeStep;
        const active = index === activeStep;
        const dataTransicao = datasPorStatus[stepStatus];

        return (
          <Step key={stepStatus} completed={completed}>
            <StepLabel
              StepIconProps={{
                sx: active
                  ? { color: 'primary.main' }
                  : completed
                    ? { color: 'success.main' }
                    : {},
              }}
            >
              <Stack alignItems="center" spacing={0.25}>
                <Typography
                  variant="caption"
                  fontWeight={active ? 700 : 400}
                  color={active ? 'primary.main' : completed ? 'success.main' : 'text.secondary'}
                >
                  {IR_STATUS_LABELS[stepStatus]}
                </Typography>
                {dataTransicao && (
                  <Box
                    component="span"
                    sx={{ fontSize: 10, color: 'text.disabled', display: 'block', textAlign: 'center' }}
                  >
                    {formatData(dataTransicao)}
                  </Box>
                )}
              </Stack>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
