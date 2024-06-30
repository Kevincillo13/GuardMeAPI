const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require("../../databases/db");

// Clave secreta para firmar el token.
const SECRET_KEY = 'guardMe';

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
