/*
cron "0 9 * * *" autoSignin.js, tag=阿里云盘签到
*/

const axios = require('axios')
const { initInstance, getEnv, updateCkEnv } = require('./qlApi.js')
const notify = require('./sendNotify')

const updateAccesssTokenURL = 'https://auth.aliyundrive.com/v2/account/token'
const signinURL = 'https://member.aliyundrive.com/v1/activity/sign_in_list'

// 使用 refresh_token 更新 access_token
function updateAccesssToken(queryBody, remarks) {
  return axios(updateAccesssTokenURL, {
    method: 'POST',
    data: queryBody,
    headers: { 'Content-Type': 'application/json' }
  })
    .then(d => d.data)
    .then(d => {
      const errorMessage = [remarks, '更新 access_token 失败']
      const { code, message, nick_name, refresh_token, access_token } = d
      if (code) {
        if (
          code === 'RefreshTokenExpired' ||
          code === 'InvalidParameter.RefreshToken'
        )
          errorMessage.push('refresh_token 已过期或无效')
        else errorMessage.push(message)
        return Promise.reject(errorMessage.join(', '))
      }
      return { nick_name, refresh_token, access_token }
    })
}

//签到
function sign_in(queryBody, access_token, remarks) {
  return axios(signinURL, {
    method: 'POST',
    data: queryBody,
    headers: {
      Authorization: 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    }
  })
    .then(d => d.data)
    .then(json => {
      const sendMessage = [remarks]
      if (!json.success) {
        sendMessage.push('签到失败')
        return Promise.reject(sendMessage.join(', '))
      }

      sendMessage.push('签到成功')

      const { signInLogs, signInCount } = json.result
      const signedArray = signInLogs.filter(v => v.status === 'normal') // 已签到信息组
      const currentSignInfo = signedArray[signedArray.length - 1] // 当天签到信息

      sendMessage.push(`本月累计签到 ${signInCount} 天`)

      //   当天签到是否有奖励
      if (currentSignInfo.reward)
        sendMessage.push(
          `本次签到获得${currentSignInfo.reward.name}${currentSignInfo.reward.description}`
        )

      return sendMessage.join(', ')
    })
    .catch(err => console.log(err))
}

// 获取环境变量
async function getRefreshToken() {
  let instance = null
  try {
    instance = await initInstance()
  } catch (e) {}

  let refreshToken =
    (instance && (await getEnv(instance, 'refreshToken'))) ||
    process.env.refreshToken ||
    []
  let refreshTokenArray = []

  if (Array.isArray(refreshToken)) refreshTokenArray = refreshToken
  else if (refreshToken.indexOf('&') > -1)
    refreshTokenArray = refreshToken.split('&')
  else if (refreshToken.indexOf('\n') > -1)
    refreshTokenArray = refreshToken.split('\n')
  else refreshTokenArray = [refreshToken]

  if (!refreshTokenArray.length) {
    console.log('未配置refreshToken, 程序终止')
    process.exit(1)
  }

  return {
    instance,
    refreshTokenArray
  }
}

!(async () => {
  const { instance, refreshTokenArray } = await getRefreshToken()

  const message = []
  let index = 1
  for await (refreshToken of refreshTokenArray) {
    let remarks = refreshToken.remarks || `账号${index}`
    const queryBody = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken.value || refreshToken
    }
    try {
      const { nick_name, refresh_token, access_token } =
        await updateAccesssToken(queryBody, remarks)

      if (nick_name && nick_name !== remarks)
        remarks = `${nick_name}(${remarks})`

      // 更新环境变量
      instance &&
        (await updateCkEnv(instance, {
          id: refreshToken.id,
          name: refreshToken.name,
          value: refresh_token,
          remarks: refreshToken.remarks || nick_name // 优先存储原有备注信息
        }))

      const sendMessage = await sign_in(queryBody, access_token, remarks)
      console.log(sendMessage)
      console.log('\n')
      message.push(sendMessage)
    } catch (e) {
      console.log(e)
      console.log('\n')
      message.push(e)
    }
    index++
  }
  await notify.sendNotify(`阿里云盘签到`, message.join('\n'))
})()
