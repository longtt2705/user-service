import { getUserById } from '../users/user.service'

export const getUser = async (req, res) => {
  const { id } = req.params
  const user = await getUserById(id)
  res.json(user)
}

export default {
  getUser,
}
