const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurações do Servidor
const app = express();
const PORT = 3000;

// Credenciais do Supabase (Coloque suas chaves do painel aqui)
const SUPABASE_URL = 'https://gerkpqbjviphtotmnrgx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Etkc0BW2kC_2ta93xi10rw_MFZ4tXM7';

// Inicializa o cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota de Cadastro
app.post('/api/cadastrar', async (req, res) => {
  const { nomeReal, usuario, senha, dicaSenha } = req.body;

  if (!nomeReal || !usuario || !senha || !dicaSenha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
  }

  try {
    // 1. Verifica se o nome de usuário já existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('usuario')
      .eq('usuario', usuario)
      .maybeSingle();

    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Nome de usuário já está em uso.' });
    }

    // 2. Insere o novo usuário no banco
    const { error } = await supabase
      .from('usuarios')
      .insert([
        {
          nome_real: nomeReal,
          usuario: usuario,
          senha: senha,
          dica_senha: dicaSenha
        }
      ]);

    if (error) {
      console.error('Erro do Supabase:', error);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário no banco de dados.' });
    }

    return res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
  } catch (error) {
    console.error('Erro na requisição:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ mensagem: 'Preencha usuário e senha!' });
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nome_real, usuario')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
    }

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: { nomeReal: data.nome_real, usuario: data.usuario }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`⚔️ Servidor rodando em http://localhost:${PORT}`);
});