// Aguardar o carregamento completo da página antes de executar o código
document.addEventListener('DOMContentLoaded', function() {
    console.log('🐕 Cãopeão - Sistema iniciado');
    
    // Verificar qual página estamos e inicializar as funcionalidades correspondentes
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.html')) {
        initLoginPage();
    } else if (currentPage.includes('cadastro.html')) {
        initCadastroPage();
    } else if (currentPage.includes('dashboard.html')) {
        initDashboardPage();
    }
});

// === INICIALIZAÇÃO DA PÁGINA DE LOGIN ===
function initLoginPage() {
    console.log('📋 Inicializando página de login');
    
    // Buscar o formulário de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Adicionar evento de submit ao formulário
        loginForm.addEventListener('submit', handleLogin);
    }
}

// === FUNÇÃO PARA PROCESSAR LOGIN ===
async function handleLogin(event) {
    // Prevenir o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();
    
    console.log('🔐 Processando login...');
    
    // Coletar dados do formulário
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        senha: formData.get('senha')
    };
    
    console.log('📨 Dados coletados:', { email: loginData.email });
    
    try {
        // Mostrar estado de carregamento
        showMessage('Fazendo login...', 'info');
        
        // Fazer requisição para o servidor
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        // Converter resposta para JSON
        const result = await response.json();
        
        console.log('📤 Resposta do servidor:', result);
        
        if (result.success) {
            // Login bem-sucedido
            showMessage(result.message, 'success');
            
            // Salvar dados do usuário (em memória para esta sessão)
            // Nota: Em produção, usaria tokens JWT ou sessions mais seguras
            sessionStorage.setItem('user', JSON.stringify(result.usuario));
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // Redirecionar para o dashboard após 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            // Login falhou
            showMessage(result.message, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showMessage('Erro de conexão. Tente novamente.', 'error');
    }
}

// === INICIALIZAÇÃO DA PÁGINA DE CADASTRO ===
function initCadastroPage() {
    console.log('📝 Inicializando página de cadastro');
    
    const cadastroForm = document.getElementById('cadastroForm');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', handleCadastro);
        
        // Adicionar validação em tempo real das senhas
        const senhaInput = document.getElementById('senha');
        const confirmarSenhaInput = document.getElementById('confirmarSenha');
        
        if (confirmarSenhaInput) {
            confirmarSenhaInput.addEventListener('input', validatePasswordMatch);
        }
    }
}

// === FUNÇÃO PARA VALIDAR SE AS SENHAS COINCIDEM ===
function validatePasswordMatch() {
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    
    if (confirmarSenha && senha !== confirmarSenha) {
        confirmarSenhaInput.style.borderColor = 'var(--error-color)';
        confirmarSenhaInput.setCustomValidity('As senhas não coincidem');
    } else {
        confirmarSenhaInput.style.borderColor = '';
        confirmarSenhaInput.setCustomValidity('');
    }
}

// === FUNÇÃO PARA PROCESSAR CADASTRO ===
async function handleCadastro(event) {
    event.preventDefault();
    
    console.log('📝 Processando cadastro...');
    
    // Coletar dados do formulário
    const formData = new FormData(event.target);
    
    // Validar se as senhas coincidem
    const senha = formData.get('senha');
    const confirmarSenha = formData.get('confirmarSenha');
    
    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem', 'error');
        return;
    }
    
    // Preparar dados para envio
    const cadastroData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: senha,
        telefone: formData.get('telefone')
    };
    
    console.log('📨 Dados coletados:', { 
        nome: cadastroData.nome, 
        email: cadastroData.email,
        telefone: cadastroData.telefone 
    });
    
    try {
        // Mostrar estado de carregamento
        showMessage('Criando sua conta...', 'info');
        
        // Fazer requisição para o servidor
        const response = await fetch('/api/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cadastroData)
        });
        
        const result = await response.json();
        
        console.log('📤 Resposta do servidor:', result);
        
        if (result.success) {
            // Cadastro bem-sucedido
            showMessage(result.message, 'success');
            
            // Redirecionar para a página de login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            // Cadastro falhou
            showMessage(result.message, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        showMessage('Erro de conexão. Tente novamente.', 'error');
    }
}

// === INICIALIZAÇÃO DO DASHBOARD ===
function initDashboardPage() {
    console.log('🏠 Inicializando dashboard');
    
    // Verificar se o usuário está logado
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        // Se não estiver logado, redirecionar para login
        console.log('⚠️ Usuário não logado, redirecionando...');
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar informações do usuário
    loadUserInfo();
    
    // Configurar botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// === FUNÇÃO PARA CARREGAR INFORMAÇÕES DO USUÁRIO ===
function loadUserInfo() {
    try {
        // Recuperar dados do usuário salvos no sessionStorage
        const userData = sessionStorage.getItem('user');
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // Atualizar elementos da página com os dados do usuário
            const userNameElement = document.getElementById('userName');
            const welcomeMessageElement = document.getElementById('welcomeMessage');
            
            if (userNameElement) {
                userNameElement.textContent = user.nome;
            }
            
            if (welcomeMessageElement) {
                welcomeMessageElement.textContent = `Bem-vindo de volta, ${user.nome.split(' ')[0]}!`;
            }
            
            console.log('👤 Dados do usuário carregados:', { nome: user.nome, email: user.email });
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        handleLogout(); // Se houver erro, fazer logout
    }
}

// === FUNÇÃO PARA PROCESSAR LOGOUT ===
function handleLogout() {
    console.log('🚪 Fazendo logout...');
    
    // Limpar dados da sessão
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    
    // Redirecionar para a página inicial
    window.location.href = 'index.html';
}

// === FUNÇÃO UTILITÁRIA PARA MOSTRAR MENSAGENS ===
function showMessage(message, type = 'info') {
    // Buscar elemento de mensagem na página
    const messageElement = document.getElementById('message');
    
    if (!messageElement) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        return;
    }
    
    // Limpar classes antigas
    messageElement.className = 'message';
    
    // Adicionar nova classe baseada no tipo
    messageElement.classList.add(type);
    
    // Definir o texto da mensagem
    messageElement.textContent = message;
    
    // Mostrar a mensagem
    messageElement.classList.remove('hidden');
    
    // Auto-ocultar mensagens de sucesso e info após 5 segundos
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

// === FUNÇÃO UTILITÁRIA PARA VALIDAR EMAIL ===
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// === FUNÇÃO UTILITÁRIA PARA VALIDAR TELEFONE BRASILEIRO ===
function isValidPhone(phone) {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
}

// === FORMATAÇÃO AUTOMÁTICA DE TELEFONE ===
function formatPhone(input) {
    // Remove tudo que não é dígito
    let phone = input.value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (phone.length >= 6) {
        phone = phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length >= 2) {
        phone = phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    input.value = phone;
}

// === ADICIONAR FORMATAÇÃO AUTOMÁTICA DE TELEFONE ===
document.addEventListener('DOMContentLoaded', function() {
    const telefoneInput = document.getElementById('telefone');
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            formatPhone(this);
        });
    }
});

// === FUNÇÕES DE ANIMAÇÃO E FEEDBACK VISUAL ===

// Adicionar efeito de loading aos botões
function addLoadingToButton(button, originalText) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    
    return function removeLoading() {
        button.disabled = false;
        button.innerHTML = originalText;
    };
}

// Adicionar efeitos visuais aos formulários
function addFormEffects() {
    // Efeito de foco nos inputs
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

// Inicializar efeitos quando a página carregar
document.addEventListener('DOMContentLoaded', addFormEffects);

console.log('✅ Script do Cãopeão carregado com sucesso!');