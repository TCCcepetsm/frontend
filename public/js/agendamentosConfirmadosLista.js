document.addEventListener("DOMContentLoaded", async () => {
    // Use a função padronizada do auth.js
    const token = window.auth.getToken(); // <<-- CORREÇÃO

    // Verificar autenticação usando a função padronizada
    if (!window.auth.checkAuth()) { // <<-- CORREÇÃO
        return;
    }

    // Elementos da página
    const tableBody = document.getElementById('agendamentos-table-body');

    // Função para carregar agendamentos
    async function loadAgendamentos() {
        try {
            const response = await fetch("https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/confirmados", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const agendamentos = await response.json();

            // Limpar tabela
            tableBody.innerHTML = '';

            if (agendamentos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">Nenhum agendamento confirmado encontrado.</td></tr>';
                return;
            }

            // Preencher tabela
            agendamentos.forEach(agendamento => {
                const row = tableBody.insertRow();

                // Data
                const cellData = row.insertCell(0);
                cellData.textContent = formatarData(agendamento.data);

                // Horário
                const cellHorario = row.insertCell(1);
                cellHorario.textContent = agendamento.horario || 'N/A';

                // Solicitante
                const cellSolicitante = row.insertCell(2);
                cellSolicitante.textContent = agendamento.nome || agendamento.nomeCliente || 'N/A';

                // Plano
                const cellPlano = row.insertCell(3);
                cellPlano.textContent = agendamento.plano || 'N/A';

                // Status
                const cellStatus = row.insertCell(4);
                cellStatus.textContent = agendamento.status || 'CONFIRMADO';
                cellStatus.className = 'status-confirmado';

                // Ações
                const cellAcoes = row.insertCell(5);
                const btnAcessar = document.createElement('button');
                btnAcessar.textContent = 'Acessar';
                btnAcessar.className = 'btn-acessar';
                btnAcessar.onclick = () => {
                    window.location.href = `agendamentosConfirmados.html?id=${agendamento.id}`;
                };
                cellAcoes.appendChild(btnAcessar);
            });

        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar agendamentos: ${error.message}</td></tr>`;
        }
    }

    // Função para formatar data
    function formatarData(dataString) {
        try {
            const [year, month, day] = dataString.split('-');
            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }

    // Carregar os dados
    loadAgendamentos();
});