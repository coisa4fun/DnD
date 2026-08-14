const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const formTitle = document.getElementById('form-title');
const mensagemDiv = document.getElementById('mensagem');

// Alternar para tela de cadastro
showRegisterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  formTitle.innerText = 'Criar Nova Conta';
  mensagemDiv.innerText = '';
});

// Alternar para tela de login
showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  formTitle.innerText = 'Entrar na Taverna';
  mensagemDiv.innerText = '';
});

// Enviar Cadastro
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nomeReal: document.getElementById('reg-nome').value,
    usuario: document.getElementById('reg-usuario').value,
    senha: document.getElementById('reg-senha').value,
    dicaSenha: document.getElementById('reg-dica').value,
  };

  const response = await fetch('/api/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resData = await response.json();
  mensagemDiv.innerText = resData.mensagem;
  mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

  if (response.ok) {
    registerForm.reset();
  }
});

// Enviar Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    usuario: document.getElementById('login-usuario').value,
    senha: document.getElementById('login-senha').value,
  };

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resData = await response.json();
  mensagemDiv.innerText = resData.mensagem;
  mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

  if (response.ok) {
    loginForm.reset();
  }
});