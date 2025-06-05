
// Model for Alert Messages
const AlertMessage = (email: any) => {
    const message = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Base Server Alert</title>
            <style>
                .grid-container1 {
                    display: grid;
                    grid-template-columns: 10% 90%;
                }
            
                .title {
                    font-family: 'Poppins', sans-serif;
                    font-size: 24px;
                    margin: 5% 10% 0% 2.5%;
                }
            
                .information {
                    font-size: 16px;
                    margin: 0% 10% 0% 2.5%;
                }
                      
                .email {
                    font-size: 18px;
                    margin: 1% 10% 0% 2.5%;
                }
            
                .last {
                    font-size: 22px;
                    margin: 2% 10% 0% 2.5%;
                }
            
            </style>
        </head>
        <body>
        
            <div class="grid-container">
                <div class="grid-item">
                    <div class="title">
                        <b>Alert from Base Server</b>
                    </div>
                </div>
                <br>
                <div class="grid-item">
                    <div class="information">
                        Email: <b>${email}</b>.
                    </div>
                </div>
                <br>
                Note: This is an alert message.
               <br>
               <br>
                <div class="grid-item">
                    <div class="last">
                        Thank you, <sub>Base Server</sub>
                    </div>
                </div>
            </div>
            
        </body>
        </html>`;
    
        return message;
}

export { AlertMessage }