import { QUEUE_NAME } from 'src/shared/redis-service-key'
import debug from 'src/utils/debug'
import { createMessage, producer, REDIS_NAMESPACE } from '.'

// Producers sections
const createNotiMessage = (type, data) => {
  return createMessage(QUEUE_NAME.NOTIFICATIONS_QUEUE, type, data)
}

export const createNotification = async (data, subscribers) => {
  try {
    producer.produce(
      createNotiMessage(QUEUE_NAME.NOTIFICATIONS_QUEUE, {
        data,
        subscribers,
      }),
      (err) => {
        if (err) throw err
      }
    )
  } catch (err) {
    debug.log(REDIS_NAMESPACE, err)
  }
}
