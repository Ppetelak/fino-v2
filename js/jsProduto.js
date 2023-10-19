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

/* function calcularTabelaComercial($container) {
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
                    $fxComercialInput.attr('value', (valorArredondado + 0.01).toFixed(2));
                } else {
                    $fxComercialInput.val(valorArredondado.toFixed(2));
                    $fxComercialInput.attr('value', valorArredondado.toFixed(2));
                }
            }
            else {
                alert("Preencha todos os campos antes de calcular");
            }
        });
    } else {
        alert('Insira um valor numérico válido no campo Valor de Spread.');
    }
} */

function calcularTabelaComercial($container) {
    const valorSpread = parseFloat($container.find('.valorSpread').val());

    if (!isNaN(valorSpread)) {
        let valorAnterior = null;

        $container.find('.faixaetaria').each(function () {
            const $row = $(this);
            const $fxNetInput = $row.find('.fxetaria');
            const $fxComercialInput = $row.find('.fxComercial');
            const $variacaoInput = $row.find('.variacao');

            const fxNetValue = parseFloat($fxNetInput.val());

            if (!isNaN(fxNetValue)) {
                const novoValorFxComercial = fxNetValue + (fxNetValue * valorSpread / 100);
                const duasCasasDecimais = novoValorFxComercial.toFixed(2);
                const valorArredondado = parseFloat(duasCasasDecimais);

                if (valorAnterior !== null) {
                    const variacao = ((valorArredondado - valorAnterior) / valorAnterior) * 100;
                    const variacaoDuasCasas = variacao.toFixed(2);
                    $variacaoInput.val(variacaoDuasCasas);
                    $variacaoInput.attr('value', variacaoDuasCasas)
                }

                valorAnterior = valorArredondado;

                const terceiraCasaDecimal = Math.floor((valorArredondado * 1000) % 10);
                if (terceiraCasaDecimal > 0) {
                    $fxComercialInput.val((valorArredondado + 0.01).toFixed(2));
                    $fxComercialInput.attr('value', (valorArredondado + 0.01).toFixed(2));
                } else {
                    $fxComercialInput.val(valorArredondado.toFixed(2));
                    $fxComercialInput.attr('value', valorArredondado.toFixed(2));
                }
            } else {
                alert("Preencha todos os campos antes de calcular");
            }
        });
    } else {
        alert('Insira um valor numérico válido no campo Valor de Spread.');
    }
}



$('#cadastrar-produto').click(function (e) {
    e.preventDefault();

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
        variacao1: $('#variacao1').val(),
        variacao2: $('#variacao2').val(),
        variacao3: $('#variacao3').val(),
        variacao4: $('#variacao4').val(),
        variacao5: $('#variacao5').val(),
        variacao6: $('#variacao6').val(),
        variacao7: $('#variacao7').val(),
        variacao8: $('#variacao8').val(),
        variacao9: $('#variacao9').val(),
        planoobs: $('#planoobs').val(),
        valorSpread: $('#valorSpread').val(),
        reducaocarencia: $('#procedimentoreducaocarencia').val(),
        congenere: $('#procedimentocongenere').val(),
    };

    console.log(formData)

    $.ajax({
        type: 'POST',
        url: '/cadastrar-produto',
        data: JSON.stringify({ formData: formData }),
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

$('.duplicate').click(function () {
    var produtoId = this.getAttribute('data-produto-id');
    console.log('Clicou no prouto de ID:', produtoId)

    $.ajax({
        type: 'POST',
        url: `/duplicar-produto/${produtoId}`,
        processData: false,
        success: function (response) {
            console.log('Resposta Backend', response);
            location.reload();
        },
        error: function (response) {
            showMessageError(response.message)
            console.error('Erro ao cadastrar produto:', response)
        },
    });
})

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
        variacao1: form.find('#variacao1').val(),
        variacao2: form.find('#variacao2').val(),
        variacao3: form.find('#variacao3').val(),
        variacao4: form.find('#variacao4').val(),
        variacao5: form.find('#variacao5').val(),
        variacao6: form.find('#variacao6').val(),
        variacao7: form.find('#variacao7').val(),
        variacao8: form.find('#variacao8').val(),
        variacao9: form.find('#variacao9').val(),
        planoobs: form.find('#planoobs').val(),
        reducaocarencia: form.find('#procedimentoreducaocarencia').val(),
        congenere: form.find('#procedimentocongenere').val(),
    }

    const idProduto = form.data('id');
    const actionUrl = `/editar-produto/${idProduto}`

    console.log(formData)

    $.ajax({
        type: 'POST',
        url: actionUrl,
        data: ({ formData: formData }),
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

