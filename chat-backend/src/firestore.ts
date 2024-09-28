import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {initializeApp} from 'firebase/app';
import {getFirestore, collection, addDoc, Timestamp, serverTimestamp, getDoc} from 'firebase/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import serviceAccount from '../rabbits-island-firebase-account.json'with { type: "json" };


// Use import.meta.url to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIlI6isIaDakLeEVWoYWoQnK6NciZQUjc",
    authDomain: "rabbits-island.firebaseapp.com",
    databaseURL: "https://rabbits-island-default-rtdb.firebaseio.com",
    projectId: "rabbits-island",
    storageBucket: "rabbits-island.appspot.com",
    messagingSenderId: "1012959708765",
    appId: "1:1012959708765:web:813f3323fe7abdc3822fb4",
    measurementId: "G-DH07QDFB14"
};

const firebaseapp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseapp);


// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define interfaces for request bodies
interface Message {
    body: {
        userId: string;
        message: string;
        room: string;
    };
  }



  
// API endpoint for sending messages
app.post('/send-message', async (req: Message , res: Response) => {
try {
    const { userId, message, room } = req.body;

    // Validate request body
    if (!room || !userId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send the message
    const docRef = await addDoc(collection(db, "messages"), {
        userId: userId,
        message: message,
        room: room,
        timestamp: serverTimestamp() 
    });

    console.log("Document written with ID: ", docRef.id);

    // Respond with success
    res.status(200).json({ message: 'Message sent', documentId: docRef.id });
} catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: 'Error sending message' });
}
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});







  

 


