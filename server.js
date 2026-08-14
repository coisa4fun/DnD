const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// "Banco de dados" em memória para testes
const usuarios = [];

// Rota de Cadastro
app.post('/api/cadastrar', (req, res) => {
  const { nomeReal, usuario, senha, dicaSenha } = req.body;

  if (!nomeReal || !usuario || !senha || !dicaSenha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
  }

  const usuarioExiste = usuarios.find(u => u.usuario === usuario);
  if (usuarioExiste) {
    return res.status(400).json({ mensagem: 'Nome de usuário já está em uso.' });
  }

  usuarios.push({ nomeReal, usuario, senha, dicaSenha });
  return res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
});

// Rota de Login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  const conta = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!conta) {
    return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
  }

  return res.status(200).json({ 
    mensagem: 'Login realizado com sucesso!', 
    usuario: { nomeReal: conta.nomeReal, usuario: conta.usuario } 
  });
});

app.listen(PORT, () => {
  console.log(`⚔️ Servidor rodando em http://localhost:${PORT}`);
});