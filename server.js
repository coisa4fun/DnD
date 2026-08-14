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

// Rota de Cadastro Aprimorada
app.post('/api/cadastrar', async (req, res) => {
  const { nomeReal, usuario, senha, dicaSenha } = req.body;

  // 1. Validação de campos vazios ou com apenas espaços
  if (!nomeReal?.trim() || !usuario?.trim() || !senha?.trim() || !dicaSenha?.trim()) {
    return res.status(400).json({ mensagem: 'Todos os campos devem ser preenchidos!' });
  }

  // 2. Validação de tamanho mínimo de nick e senha
  if (usuario.length < 3) {
    return res.status(400).json({ mensagem: 'O nome de usuário deve ter pelo menos 3 caracteres.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    // 3. Checa se o usuário já existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('usuario')
      .eq('usuario', usuario)
      .maybeSingle();

    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Já existe um jogador com esse nome de usuário!' });
    }

    // 4. Insere no Supabase
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

    // Se o Supabase retornar um erro, exibimos a mensagem detalhada
    if (error) {
      console.error('Erro detalhado do Supabase:', error);
      return res.status(500).json({ mensagem: `Erro do Banco: ${error.message}` });
    }

    return res.status(201).json({ mensagem: 'Conta criada com sucesso! Você já pode entrar.' });
  } catch (error) {
    console.error('Erro de servidor:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao conectar com o servidor.' });
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