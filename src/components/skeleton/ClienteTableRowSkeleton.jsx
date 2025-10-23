import { Stack, TableRow, Skeleton, TableCell } from '@mui/material';

export function ClienteTableRowSkeleton() {
  return (
    <TableRow hover>
      <TableCell>
        <Stack spacing={0.5}>
          <Skeleton variant="text" sx={{ width: '60%', fontSize: '1rem' }} />
          <Skeleton variant="text" sx={{ width: '40%', fontSize: '0.8rem' }} />
        </Stack>
      </TableCell>

      <TableCell>
        <Skeleton variant="text" />
      </TableCell>

      <TableCell>
        <Skeleton variant="text" />
      </TableCell>

      <TableCell>
        <Skeleton variant="text" />
      </TableCell>

      <TableCell>
        <Skeleton variant="rounded" width={50} height={22} />
      </TableCell>

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
