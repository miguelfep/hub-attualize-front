// src/sections/abertura/form-wizard-abertura-view/form-steps-three.jsx

import React from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';

// Importação dos componentes criados

import DefaultComponent from './form-defaultComponent';
import PsicologoComponent from './form-psicologoComponent';

// ----------------------------------------------------------------------

export default function StepThree() {
  const { getValues } = useFormContext();
  const segment = getValues('stepTwo.segment');

  // Mapeamento de segmentos para componentes
  const segmentComponents = {
    teste: PsicologoComponent,
    // Adicione outros mapeamentos conforme necessário
  };

  // Se não houver um componente específico, use o DefaultComponent
  const SegmentComponent = segmentComponents[segment] || DefaultComponent;

  return (
    <Box>
      <SegmentComponent />
    </Box>
  );
}
