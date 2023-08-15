let numProcedimentos = 0;

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

function reorganizarIdsProcedimentos() {
    $('.procedimento').each(function (index) {
        const novoId = `procedimento-${index + 1}`;
        $(this).attr('id', novoId);
    });
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
        nomedoplano: $('#nomedoplano').val(),
        ansplano: $('#ansplano').val(),
        contratoplano: $('#contratoplano').val(),
        abrangenciaplano: $('#abrangenciaplano').val(),
        cooparticipacao: $('#cooparticipacao').val(),
        coberturaplano: $('#coberturaplano').val(),
        acomodacao: $('#acomodacaoplano').val(),
        areaabrangencia: $('#areaabrangencia').val(),
        condicoesdependentes_conjuge: $('#condicoesdependentes_conjuge').val(),
        condicoesdependentes_filhos: $('#condicoesdependentes_filhos').val(),
        documentosdependentes_filhos: $('#documentosdependentes_filhos').val(),
        condicoesdependentes_netos: $('#condicoesdependentes_netos').val(),
        documentosdependentes_netos: $('#documentosdependentes_netos').val(),
        condicoesdependentes_pais: $('#condicoesdependentes_pais').val(),
        documentosdependentes_pais: $('#documentosdependentes_pais').val(),
        condicoesdependentes_outros: $('#condicoesdependentes_outros').val(),
        documentosdependentes_outros: $('#documentosdependentes_outros').val(),
        fxetaria1: $('#fxetaria1').val(),
        fxetaria2: $('#fxetaria2').val(),
        fxetaria3: $('#fxetaria3').val(),
        fxetaria4: $('#fxetaria4').val(),
        fxetaria5: $('#fxetaria5').val(),
        fxetaria6: $('#fxetaria6').val(),
        fxetaria7: $('#fxetaria7').val(),
        fxetaria8: $('#fxetaria8').val(),
        fxetaria9: $('#fxetaria9').val(),
        fxetaria10: $('#fxetaria10').val(),
        planoobs: $('#planoobs').val()
    };

    console.log(procedimentos)
    console.log(formData) 
     
})