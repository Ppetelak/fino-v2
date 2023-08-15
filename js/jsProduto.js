let numProcedimentos = 1;

$('.adicionar-procedimento').click(function () {
    const $button = $(this)

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
            <button type="button" class="btn btn-danger excluir-procedimento">Excluir Procedimento</button>
        </div>
    </div>
</div>`;

    $button.before(novoProcedimento);

});