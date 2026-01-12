import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getUsersCliente() {
  return axios.get(`${baseUrl}users/cliente`);
}

export async function criarUserCliente({ name, email, password, role, status, empresasId, onboardingsPendentes }) {
  return axios.post(`${baseUrl}users/cliente`, { 
    name, 
    email, 
    password, 
    role, 
    status, 
    empresasId,
    onboardingsPendentes, // Array de IDs de onboardings (em ordem)
  });
}

export async function editarUserCliente(usuarioData) {

  console.log("usuarioData dp axios", usuarioData);
  return axios.put(`${baseUrl}users/cliente/${usuarioData.userId}`, {...usuarioData });
}

export async function deletarUserCliente({ id }) {
  return axios.delete(`${baseUrl}users/cliente/${id}`);
}

export async function updatePassword({ userId, password, token }) {
  return axios.post(`${baseUrl}users/reset-password`, { password, token });
}

export async function forgotPassword({ email }) {
  return axios.post(`${baseUrl}users/forgot-password`, { email });
}

/**
 * Buscar empresas de um usuário (admin)
 * GET /api/users/empresas/:userId
 */
export async function getEmpresasUsuario(userId) {
  return axios.get(`${baseUrl}users/empresas/${userId}`);
}

