import Phaser from 'phaser';
import firebase from 'firebase/app';
import AwaitLoader from 'phaser3-rex-plugins/plugins/awaitloader';
import { Preload as SetupFirebase, SingleRoom, Messages, Broadcast } from 'phaser3-rex-plugins/plugins/firebase-components';
import { sendMessage, subscribe, unsubscribeFromTopic } from '../actions'
import { requestPermission } from '../getToken';



export default class ChatBox extends Phaser.Scene {
    private userID: string;
    private userName: string;
    private messages: any
    private rexFire: any;
    private room: any;

    constructor() {
        super('chat');
        this.userID = '';
        this.userName = '';
        this.messages;
    }

    preload(): void { 
        requestPermission();
        const firebaseConfig = {

        };

        

        AwaitLoader.call(this.load, async function (successCallback: Function, failureCallback: Function) {
            await SetupFirebase({}, firebaseConfig);
            successCallback();
        })

        this.load.plugin('rexfirebaseplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexfirebaseplugin.min.js', true);

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });      

    }

    create(): void {
        this.userID = GetRandomWord(10);
        this.userName = GetRandomWord(5, 10);

        this.messages = new Messages({
            root: 'messages'
        });

        const mainPanel = CreateMainPanel(this, {
            x: 400, y: 300,
            width: 640, height: 560,
            color: {
                background: 0x0E376F,
                track: 0x3A6BA5,
                thumb: 0xBFCDBB,
                inputBackground: 0x685784,
                inputBox: 0x182456
            },
            userName: this.userName
        }).layout();

        mainPanel.on('send-message', async (message: string) => {
            // Send POST request to the server
            mainPanel.setFCMTokenBox();
            const registrationToken = "cgM-DaLOSMVaifKh6Q84bE:APA91bHXnV4CzEO2yKEgp-Z-7Nb-0pAXAhiyvPRAOiwieBCssgrgMY5lzsC4huHSOTMk3KWKTzP_ldph5zAh5Mut3oBDj6tNdjykKbO2Ni9Io_svbTvYEkLvSgcyA8m91fmf7ZMaiBXJ";
            await sendMessage(registrationToken, message);
        }).on('change-name', (newUserName: string) => {
            this.room.changeUserName(newUserName);
        });


        // Listen for messages from the service worker
        this.events.on('serviceWorkerMessage', (payload: any) => {
        console.log('Received payload:', payload);

        // Update the FCMTokenBox with the new message
        const FCMTokenBox = mainPanel.getByName('upperPanel').getByName('FCMTokenBox');
        if (FCMTokenBox) {
            FCMTokenBox.appendText(`New message: ${payload.data.body}\n`);
        }
        
    });
    }

    update(): void {
    }
}

interface PanelConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    color: {
        background: number;
        track: number;
        thumb: number;
        inputBackground: number;
        inputBox: number;
    };
    userName: string;
}

const CreateMainPanel = (scene: Phaser.Scene, config: PanelConfig) => {
    const mainPanel = scene.rexUI.add.sizer({
        x: config.x, y: config.y,
        width: config.width, height: config.height,
        orientation: 'y'
    });

    const upperPanel = scene.rexUI.add.sizer({ orientation: 'x', name:'upperPanel' });
    const background = scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, config.color.background);
    const userListBox = CreateUserListBox(mainPanel, config);
    const inputPanel = CreateInputPanel(mainPanel, config);
    const FCMTokenBox = CreateFCMTokenBox(mainPanel, config);
    console.log('inside main panel', FCMTokenBox);

    upperPanel.add(userListBox, 0, 'center', { right: 5 }, true)
              .add(FCMTokenBox, 1, 'center', { right: 5 }, true)

    mainPanel.addBackground(background)
             .add(upperPanel, 2, 'center', { top: 10, bottom: 10, left: 5, right: 5 }, true)
             .add(inputPanel, 1, 'center', 0, true);

    return mainPanel;
};

