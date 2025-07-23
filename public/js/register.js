document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário já está logado
    if (localStorage.getItem('authToken')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const redirectUrl = userInfo?.roles?.includes('ROLE_ADMIN')
            ? '/views/inicialAdmin.html'
            : '/views/inicial.html';
        window.location.href = redirectUrl;
        return;
    }

    // Configura máscaras para os campos
    $('#cpf').mask('000.000.000-00');
    $('#cnpj').mask('00.000.000/0000-00');
    $('#phone').mask('(00) 00000-0000');

    // Alternar entre Pessoa Física e Jurídica
    document.querySelectorAll('.toggle-option').forEach(button => {
        button.addEventListener('click', function () {
            const logo = document.querySelector('.logo img');
            const isPJ = this.dataset.value === 'pj';

            // Ativa/desativa botões
            document.querySelectorAll('.toggle-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('userType').value = this.dataset.value;

            // Mostra/esconde campos conforme o tipo
            document.getElementById('cpfGroup').style.display = isPJ ? 'none' : 'block';
            document.getElementById('cnpjGroup').style.display = isPJ ? 'block' : 'none';
            document.getElementById('cpf').required = !isPJ;
            document.getElementById('cnpj').required = isPJ;

            // Muda o tema visual
            document.body.classList.toggle('theme-orange', isPJ);
            logo.src = isPJ ? '../public/images/logoAdmin.png' : '../public/images/logo.png';
        });
    });

    // Configura o formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Cria elementos de feedback (spinner e mensagens)
        createFeedbackElements();

        // Adiciona o evento de submit
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }
});

// Cria os elementos de feedback na página
function createFeedbackElements() {
    // Cria o spinner de carregamento se não existir
    if (!document.getElementById('loading-spinner')) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.style.cssText = 'display:none; margin-left:10px;';
        spinner.innerHTML = '⏳'; // Pode ser substituído por um GIF

        // Adiciona o spinner após o botão de submit
        const submitBtn = document.getElementById('registerBtn');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', spinner);
        }
    }

    // Cria o container de mensagens se não existir
    if (!document.getElementById('feedback-messages')) {
        const messagesDiv = document.createElement('div');
        messagesDiv.id = 'feedback-messages';
        messagesDiv.style.cssText = 'margin: 15px 0; min-height: 50px;';

        // Adiciona após o formulário
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.parentNode.insertBefore(messagesDiv, registerForm.nextSibling);
        }
    }
}

// Função principal que lida com o registro
async function handleRegister() {
    // Encontra o botão de submit pelo ID
    const submitBtn = document.getElementById('registerBtn');

    try {
        // Desabilita o botão e mostra o spinner
        if (submitBtn) {
            submitBtn.disabled = true;
            toggleLoading(true);
        }

        // Obtém e valida os dados do formulário
        const formData = getFormData();
        const errors = validateForm(formData);

        // Mostra erros se houver
        if (errors.length > 0) {
            showError(errors.join('<br>'));
            return;
        }

        // Faz a requisição para a API
        const response = await makeApiRequest(formData);

        // Processa a resposta
        if (response.ok) {
            const data = await response.json();
            showSuccess('Registro realizado com sucesso!');
            setTimeout(() => window.location.href = '/views/login.html', 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no registro');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        showError(error.message || 'Erro ao realizar o registro');
    } finally {
        // Reabilita o botão e esconde o spinner
        if (submitBtn) {
            submitBtn.disabled = false;
            toggleLoading(false);
        }
    }
}

// Controla a exibição do spinner
function toggleLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'inline-block' : 'none';
    }
}

// Mostra mensagens de erro
function showError(message) {
    const feedbackDiv = document.getElementById('feedback-messages');
    if (feedbackDiv) {
        feedbackDiv.innerHTML = `<div class="error-message" style="color:red;">${message}</div>`;
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Mostra mensagens de sucesso
function showSuccess(message) {
    const feedbackDiv = document.getElementById('feedback-messages');
    if (feedbackDiv) {
        feedbackDiv.innerHTML = `<div class="success-message" style="color:green;">${message}</div>`;
    }
}

// Obtém os dados do formulário
function getFormData() {
    const userType = document.getElementById("userType").value;
    const isPJ = userType === "pj";

    const data = {
        nome: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("phone").value.replace(/\D/g, ""),
        senha: document.getElementById("password").value,
        confirmarSenha: document.getElementById("confirmPassword").value,
        agreeTerms: document.getElementById("agreeTerms").checked,
        tipo: userType.toUpperCase()
    };

    // Adiciona CPF ou CNPJ conforme o tipo
    if (isPJ) {
        data.cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");
    } else {
        data.cpf = document.getElementById("cpf").value.replace(/\D/g, "");
    }

    return data;
}

// Valida os dados do formulário
function validateForm(formData) {
    const errors = [];
    const { nome, email, cpf, cnpj, telefone, senha, confirmarSenha, agreeTerms, tipo } = formData;
    const isPJ = tipo === 'PJ';

    // Validações básicas
    if (!nome || nome.length < 3) errors.push('Nome deve ter pelo menos 3 caracteres');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
    if (!telefone || telefone.length < 11) errors.push('Telefone inválido');
    if (!senha || senha.length < 6) errors.push('Senha deve ter pelo menos 6 caracteres');
    if (senha !== confirmarSenha) errors.push('As senhas não coincidem');
    if (!agreeTerms) errors.push('Você deve aceitar os termos');

    // Validação de documentos
    if (isPJ) {
        if (!cnpj || !validarCNPJ(cnpj)) errors.push('CNPJ inválido');
    } else {
        if (!cpf || !validarCPF(cpf)) errors.push('CPF inválido');
    }

    return errors;
}

// Validação simples de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

// Validação simples de CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.length === 14;
}

// Faz a requisição para a API
async function makeApiRequest(formData) {
    try {
        // Configura timeout
        const TIMEOUT_DURATION = 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.warn(`Request aborted after ${TIMEOUT_DURATION / 1000} seconds`);
        }, TIMEOUT_DURATION);

        // Prepara os dados para a API
        const requestData = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            senha: formData.senha,
            confirmarSenha: formData.confirmarSenha,
            agreeTerms: formData.agreeTerms,
            tipo: formData.tipo
        };

        // Adiciona CPF ou CNPJ conforme o tipo
        if (formData.tipo === 'PJ') {
            requestData.cnpj = formData.cnpj;
        } else {
            requestData.cpf = formData.cpf;
        }

        // Configura a requisição
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData),
            signal: controller.signal
        };

        // Faz a requisição
        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/usuario/registrar', requestOptions);

        clearTimeout(timeoutId);

        // Verifica a resposta
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        }

        return response;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('O servidor está demorando muito para responder. Tente novamente mais tarde.');
        }
        throw error;
    }
}