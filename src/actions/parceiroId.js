import axios from 'axios'

export const getAllCnaes = () =>
  axios.get('https://api.parceiroid.com.br/superadmin/cnae/all', { headers: { 'Content-Type': 'application/json' } })

export const openMEI = params =>
  axios.post('https://api.parceiroid.com.br/atlantis/enterpriseopen/create', params, {
    headers: { 'Content-Type': 'application/json' }
  })