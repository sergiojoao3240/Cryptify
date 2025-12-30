//___________________IMPORTS______________________
// Node Modules
const nodeMailer = require('nodemailer');

// Utils
import ErrorResponse from "../response/errorResponse";

// Email models
import { ConfirmPassswordUpdated } from "./email_models/confirmPasswordUpdated";
import { NewPinMessage } from "./email_models/authPin";
import { SharedPasskey } from "./email_models/sharedPasskey";

// Config
import logger from "../../config/logger";

//___________________IMPORTS______________________


/**
 * @description Function to send emails 
 * @param email 
 * @param subjectB 
 * @param typeMessage 
 * @param _id 
 * @param info 
 */
export async function Email(email: string, subjectB: string, typeMessage: string, _id?: string, info?: any) {
 
    // Check if email is valid
    let valid = ValidateEmail(email);
    if (!valid){
        throw new ErrorResponse("Invalid Email", 400);
    }

    // Criação de um objeto que pode mapear os tipos e mensagens aos respetivos modelos
    // Caso contrário retorna-se um erro
    const messageGenerators: { [key: string]: () => string } = {
        AuthPin: () => NewPinMessage(info),
        ConfirmPassswordUpdated: () => ConfirmPassswordUpdated(),
        SharedPasskey: () => SharedPasskey(info)
    };
    
    const generateHtml = messageGenerators[typeMessage];

    if (!generateHtml) {
        throw new ErrorResponse("Invalid message type", 400);
    }

    const html = generateHtml();

    const transporter = createTransporter()

    //Envio da mensagem
    const data = {
        from: 'noreply.cryptify@gmail.com',
        to: email,
        subject: subjectB,
        html: html
    }

    transporter.sendMail(data, function (error: any) {
        if (error) {
            logger.error(error)
            throw new ErrorResponse(`Error sending an Email`, 500);
        } else {
            logger.info(`Email sent to ${email} with subject: ${subjectB}`);
        }
    });
};


/**
 * @description Function to send files to email
 * @param file 
 * @param filename 
 * @param email 
 */
export async function EmailFile(file: any, filename: string, email: string) {
    
    // Check if email is valid
    let valid = ValidateEmail(email);
    if (!valid){
        throw new ErrorResponse("Invalid Email", 400);
    }

    const transporter = createTransporter()

    // Send Email
    const data = {
        from: 'noreply.cryptify@gmail.com',
        to: email,
        subject: "File with metrics",
        text: 'Attached file.',
        attachments: [
          {
            filename: `${filename}.csv`,
            content: file
          }
        ]
    }

    transporter.sendMail(data, function (error: any) {
        if (error) {
            logger.error(error)
            throw new ErrorResponse(`Error sending an Email`, 500);
        } else {
            logger.info(`Email sent to ${email}.`);
        }
    });
}


/**
 * @description Function to Validate Email
 * @param email 
 * @returns 
 */
function ValidateEmail(email: string): boolean {
    const expression = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const result: boolean = expression.test(email);
    if (!result) {
        return false
    }
    return true
}


/**
 * @description Function to to create transporter to send email
 * @returns 
 */
function createTransporter() {
    // Connection with Google server
    const transporter = nodeMailer.createTransport({
        host: process.env.GMAIL_HOST,
        port: process.env.GMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    return transporter;
}


