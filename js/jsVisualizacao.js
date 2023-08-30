document.addEventListener('DOMContentLoaded', function() {
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(function(button) {
    new ClipboardJS(button, {
      text: function(trigger) {
        const spanElement = trigger.parentElement.querySelector('span'); 
        return spanElement.textContent;
      }
    });
  });
});

document.getElementById('pdfImprimir').addEventListener('click', () => {
  window.print();
});

document.getElementById('copiarLink').addEventListener('click', () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado com sucesso!');
  }).catch((error) => {
      console.error('Erro ao copiar o link:', error);
  });
});

document.getElementById('baixarJson').addEventListener('click', async () => {
  const idFino = document.getElementById('idFino').value

  try {
      const response = await fetch(`/finojson/${idFino}`);
      if (!response.ok) {
          console.error('Erro ao obter o JSON');
          return;
      }

      const jsonData = await response.json();
      const jsonString = JSON.stringify(jsonData, null, 2);

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Dados Fino ${idFino}.json`;
      a.textContent = 'Baixar JSON';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  } catch (error) {
      console.error('Erro ao baixar o JSON:', error);
  }
});
