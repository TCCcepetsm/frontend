// public/js/agendamentosConfirmadosLista.js

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificação de Autenticação e Token
    // Assumes window.checkAuthentication() and window.getAuthToken() are available from auth.js
    if (typeof window.checkAuthentication === 'function' && !window.checkAuthentication()) {
        return; // checkAuthentication will handle redirection if not authenticated
    }
    const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : null;

    if (!token) {
        alert("Erro de autenticação. Por favor, faça login novamente.");
        window.location.href = 'login.html'; // Fallback redirect
        return;
    }

    // Referência ao corpo da tabela onde os agendamentos serão inseridos
    const agendamentosConfirmadosTableBody = document.getElementById('agendamentos-confirmados-table-body');

    // Função para formatar a data (reutilizável)
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        try {
            // Supondo formato 'YYYY-MM-DD' vindo do backend
            const [ano, mes, dia] = dataString.split('-');
            const data = new Date(ano, mes - 1, dia); // Mês é 0-indexed no JS (0=Jan, 11=Dez)
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return data.toLocaleDateString('pt-BR', options);
        } catch (e) {
            console.error("Erro ao formatar data:", dataString, e);
            return dataString; // Retorna a string original em caso de erro
        }
    }

    // Função para carregar os agendamentos confirmados do backend
    async function loadConfirmedAgendamentos() {
        if (!agendamentosConfirmadosTableBody) {
            console.error("Elemento 'agendamentos-confirmados-table-body' não encontrado no HTML.");
            return;
        }

        // Exibe mensagem de carregamento
        agendamentosConfirmadosTableBody.innerHTML = '<tr><td colspan="6">Carregando agendamentos confirmados...</td></tr>';

        try {
            const response = await fetch("https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/confirmados", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Incluir o token JWT
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro HTTP ao buscar agendamentos confirmados: ${response.status} - ${response.statusText}`, errorText);

                if (response.status === 401 || response.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    if (typeof window.logout === 'function') window.logout();
                    else window.location.href = 'login.html';
                }
                throw new Error(errorText || `Erro ao buscar agendamentos confirmados: ${response.statusText}`);
            }

            const agendamentos = await response.json();

            // Limpa o conteúdo atual da tabela
            agendamentosConfirmadosTableBody.innerHTML = '';

            if (agendamentos.length === 0) {
                agendamentosConfirmadosTableBody.innerHTML = '<tr><td colspan="6">Nenhum agendamento confirmado encontrado.</td></tr>';
            } else {
                agendamentos.forEach(agendamento => {
                    const row = agendamentosConfirmadosTableBody.insertRow();

                    // Coluna da Data
                    row.insertCell(0).textContent = formatarData(agendamento.data);

                    // Coluna do Horário
                    row.insertCell(1).textContent = agendamento.horario;

                    // Coluna do Solicitante (Ajuste o campo conforme seu DTO/Entidade Agendamento)
                    // Exemplo: se Agendamento tem um 'usuario' aninhado, ou um campo 'nomeCliente'
                    row.insertCell(2).textContent = agendamento.usuario ? agendamento.usuario.nome : (agendamento.nomeCliente || 'N/A');

                    // Coluna do Plano
                    row.insertCell(3).textContent = agendamento.plano || 'N/A';

                    // Coluna do Status (apenas para ter certeza, mas todos devem ser "CONFIRMADO")
                    row.insertCell(4).textContent = agendamento.status || 'N/A';

                    // Coluna de Ações (botão Acessar Detalhes)
                    const acoesCell = row.insertCell(5);
                    const acessarButton = document.createElement('button');
                    acessarButton.textContent = 'Acessar';
                    acessarButton.className = 'btn-acessar'; // Use uma classe CSS que você tenha
                    acessarButton.onclick = () => {
                        // Redireciona para a página de detalhes de UM agendamento
                        // (usando a sua agendamentoDetalhes.html existente)
                        window.location.href = `agendamentoDetalhes.html?id=${agendamento.id}`;
                    };
                    acoesCell.appendChild(acessarButton);
                });
            }

        } catch (error) {
            console.error("Erro ao carregar os agendamentos confirmados:", error);
            alert(`Erro ao carregar os agendamentos confirmados: ${error.message}`);
            agendamentosConfirmadosTableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar agendamentos.</td></tr>';
        }
    }

    // Chamar a função para carregar os dados quando a página for carregada
    loadConfirmedAgendamentos();
});