// ==========================================
// 1. SISTEMA DE LOGIN E CADASTRO
// ==========================================

// Seleção de Elementos da Tela de Login/Cadastro
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const formTitle = document.getElementById('form-title');
const mensagemDiv = document.getElementById('mensagem');

// Alternância de Telas (Login / Cadastro)
if (showRegisterBtn && showLoginBtn) {
  showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    formTitle.innerText = 'Criar Nova Conta';
    if (mensagemDiv) mensagemDiv.innerText = '';
  });

  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    formTitle.innerText = 'Entrar na Taverna';
    if (mensagemDiv) mensagemDiv.innerText = '';
  });
}

// Submissão do Formulário de Cadastro
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

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

      mensagemDiv.innerText = resData.mensagem;
      mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

      if (response.ok) {
        registerForm.reset();
      }
    } catch (error) {
      console.error('Erro de requisição:', error);
      mensagemDiv.innerText = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      mensagemDiv.style.color = '#f75a68';
    }
  });
}

// Submissão do Formulário de Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

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

      mensagemDiv.innerText = resData.mensagem;
      mensagemDiv.style.color = response.ok ? '#04d361' : '#f75a68';

      if (response.ok) {
        loginForm.reset();
        
        // Redireciona o aventureiro para a home.html
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
}


// ==========================================
// 2. RECURSOS BLOQUEADOS (HOME PAGE)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const disabledLinks = document.querySelectorAll('.nav-item.disabled');
  disabledLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Impede a navegação em links desabilitados
    });
  });
});


