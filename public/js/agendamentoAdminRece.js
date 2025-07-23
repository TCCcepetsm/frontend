document.addEventListener("DOMContentLoaded", async () => {
    try {

        // Use a função padronizada do auth.js
        const token = window.auth.getToken(); // <<-- CORREÇÃO

        // Verificar autenticação usando a função padronizada
        if (!window.auth.checkAuth()) { // <<-- CORREÇÃO
            return;
        }

        // 2. Seleção de elementos
        const tbody = document.querySelector("#bookingsTable tbody");
        if (!tbody) {
            throw new Error("Elemento tbody não encontrado");
        }

        // 3. Funções auxiliares
        const formatarData = (dataString) => {
            try {
                const [year, month, day] = dataString.split('-');
                return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
            } catch (e) {
                console.error("Erro ao formatar data:", e);
                return dataString;
            }
        };

        // 4. Carregar agendamentos
        const loadConfirmedBookings = async () => {
            tbody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

            const response = await fetch("https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/confirmados", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `Erro ${response.status}`);
            }

            const bookings = await response.json();

            if (!bookings.length) {
                tbody.innerHTML = '<tr><td colspan="3">Nenhum agendamento encontrado</td></tr>';
                return;
            }

            tbody.innerHTML = bookings.map(booking => `
                <tr>
                    <td data-label="Data">${formatarData(booking.data)}</td>
                    <td data-label="Horário">${booking.horario}</td>
                    <td data-label="Acessar">
                        <button class="btn btn-access" data-id="${booking.id}">Acessar</button>
                    </td>
                </tr>
            `).join('');
        };

        // 5. Event listeners
        tbody.addEventListener("click", (e) => {
            const button = e.target.closest(".btn-access");
            if (button) {
                window.location.href = `agendamentoDetalhes.html?id=${button.dataset.id}`;
            }
        });

        // 6. Inicialização
        await loadConfirmedBookings();

    } catch (error) {
        console.error("Erro fatal:", error);
        alert(`Erro: ${error.message}`);
        if (typeof window.logout === 'function') window.logout();
        else window.location.href = 'login.html';
    }
});