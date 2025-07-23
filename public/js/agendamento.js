document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookingForm");
  const responseDiv = document.getElementById("response");
  const API_BASE_URL = "https://psychological-cecilla-peres-7395ec38.koyeb.app/api";

  // Use a função padronizada do auth.js
  const token = window.auth.getToken(); // <<-- CORREÇÃO

  // Verificar autenticação usando a função padronizada
  if (!window.auth.checkAuth()) { // <<-- CORREÇÃO
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Validar campos antes de enviar
    if (!validateForm()) {
      return;
    }

    showLoading();

    const formData = {
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefone: document.getElementById("telefone").value.replace(/\D/g, ''),
      plano: document.getElementById("plano").value,
      data: document.getElementById("data").value,
      horario: document.getElementById("horario").value,
      esporte: document.getElementById("esporte").value,
      local: document.getElementById("local").value,
      latitude: document.getElementById("latitude").value,
      longitude: document.getElementById("longitude").value
    };

    try {
      // CORREÇÃO: Chamar o endpoint correto (/api/agendamentos2/criar2)
      const response = await fetch(`${API_BASE_URL}/agendamentos2/criar2`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        window.location.href = "login.html";
        return;
      }

      if (!response.ok) {
        // Tenta ler a resposta como texto para dar uma mensagem de erro melhor
        const errorText = await response.text();
        console.error("Erro do servidor:", errorText); // Log para depuração
        throw new Error(errorText || "Erro ao agendar");
      }

      const data = await response.json();
      showSuccessMessage(formData, data);
      form.reset();

    } catch (error) {
      console.error("Erro no fetch:", error);
      showErrorMessage(error);
    }
  });

  function validateForm() {
    // Validação básica - pode ser expandida
    const requiredFields = ['nome', 'email', 'telefone', 'plano', 'data', 'horario', 'esporte', 'local'];
    let isValid = true;

    requiredFields.forEach(field => {
      const element = document.getElementById(field);
      if (!element.value.trim()) {
        element.style.borderColor = "red";
        isValid = false;
      } else {
        element.style.borderColor = "";
      }
    });

    if (!isValid) {
      responseDiv.className = "error";
      responseDiv.innerHTML = "<p>Por favor, preencha todos os campos obrigatórios.</p>";
      return false;
    }

    // Validação adicional do email
    const email = document.getElementById("email").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("email").style.borderColor = "red";
      responseDiv.className = "error";
      responseDiv.innerHTML = "<p>Por favor, insira um e-mail válido.</p>";
      return false;
    }

    return true;
  }

  function showLoading() {
    responseDiv.style.display = "block";
    responseDiv.innerHTML = '<div class="loading-spinner"></div><p>Enviando agendamento...</p>';
    responseDiv.className = "loading";
  }

  function showSuccessMessage(formData, responseData) {
    const dataFormatada = new Date(formData.data).toLocaleDateString('pt-BR');

    const mensagem = `
      <div class="success-message">
        <h3>Agendamento confirmado!</h3>
        <p>Olá <strong>${formData.nome}</strong>, seu agendamento para <strong>${formData.esporte}</strong> foi realizado com sucesso!</p>
        <div class="agendamento-info">
          <p><strong>Código:</strong> ${responseData.codigo || 'N/A'}</p>
          <p><strong>Data:</strong> ${dataFormatada} às ${formData.horario}</p>
          <p><strong>Local:</strong> ${formData.local}</p>
          <p><strong>Plano:</strong> ${formData.plano}</p>
          <p>Um e-mail de confirmação foi enviado para: <strong>${formData.email}</strong></p>
        </div>
        <button id="backButton" class="primary-button">Voltar à Página Inicial</button>
      </div>
    `;

    responseDiv.className = "success";
    responseDiv.innerHTML = mensagem;
    responseDiv.scrollIntoView({ behavior: 'smooth' });

    document.getElementById("backButton").addEventListener("click", () => {
      window.location.href = "inicial.html";
    });
  }

  function showErrorMessage(error) {
    responseDiv.className = "error";
    responseDiv.innerHTML = `
      <div class="error-message">
        <h3>Erro no agendamento</h3>
        <p>${error.message || "Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente."}</p>
        <button id="tryAgainButton" class="secondary-button">Tentar Novamente</button>
      </div>
    `;

    document.getElementById("tryAgainButton").addEventListener("click", () => {
      responseDiv.style.display = "none";
    });
  }

  // Máscara para telefone (mantido do código original)
  const telefoneInput = document.getElementById("telefone");
  telefoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 10) {
      value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }

    e.target.value = value;
  });

  // Inicialização do mapa (mantido do código original)
  const map = L.map('map').setView([-23.5505, -46.6333], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let marker;
  map.on('click', (e) => {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);

    document.getElementById('latitude').value = e.latlng.lat;
    document.getElementById('longitude').value = e.latlng.lng;

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('local').value = data.display_name || "Endereço não encontrado";
      });
  });
});