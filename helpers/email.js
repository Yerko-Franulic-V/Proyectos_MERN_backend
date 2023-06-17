import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {

    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta de Uptask",
        html: `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el sieguiente enlace:

        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
        
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.</p>
        `
    };

    // Informacion del Email
    const info = await transport.sendMail(message)
}

const emailOlvidePassword = async (datos) => {

    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu contraseña",
        text: "Reestablece tu contraseña",
        html: `<p>Hola: ${nombre} has solicitado reestablecer tu contraseña</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:

        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a>
        
        <p>Si tu no solicitaste el email, puedes ignorar el mensaje.</p>
        `
    };

    // Informacion del Email
    const info = await transport.sendMail(message)
}

export { emailRegistro, emailOlvidePassword }