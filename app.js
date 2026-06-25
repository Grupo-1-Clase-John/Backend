import express from 'express';
const app = express();
const PORT = 3000;


app.get("/", (req, res) => {
    res.json({
        mensaje: "¡Servidor funcionando correctamente!"
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//Corre el servidor con npm start