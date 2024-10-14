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

      // Implementação do envio para o Google Drive
      uploadBtn.onclick = () => {
        uploadToGoogleDrive(blob); // Função que você precisa implementar
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

// Função para enviar o vídeo para o Google Drive (implementar a autenticação e upload)
function uploadToGoogleDrive(blob) {
  // Implementar o upload para o Google Drive
}
