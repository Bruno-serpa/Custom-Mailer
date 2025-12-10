const form = document.querySelector('#emailForm');
const loadingScreen = document.getElementById('loading-screen');
const anexoButton = document.getElementById('anexo');
const anexoInput = document.getElementById('anexoInput');
const destinatarioInput = document.querySelector('#destinatario');
const assuntoInput = document.querySelector('#sobre');
const mensagemInput = document.querySelector('#e-html');
const anexosList = document.getElementById('anexos-list');
const tutorialBox = document.querySelector('.tutorial-box');
const imagemSection = document.querySelector('.imagem-section');
const anexosSection = document.querySelector('.anexos-section');
const removerTodosAnexosButton = document.getElementById('remover-todos-anexos');

// Array para armazenar os anexos
const anexos = [];

anexoButton.addEventListener('click', () => {
  if (anexoInput.files.length === 0 && anexos.length === 0) {
    // Se não houver arquivos anexados, exiba a seção de imagem
    anexosSection.style.display = 'none';
    imagemSection.style.display = 'block';
    
  } else {
    // Se houver arquivos anexados, exiba a seção de anexos
    anexosSection.style.display = 'block';
    imagemSection.style.display = 'none';
  }

  // Limpar a seleção de arquivo para permitir que o usuário selecione mais
  anexoInput.value = '';
});

anexoButton.addEventListener('click', () => {
  anexoInput.click();
  if (anexoInput.files.length === 0 && anexos.length === 0) 
  {
    imagemSection.style.display = 'flex';
    imagemSection.style.alignItems = 'center';
    imagemSection.style.justifyContent = 'center';
    imagemSection.style.flexDirection = 'column';
  }
});

anexoInput.addEventListener('change', (event) => {
  const selectedFiles = event.target.files;

  if (selectedFiles.length === 0) {
    anexosSection.style.display = 'none';
    imagemSection.style.display = 'block';
  } else {
    // Se houver arquivos selecionados, exiba a seção de anexos
    anexosSection.style.display = 'block';
    imagemSection.style.display = 'none';

    Array.from(selectedFiles).forEach((file) => {
      // Adicione o arquivo ao array de anexos
      anexos.push(file);

      // Limpar a seleção de arquivo para permitir que o usuário selecione mais
      anexoInput.value = '';
    });

    // Atualize a lista de anexos
    atualizarListaDeAnexos();
  }
});

// Atualiza a lista de anexos na interface
function atualizarListaDeAnexos() {
  anexosList.innerHTML = '';

  anexos.forEach((file) => {
    const fileName = file.name.length > 25 ? file.name.substring(0, 25) + '...' : file.name;
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${fileName}</span>
      <button class="remover-anexo">X</button>
    `;
    anexosList.appendChild(listItem);

    const removerBotoes = listItem.querySelectorAll('.remover-anexo');
    removerBotoes.forEach((removerBotao) => {
      removerBotao.addEventListener('click', () => {
        anexosList.removeChild(listItem);
        const fileName = file.name;
        const index = anexos.findIndex((anexo) => anexo.name === fileName);
        if (index !== -1) {
          anexos.splice(index, 1);
        }

        if (anexos.length === 0) {
          anexosSection.style.display = 'none';
          imagemSection.style.display = 'block';
          }
      });
    });
  });
}

// Ouvinte de evento para o botão "Remover Todos"
removerTodosAnexosButton.addEventListener('click', () => {
  const anexosList = document.getElementById('anexos-list');

  // Remove todos os itens da lista de anexos
  while (anexosList.firstChild) {
    anexosList.removeChild(anexosList.firstChild);
  }

  // Limpa o array de anexos
  anexos.length = 0;

  // Oculta a seção de anexos e exibe a seção de imagem
  anexosSection.style.display = 'none';
  imagemSection.style.display = 'block';
  imagemSection.style.display = 'flex';
  imagemSection.style.alignItems = 'center';
  imagemSection.style.justifyContent = 'center';
  imagemSection.style.flexDirection = 'column';
});

// Função para lidar com o envio de email
async function enviarEmail() {
  event.preventDefault();

  if (!navigator.onLine) {
    alert('Você não possui uma conexão de internet ativa. Verifique sua conexão e tente novamente.');
  } 
  else {
    loadingScreen.style.display = 'flex';
    form.style.pointerEvents = 'none';

    const destinatario = destinatarioInput.value;
    const assunto = assuntoInput.value;
    const mensagem = mensagemInput.value;

    const selectedFiles = anexos;

    const emailData = {
      destinatario,
      assunto,
      mensagem,
      anexos: selectedFiles.map((file) => file.path),
    };

    ipcRenderer.send('enviar-email', emailData);
  }
}

form.addEventListener('submit', enviarEmail);

ipcRenderer.receive('enviar-email-resposta', (resposta) => {
  loadingScreen.style.display = 'none';
  form.style.pointerEvents = 'auto';

  if (resposta.sucesso) {
    setTimeout(() => {
      alert('E-mail enviado com sucesso!!');
      assuntoInput.value = '';
      mensagemInput.value = '';
      anexosList.innerHTML = '';
      anexosSection.style.display = 'none';
      imagemSection.style.display = 'block';
      anexos.length = 0;
    }, 100);
  } else {
    alert('Erro ao enviar o e-mail: ' + resposta.erro);
  }
});

// Atalhos
document.addEventListener('keydown', (event) => {
  // Ctrl ou Command + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    const enviarButton = document.getElementById('enviar-button');
    if (enviarButton) {
      enviarButton.click();
    }
  }
  // Outros atalhos...
});
