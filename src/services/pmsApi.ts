import api from '../api'

export async function getAllProperties() {
  const res = await api.get('/properties')
  return res.data
}
