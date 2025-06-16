
// Model for New Pin Messages
const SharedPasskey = (info: any) => {
    const message = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <title>Shared Password - Cryptify</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(to right, #1E2A78, #6C4AB6); font-family: 'Segoe UI', sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td align="center" style="padding: 50px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
                
                <!-- Header -->
                <tr>
                    <td align="center" style="background: linear-gradient(to right, #6C4AB6, #FFD700); padding: 30px;">
                    <h1 style="margin: 0; font-size: 32px; color: #ffffff;">🔐 Cryptify</h1>
                    <p style="margin: 8px 0 0; color: #ffffff; font-size: 16px;">Secure Login Verification</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding: 40px 30px 30px;">
                    <p>Você recebeu uma informação segura. Clique abaixo para abrir:</p>
                    <p><a href="${info}" target="_blank">Acessar agora</a></p>
                    <p>Este link expira em 24 horas ou após ser visualizado.</p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #F5F5F5; padding: 20px 30px; text-align: center;">
                    <p style="color: #888888; font-size: 14px; margin: 0;">&copy; 2025 Cryptify</p>
                    <p style="color: #8A6FE8; font-size: 14px; margin: 5px 0 0;">All rights reserved.</p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>

    </body>
    </html>`;
    
  return message;
}

export { SharedPasskey }