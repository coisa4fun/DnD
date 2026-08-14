// Seleção de Elementos do DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const formTitle = document.getElementById('form-title');
const mensagemDiv = document.getElementById('mensagem');

// --- ALTERNÂNCIA DE TELAS ---

// Transição para a tela de Cadastro
showRegisterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  formTitle.innerText = 'Criar Nova Conta';
  mensagemDiv.innerText = '';
});

// Transição para a tela de Login
showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  formTitle.innerText = 'Entrar na Taverna';
  mensagemDiv.innerText = '';
});

// --- SUBMISSÃO DE FORMULÁRIOS ---

// Processar Envio do Cadastro
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Feedback visual enquanto processa
  mensagemDiv.innerText = 'Criando conta...';
  mensagemDiv.style.color = '#e1e1e6';

  const dados = {
    nomeReal: document.getElementById('reg-nome').value,
    usuario: document.getElementById('reg-usuario').value,
    senha: document.getElementById('reg-senha').value,
    dicaSenha: document.getElementById('reg-dica').value,
  };

  try {
    const response = await fetch('/api/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const resData = await response.json();

    // Exibe mensagem vinda da API (Sucesso ou Erro)
    mensagemDiv.innerText = resData.mensagem;
    mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

    // Se o cadastro deu certo, limpa os campos
    if (response.ok) {
      registerForm.reset();
    }
  } catch (error) {
    console.error('Erro de requisição:', error);
    mensagemDiv.innerText = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    mensagemDiv.style.color = '#f75a68';
  }
});

// Processar Envio do Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Feedback visual enquanto processa
  mensagemDiv.innerText = 'Entrando na taverna...';
  mensagemDiv.style.color = '#e1e1e6';

  const dados = {
    usuario: document.getElementById('login-usuario').value,
    senha: document.getElementById('login-senha').value,
  };

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const resData = await response.json();

    // Exibe a mensagem de retorno
    mensagemDiv.innerText = resData.mensagem;
    mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

    if (response.ok) {
      loginForm.reset();
      
      // Redireciona o aventureiro para a home.html após 1 segundo
      setTimeout(() => {
        window.location.href = '/home.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Erro de requisição:', error);
    mensagemDiv.innerText = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    mensagemDiv.style.color = '#f75a68';
  }
});