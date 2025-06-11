//_____________IMPORTS__________________
// Node Modules
import "colors"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

console.log("\n\t--- Cryptify ---")
console.log("\n\t--- Run Mode - " + process.env.NODE_ENV?.cyan + " ---")

/* Import server configurations based on the environment: PRODUCTION or DEVELOPMENT */
if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: `${__dirname}/../server-config/prod-config.env` });
    require('dotenv').config({ path: `${__dirname}/../server-config/prod-config.env` });
}
else {
    dotenv.config({ path: `${__dirname}/../server-config/dev-config.env` });
    require('dotenv').config({ path: `${__dirname}/../server-config/dev-config.env` });
}

const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

//Comunications
import { connectTo_Mongoose } from "./comunications/database/mongoose";

//WebSocket
import { Start_WebSocketServer } from "./comunications/websocket/websocket_Server";

// Utils
import { errorHandler } from "./utils/response/error";

// Routes
import UserRouter from "./routes/userRoute";
import AuthRouter from "./routes/authRoute";
import VaultRouter from "./routes/vaultRoute";
import VaultUserRouter from "./routes/vaultUserRoute";
import CategoryRoute from "./routes/categoryRoute";
import PassKeysRoute from "./routes/passkeysRoute";

//_____________IMPORTS__________________

/* Express Framework import */
const app = express();

/* Create http server */
const server = require("http").createServer(app);

/* Express behind proxy */
app.set("trust proxy", 1);

/* Body Parser */
app.use(express.json({ limit: "300mb" })); /* Body limit is 10kb */
app.use(express.urlencoded({ limit: "300mb", extended: true }));

/* Cookie Parser */
app.use(cookieParser());

/* CORS Configuration */
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));

/* Input Sanitize */
app.use(mongoSanitize());

/* Security Headers */
app.use(helmet());

/** Swagger configuration */
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// // Remove helmet to run on AWS
// app.use('/api-docs', (req: any, res: any, next: any) => { res.removeHeader('Content-Security-Policy'); next(); }, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req: any, res: any, next: any) => {
    let m_colorized: string = req.method
    switch (req.method) {
        case 'GET':
            m_colorized = m_colorized.green
            break;
        case 'POST':
            m_colorized = m_colorized.yellow
            break;
        case 'DELETE':
            m_colorized = m_colorized.red
            break;
        case 'PATCH':
            m_colorized = m_colorized.magenta
            break;
        default:
            m_colorized = m_colorized.blue
            break;
    }
    
    const requestDate = new Date().toLocaleString();

    console.log(`From: ${req.ip}, At: ${requestDate} > Received `.cyan + `${m_colorized}` + ` request at ${req.url}\n`.cyan);
    
    next(); // Call the next middleware in the chain
});


/* Control the number of requests that API can accept */
const limiter = rateLimit({
    windowsMs: 60 * 1000, /* 1min */
    max: 100000
})
app.use(limiter);

/* ROUTES */
app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/vaults", VaultRouter);
app.use("/vaultUser", VaultUserRouter);
app.use("/category", CategoryRoute);
app.use("/passkeys", PassKeysRoute);


/* Error handler middleware */
app.use(errorHandler);


async function openConnections(): Promise<void> {
    /* Start connection with Mongo DB */
    await connectTo_Mongoose(String(process.env.MONGO_URL), String(process.env.MONGO_DB));

}

openConnections().then(async () => {
    /*  Start WebSocket Server to test locally*/
    /* websocket alowed conections - local URL:port (http) and RemoteUrl (https) */
    var ws_urls: Array<string> = [process.env.SV_ADDRESS + ":" + process.env.SV_PORT, String(process.env.SV_ADDRESS_API)];
    await Start_WebSocketServer(server, Number(process.env.SV_PORT), ws_urls);

    server.listen(Number(process.env.SV_PORT), () => {
    console.log(`Express Server Started on port ${process.env.SV_PORT}`.green);
    });

});


export default app;
export { openConnections };