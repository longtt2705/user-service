import { get } from 'lodash'
import { REDIS_SERVICE_KEY } from 'src/shared/constant'
import { QUEUE_NAME } from 'src/shared/redis-service-key'
import debug from 'src/utils/debug'
import { consumer, createMessage, producer, REDIS_NAMESPACE } from '.'
import * as userService from '../users/user.service'
const ADS_SERVICE = REDIS_SERVICE_KEY.MESSAGE.ADS_SERVICE

// Consumers sections
const messageHandler = (message, ack) => {
  const { type, data } = message.getBody()
  debug.log(REDIS_NAMESPACE, type)
  switch (type) {
    case ADS_SERVICE.FACEBOOK_SERVICES.RECEIVE_FACEBOOK_AD_ACCOUNTS:
      updateConnectToFacebook(data)
      ack()
      break
    case ADS_SERVICE.GOOGLE_SERVICES.RECEIVE_GOOGLE_ACCESSIBLE_ACCOUNTS:
      updateConnectToGoogle(data)
      ack()
      break
    default:
      debug.log(REDIS_NAMESPACE, 'Unknown message')
  }
}

export const initAdConsumers = () => {
  consumer.consume(QUEUE_NAME.ADS_USERS_QUEUE, false, messageHandler, (err, isRunning) => {
    if (err) debug.log(REDIS_NAMESPACE, err)
    // the message handler will be started only if the consumer is running
    else
      debug.log(
        REDIS_NAMESPACE,
        `${REDIS_SERVICE_KEY.ADS_SERVICE} Message handler has been registered. Running status: ${isRunning}`
      ) // isRunning === false
  })
}

// Producers sections
const createAdsMessage = (type, data) => {
  return createMessage(QUEUE_NAME.USERS_ADS_QUEUE, type, data)
}

export const sendUpdateConnectToFacebook = async (data) => {
  try {
    producer.produce(
      createAdsMessage(ADS_SERVICE.FACEBOOK_SERVICES.GET_FACEBOOK_AD_ACCOUNTS, data),
      (err) => {
        if (err) throw err
      }
    )
  } catch (err) {
    debug.log(REDIS_NAMESPACE, err)
  }
}

export const sendUpdateConnectToGoogle = async (data) => {
  try {
    producer.produce(
      createAdsMessage(
        REDIS_SERVICE_KEY.MESSAGE.ADS_SERVICE.GOOGLE_SERVICES.GET_GOOGLE_ACCESSIBLE_ACCOUNTS,
        data
      ),
      (err) => {
        if (err) throw err
      }
    )
  } catch (err) {
    debug.log(REDIS_NAMESPACE, err)
  }
}

export const updateConnectToFacebook = async (data) => {
  const { user, fbUserId, longLiveAccessToken, adAccounts, name, picture } = data
  await userService.connectToFacebook(user.id, {
    userId: fbUserId,
    accessToken: longLiveAccessToken,
    adAccounts,
    information: {
      name,
      picture,
    },
  })
}

export const updateConnectToGoogle = async (data) => {
  const { googleAdAccounts, user, userId, information, token } = data
  /**
   * The data will be in shape
   * {
   *  7508956962 (logged in user): [
   *   {
   *    descriptive_name: "Test 1"
   *    id: 2609064194
   *    logged_in_customer_id: "7508956962"
   *    resource_name: "customers/7508956962/customerClients/2609064194"
   *   }
   *  ]
   * }
   *
   * => Turn to shape
   * [
   *  {
   *    descriptive_name: "Test 1"
   *    id: 2609064194
   *    logged_in_customer_id: "7508956962"
   *    resource_name: "customers/7508956962/customerClients/2609064194"
   *   }
   * ]
   */
  let adAccounts = []
  Object.values(googleAdAccounts).forEach((value) => {
    adAccounts = adAccounts.concat(value)
  })

  await userService.connectToGoogle(user.id, {
    userId,
    idToken: get(token, 'id_token'),
    refreshToken: get(token, 'refresh_token'),
    adAccounts,
    information,
  })
}
