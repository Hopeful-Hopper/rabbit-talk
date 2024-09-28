import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
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

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL as string
});

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define interfaces for request bodies
interface SendMessageRequest extends Request {
    body: {
        registrationToken: string;
        message: string;
    };
}

interface SubscribeRequest extends Request {
    body: {
        registrationToken: string;
        topic: string;
    };
}

// API endpoint for sending messages to a single user
app.post('/send-message', async (req: SendMessageRequest, res: Response) => {
    try {
        const { registrationToken, message } = req.body;

        // Define the payload
        const payload = {
            data: {
                title: 'World Chat',
                body: message
            },
            token: registrationToken
        };

        const response = await admin.messaging().send(payload);
        console.log('Message sent successfully:', response);
        const statusMessage = 'Message sent';
        res.status(200).json({ message: statusMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});



// API endpoint for sending a message to a topic
app.post('/message-by-topic', async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        const payload = {
            data: {
                title: 'Global Chat',
                body: message
            },
            topic: 'Global'
        };

        const response = await admin.messaging().send(payload);
        console.log('Message sent successfully:', response);
        res.status(200).json({ message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});

// API endpoint for subscribing to a topic
app.post('/subscribe-to-topic', async (req: SubscribeRequest, res: Response) => {
    try {
        const { registrationToken, topic } = req.body;

        const response = await admin.messaging().subscribeToTopic([registrationToken], topic);
        console.log('Subscription status:', response);
        res.status(200).json({ message: "Subscription successful" });
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        res.status(500).json({ error: 'Error subscribing to topic' });
    }
});

// API endpoint for unsubscribing from a topic
app.post('/unsubscribe-from-topic', async (req: SubscribeRequest, res: Response) => {
    try {
        const { registrationToken, topic } = req.body;

        const response = await admin.messaging().unsubscribeFromTopic([registrationToken], topic);
        console.log('Subscription cancellation status:', response);
        res.status(200).json({ message: "Successfully Unsubscribed" });
    } catch (error) {
        console.error('Error unsubscribing from topic:', error);
        res.status(500).json({ error: 'Error unsubscribing from topic' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});