const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

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
// Rota para ler o PDF, preencher o cabeçalho e retornar o arquivo
app.post('/api/gerar-ficha', async (req, res) => {
  try {
    const dados = req.body;

    // 1. Carrega o PDF base do projeto
    const pdfBytes = fs.readFileSync(path.join(__dirname, 'D&D 5ed - Ficha Editável.pdf'));
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // 2. Preenche os campos do Cabeçalho (Página 1 e 2)
    // Nota: Os nomes dos campos devem corresponder aos IDs internos do PDF
    if (dados.nomePersonagem) form.getTextField('CharacterName')?.setText(dados.nomePersonagem);
    if (dados.classeNivel) form.getTextField('ClassLevel')?.setText(dados.classeNivel);
    if (dados.antecedente) form.getTextField('Background')?.setText(dados.antecedente);
    if (dados.nomeJogador) form.getTextField('PlayerName')?.setText(dados.nomeJogador);
    if (dados.raca) form.getTextField('Race')?.setText(dados.raca);
    if (dados.alinhamento) form.getTextField('Alignment')?.setText(dados.alinhamento);
    if (dados.xp) form.getTextField('XP')?.setText(dados.xp.toString());

    // Dados de Aparência (Página 2)
    if (dados.idade) form.getTextField('Age')?.setText(dados.idade.toString());
    if (dados.altura) form.getTextField('Height')?.setText(dados.altura);
    if (dados.peso) form.getTextField('Weight')?.setText(dados.peso);
    if (dados.olhos) form.getTextField('Eyes')?.setText(dados.olhos);
    if (dados.pele) form.getTextField('Skin')?.setText(dados.pele);
    if (dados.cabelo) form.getTextField('Hair')?.setText(dados.cabelo);

    // 3. Salva o PDF modificado em memória e envia para o cliente
    const pdfModificadoBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ficha-dnd.pdf');
    return res.send(Buffer.from(pdfModificadoBytes));

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ mensagem: 'Erro ao gerar o arquivo PDF da ficha.' });
  }
});

app.listen(PORT, () => {
  console.log(`⚔️ Servidor rodando em http://localhost:${PORT}`);
});