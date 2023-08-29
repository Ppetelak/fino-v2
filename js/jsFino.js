let numVigencias = 0;
let formularioAberto = false;

$(document).ready(function () {
    //mascaras();
    $('.editar-form').each(function () {
        const administradoraSelected = $(this).find('[name="administradora-value"]').val();
        $(this).find('#administradora option').each(function () {
            if ($(this).val() === administradoraSelected) {
                $(this).prop('selected', true);
            }
        });
        const modalidadeSelected = $(this).find('[name="modalidade-value"]').val();
        $(this).find('#modalidade option').each(function () {
            if ($(this).val() === modalidadeSelected) {
                $(this).prop('selected', true);
            }
        });
        const operadoraSelected = $(this).find('[name="operadora-value"]').val();
        $(this).find('#operadora option').each(function () {
            if ($(this).val() === operadoraSelected) {
                $(this).prop('selected', true);
            }
        });
        const negcomissaoSelected = $(this).find('[name="negcomissao-value"]').val();
        if (negcomissaoSelected === 'Sim') {
            $(this).find('#opcaoSim').prop('checked', true);
        } else if (negcomissaoSelected === 'Não') {
            $(this).find('#opcaoNao').prop('checked', true);
        }
        const negagenciamentoSelected = $(this).find('[name="negagenciamento-value"]').val();
        if (negagenciamentoSelected === 'Sim') {
            $(this).find('#negagenciamentoSim').prop('checked', true);
        } else if (negagenciamentoSelected === 'Não') {
            $(this).find('#negagenciamentoNao').prop('checked', true);
        }
        const docoperadoraSelected = $(this).find('[name="docoperadora-value"]').val();
        if (docoperadoraSelected === 'Sim') {
            $(this).find('#docoperadoraSim').prop('checked', true);
        } else if (negagenciamentoSelected === 'Não') {
            $(this).find('#docoperadoraNao').prop('checked', true);
        }
        const assOperadoraSelected = $(this).find('[name="assOperadora-value"]').val();
        if (assOperadoraSelected === 'Sim') {
            $(this).find('#assOperadoraSim').prop('checked', true);
        } else if (negagenciamentoSelected === 'Não') {
            $(this).find('#assOperadoraNao').prop('checked', true);
        }
        const assAdministradoraSelected = $(this).find('[name="assAdministradora-value"]').val();
        if (assAdministradoraSelected === 'Sim') {
            $(this).find('#assAdmSim').prop('checked', true);
        } else if (negagenciamentoSelected === 'Não') {
            $(this).find('#assAdmNao').prop('checked', true);
        }
        const enviopropostasSelected = $(this).find('[name="enviopropostas-value"]').val();
        if (enviopropostasSelected === 'Preenchimento direto no portal da operadora') {
            $(this).find('#enviopropostas1').prop('checked', true);
        } else if (enviopropostasSelected === 'Envio por e-mail') {
            $(this).find('#enviopropostas2').prop('checked', true);
        }
        const layoutpropostasSelected = $(this).find('[name="layoutpropostas-value"]').val();
        if (layoutpropostasSelected === 'Padrão da Operadora') {
            $(this).find('#layoutpropostas1').prop('checked', true);
        } else if (layoutpropostasSelected === 'Sugerido pela Administradora') {
            $(this).find('#layoutpropostas2').prop('checked', true);
        }
        const logoOperadoraSelected = $(this).find('[name="logoOperadora-value"]').val();
        if (logoOperadoraSelected === 'Sim') {
            $(this).find('#logoOperadoraSim').prop('checked', true);
        } else if (logoOperadoraSelected === 'Não') {
            $(this).find('#logoOperadoraNao').prop('checked', true);
        }
        const manualmarcaSelected = $(this).find('[name="manualmarca-value"]').val();
        if (manualmarcaSelected === 'Sim') {
            $(this).find('#manualmarcaSim').prop('checked', true);
        } else if (logoOperadoraSelected === 'Não') {
            $(this).find('#manualmarcaNao').prop('checked', true);
        }
        const modelodeclaracaoSelected = $(this).find('[name="modelodeclaracao-value"]').val();
        if (modelodeclaracaoSelected === 'Sim') {
            $(this).find('#modelodeclaracaoSim').prop('checked', true);
        } else if (logoOperadoraSelected === 'Não') {
            $(this).find('#modelodeclaracaoNao').prop('checked', true);
        }
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

$('.adicionar-vigencia').click(function () {
    const $button = $(this)

    numVigencias++;

    const novaVigencia = `<div class="row vigencia" id="vigencia-${numVigencias}">
            <div class="col-sm-3">
                <select name="diaVigencia" id="diaVigencia" class="form-control" required>
                <option value="" disabled selected>Selecionar</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24</option>
                <option value="25">25</option>
                <option value="26">26</option>
                <option value="27">27</option>
                <option value="28">28</option>
                <option value="29">29</option>
                <option value="30">30</option>
                <option value="31">31</option>
                </select>
            </div>
            <div class="col-sm-3">
                                <select name="diaMovimentacao" id="diaMovimentacao" class="form-control" required>
                                    <option value="" disabled selected>Selecionar</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                    <option value="13">13</option>
                                    <option value="14">14</option>
                                    <option value="15">15</option>
                                    <option value="16">16</option>
                                    <option value="17">17</option>
                                    <option value="18">18</option>
                                    <option value="19">19</option>
                                    <option value="20">20</option>
                                    <option value="21">21</option>
                                    <option value="22">22</option>
                                    <option value="23">23</option>
                                    <option value="24">24</option>
                                    <option value="25">25</option>
                                    <option value="26">26</option>
                                    <option value="27">27</option>
                                    <option value="28">28</option>
                                    <option value="29">29</option>
                                    <option value="30">30</option>
                                    <option value="31">31</option>
                                </select>
                            </div>
            <div class="col-sm-3">
                <select name="diaFechamento" id="diaFechamento" class="form-control" required>
                <option value="" disabled selected>Selecionar</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24</option>
                <option value="25">25</option>
                <option value="26">26</option>
                <option value="27">27</option>
                <option value="28">28</option>
                <option value="29">29</option>
                <option value="30">30</option>
                <option value="31">31</option>
                </select>
            </div>
            <div class="col-sm-3">
                <button type="button" class="btn btn-danger excluir-vigencia"><i
                        class="bi bi-trash-fill"></i></button>
            </div>
        </div>`;

        $(novaVigencia).insertBefore($button)
});

function reorganizarIdsVigencias() {
    $('.vigencia').each(function (index) {
        const novoId = `vigencia-${index + 1}`;
        $(this).attr('id', novoId);
    });
}

$('.vigencias').on('click', '.excluir-vigencia', function () {
    $(this).closest('.vigencia').remove();
    reorganizarIdsVigencias();
});

$('.cadastrar').click(function (e) {
    e.preventDefault();

    let vigencias = [];

    let selectedEntidades = [];

    const form = $(this).closest('form')

    $('.entidades input[type="checkbox"]:checked').each(function() {
        const formEntidades = {
            idEntidade: $(this).val()
        }
        selectedEntidades.push(formEntidades);
    });

    form.find('.vigencia').each(function () {
        const formVigencia = {
            iniciodavigencia: $(this).find('[name="diaVigencia"]').val(),
            movimentacao: $(this).find('[name="diaMovimentacao"]').val(),
            datafaturamento: $(this).find('[name="diaFechamento"]').val(),
        }
        vigencias.push(formVigencia);
    });

    let formData = {
        administradora: $('#administradora').val(),
        operadora: $('#operadora').val(),
        modalidade: $('#modalidade').val(),
        negcomissao: $("input[name='negcomissao']:checked").val(),
        comissaovalor: $('#comissaovalor').val(),
        negagenciamento: $("input[name='negagenciamento']:checked").val(),
        agenciamentovalor: $('#agenciamentovalor').val(),
        negobs: $('#negobs').val(),
        aniversariocontrato: $('#aniversariocontrato').val(),
        docoperadora: $("input[name='docoperadora']:checked").val(),
        assOperadora: $("input[name='assOperadora']:checked").val(),
        assAdm: $("input[name='assAdm']:checked").val(),
        enviopropostas: $("input[name='enviopropostas']:checked").val(),
        layoutpropostas: $("input[name='layoutpropostas']:checked").val(),
        logoOperadora: $("input[name='logoOperadora']:checked").val(),
        manualmarca: $("input[name='manualmarca']:checked").val(),
        modelodeclaracao: $("input[name='modelodeclaracao']:checked").val(),
        obsFino: $('#obsFino').val(),
        dataAtual: new Date().toLocaleDateString('pt-BR')
    }

    console.log(formData, vigencias, selectedEntidades)

    $.ajax({
        type: 'POST',
        url: '/cadastrar-fino',
        data: JSON.stringify({ formData: formData, vigencias: vigencias, entidades: selectedEntidades }),
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
    })
}) 

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
});

$('.editar-form').submit(function (e) {
    e.preventDefault();
    const form = $(this);
    const idFino = form.data('id')

    const formData = {
        administradora: form.find('#administradora').val(),
        operadora: form.find('#operadora').val(),
        modalidade: form.find('#modalidade').val(),
        negcomissao: form.find("input[name='negcomissao']:checked").val(),
        comissaovalor: form.find('#comissaovalor').val(),
        negagenciamento: form.find("input[name='negagenciamento']:checked").val(),
        agenciamentovalor: form.find('#agenciamentovalor').val(),
        negobs: form.find('#negobs').val(),
        aniversariocontrato: form.find('#aniversariocontrato').val(),
        docoperadora: form.find("input[name='docoperadora']:checked").val(),
        assOperadora: form.find("input[name='assOperadora']:checked").val(),
        assAdm: form.find("input[name='assAdm']:checked").val(),
        enviopropostas: form.find("input[name='enviopropostas']:checked").val(),
        layoutpropostas: form.find("input[name='layoutpropostas']:checked").val(),
        logoOperadora: form.find("input[name='logoOperadora']:checked").val(),
        manualmarca: form.find("input[name='manualmarca']:checked").val(),
        modelodeclaracao: form.find("input[name='modelodeclaracao']:checked").val(),
        obsFino: form.find('#obsFino').val(),
        dataAtual: new Date().toLocaleDateString('pt-BR')
    }

    let selectedEntidades = []; 

    form.find('.entidades input[type="checkbox"]:checked').each(function() {
        const formEntidades = {
            idEntidade: $(this).val()
        }
        selectedEntidades.push(formEntidades);
    });

    let vigencias = [];

    form.find('.vigencia').each(function () {
        const formVigencia = {
            iniciodavigencia: $(this).find('[name="diaVigencia"]').val(),
            movimentacao: $(this).find('[name="diaMovimentacao"]').val(),
            datafaturamento: $(this).find('[name="diaFechamento"]').val(),
        }
        vigencias.push(formVigencia);
    });

    console.log(formData)
    console.log(vigencias)
    console.log(selectedEntidades)

    const actionUrl = `/editar-fino/${idFino}`

    $.ajax({
        type: 'POST',
        url: actionUrl,
        data: ({ formData: formData, entidades: selectedEntidades, vigencias:vigencias }),
        success: function (response) {
            console.log('Sucesso', response)
            //location.reload();
        },
        error: function (err) {
            showMessageError('Erro ao enviar os dados:', err);
            console.error('Erro ao enviar os dados:', err);
        },
    });

    
})

$('.excluir-btn').click(function () {
    const form = $(this);
    const idFino = form.data('id');

    // Exibir um alerta de confirmação
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este Fino?");

    // Verificar se o usuário clicou em "Sim"
    if (confirmDelete) {
        // Envie a ação de excluir para a rota do servidor responsável por realizar a exclusão
        $.ajax({
            type: 'DELETE',
            url: `/excluir-fino/${idFino}`,
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