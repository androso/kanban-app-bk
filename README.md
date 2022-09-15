# Welcome to Express js with Typescript !!
Note: We're using **yarn** instead of npm.

## Development
Hit the Run button to start the server in dev mode. Or run this command in a shell.
``` sh
yarn dev
```
Put your typescript files inside of /src and they will automatically get compiled into javascript inside of /dist.

Under the hood what this command is doing is
<br/>
- Compiling typescript into js.
- Using nodemon to create a server with live updates.

## Production
To start production (and stop using nodemon) you can run:
```sh
yarn start
```
You can also configure the Run button to run this command.
<br/>
Note that this will disable the live updates.
