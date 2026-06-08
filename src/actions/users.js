import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getUsersCliente() {
  return axios.get(`${baseUrl}users/cliente`);
}

export async function criarUserCliente({ name, email, password, role, status, empresasId }) {
  return axios.post(`${baseUrl}users/cliente`, { name, email, password, role, status, empresasId });
}

export async function editarUserCliente(usuarioData) {

  console.log("usuarioData dp axios", usuarioData);
  return axios.put(`${baseUrl}users/cliente/${usuarioData.userId}`, {...usuarioData });
}

export async function deletarUserCliente({ id }) {
  return axios.delete(`${baseUrl}users/cliente/${id}`);
}

// ---------------- Usuários Internos ----------------

export async function getUsersInternos() {
  return axios.get(`${baseUrl}users/internos`);
}

export async function criarUserInterno({
  name,
  email,
  password,
  role,
  status,
  setores,
  empresasId,
  empresaAtiva,
}) {
  return axios.post(`${baseUrl}users/internos`, {
    name,
    email,
    password,
    role,
    status,
    setores,
    empresasId,
    empresaAtiva,
  });
}

export async function editarUserInterno(usuarioData) {
  return axios.put(`${baseUrl}users/internos/${usuarioData.userId}`, { ...usuarioData });
}

export async function deletarUserInterno({ id }) {
  return axios.delete(`${baseUrl}users/internos/${id}`);
}

export async function updatePassword({ userId, password, token }) {
  return axios.post(`${baseUrl}users/reset-password`, { password, token });
}

export async function forgotPassword({ email }) {
  return axios.post(`${baseUrl}users/forgot-password`, { email });
}

