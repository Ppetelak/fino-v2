let formularioAberto = false;
let numContatos = 1;

$(document).ready(function () {
    mascaras();
    $('.editar-form').each(function () {
        const ufSelected = $(this).find('[name="uf-value"]').val();
        $(this).find('#uf option').each(function () {
            if ($(this).val() === ufSelected) {
                $(this).prop('selected', true);
            }
        });
    });
});

function mascaras() {
    $('[name="cep"]').mask(('00000-000'), {reverse: true});
    $('[name="cnpj"]').mask(('00.000.000/0000-00'), {reverse: true});
    $('[name="codans"]').mask(('00000-0'), {reverse: true});
    $('[name="telatendimento"], [name="telouvidoria"], [name="telefone_contato"]').inputmask({
        mask: [
            '(99) 9999-9999',
            '0800-000-0000',
            '(00) 0000-0000',
            '(00) 00000-0000',
            '4004-0000',
            '3003-0000'
        ],
        greedy: false,
        definitions: {
            '0': {
                validator: '[0-9]',
                cardinality: 1,
                placeholder: '_'
            }
        }
    });
}

$('.addContato').click(function (){
    console.log('clicou em adicionar novo contato')
})

$('.editar-btn').click(function () {
    
    const tr = $(this).closest('tr');
    const formContainer = tr.next('.editar-form-container');
    const form = formContainer.find('.editar-form');
    mascaras();

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
});

$('.editar-form').submit(function (e) {
    e.preventDefault();
    mascaras();
    const form = $(this);
    const formData = {
        razaosocial: form.find('#razaosocial').val(),
        cnpj: form.find('#cnpj').val(),
        nomefantasia: form.find('#nomefantasia').val(),
        codans: form.find('#codans').val(),
        endereco: form.find('#endereco').val(),
        numeroendereco: form.find('#numeroendereco').val(),
        complemento: form.find('#complemento').val(),
        cep: form.find('#cep').val(),
        cidade: form.find('#cidade').val(),
        uf: form.find('#uf').val(),
        website: form.find('#website').val(),
        telatendimento: form.find('#telatendimento').val(),
        telouvidoria: form.find('#telouvidoria').val(),
        emailouvidoria: form.find('#emailouvidoria').val(),
    };
    console.log(formData);

    let contatos = [];

    form.find('.contato').each(function () {
        const contato = $(this);
        const contatoData = {
            id: contato.data('id'),
            nome_contato: contato.find('[name="nome_contato"]').val(),
            email_contato: contato.find('[name="email_contato"]').val(),
            telefone_contato: contato.find('[name="telefone_contato"]').val(),
            cargo_contato: contato.find('[name="cargo_contato"]').val(),
        };
        contatos.push(contatoData);
    });

    console.log(contatos);

    const idOperadora = form.data('id');
    const actionUrl = `/editar-operadora/${idOperadora}`;
    $.ajax({
        type: 'POST',
        url: actionUrl,
        data: ({ formData: formData, contatos: contatos }),
        success: function (response) {
            console.log('Sucesso', response)
            location.reload();

        },
        error: function (err) {
            showMessageError('Erro ao enviar os dados:', err);
            console.error('Erro ao enviar os dados:', err);
        },
    });
});


$('.excluir-btn').click(function () {
    const form = $(this);
    const idOperadora = form.data('id');

    // Exibir um alerta de confirmação
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta operadora?");

    // Verificar se o usuário clicou em "Sim"
    if (confirmDelete) {
        // Envie a ação de excluir para a rota do servidor responsável por realizar a exclusão
        $.ajax({
            type: 'DELETE',
            url: `/excluir-operadora/${idOperadora}`,
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

$('.cadastrar').click(function (e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showMessageError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    // Criar um array vazio para armazenar os dados de contato
    let contatos = [];
    const form = $(this).closest('form');

    // Iterar sobre as divs de contato
    form.find('.contato').each(function () {
        const contatoData = {
            nome_contato: $(this).find('[name="nome_contato"]').val(),
            email_contato: $(this).find('[name="email_contato"]').val(),
            telefone_contato: $(this).find('[name="telefone_contato"]').val(),
            cargo_contato: $(this).find('[name="cargo_contato"]').val(),
        };
        contatos.push(contatoData);
    });

    let formData = {
        razaosocial: $('#razaosocial').val(),
        cnpj: $('#cnpj').val(),
        nomefantasia: $('#nomefantasia').val(),
        codans: $('#codans').val(),
        endereco: $('#endereco').val(),
        numeroendereco: $('#numeroendereco').val(),
        complemento: $('#complemento').val(),
        cep: $('#cep').val(),
        cidade: $('#cidade').val(),
        uf: $('#uf').val(),
        website: $('#website').val(),
        telatendimento: $('#telatendimento').val(),
        telouvidoria: $('#telouvidoria').val(),
        emailouvidoria: $('#emailouvidoria').val()
    };

    console.log(formData, contatos)

    $.ajax({
        type: 'POST',
        url: '/cadastrar-operadora',
        data: JSON.stringify({ formData: formData, contatos: contatos }),
        processData: false,
        contentType: 'application/json',
        success: function (response) {
            console.log('Resposta BackEnd', response);
            location.reload();
        },
        error: function (response) {
            showMessageError(response.message)
            console.error('Erro ao cadastrar operadora:', response);
        },
    });
});


$('.adicionar-contato').click(function () {
    const $button = $(this);

    numContatos++;

    const novoContato = `
        <div class="contato" id="contato-${numContatos}">
        <div class="input-wrapper">
        <label for="nome" class="form-label">Nome do Contato:</label>
        <input type="text" class="form-control" name="nome_contato" required>
    </div>
    <div class="input-wrapper">
        <label for="email" class="form-label">Email do Contato:</label>
        <input type="email" class="form-control" name="email_contato" required>
    </div>
    <div class="input-wrapper">
        <label for="telefone" class="form-label">Telefone do Contato:</label>
        <input type="tel" class="form-control" name="telefone_contato" required>
    </div>
    <div class="input-wrapper">
        <label for="cargo" class="form-label">Cargo do Contato:</label>
        <input type="text" class="form-control" name="cargo_contato" required>
    </div>
    <div class="input-wrapper">   
        <button class="btn btn-danger remover-contato excluir">Remover Contato</button>
    </div>
        </div>
    `;

    $button.before(novoContato);
});

$('.contatos').on('click', '.remover-contato', function () {
    $(this).closest('.contato').remove();
    reorganizarIdsContatos();
});

function reorganizarIdsContatos() {
    $('.contato').each(function (index) {
        const novoId = `contato-${index + 1}`;
        $(this).attr('id', novoId);
    });
}

function validateForm() {
    const requiredFields = [
        'razaosocial',
        'cnpj',
        'nomefantasia',
        'codans',
        'endereco',
        'numeroendereco',
        'cep',
        'cidade',
        'uf',
        'telatendimento',
        'telouvidoria',
    ];

    let valid = true;

    requiredFields.forEach(function (fieldName) {
        const fieldValue = $('#' + fieldName).val().trim();
        if (fieldValue === '') {
            valid = false;
            // Adiciona uma classe de erro ao campo vazio para destacá-lo
            $('#' + fieldName).addClass('is-invalid');
        } else {
            // Remove a classe de erro, caso tenha sido preenchido corretamente
            $('#' + fieldName).removeClass('is-invalid');
        }
    });

    return valid;
}

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
    const alertSuccess = getCookieValue('alertSuccess');
    showMessage(alertSuccess);
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
