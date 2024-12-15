const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Dossier temporaire pour stocker les fichiers
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configuration de Multer pour gérer les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Endpoint pour uploader un fichier
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier envoyé');
    }
    res.send({ message: 'Fichier uploadé', filename: req.file.filename });
});

// Endpoint pour télécharger un fichier
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Fichier introuvable');
    }
    res.download(filePath, (err) => {
        if (err) console.error('Erreur téléchargement:', err);
    });
});

// Endpoint pour lister les fichiers disponibles
app.get('/files', (req, res) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            return res.status(500).send('Erreur lecture fichiers');
        }
        res.send(files);
    });
});

// Endpoint pour supprimer un fichier
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Fichier introuvable');
    }
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Erreur suppression fichier');
        }
        res.send({ message: 'Fichier supprimé' });
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
