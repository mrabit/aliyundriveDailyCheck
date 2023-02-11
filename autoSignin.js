/**
 * @name autoSignin.js
 * @author Anonym-w
 * @version 0.1
 */

const fetch = require('node-fetch')
const notify = require('./sendNotify')

const updateAccesssTokenURL = 'https://auth.aliyundrive.com/v2/account/token'
const signinURL = 'https://member.aliyundrive.com/v1/activity/sign_in_list'

const refreshToken = process.env.refreshToken || []
let refreshTokenArray = []

if (Array.isArray(refreshToken)) refreshTokenArray = refreshToken
else if (refreshToken.indexOf('&') > -1)
  refreshTokenArray = refreshToken.split('&')
else if (refreshToken.indexOf('\n') > -1)
  refreshTokenArray = refreshToken.split('\n')
else refreshTokenArray = [refreshToken]

refreshTokenArray = refreshTokenArray.filter(v => v)

if (!refreshTokenArray.length) {
  console.log('未配置refreshToken, 程序终止')
  process.exit(1)
}

// 使用 refresh_token 更新 access_token
function updateAccesssToken(queryBody) {
  return fetch(updateAccesssTokenURL, {
    method: 'POST',
    body: JSON.stringify(queryBody),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(d => {
      const errorMessage = ['更新 access_token 失败']
      const { code, nick_name, refresh_token, access_token } = d
      if (code) {
        if (
          code === 'RefreshTokenExpired' ||
          code === 'InvalidParameter.RefreshToken'
        )
          errorMessage.push('refresh_token 已过期或无效')
        else errorMessage.push(message)
        return Promise.reject(errorMessage.join(','))
      }
      return access_token
    })
}

//签到
function sign_in(queryBody, access_token) {
  return fetch(signinURL, {
    method: 'POST',
    body: JSON.stringify(queryBody),
    headers: {
      Authorization: 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(json => {
      if (!json.success) {
        return Promise.reject('签到失败')
      }

      const successMessage = ['签到成功']

      const { signInLogs, signInCount } = json.result
      const signedArray = signInLogs.filter(v => v.status === 'normal') // 已签到信息组
      const currentSignInfo = signedArray[signedArray.length - 1] // 当天签到信息

      successMessage.push(`本月累计签到 ${signInCount} 天`)

      //   当天签到是否有奖励
      if (currentSignInfo.reward)
        successMessage.push(`本次签到获得${currentSignInfo.notice}`)

      return successMessage.join(',')
    })
    .catch(err => console.log(err))
}

!(async () => {
  const message = []
  for await (refresh_token of refreshTokenArray) {
    const queryBody = {
      grant_type: 'refresh_token',
      refresh_token
    }
    try {
      const access_token = await updateAccesssToken(queryBody)
      const successMessage = await sign_in(queryBody, access_token)
      console.log(successMessage)
      console.log('\n')
      message.push(successMessage)
    } catch (e) {
      console.log(e)
      console.log('\n')
      message.push(e)
    }
  }
  await notify.sendNotify(`阿里云盘签到`, message.join('\n'))
})()
