
// Model for Workspace Shared
const NewWorkspaceMessage = (info: string) => {
    const message = `
    
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Workspace Shared with you</title>
        <style>

            body {
                font-family: 'Arial', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: auto;
                background-color: #f9f9f9;
                position: relative;
            }

            .container {
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 600px;
                padding: 40px;
            }

            .container .title{
                font-family: 'Poppins', sans-serif; 
                color: #2C2C54;
                font-size: 20px; 
                text-align: left;
                font-weight: bold;
                left: 20px;
            }

            .content h2 {
                font-family: 'Poppins', sans-serif;
                color: #2C2C54;
                font-size: 26px;
                margin-bottom: 10px;
            }

        .content p {
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                color: #4B4B4B;
                margin-top: 30px;
                margin-bottom: 30px;
            }

            a {
                text-decoration: none !important; 
                color: inherit;
            }

            .activate-btn {
                display: inline-block;
                background-color: #706A65;
                color: #fff !important;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-family: 'Poppins', sans-serif; 
                font-size: 16px;
                font-weight: bold;
                border: none;
                cursor: pointer;
            }

            .footer {
                margin-top: 35px;
            }

            .footer p {
                color: #959BCA;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
            }

            
        </style>
    </head>
    <body>
        <div class="container">  
                <h1 class="title">HTTPost</h1>   
                <div class="content">
                    <h2>New WorkSpace shared with you</h2>
                    <p>You've been added to a workspace called ${info}</p>
                    <a href="#" class="activate-btn">Watch Now</a>
                </div>


            <div class="footer">
                <p>HTTPost</p>
                <p>Copyright © 2025</p>
                <p>Sergio Goncalves</p>
            </div>
        </div>
    </body>
    </html>`;
    
        return message;
}

export { NewWorkspaceMessage }