const CreateUserListBox = (parent: any, config: PanelConfig) => {
    const scene = parent.scene;
    const userListBox = scene.rexUI.add.textArea({
        width: 150,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, config.color.inputBox, 0.5),
        text: scene.rexUI.add.BBCodeText(0, 0, '', {}),
        slider: false,
        name: 'userListBox'
    });

    parent.setUserList = (users: any[]) => {
        const s: string[] = [];
        users.forEach((user: any) => {
            s.push(user.userName);
        });
        userListBox.setText(s.join('\n'));
    };
    return userListBox;
};

const CreateFCMTokenBox = (parent: any, config: PanelConfig) => {
    const scene = parent.scene;

    const FCMTokenBox = scene.rexUI.add.textArea({
        width: 150,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, config.color.inputBox, 0.5),
        text: scene.rexUI.add.BBCodeText(0, 0, 'FCM Token', {}),
        slider: false,
        name: 'FCMTokenBox' // Name the FCMTokenBox so it can be accessed later
    });

    parent.setFCMTokenBox = () => {
        const token = localStorage.getItem('fcmToken');
        if (token) {
           // FCMTokenBox.setText(`FCM Token: ${token}`);
        }
    };

    return FCMTokenBox;
};

const CreateInputPanel = (parent: any, config: PanelConfig) => {
    const scene = parent.scene;
    
    // Debugging log
    console.log('Creating Input Panel');
    
    // Background
    const background = scene.rexUI.add.roundRectangle(0, 0, 2, 2, { bl: 20, br: 20 }, config.color.inputBackground);
    
    // UserName Box
    const userNameBox = scene.rexUI.add.BBCodeText(0, 0, config.userName, {
        halign: 'right',
        valign: 'center',
        fixedWidth: 120,
        fixedHeight: 20
    });
    
    // Input Box
    const inputBox = scene.rexUI.add.BBCodeText(0, 0, 'Hello world', {
        halign: 'left',
        valign: 'center',
        fixedWidth: 100,
        fixedHeight: 20,
        backgroundColor: `#${config.color.inputBox.toString(16)}`
    });
    
    // Send Button
    const sendBtn = scene.rexUI.add.BBCodeText(0, 0, 'Send', {});
    
    // Create Input Panel
    const inputPanel = scene.rexUI.add.label({
        height: 40,
        background: background,
        icon: userNameBox,
        text: inputBox,
        expandTextWidth: true,
        action: sendBtn,
        space: {
            left: 15, right: 15, top: 0, bottom: 0,
            icon: 10, text: 10,
        }
    });
    
    // Set interactivity
    sendBtn.setInteractive().on('pointerdown', () => {
        if (inputBox.text !== '') {
            console.log('Send button clicked, sending message:', inputBox.text);
            parent.emit('send-message', inputBox.text, userNameBox.text);
            inputBox.text = '';
        }
    });
    
    userNameBox.setInteractive().on('pointerdown', () => {
        const prevUserName = userNameBox.text;
        scene.rexUI.edit(userNameBox, undefined, (textObject: any) => {
            const currUserName = textObject.text;
            if (currUserName !== prevUserName) {
                console.log('User name changed from', prevUserName, 'to', currUserName);
                parent.emit('change-name', currUserName, prevUserName);
            }
        });
    });
    
    inputBox.setInteractive().on('pointerdown', () => {
        scene.rexUI.edit(inputBox);
    });
    
    console.log('Input Panel Created:', inputPanel);
    return inputPanel;
};


const RandomInt = Phaser.Math.Between;
const RandomItem = Phaser.Utils.Array.GetRandom;
const CANDIDATES = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const GetRandomWord = (min: number, max?: number, candidates: string = CANDIDATES): string => {
    const count = (max === undefined) ? min : RandomInt(min, max);
    let word = '';
    const candidatesArray = candidates.split(''); // Split the string into an array of characters
    for (let j = 0; j < count; j++) {
        word += RandomItem(candidatesArray);
    }
    return word;
};

