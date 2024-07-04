const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const router = express.Router(); 
router.use(express.urlencoded({ extended: true }));


// Configurer multer pour stocker les fichiers sur le disque
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')  // Chemin du dossier où les fichiers seront sauvegardés
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  // Nom de fichier unique
  }
});

const upload = multer({ storage: storage });

// Créer une connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '',
  database: 'oplearn'
});

// Middleware pour gérer les erreurs et la promesse de requête SQL
function queryPromise(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}


// Route pour l'upload de fichiers de cours
router.post('/upload', upload.single('file'), (req, res) => {
  const { title, description,category, level } = req.body;
  const file_path = req.file.path;



  // Insérer les données du cours dans la base de données
  const query = 'INSERT INTO courses (title, description, file_path, category, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
db.query(query, [title, description, file_path, category, level], (err, result) => {
  if (err) {
    console.error('Erreur lors de l\'insertion du cours : ', err);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du cours' });
  }
  res.json({ success: true, message: 'Cours uploadé avec succès' });
});
});


// Route pour l'upload de vidéos
router.post('/upload_video', upload.single('video'), (req, res) => {
  const { title, description } = req.body;
  const file_path = req.file.path;

  // Insérer les données de la vidéo dans la base de données
  const query = 'INSERT INTO videos (title, description, file_path, uploaded_at) VALUES (?, ?, ?, NOW())';
  db.query(query, [title, description, file_path], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion de la vidéo : ', err);
      return res.status(500).send('Erreur lors de l\'enregistrement de la vidéo');
    }
    res.send('Vidéo uploadée avec succès');
  });
}); 


// Route pour afficher la liste des cours
router.get('/liste_cours', (req, res) => {
  const query = 'SELECT * FROM courses';
  queryPromise(query).then(courses => {
    res.render('liste_cours', { courses });
  }).catch(err => {
    console.error(err);
    res.status(500).send('Erreur du serveur');
  });
});

// Route pour récupérer la liste des vidéos
router.get('/videos', (req, res) => {
  const query = 'SELECT * FROM videos ORDER BY uploaded_at DESC';
  queryPromise(query).then(videos => {
    res.render('videos', { videos });
  }).catch(err => {
    console.error(err);
    res.status(500).send('Erreur du serveur');
  });
});

router.get('/discussion', (req, res) => {
  res.render('discussion');
});

// Route pour le triage des cours
router.post('/search', (req, res) => {
  let { category, level } = req.body;
  let query = 'SELECT * FROM courses WHERE 1=1';
  let queryParams = [];

  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }
  if (level) {
    query += ' AND level = ?';
    queryParams.push(level);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Erreur lors de la recherche des cours : ', err);
      return res.status(500).send('Erreur lors de la recherche des cours');
    }
    res.json(results);
  });
});

module.exports = router;