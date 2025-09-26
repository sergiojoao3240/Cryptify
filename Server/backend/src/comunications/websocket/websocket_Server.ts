//_____________IMPORTS____________
import { Server } from "socket.io";
import logger from '../../config/logger';
//_____________IMPORTS____________

export async function Start_WebSocketServer(httpServer: any, sv_port: number, url_strings: Array<string>) {
  const io = new Server(httpServer, {
    cors: {
      origin: url_strings,
      credentials: true,
    },
  });

  /* Event when someone connects to the server by websockets */
  io.on("connection", (socket: any) => {
    logger.info("New socket connection: " + socket.id)

    /* Socket Event while user join */
    socket.on("join", (room: any) => {
      logger.info("Joining on room: " + room);
      socket.join(room);
    });

    /* Socket Event on error*/
    socket.on("connect_error", (error: any) => {
      logger.error("Connection error:", error);
    });

    /* Socket Event on timeout */
    socket.on("connect_timeout", (timeout: any) => {
      logger.error("Connection timeout:", timeout);
    });

    /* Socket Event when user disconnects */
    socket.on("disconnect", () => {
      logger.info("User disconnected: " + socket.id);
    });

    
    /* Socket Event to sending individual messages 
      This event received all microservices messages and redirect the message to the correct event
    */
    socket.on("sendObjectToServer", (data: any) => {
      logger.info("New Object coming: " + data.content);
      const room = data.destination;
      const event = data.event;
      io.to(room).emit(event, data.content);
    });

    logger.info(`WebSocket Server Started with SUCCESS on Express Port`.green);
    url_strings.forEach((element) => {
      logger.info(`\t ${element}`.green);
    });
  });
}