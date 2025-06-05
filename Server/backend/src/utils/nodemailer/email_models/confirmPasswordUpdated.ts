
// Model to confirm password updated
const ConfirmPassswordUpdated = () => {
    const message = `
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Password Changed</title>
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
                    <p style="margin: 8px 0 0; color: #ffffff; font-size: 16px;">Encryption Made Simple</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding: 40px 30px 30px;">
                    <h2 style="font-size: 24px; color: #1E2A78; margin-bottom: 20px;">Your Password Has Been Changed</h2>
                    <p style="font-size: 16px; color: #444444; line-height: 1.6;">
                        Hi,<br><br>
                        This is a confirmation that your password was successfully changed.<br><br>
                        If you made this change, no further action is needed.<br><br>
                        If you didn’t request this change, please reset your password immediately or contact our support team.
                    </p>
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

export { ConfirmPassswordUpdated }