import { Game } from './game/Game';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const game = new Game(canvas);
    game.start();
});