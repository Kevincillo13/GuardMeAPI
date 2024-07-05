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

// Manejo del web socket
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
      console.log(`Received message => ${message}`);
      // Process the message and possibly send a response
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  
    // Send a message to the client
    ws.send('Hello from server');
  });
  
  server.listen(8080, () => {
    console.log('Server is listening on port 8080');
  });

// Ruta de inicio de sesión
router.post('/auth/login', async (req, res) => {
    const { email, password, expiresInMins } = req.body;
    const expiresIn = expiresInMins ? `${expiresInMins}m` : '1h';

    // Verifica que `email` y `password` no estén vacíos
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Busca el usuario en la colección de usuarios
    const user = await db.query("find", "Users", { email, password }, { _id: 1, first_name: 1 });
    console.log("Resultado de la búsqueda del usuario:", user);

    if (user && user.length > 0) {
        const token = jwt.sign({ id: user[0]._id, userType: "user" }, SECRET_KEY, { expiresIn });
        return res.json({ token });
    }

    // Si no se encuentra el usuario
    res.status(401).json({ message: "Invalid email or password" });
});

// Middleware para verificar el token
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

// Ruta protegida
router.get('/auth/protected', verifyToken, (req, res) => {
    res.json({ message: "You have access to this route!", user: req.user });
});

module.exports = router;
