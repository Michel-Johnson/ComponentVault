# ComponentVault

------

**Read this in other languages: [English](README.md), [中文](README_zh.md).**

This is a software for managing electronic components, using a local website as the UI interaction, and capable of storing data locally. Currently, it supports Linux(Ubuntu) and Windows system deployment.
This software was generated via Replit and already possesses basic functionalities, meeting the author's daily usage needs. It will not be maintained further.

## Configuration Tutorial

### System: Ubuntu 24.04

1. Download the source code from the GitHub repository.

2. Install the following configurations in Ubuntu.
   Note: Node.js version must be higher than 20.

   ```shell
   sudo apt install npm
   npm install -g tsx # If there's an error, just execute this line , or check the Node.js version.
   ```

3. Run: `npm run dev`

Enter `localhost:5000` in your browser to run the application.

### System: Windows 11

1. Download the source code from the GitHub repository.
2. Download Node.js, requiring a version greater than 20. You can refer to [How to Install Node.js in Windows 11: A Step-by-Step Guide - Solve Your Tech](https://www.solveyourtech.com/how-to-install-node-js-in-windows-11-a-step-by-step-guide/)
3. Modify `package.json` as follows:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts"
}
```

3. Modify `index.ts` in the `server` folder.
   Change:

   ```ts
   server.listen({
     port,
     host: "0.0.00",
     reusePort: true,
   }, () => {
     log(`serving on port ${port}`);
   });
   ```

   To:

   ```ts
   server.listen(port, () => {
     log(`serving on port ${port}`);
   });
   ```

4. Run: `npm run dev`

- If you encounter: "Running scripts is disabled on this system"
  SecurityError: ( ) [], PSSecurityException
  FullyQualifiedErrorId : UnauthorizedAccess

  This issue is straightforward; please use GPT to resolve it, as it involves security concerns, and code will not be provided here.

- If `cross-env` is not recognized, please install cross-env: `npm install --save-dev cross-env`. Execute `npm list cross-env` to check if the installation was successful.

Enter `localhost:5000` in your browser to run the application.

Additionally, I have written a script for Windows, which is named `ComponentVault.txt` in the project. You need to change `cd /d "D:\components_vault\ComponentVault"` to your own path, then change the file extension to `.bat` to run it. Clicking it will directly open the browser page. The icon is also in the repository, named `ComponentVault.ico`.

