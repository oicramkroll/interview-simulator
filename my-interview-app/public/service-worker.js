self.addEventListener("install", (event) => {
    console.log("Service Worker instalado.");
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Interceptando requisição para:", event.request.url);
  });
  
  let deferredPrompt;

  self.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  
    // Mostrar um botão ou mensagem para o usuário instalar o PWA
    const installButton = document.createElement('button');
    installButton.textContent = 'Instalar App';
    installButton.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        } else {
          console.log('Usuário recusou a instalação');
        }
        deferredPrompt = null;
      });
    });
  
    document.body.appendChild(installButton);
  });