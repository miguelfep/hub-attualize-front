import Chip from '@mui/material/Chip';

import { IR_STATUS_LABELS, IR_STATUS_COLORS } from 'src/actions/ir';

// ----------------------------------------------------------------------

/**
 * Badge colorido exibindo o status de um pedido IR
 * @param {{ status: string, size?: 'small'|'medium' }} props
 */
export default function IrStatusBadge({ status, size = 'small' }) {
  const label = IR_STATUS_LABELS[status] ?? status;
  const color = IR_STATUS_COLORS[status] ?? 'default';

  return <Chip label={label} color={color} size={size} variant="soft" />;
}
