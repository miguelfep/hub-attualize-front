import axios from 'axios';

export const getAllCnaes = () =>
  axios.get('http://localhost:4000/superadmin/cnae/all', {
    headers: { 'Content-Type': 'application/json' },
  });

export const openMEI = (params) =>
  axios.post('http://localhost:4000/atlantis/enterpriseopen/create', params, {
    headers: { 'Content-Type': 'application/json' },
  });
