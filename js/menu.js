// Crear una nova instància de Vue.js
new Vue({
    el: '#menu',
    methods: {
      startGame() {
        window.location.href = 'html/menu.html';
      },
      load() {
        alert('Blai no ploris');
      },
      options() {
        alert('Lucia?');
      },
      exit() {
        alert('Exit de la vida ja');
      }
    }
  });
  