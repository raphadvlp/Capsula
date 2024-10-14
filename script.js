const CLIENT_ID =
  "94983669669-udga96dgah91eichjqtqibnd3hpe1qrg.apps.googleusercontent.com"; // Substitua pelo seu Client ID
const API_KEY = "AIzaSyAqH9zpTa0LPcT385TREIb9I1TeD7XyGCY"; // Substitua pela sua API Key
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const REDIRECT_URI = "https://capsula-sand.vercel.app"; // Ajuste conforme necessário

// Elementos do DOM
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const timerDisplay = document.getElementById("timer");
const uploadBtn = document.getElementById("uploadBtn");
const downloadBtn = document.getElementById("downloadBtn");
const videoPreview = document.getElementById("preview");

let mediaRecorder;
let recordedChunks = [];
let timer;
let secondsLeft = 60;

// Carregar a biblioteca da API do Google
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Inicializar o cliente
async function initClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    scope: SCOPES,
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ],
  });
}

// Função para autenticar o usuário
async function authenticate() {
  try {
    await gapi.auth2.getAuthInstance().signIn();
  } catch (error) {
    console.error("Erro ao autenticar", error);
  }
}

// Função para fazer o upload do vídeo
async function uploadToGoogleDrive(blob) {
  try {
    const fileMetadata = {
      name: "video.webm",
      mimeType: "video/webm",
    };
    const media = {
      mimeType: "video/webm",
      body: blob,
    };

    const response = await gapi.client.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("Arquivo enviado com sucesso:", response);
    alert("Vídeo enviado para o Google Drive com sucesso!"); // Notificação ao usuário
  } catch (error) {
    console.error("Erro ao enviar o arquivo:", error);
    alert("Erro ao enviar o vídeo para o Google Drive.");
  }
}

// Solicitar permissão para acessar a câmera e o microfone
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    videoPreview.srcObject = stream;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      recordedChunks = [];

      const videoURL = URL.createObjectURL(blob);
      videoPreview.src = videoURL;
      downloadBtn.disabled = false;
      uploadBtn.disabled = false; // Habilita o botão de upload após parar a gravação

      // Configure o upload do vídeo após a gravação
      uploadBtn.onclick = async () => {
        await authenticate(); // Autenticar o usuário antes do upload
        uploadToGoogleDrive(blob); // Faça o upload do vídeo
      };
    };
  });

startBtn.onclick = () => {
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  secondsLeft = 60;
  timerDisplay.innerText = secondsLeft;
  timer = setInterval(() => {
    secondsLeft--;
    timerDisplay.innerText = secondsLeft;
    if (secondsLeft <= 0) {
      stopRecording();
    }
  }, 1000);
};

stopBtn.onclick = () => {
  stopRecording();
};

function stopRecording() {
  mediaRecorder.stop();
  clearInterval(timer);
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

downloadBtn.onclick = () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.webm";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  downloadBtn.disabled = true;
};

// Chamar a função para carregar a biblioteca do Google
document.addEventListener("DOMContentLoaded", handleClientLoad);
