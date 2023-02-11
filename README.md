# autoSigninAliyun
阿里云盘的自动签到脚本，青龙，js

# 第一步：获取 refresh_token
1. 网页登录阿里云盘官网 https://www.aliyundrive.com/drive
2. 按F12，进入开发者工具模式，在顶上菜单栏点 Application ，然后在左边菜单找到 Local storage 下面的 https://www.aliyundrive.com 这个域名，点到这个域名会看到有一个 token 选项，再点 token ，就找到 refresh_token 了
![img.png](img.png)
# 第二步：js里的 refreshToeknArry 值改为 refresh_token 值，支持多账号
const refreshToeknArry = [
"",
""
]

# 第三步：青龙里创建自动任务
1. 脚本里加上
2. 创建任务
   1. 阿里云盘自动签到
   2. task autoSignin.js
   3. 0 3 0 * * ?
