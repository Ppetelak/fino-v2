document.addEventListener("DOMContentLoaded", function () {
  const copyButtons = document.querySelectorAll(".copy-button");

  copyButtons.forEach(function (button) {
    new ClipboardJS(button, {
      text: function (trigger) {
        const spanElement = trigger.parentElement.querySelector("span");
        return spanElement.textContent;
      },
    });
  });
});

document.getElementById("copiarLink").addEventListener("click", () => {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("Link copiado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro ao copiar o link:", error);
    });
});

document.getElementById("gerarExcel").addEventListener("click", async () => {
    const idFino = document.getElementById("idFino").value;
    console.log('Clicou em gerar Excel do FINO de número:', idFino);
})
