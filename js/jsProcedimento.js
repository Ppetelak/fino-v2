let formularioAberto = false;

$(document).ready(function () {
    //mascaras();
    $('.editar-form').each(function () {
        const contratacaoSelected = $(this).find('[name="contratoplano-value"]').val();
        $(this).find('#contratoplano option').each(function () {
            if ($(this).val() === contratacaoSelected) {
                $(this).prop('selected', true);
            }
        });
        const abrangenciaSelected = $(this).find('[name="abrangencia-value"]').val();
        $(this).find('#abrangenciaplano option').each(function () {
            if ($(this).val() === abrangenciaSelected) {
                $(this).prop('selected', true);
            }
        });
        const cooparticipacaoSelected = $(this).find('[name="cooparticipacao-value"]').val();
        $(this).find('#cooparticipacao option').each(function () {
            if ($(this).val() === cooparticipacaoSelected) {
                $(this).prop('selected', true);
            }
        });
        const coberturaSelected = $(this).find('[name="cobertura-value"]').val();
        $(this).find('#coberturaplano option').each(function () {
            if ($(this).val() === coberturaSelected) {
                $(this).prop('selected', true);
            }
        });
        const acomodacaoSelected = $(this).find('[name="acomodacao-value"]').val();
        $(this).find('#acomodacaoplano option').each(function () {
            if ($(this).val() === acomodacaoSelected) {
                $(this).prop('selected', true);
            }
        });
        $('.cooparticipacao').each(function () {
            const tipoFranquiaSelected = $(this).find('[name="tipofranquiaValue"]').val();
            const tipofranquiaSelect = $(this).find('.tipofranquia-select');
            
            tipofranquiaSelect.find('option').each(function () {
                if ($(this).val() === tipoFranquiaSelected) {
                    $(this).prop('selected', true);
                }
            });
        });
        
    });
});

function getCookieValue(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName)) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
}

if (document.cookie.includes('alertSuccess')) {
    const alertSucess = getCookieValue('alertSuccess');
    showMessage(alertSucess);
    document.cookie = 'alertSuccess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

if (document.cookie.includes('alertError')) {
    const alertError = getCookieValue('alertError');
    showMessageError(alertError);
    document.cookie = 'alertError=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

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

$('.editar-btn').click(function () {

    const tr = $(this).closest('tr');
    const formContainer = tr.next('.editar-form-container');
    const form = formContainer.find('.editar-form');
    //mascaras();

    if (!formularioAberto) {
        // Abrir o formulário para edição
        form.find('.form-control').prop('disabled', false);
        formContainer.show();
        $(this).text("Cancelar");
    } else {
        // Fechar o formulário e desabilitar os campos
        form.find('.form-control').prop('disabled', true);
        formContainer.hide();
        $(this).text("Editar");
    }

    formularioAberto = !formularioAberto;
})

$('.excluir-btn').click(function () {
    const form = $(this);
    const idProcedimento = form.data('id');

    // Exibir um alerta de confirmação
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir este Procedimento?`);

    // Verificar se o usuário clicou em "Sim"
    if (confirmDelete) {
        // Envie a ação de excluir para a rota do servidor responsável por realizar a exclusão
        $.ajax({
            type: 'DELETE',
            url: `/excluir-produto/${idProcedimento}`,
            success: function (response) {
                console.log('Sucesso', response);
                location.reload();
            },
            error: function (xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                showMessageError(response.message);
                console.error('Erro ao excluir a operadora:', error);
            },
        });
    }
});

$('#cadastrar-procedimento').click(function (e) {
    e.preventDefault();

    const procedimentoData = {
        idOperadora: $('#cadastrar-procedimento-form').data('id'),
        descricao: $('#procedimentodescricao').val(),
        copay: $('#procedimentocopay').val(),
        limitecopay: $('#procedimentolimitecopay').val(),
        tipofranquia: $('#tipofranquia').val(),
        franquiacopay: $('#procedimentofranquiacopay').val(),
        limitecarencia: $('#procedimentolimitecarencia').val(),
    }

    console.log(procedimentoData)


    $.ajax({
        type: 'POST',
        url: '/cadastrar-procedimento',
        data: JSON.stringify({ procedimentoData: procedimentoData }),
        processData: false,
        contentType: 'application/json',
        success: function (response) {
            console.log('Resposta Backend', response);
            location.reload();
        },
        error: function (response) {
            showMessageError(response.message)
            console.error('Erro ao cadastrar produto:', response)
        },
    });
});

$('.editar-form').submit(function (e) {
    e.preventDefault();
    const form = $(this);
    const idProcedimento = document.getElementById('idProcedimento').value
    const procedimentoData = {
        id: idProcedimento,
        descricao: form.find('[name="procedimentodescricao"]').val(),
        copay: form.find('[name="procedimentocopay"]').val(),
        limitecopay: form.find('[name="procedimentolimitecopay"]').val(),
        tipofranquia: form.find('[name="tipofranquia"]').val(),
        franquiacopay: form.find('[name="procedimentofranquiacopay"]').val(),
        limitecarencia: form.find('[name="procedimentolimitecarencia"]').val(),
    };

    const actionUrl = `/editar-procedimento/${idProcedimento}`

    console.log(procedimentoData)

    $.ajax({
        type: 'POST',
        url: actionUrl,
        data: ({ procedimentos: procedimentoData }),
        success: function (response) {
            console.log('Sucesso', response)
            location.reload();

        },
        error: function (err) {
            showMessageError('Erro ao enviar os dados:', err);
            console.error('Erro ao enviar os dados:', err);
        },
    });

})

