const { app, BrowserWindow, ipcMain } = require('electron');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { version } = require('./package.json');

//---------------------------------------------------- Ler o arquivo de configuração ---------------------------------------------------------------------------

const configPath = path.join(__dirname, 'config.json');
let config;

try {
  const configData = fs.readFileSync(configPath);
  config = JSON.parse(configData);
} catch (error) {
  console.error('Erro ao ler o arquivo de configuração:', error);
}

let email = config.email;
let senha = config.senha;

// --------------------------------------------------------- Janela Principal --------------------------------------------------------------------------

var mainWindow = null;
async function createwindow() {
    const iconPath = path.join(app.getAppPath(), 'src', 'images', 'icon.png');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        titleBarOverlay: true,
        titleBarStyle: 'hidden',
        frame: 'false',
        titleBarOverlay: {
            color: '#eff1f2',
            symbolColor: '#1c1c1c',
            height:35
        },
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'src/pages/main/preload.js')
        },
        icon: iconPath
    });

    await mainWindow.loadFile('src/pages/splash/splash.html');

    // Abrir Devtools
    //mainWindow.webContents.openDevTools({ mode: 'attached' });
}

// ------------------------------------------------------ Criando Janela --------------------------------------------------------------------------

// Quando estiver pronto
app.whenReady().then(createwindow);

// Activete (Mac)
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
        createwindow();
    }
});

app.on('web-contents-created', (e, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      delete webPreferences.preload;
    });
  });

// ---------------------------------------------------------- Ipc Main ------------------------------------------------------------------------

// Envie a versão para o processo de renderização
ipcMain.handle('get-app-version', () => version);

ipcMain.on('enviar-email', (event, emailData) => {
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Ou outro provedor de e-mail
    auth: {
    user: email,
    pass: senha
    }
});

const mailOptions = {
    from: email,
    to: emailData.destinatario,
    subject: emailData.assunto,
    html: emailData.mensagem,
    attachments: emailData.anexos.map((anexo) => ({ path: anexo }))
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Erro ao enviar o e-mail:', error);
        event.sender.send('enviar-email-resposta', { sucesso: false, erro: error.message });
    } else {
        console.log('E-mail enviado: ' + info.response);
        event.sender.send('enviar-email-resposta', { sucesso: true, info: info.response });
    }
});
});
  