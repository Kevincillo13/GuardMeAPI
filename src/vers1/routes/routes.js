const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require("../../databases/db");
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Clave secreta para firmar el token.
const SECRET_KEY = 'guardMe';

// Manejo del WebSocket
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        // Parsear el mensaje si está en JSON
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error('Invalid JSON format:', error);
            return;
        }
        
        // Procesar el mensaje y posiblemente enviar una respuesta
        console.log(`Heart Rate: ${data.heartRate}, Blood Oxygen: ${data.bloodOxygen}, ECG Data: ${data.ecgData}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Enviar un mensaje al cliente
    ws.send(JSON.stringify({ message: 'Hello from server' }));
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

// Rutas de autenticación y protegidas
router.post('/auth/login', async (req, res) => {
    const { email, password, expiresInMins } = req.body;
    const expiresIn = expiresInMins ? `${expiresInMins}m` : '1h';

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await db.query("find", "Users", { email, password }, { _id: 1, first_name: 1 });
    console.log("Resultado de la búsqueda del usuario:", user);

    if (user && user.length > 0) {
        const token = jwt.sign({ id: user[0]._id, userType: "user" }, SECRET_KEY, { expiresIn });
        return res.json({ token });
    }

    res.status(401).json({ message: "Invalid email or password" });
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.get('/auth/protected', verifyToken, (req, res) => {
    res.json({ message: "You have access to this route!", user: req.user });
});

module.exports = router;
