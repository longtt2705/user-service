import { REDIS_SERVICE_KEY } from 'src/shared/constant'
import { QUEUE_NAME } from 'src/shared/redis-service-key'
import debug from 'src/utils/debug'
import { consumer, REDIS_NAMESPACE } from '.'
import { sendRuleNotiEmailToUserById } from '../users/user.service'

const emailMessageHandler = (message, ack) => {
  const { type, data } = message.getBody()
  debug.log(REDIS_NAMESPACE, type)
  switch (type) {
    case REDIS_SERVICE_KEY.QUEUE_NAME.EMAIL_USER_QUEUE:
      sendRuleNotiEmailToUserById(data.userId, data.payload)
      ack()
      break

    default:
      debug.log(REDIS_NAMESPACE, 'Unknown message')
  }
}

export const initEmailConsumer = () => {
  consumer.consume(QUEUE_NAME.EMAIL_USER_QUEUE, false, emailMessageHandler, (err, isRunning) => {
    if (err) debug.log(REDIS_NAMESPACE, err)
    // the message handler will be started only if the consumer is running
    else
      debug.log(
        REDIS_NAMESPACE,
        `${REDIS_SERVICE_KEY.USERS_SERVICE} Message handler has been registered. Running status: ${isRunning}`
      ) // isRunning === false
  })
}
