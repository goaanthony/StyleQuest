import './public/styles/global.css';
import './public/styles/buttons.css';

// Système de navigation global
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // Vérifie si l'élément cliqué (ou un de ses parents) a l'attribut 'data-href'
  const elementWithHref = target.closest('[data-href]');
  
  if (elementWithHref) {
    const url = elementWithHref.getAttribute('data-href');
    if (url) {
      window.location.href = url;
    }
  }
});

// Votre code spécifique aux pages peut aller ici si besoin
window.addEventListener("DOMContentLoaded", () => {
  console.log("Application chargée");
});