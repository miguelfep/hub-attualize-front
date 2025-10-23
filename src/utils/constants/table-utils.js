function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  // Trata valores que podem não ser strings (ex: fatorR que é boolean)
  const valA = a[orderBy];
  const valB = b[orderBy];

  if (typeof valA === 'boolean' && typeof valB === 'boolean') {
    return valB === valA ? 0 : valB ? 1 : -1;
  }
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

export function applySortFilter({ inputData, order, orderBy }) {
  if (!Array.isArray(inputData)) return [];

  return [...inputData].sort((a, b) => {
    const statusA = a.status === true || a.status === 'true' || a.status === 1;
    const statusB = b.status === true || b.status === 'true' || b.status === 1;
    if (statusA !== statusB) return statusA ? -1 : 1;

    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;

    const valA = a[orderBy] ?? '';
    const valB = b[orderBy] ?? '';
    const dir = order === 'asc' ? 1 : -1;

    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return valA === valB ? 0 : valA ? dir : -dir;
    }

    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });
}

