function showMessage(message) {
    const Mensagem = document.getElementById('Message')
    Mensagem.innerHTML = `${decodeURIComponent(message)} 
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`
    Mensagem.style.display = 'block';
}

function showMessageError(message) {
    const Mensagem = document.getElementById('MessageError')
    Mensagem.innerHTML = `ALERTA: ${decodeURIComponent(message)} 
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`
    Mensagem.style.display = 'block';
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const passwordMismatchMessage = document.getElementById('passwordMismatch');
const enviarButton = document.getElementById('enviar');
const userId = document.getElementById('userId').value;


function checkPasswordMatch() {
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (senha !== confirmarSenha) {
        passwordMismatchMessage.textContent = '➡ As senhas não coincidem.';
        enviarButton.disabled = true;
    } else {
        passwordMismatchMessage.textContent = '';
        checkPasswordRequirements();
    }
}

function checkPasswordRequirements() {
    const senha = senhaInput.value;

    // Verifica se a senha atende aos requisitos
    const minLengthOk = senha.length >= 6;
    const upperCaseOk = /[A-Z]/.test(senha);
    const specialCharOk = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

    // Atualiza a cor do texto de cada item da lista de requisitos
    document.getElementById('minLength').classList.toggle('password-ok', minLengthOk);
    document.getElementById('upperCase').classList.toggle('password-ok', upperCaseOk);
    document.getElementById('specialChar').classList.toggle('password-ok', specialCharOk);

    // Habilita o botão de enviar se todos os requisitos forem atendidos
    enviarButton.disabled = !(minLengthOk && upperCaseOk && specialCharOk);
}

// Chamada inicial para verificar os requisitos
checkPasswordRequirements();

senhaInput.addEventListener('input', checkPasswordMatch);
confirmarSenhaInput.addEventListener('input', checkPasswordMatch);
enviarButton.addEventListener('click', function (e) {
    e.preventDefault()
    enviarNovaSenha();
})


function enviarNovaSenha() {
    const senha = senhaInput.value;
    $.ajax({
        type: 'POST',
        url: `/alterarSenha/${userId}`,
        data: { novaSenha: senha },
        success: function(response) {
            console.log('Senha alterada com sucesso:', response);
            showMessage('Senha alterada com sucesso, você será redirecionado para o LOGIN')
            setTimeout(function() {
                window.location.href = '/login';
            }, 3000);
        },
        error: function(error) {
            showMessageError('Erro ao alterar sua senha, tente novamente ou entre em contato com o suporte')
            console.error('Erro ao alterar a senha:', error);
        }
    });
}
