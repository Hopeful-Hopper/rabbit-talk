// Define types for function parameters
interface MessageResponse {
    message?: string;
    error?: string;
}

interface SubscriptionResponse {
    message?: string;
    error?: string;
}

interface UnsubscribeResponse {
    message?: string;
    error?: string;
}

// Function to send a message
export async function sendMessage(registrationToken: string, message: string): Promise<void> {
    try {
        // Send POST request to the server
        const response = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ registrationToken, message })
        });

        // Handle the server response
        const result: MessageResponse = await response.json();
        console.log(result.message || result.error);

    } catch (error: any) {
        console.error('Error sending message: ' + error.message);
    }
}

// Function to send a message by Topic
export async function sendMessageByTopic(message: string): Promise<void> {
    try {
        // Send POST request to the server
        const response = await fetch('http://localhost:3000/message-by-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        // Handle the server response
        const result: MessageResponse = await response.json();
        console.log(result.message || result.error);

    } catch (error: any) {
        console.error('Error sending message to topic: ' + error.message);
    }
}

// Function to subscribe to a topic
export async function subscribe(registrationToken: string, topic: string): Promise<void> {
    try {
        // Send POST request to the server
        const response = await fetch('http://localhost:3000/subscribe-to-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ registrationToken, topic })
        });

        // Handle the server response
        const result: SubscriptionResponse = await response.json();
        console.log(result.message || result.error);

    } catch (error: any) {
        console.error('Error subscribing to topic: ' + error.message);
    }
}

// Function to unsubscribe from a topic
export async function unsubscribeFromTopic(registrationToken: string, topic: string): Promise<void> {
    try {
        const response = await fetch('http://localhost:3000/unsubscribe-from-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ registrationToken, topic })
        });
        const result: UnsubscribeResponse = await response.json();
        console.log('Unsubscription result:', result);
    } catch (error: any) {
        console.error('Error unsubscribing from topic: ' + error.message);
    }
}
