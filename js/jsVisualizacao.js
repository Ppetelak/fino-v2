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
