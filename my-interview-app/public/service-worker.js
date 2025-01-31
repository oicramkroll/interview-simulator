self.addEventListener("install", (event) => {
    console.log("Service Worker instalado.");
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Interceptando requisição para:", event.request.url);
  });