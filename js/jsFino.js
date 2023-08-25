let numVigencias = 0;

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
            //location.reload();
        },
        error: function (response) {
            showMessageError(response.message)
            console.error('Erro ao cadastrar operadora:', response);
        },
    })
}) 
