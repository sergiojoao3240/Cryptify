let socket: any;

/**
 * Function to send data by WebSockets
 *
 * @remarks
 * This function emit all messages to gateway
 *
 * @param data_toSend - The content that you want to send
 * @param destination_room - The destinations of this message
 * @param event - The event to listen 
 *
 */
export const websocketSendData = async (data_toSend: any, destination_room: string, event: string): Promise<boolean> => {
  try {
    let data = {
      content: data_toSend,
      destination: destination_room,
      event: event
    };

    socket.emit("sendObjectToServer", data);
    console.log("Sent Data: " + data.content + "to: " + data.destination);
    return true;
  } catch (error) {
    console.error("Error sending WebSocket Data", error);
    return false;
  }
};
