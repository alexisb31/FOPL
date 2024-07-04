const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router(); 
const session = require('express-session');
router.use(express.urlencoded({ extended: true }));

// Configurer la session
router.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true,
}));

// Créer une connexion à la base de données
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'oplearn'
});

// Connecter à la base de données
connection.connect((err) => {
  if (err) throw err;
  console.log('Connecté à la base de données');
});

// Route pour connexion à l'application
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur du serveur');
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password_hash, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erreur du serveur');
        }

        if (isMatch) {
  
          req.session.user = { id: result[0].user_id, username: result[0].username, role: result[0].role };
          
          res.redirect('/accueil');
        } else {

          res.send('Mot de passe incorrect');
        }
      });
    } else {
   
      res.send('Nom d\'utilisateur non trouvé');
    }
  });
});

/// vers la page d'accueil
router.get('/accueil', (req, res) => {
  if(req.session.user) {
    res.sendFile(path.join(__dirname, '../ProjetAnnuel/public/accueil/accueil.html'));
  } else {
    res.redirect('/login.html'); 
  }
}); 

module.exports = router;
