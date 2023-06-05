// Crear una nova instància de Vue.js
new Vue({
    el: '#menu',
    methods: {
      startGame() {
        window.location.href = 'html/game.html';
      },
      load() {
        alert('No ens ha donat temps :(');
      },
      options() {
      },
      exit() {
        alert('Exit');
      }
    }
  });
  