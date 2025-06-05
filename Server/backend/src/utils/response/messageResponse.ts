export function genMessage (httpCode: number, message: any) {
    let msg: any = { httpCode };

    if(httpCode >= 400) {
        msg.action = "Failed";
        if (message.response.data) {
            msg.error = message.response.data.error;
        } else {
            msg.error = message.toString();
        }
    } else {
        msg.action = "Success";
        msg.results = message;
    }

    return msg;
}