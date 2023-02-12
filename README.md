## 阿里云盘每日签到

基于 [Anonym-w/autoSigninAliyun](https://github.com/Anonym-w/autoSigninAliyun) 实现的阿里云盘每日签到

### TODO

- [x] 阿里云盘签到
- [x] 青龙面板支持
- [ ] github action 支持

### Use 使用

#### 第一步：获取 refresh_token

1. 网页登录阿里云盘官网 https://www.aliyundrive.com/drive
2. 按 F12，进入开发者工具模式，在顶上菜单栏点 Application ，然后在左边菜单找到 Local storage 下面的 https://www.aliyundrive.com 这个域名，点到这个域名会看到有一个 token 选项，再点 token ，就找到 refresh_token 了
   ![img.png](img.png)

#### 第二步：添加依赖项

- node-fetch@2
- axios

#### 第三步：添加环境变量

- refreshToken: 阿里云盘 refresh_token, 添加多个可支持多账户签到
- CLIENT_ID: 可选, 用于青龙面板 API
- CLIENT_SECRET: 可选, 用于青龙面板 API

`CLIENT_ID` 和 `CLIENT_SECRET` 可在 `青龙面板 -> 系统设置 -> 应用设置 -> 新建应用` 新增, 用于自动更新环境变量内 `refreshToken` 配置

#### 第四步：青龙里创建自动任务

```shell
ql repo https://github.com/mrabit/aliyundriveDailyCheck.git "autoSignin" "" "qlApi"
```

可自行调整任务执行时间

### 申明

- 本项目仅做学习交流, 禁止用于各种非法途径
- 项目中的所有内容均源于互联网, 仅限于小范围内学习参考, 如有侵权请第一时间联系 [本项目作者](https://github.com/mrabit) 进行删除

### 鸣谢

#### 特别感谢以下作者及所开发的程序，本项目参考过以下几位开发者代码及思想。

- @Anonym-w: [Anonym-w/autoSigninAliyun](https://github.com/Anonym-w/autoSigninAliyun)
- @ImYrS: [ImYrS/aliyun-auto-signin](https://github.com/ImYrS/aliyun-auto-signin)
