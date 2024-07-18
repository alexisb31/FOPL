// Déclaration des modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const i18next = require('i18next');
const FsBackend = require('i18next-fs-backend');
const authRoutes = require('./authRoutes'); 
const admin = require('./admin');

const app = express();
app.use(admin);
app.use(authRoutes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(passport.initialize());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));



i18next.use(FsBackend).init({
    lng: 'en',
    fallbackLng: 'en',
    debug: true,
    backend: {
        loadPath: './public/locales/{{lng}}/translation.json',
    },
});


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'oplearn'
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.post('/inscription', async (req, res) => {
    const { email, username, password, confirmPassword, role } = req.body;
  
    if (password !== confirmPassword) {
        return res.status(400).send('Les mots de passe ne correspondent pas.');
    }
  
    bcrypt.hash(password, 10, function(err, hash) {
        if (err) {
            console.error('Erreur lors du hachage du mot de passe : ', err);
            return res.status(500).send(err);
        }
        const query = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
        connection.query(query, [username, email, hash, role], (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'insertion : ', error);
                return res.status(500).send(error);
            }
            res.redirect('./confirmation.html');
        });
    });
});

app.get('/accueil', (req, res) => {
    
    const user = {
        username: "Alexis",
        created_at: new Date('2024-04-09T15:20:21Z'),
        role: "teacher"
    };

    
    res.render('accueil', { user: user });
});





app.get('/confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});
