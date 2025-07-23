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

            document.querySelectorAll('.toggle-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('userType').value = this.dataset.value;

            document.getElementById('cpfGroup').style.display = isPJ ? 'none' : 'block';
            document.getElementById('cnpjGroup').style.display = isPJ ? 'block' : 'none';
            document.getElementById('cpf').required = !isPJ;
            document.getElementById('cnpj').required = isPJ;

            document.body.classList.toggle('theme-orange', isPJ);
            logo.src = isPJ ? '../public/images/logoAdmin.png' : '../public/images/logo.png';
        });
    });

    // Configura o formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        createFeedbackElements();

        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleRegister();
        });
    }
});

// Funções auxiliares
function createFeedbackElements() {
    if (!document.getElementById('loading-spinner')) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.style.cssText = 'display:none; margin-left:10px;';
        spinner.innerHTML = '⏳';

        const submitBtn = document.getElementById('registerBtn');
        if (submitBtn) submitBtn.insertAdjacentElement('afterend', spinner);
    }

    if (!document.getElementById('feedback-messages')) {
        const messagesDiv = document.createElement('div');
        messagesDiv.id = 'feedback-messages';
        messagesDiv.style.cssText = 'margin: 15px 0; min-height: 50px;';

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.parentNode.insertBefore(messagesDiv, registerForm.nextSibling);
        }
    }
}

async function handleRegister() {
    const submitBtn = document.getElementById('registerBtn');

    try {
        if (submitBtn) submitBtn.disabled = true;
        toggleLoading(true);

        const formData = getFormData();
        const errors = validateForm(formData);

        if (errors.length > 0) {
            showError(errors.join('<br>'));
            return;
        }

        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/usuario/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                senha: formData.senha,
                confirmarSenha: formData.confirmarSenha,
                agreeTerms: formData.agreeTerms,
                tipo: formData.tipo,
                cpf: formData.tipo === 'PF' ? formData.cpf : undefined,
                cnpj: formData.tipo === 'PJ' ? formData.cnpj : undefined
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro no registro');
        }

        showSuccess('Registro realizado com sucesso!');
        setTimeout(() => window.location.href = '/views/login.html', 2000);

    } catch (error) {
        console.error('Erro no registro:', error);
        showError(error.message || 'Erro ao realizar o registro');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        toggleLoading(false);
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
        const TIMEOUT_DURATION = 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                senha: formData.senha,
                confirmarSenha: formData.confirmarSenha,
                agreeTerms: formData.agreeTerms,
                tipo: formData.tipo,
                ...(formData.tipo === 'PJ' ? { cnpj: formData.cnpj } : { cpf: formData.cpf })
            }),
            signal: controller.signal
        };

        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/usuario/registrar', requestOptions);
        clearTimeout(timeoutId);

        // Verifica se a resposta está vazia
        const responseText = await response.text();
        if (!responseText) {
            throw new Error('Resposta vazia do servidor');
        }

        // Retorna tanto o status quanto o texto para ser parseado posteriormente
        return {
            ok: response.ok,
            status: response.status,
            json: () => JSON.parse(responseText),
            text: () => responseText
        };

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Tempo de conexão esgotado. Tente novamente.');
        }
        throw error;
    }


}

console.log('Resposta da API:', {
    status: response.status,
    body: await response.text()
});