// ==========================================
// 3. CRIAÇÃO DE PERSONAGEM & CÁLCULO DE FICHA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const fullForm = document.getElementById('full-character-form');

  // Só executa o código abaixo se estiver na página de criação de personagem
  if (!fullForm) return;

  const formElements = document.querySelectorAll('#full-character-form input, #full-character-form select');
  const helpText = document.getElementById('help-text');
  const helpTitle = document.getElementById('help-title');

  // Mapeamento Oficial de Bônus de Raça no D&D 5e
  const bonusRaciais = {
    'Anão das Colinas': { con: 2, sab: 1 },
    'Anão da Montanha': { con: 2, for: 2 },
    'Elfo Alto': { des: 2, int: 1 },
    'Elfo da Floresta': { des: 2, sab: 1 },
    'Halfling Pies-Leves': { des: 2, car: 1 },
    'Humano': { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    'Draconato': { for: 2, car: 1 },
    'Gnomo das Rochas': { int: 2, con: 1 },
    'Meio-Elfo': { car: 2, des: 1, con: 1 },
    'Meio-Orc': { for: 2, con: 1 },
    'Tiefling': { car: 2, int: 1 }
  };

  // Função para calcular o Modificador de Atributo D&D (ex: 14 -> +2, 8 -> -1)
  const calcMod = (val) => Math.floor((val - 10) / 2);

  // Recalcula totais, modificadores, PV e CA em tempo real
  const recalculaficha = () => {
    const raca = document.getElementById('raca').value;
    const bonus = bonusRaciais[raca] || {};

    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    const totaisCalculados = {};

    attrs.forEach(attr => {
      const baseEl = document.getElementById(`base-${attr}`);
      const base = baseEl ? (parseInt(baseEl.value) || 10) : 10;
      const add = bonus[attr] || 0;
      const total = base + add;
      const mod = calcMod(total);
      
      totaisCalculados[attr] = { total, mod };

      const modText = mod >= 0 ? `+${mod}` : `${mod}`;
      const totalEl = document.getElementById(`total-${attr}`);
      if (totalEl) {
        totalEl.innerText = `Total: ${total} (${modText})`;
      }
    });

    // Nível e Bônus de Proficiência
    const nivelEl = document.getElementById('nivel');
    const nivel = nivelEl ? (parseInt(nivelEl.value) || 1) : 1;
    const profBonus = Math.ceil(1 + (nivel / 4));

    const profBonusEl = document.getElementById('prof-bonus');
    const profBonusTextEl = document.getElementById('prof-bonus-text');
    if (profBonusEl) profBonusEl.innerText = profBonus;
    if (profBonusTextEl) profBonusTextEl.innerText = profBonus;

    // Estimativa de PV (Vida base 8 + Modificador de Constituição)
    const pvEstimado = (8 + totaisCalculados['con'].mod) + ((nivel - 1) * (5 + totaisCalculados['con'].mod));
    const pvEl = document.getElementById('pv-estimado');
    if (pvEl) pvEl.innerText = Math.max(pvEstimado, 1);

    // Estimativa de CA (Classe de Armadura)
    const armaduraEl = document.getElementById('armadura');
    const armadura = armaduraEl ? armaduraEl.value : '';
    let ca = 10 + totaisCalculados['des'].mod; // Sem armadura base

    if (armadura.includes('Couro Batido')) ca = 12 + totaisCalculados['des'].mod;
    else if (armadura.includes('Couro')) ca = 11 + totaisCalculados['des'].mod;
    else if (armadura.includes('Peitoral')) ca = 14 + Math.min(totaisCalculados['des'].mod, 2);
    else if (armadura.includes('Gibeão')) ca = 12 + Math.min(totaisCalculados['des'].mod, 2);
    else if (armadura.includes('Cota de Malha Média')) ca = 13 + Math.min(totaisCalculados['des'].mod, 2);
    else if (armadura.includes('Cota de Anéis')) ca = 14;
    else if (armadura.includes('Cota de Malha Pesada')) ca = 16;
    else if (armadura.includes('Placas')) ca = 18;

    const caEl = document.getElementById('ca-estimada');
    if (caEl) caEl.innerText = ca;
  };

  // Eventos para atualização em tempo real
  ['raca', 'nivel', 'armadura', 'base-for', 'base-des', 'base-con', 'base-int', 'base-sab', 'base-car'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', recalculaficha);
      el.addEventListener('change', recalculaficha);
    }
  });

  // Atualização das mensagens do Guia do Aventureiro (Painel Lateral)
  formElements.forEach(element => {
    const updateHelp = () => {
      const text = element.getAttribute('data-help');
      const label = element.previousElementSibling?.innerText || 'Campo';
      if (text && helpTitle && helpText) {
        helpTitle.innerText = `💡 ${label}`;
        helpText.innerText = text;
      }
    };

    element.addEventListener('focus', updateHelp);
    element.addEventListener('mouseenter', updateHelp);
  });

  // Submissão do Formulário Completo e Download do PDF
  fullForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const classeSel = document.getElementById('classe').value;
    const nivelVal = document.getElementById('nivel').value;

    // Coleta as perícias selecionadas
    const periciasChecked = Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(cb => cb.value);

    const dados = {
      nomePersonagem: document.getElementById('nomePersonagem').value,
      classeNivel: `${classeSel} ${nivelVal}`,
      raca: document.getElementById('raca').value,
      antecedente: document.getElementById('antecedente').value,
      alinhamento: document.getElementById('alinhamento').value,
      nomeJogador: document.getElementById('nomeJogador').value,
      armaPrincipal: document.getElementById('armaPrincipal').value,
      armadura: document.getElementById('armadura').value,
      pericias: periciasChecked,
      forca: document.getElementById('total-for').innerText,
      destreza: document.getElementById('total-des').innerText,
      constituicao: document.getElementById('total-con').innerText,
      inteligencia: document.getElementById('total-int').innerText,
      sabedoria: document.getElementById('total-sab').innerText,
      carisma: document.getElementById('total-car').innerText
    };

    try {
      const response = await fetch('/api/gerar-ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!response.ok) throw new Error('Erro ao gerar o arquivo PDF.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dados.nomePersonagem || 'Aventureiro'}_DnD5e.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Erro ao gerar o PDF: ' + err.message);
    }
  });

  // Dispara o primeiro cálculo automático ao carregar a tela
  recalculaficha();
});