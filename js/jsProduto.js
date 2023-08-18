let numProcedimentos = 0;
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
    });
});

$('.calcular').click(function () {
    const $button = $(this);
    const $container = $button.closest('.tabela-de-precos');
    calcularTabelaComercial($container);
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

if (document.cookie.includes('alertSucess')) {
    const alertSucess = getCookieValue('alertSucess');
    showMessage(alertSucess);
    document.cookie = 'alertSucess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

$('.adicionar-procedimento').click(function () {
    const $button = $(this)
    var divProcedimentos = $(this).siblings('.procedimentos');

    numProcedimentos++;

    const novoProcedimento = `<div class="row procedimento" id="procedimento-${numProcedimentos}">
    <div class=" row mb-3">
        <label for="procedimentodescricao" class="form-label">Descrição do procedimento</label>
        <textarea name="procedimentodescricao" id="procedimentodescricao" required class="form-control" rows="1"></textarea>
    </div>
    <div class="mb-3 row cooparticipacao">
        <h4> Coparticipação e Carências</h4>
        <div class="col-sm-3">
            <label for="procedimentocopay" class="form-label">Valor Coparticipação <span>(%)</span></label>
            <input type="number" name="procedimentocopay" id="procedimentocopay" placeholder="Valor (%)"
                required class="form-control">
        </div>
        <div class="col-sm-3">
            <label for="procedimentolimitecopay" class="form-label">Limite</label>
            <div class="input-group">
                <span class="input-group-text">R$</span>
                <input type="number" name="procedimentolimitecopay" id="procedimentolimitecopay"
                    placeholder="Limite (R$)" required class="form-control">
            </div>
        </div>
        <div class="col-sm-3">
            <label for="procedimentofranquiacopay" class="form-label">Franquia</label>
            <div class="input-group">
                <span class="input-group-text">R$</span>
                <input type="text" name="procedimentofranquiacopay" id="procedimentofranquiacopay" required class="form-control" placeholder="Franquia (R$)">
            </div>
        </div>
        <div class="col-sm-3">
            <label for="procedimentolimitecarencia" class="form-label">Limite Carência <span>(dias)</span></label>
            <input type="number" name="procedimentolimitecarencia" id="procedimentolimitecarencia"
                required class="form-control">
        </div>
    </div>
    <div class=" row mb-3">
        <div class="col-sm-6">
            <label for="procedimentoreducaocarencia" class="form-label">Redução de carências</label>
            <textarea name="procedimentoreducaocarencia" id="procedimentoreducaocarencia"
                placeholder="Condições de redução..." class="form-control" rows="2"></textarea>
        </div>
        <div class="col-sm-6">
            <label for="procedimentocongenere" class="form-label">Congêneres</label>
            <textarea name="procedimentocongenere" id="procedimentocongenere"
                placeholder="Condições de congêneres..." class="form-control" rows="2"></textarea>
        </div>
    </div>
    <div class="row mb-3 excluir-div">
        <div class="col-sm-4">
        <button type="button" class="btn btn-danger excluir-procedimento"><i class="bi bi-trash-fill"></i></button>
        </div>
    </div>
</div>`;

    $(novoProcedimento).insertBefore($button);

});

$('.procedimentos').on('click', '.excluir-procedimento', function () {
    $(this).closest('.procedimento').remove();
    reorganizarIdsProcedimentos();
});

$('.excluir-btn').click(function () {
    const form = $(this);
    const idProduto = form.data('id');

    // Exibir um alerta de confirmação
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir este Produto?`);

    // Verificar se o usuário clicou em "Sim"
    if (confirmDelete) {
        // Envie a ação de excluir para a rota do servidor responsável por realizar a exclusão
        $.ajax({
            type: 'DELETE',
            url: `/excluir-produto/${idProduto}`,
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

function reorganizarIdsProcedimentos() {
    $('.procedimento').each(function (index) {
        const novoId = `procedimento-${index + 1}`;
        $(this).attr('id', novoId);
    });
}

function calcularTabelaComercial($container) {
    const valorSpread =  parseFloat($container.find('.valorSpread').val());

    if (!isNaN(valorSpread)) {
        $container.find('.faixaetaria').each(function () {
            const $row = $(this);
            const $fxNetInput = $row.find('.fxetaria');
            const $fxComercialInput = $row.find('.fxComercial');

            const fxNetValue = parseFloat($fxNetInput.val());

            if (!isNaN(fxNetValue)) {
                const novoValorFxComercial = fxNetValue + (fxNetValue * valorSpread / 100);
                const duasCasasDecimais = novoValorFxComercial.toFixed(2);
                const valorArredondado = parseFloat(duasCasasDecimais);

                // Verifica se a terceira casa decimal é maior ou igual a 5
                const terceiraCasaDecimal = Math.floor((valorArredondado * 1000) % 10);
                if (terceiraCasaDecimal > 0) {
                    $fxComercialInput.val((valorArredondado + 0.01).toFixed(2));
                } else {
                    $fxComercialInput.val(valorArredondado.toFixed(2));
                }
            }
            else {
                alert("Preencha todos os campos antes de calcular");
            }
        });
    } else {
        alert('Insira um valor numérico válido no campo Valor de Spread.');
    }
}

$('#cadastrar-produto').click(function (e) {
    e.preventDefault();

    let procedimentos = [];
    const form = $(this).closest('form');

    form.find('.procedimento').each(function () {
        const procedimentoData = {
            descricao: $(this).find('[name="procedimentodescricao"]').val(),
            copay: $(this).find('[name="procedimentocopay"]').val(),
            limitecopay: $(this).find('[name="procedimentolimitecopay"]').val(),
            franquiacopay: $(this).find('[name="procedimentofranquiacopay"]').val(),
            limitecarencia: $(this).find('[name="procedimentolimitecarencia"]').val(),
            reducaocarencia: $(this).find('[name="procedimentoreducaocarencia"]').val(),
            congenere: $(this).find('[name="procedimentocongenere"]').val(),
        }
        procedimentos.push(procedimentoData)
    })

    let formData = {
        idOperadora: $('#cadastrar-produto-form').attr('data-id'),
        nomedoplano: $('#nomeplano').val(),
        ansplano: $('#ansplano').val(),
        contratoplano: $('#contratoplano').val(),
        abrangenciaplano: $('#abrangenciaplano').val(),
        cooparticipacao: $('#cooparticipacao').val(),
        coberturaplano: $('#coberturaplano').val(),
        acomodacao: $('#acomodacaoplano').val(),
        areaabrangencia: $('#areaabrangencia').val(),
        condicoesconjuges: $('#condicoesdependentes_conjuge').val(),
        documentosconjuges: $('#condicoesdependentes_conjuge').val(),
        condicoesfilhos: $('#condicoesdependentes_filhos').val(),
        documentosfilhos: $('#documentosdependentes_filhos').val(),
        condicoesnetos: $('#condicoesdependentes_netos').val(),
        documentosnetos: $('#documentosdependentes_netos').val(),
        condicoespais: $('#condicoesdependentes_pais').val(),
        documentospais: $('#documentosdependentes_pais').val(),
        condicoesoutros: $('#condicoesdependentes_outros').val(),
        documentosoutros: $('#documentosdependentes_outros').val(),
        fx1: $('#fxetaria1').val(),
        fxComercial1: $('#fx1Comercial').val(),
        fx2: $('#fxetaria2').val(),
        fxComercial2: $('#fx2Comercial').val(),
        fx3: $('#fxetaria3').val(),
        fxComercial3: $('#fx3Comercial').val(),
        fx4: $('#fxetaria4').val(),
        fxComercial4: $('#fx4Comercial').val(),
        fx5: $('#fxetaria5').val(),
        fxComercial5: $('#fx5Comercial').val(),
        fx6: $('#fxetaria6').val(),
        fxComercial6: $('#fx6Comercial').val(),
        fx7: $('#fxetaria7').val(),
        fxComercial7: $('#fx7Comercial').val(),
        fx8: $('#fxetaria8').val(),
        fxComercial8: $('#fx8Comercial').val(),
        fx9: $('#fxetaria9').val(),
        fxComercial9: $('#fx9Comercial').val(),
        fx10: $('#fxetaria10').val(),
        fxComercial10: $('#fx10Comercial').val(),
        planoobs: $('#planoobs').val(),
        valorSpread: $('#valorSpread').val()
    };

    console.log(procedimentos)
    console.log(formData)

    $.ajax({
        type: 'POST',
        url: '/cadastrar-produto',
        data: JSON.stringify({ formData: formData, procedimentos: procedimentos }),
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
    const idOperadora = document.getElementById('idOperadora').value

    const formData = {
        idOperadora: idOperadora,
        nomedoplano: form.find('#nomeplano').val(),
        ansplano: form.find('#ansplano').val(),
        contratoplano: form.find('#contratoplano').val(),
        abrangenciaplano: form.find('#abrangenciaplano').val(),
        cooparticipacao: form.find('#cooparticipacao').val(),
        coberturaplano: form.find('#coberturaplano').val(),
        acomodacao: form.find('#acomodacaoplano').val(),
        areaabrangencia: form.find('#areaabrangencia').val(),
        condicoesconjuges: form.find('#condicoesdependentes_conjuge').val(),
        documentosconjuges: form.find('#condicoesdependentes_conjuge').val(),
        condicoesfilhos: form.find('#condicoesdependentes_filhos').val(),
        documentosfilhos: form.find('#documentosdependentes_filhos').val(),
        condicoesnetos: form.find('#condicoesdependentes_netos').val(),
        documentosnetos: form.find('#documentosdependentes_netos').val(),
        condicoespais: form.find('#condicoesdependentes_pais').val(),
        documentospais: form.find('#documentosdependentes_pais').val(),
        condicoesoutros: form.find('#condicoesdependentes_outros').val(),
        documentosoutros: form.find('#documentosdependentes_outros').val(),
        fx1: form.find('#fxetaria1').val(),
        fxComercial1: form.find('#fx1Comercial').val(),
        fx2: form.find('#fxetaria2').val(),
        fxComercial2: form.find('#fx2Comercial').val(),
        fx3: form.find('#fxetaria3').val(),
        fxComercial3: form.find('#fx3Comercial').val(),
        fx4: form.find('#fxetaria4').val(),
        fxComercial4: form.find('#fx4Comercial').val(),
        fx5: form.find('#fxetaria5').val(),
        fxComercial5: form.find('#fx5Comercial').val(),
        fx6: form.find('#fxetaria6').val(),
        fxComercial6: form.find('#fx6Comercial').val(),
        fx7: form.find('#fxetaria7').val(),
        fxComercial7: form.find('#fx7Comercial').val(),
        fx8: form.find('#fxetaria8').val(),
        fxComercial8: form.find('#fx8Comercial').val(),
        fx9: form.find('#fxetaria9').val(),
        fxComercial9: form.find('#fx9Comercial').val(),
        fx10: form.find('#fxetaria10').val(),
        fxComercial10: form.find('#fx10Comercial').val(),
        planoobs: form.find('#planoobs').val()
    }

    let procedimentos = [];

    form.find('.procedimento').each(function () {
        const procedimento = $(this);
        const procedimentoData = {
            id: procedimento.data('id'),
            descricao: procedimento.find('[name="procedimentodescricao"]').val(),
            copay: procedimento.find('[name="procedimentocopay"]').val(),
            limitecopay: procedimento.find('[name="procedimentolimitecopay"]').val(),
            franquiacopay: procedimento.find('[name="procedimentofranquiacopay"]').val(),
            limitecarencia: procedimento.find('[name="procedimentolimitecarencia"]').val(),
            reducaocarencia: procedimento.find('[name="procedimentoreducaocarencia"]').val(),
            congenere: procedimento.find('[name="procedimentocongenere"]').val(),
        };
        procedimentos.push(procedimentoData);
    })

    const idProduto = form.data('id');
    const actionUrl = `/editar-produto/${idProduto}`

    console.log(formData)
    console.log(procedimentos)
    console.log(idProduto)

    $.ajax({
        type: 'POST',
        url: actionUrl,
        data: ({ formData: formData, procedimentos: procedimentos }),
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

