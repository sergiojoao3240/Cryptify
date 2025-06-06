export function genMessage (httpCode: number, message: any, newToken?: any) {
    let msg: any = { httpCode };

    if(httpCode >= 400) {
        msg.action = "Failed";
        if (message.response) {
            msg.error = message.response;
        } else {
            msg.error = message.toString();
        }
    } else {
        msg.action = "Success";
        msg.results = message;
        if(newToken){msg.newToken = newToken;}
    }

    return msg;
}