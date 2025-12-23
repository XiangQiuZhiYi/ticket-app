import { getDB } from '../index'

export const findUsers = async (query = {}) => {
  try {
    const db = getDB()
    return await db.collection('user-list').where(query).get()
  } catch (e) {
    console.warn('findUsers error', e)
    throw e
  }
}

export const findOneUser = async (query = {}) => {
  console.log(query);
  
  const res = await findUsers(query)
  return res && res.data && res.data.length ? res.data[0] : null
}

export const addUser = async (data) => {
  try {
    const db = getDB()
    return await db.collection('user-list').add({
      data: {
        ...data,
        createTime: db.serverDate(),
      },
    })
  } catch (e) {
    console.warn('addUser error', e)
    throw e
  }
}
