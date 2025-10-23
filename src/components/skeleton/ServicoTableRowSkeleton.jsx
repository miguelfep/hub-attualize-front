import { Stack, TableRow, Skeleton, TableCell } from '@mui/material';

export function ServicoTableRowSkeleton() {
  return (
    <TableRow hover>
      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
      <TableCell><Skeleton variant="text" /></TableCell>
      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
      <TableCell><Skeleton variant="rounded" width={50} height={22} /></TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="rounded" width={80} height={30} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
