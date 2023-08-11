$(document).ready(function () {
    $('[name="operadora"]').on('change', function () {
        const selectedOperadoraId = $(this).val();

        $.ajax({
            type: 'GET',
            url: `/contatos/${selectedOperadoraId}`, // Altere para a rota correta
            success: function (data) {
                // Atualize a tabela de contatos com os dados recebidos
                const contatosTableBody = $('#contatos-section').find('tbody');
                contatosTableBody.empty();

                data.contatos.forEach(function (contato) {
                    contatosTableBody.append(`
                    <tr>
                    <td>
                        ${contato.nome}
                    </td>
                    <td>
                        ${contato.telefone}
                    </td>
                    <td>
                        ${contato.cargo}
                    </td>
                    <td>
                        <!-- Botão "Editar" -->
                        <button type="button" class="btn btn-primary editar-btn" data-bs-toggle="collapse"
                            data-bs-target="#editar${contato.id}" aria-expanded="false"
                            aria-controls="editar${contato.id}">
                            Editar
                        </button>
                        <button type="button" class="btn btn-secondary cancelar-btn d-none">Cancelar</button>
                    </td>
                </tr>
                <!-- Formulário de edição (colapsado por padrão) -->
                <tr class="collapse editar-form-container" id="editar${contato.id}" data-id="${contato.id}">
                    <td colspan="4">
                        <form class="editar-form" data-id="${contato.id}">
                            <table class="table table-borderless">
                                <tr>
                                    <!-- Primeira coluna com os primeiros campos de edição -->
                                    <td>
                                        <div class="mb-3">
                                            <label for="nome" class="form-label">Nome: </label>
                                            <input type="text" class="form-control" id="nome"
                                                name="nome" value="${contato.nome}"
                                                required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="email" class="form-label">Email: </label>
                                            <input type="text" class="form-control" id="email" name="email"
                                                value="${contato.email}" required>
                                        </div>
                                    </td>
                                    <!-- Segunda coluna com os campos restantes de edição -->
                                    <td>
                                        <div class="mb-3">
                                            <label for="telefone" class="form-label">Telefone: </label>
                                            <input type="text" class="form-control" id="telefone"
                                                name="telefone" value="${contato.telefone}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="cargo" class="form-label">Cargo: </label>
                                            <input type="text" class="form-control" id="cargo"
                                                name="cargo" value="${contato.cargo}"
                                                required>
                                        </div>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <!-- Botões "Salvar" e "Cancelar" -->
                                        <button type="submit" class="btn btn-success salvar-btn">Salvar</button>
                                        <button type="button" class="btn btn-danger excluir-btn"
                                            data-id="${contato.id}">Excluir</button>
                                    </td>
                                </tr>
                            </table>

                    </td>
                    </form>
                </tr>
                    `);
                });

                $('#contatos-section').show();
            },
            error: function (xhr, status, error) {
                console.error('Erro ao buscar dados de contato:', error);
            }
        });
    });
});