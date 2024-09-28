
import Phaser from 'phaser';
import ChatBox from './scenes/Chat box';
import GlobalChat from './scenes/Global chat';

const config = {
    type: Phaser.AUTO,
    parent:'phaser-example',
    width: 800,
    height: 500,
    physics:{
        default: 'arcade',
        arcade: {
            gravity: {y:0},
            debug: true
        }
    },
    scale: {
        zoom: 1
    },
    dom: {
        createContainer: true
    },
    scene: [GlobalChat]
};

// Create a Phaser Game instance
const game = new Phaser.Game(config);

// Store the game instance globally so it can be accessed elsewhere
(window as any).game = game;

// Export the game instance
export default game;
