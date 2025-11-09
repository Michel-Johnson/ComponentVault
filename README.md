# ComponentVault
这是一个管理电子元件的软件，采用网站来作为UI交互，可以将数据存储到本地。目前支持Linux系统部署。
该软件通过Replit生成，已经具备基本功能，满足作者日常使用，后续不再维护。

## 配置教程

### 使用系统：Ubuntu 24.04

1. 下载github的仓库源码

2. 在ubuntu中安装好以下配置
   注意：nodejs版本要高于20

   ```shell
   sudo apt install npm
   npm install -g tsx	#如果有报错，再执行这一行，或者去检查nodejs版本
   ```

3. 运行：`npm run dev`

浏览器中输入`localhost:5000`，即可运行

### 使用系统：Windows 11

1. 下载github的仓库源码
2. 下载nodejs，要求版本大于20,，可以参考[Node.js 下载安装与环境配置全流程](https://blog.csdn.net/Natsuago/article/details/145567734)
3. 修改package.json中的

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts"
}
```

3. 修改server文件夹中的index.ts
   将

   ```ts
   server.listen({
     port,
     host: "0.0.0.0",
     reusePort: true,
   }, () => {
     log(`serving on port ${port}`);
   });
   ```

   修改为：

   ```ts
   server.listen(port, () => {
     log(`serving on port ${port}`);
   });
   ```

4. 运行：`npm run dev`

- 如果出现：“在此系统上禁止运行脚本”
  SecurityError: ( ) [], PSSecurityException
  FullyQualifiedErrorId : UnauthorizedAccess 
  这个问题很简单，请借助AI去解决，因为涉及到安全性问题，这里不提供代码

- 如果无法识别cross-env,请安装cross-env:   `npm install --save-dev cross-env`   执行`npm list cross-env`检查安装是否成功

浏览器中输入`localhost:5000`，即可运行

此外，我在windows中写了一个脚本，在项目中它是ComponentVault.txt文件，你需要将`cd /d "D:\components_vault\ComponentVault"`修改为你自己的路径，然后将后缀改为.bat，即可运行。点击就能直接跳出浏览器页面。图标也在仓库中，命名为ComponentVault.ico


