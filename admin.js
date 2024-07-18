const express = require('express');
const passport = require('passport');
const mysql = require('mysql');
const multer = require('multer');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')  
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  
  }
});

const upload = multer({ storage: storage });


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'oplearn'
});


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

router.post('/upload', upload.single('file'), (req, res) => {
  const { title, description, category, level } = req.body;
  const file_path = req.file.path;

  
  const query = 'INSERT INTO courses (title, description, file_path, category, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
  db.query(query, [title, description, file_path, category, level], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion du cours : ', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du cours' });
    }
    const successHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Succès de l'upload</title>
      <style>
          body {
              background-image: url('https://images.unsplash.com/photo-1557683316-973673baf926');
              font-family: "Montserrat", sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
          }

          .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.8);
              -webkit-backdrop-filter: blur(10px);
              backdrop-filter: blur(10px);
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          .logo {
              max-width: 30%;
              height: auto;
              margin-bottom: 20px;
              border-radius: 5px;
          }

          .message-box h1 {
              color: #333;
          }

          .message-box p {
              color: #555;
              margin-bottom: 20px;
          }

          button {
              font-family: "Montserrat", sans-serif;
              font-weight: 500;
              padding: 10px 20px;
              border: none;
              background-color: #58a9c0;
              color: white;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s;
          }

          button:hover {
              background-color: #0056b3;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="message-box">
              <h1>Cours uploadé avec succès</h1>
              <p>Votre vidéo a été uploadé avec succès.</p>
          </div>
      </div>

      <script>
          // Disappear after 3 seconds
          setTimeout(function() {
              document.querySelector('.container').style.display = 'none';
          }, 3000);
      </script>
  </body>
  </html>`;

  res.send(successHtml);
});
});

router.post('/upload_video', upload.single('video'), (req, res) => {
  const { title, description } = req.body;
  const file_path = req.file.path;


  const query = 'INSERT INTO videos (title, description, file_path, uploaded_at) VALUES (?, ?, ?, NOW())';
db.query(query, [title, description, file_path], (err, result) => {
  if (err) {
    console.error('Erreur lors de l\'insertion de la vidéo : ', err);
    return res.status(500).send('Erreur lors de l\'enregistrement de la vidéo');
  }
  
  const successHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Succès de l'upload</title>
      <style>
          body {
              background-image: url('https://images.unsplash.com/photo-1557683316-973673baf926');
              font-family: "Montserrat", sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
          }

          .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.8);
              -webkit-backdrop-filter: blur(10px);
              backdrop-filter: blur(10px);
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          .logo {
              max-width: 30%;
              height: auto;
              margin-bottom: 20px;
              border-radius: 5px;
          }

          .message-box h1 {
              color: #333;
          }

          .message-box p {
              color: #555;
              margin-bottom: 20px;
          }

          button {
              font-family: "Montserrat", sans-serif;
              font-weight: 500;
              padding: 10px 20px;
              border: none;
              background-color: #58a9c0;
              color: white;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s;
          }

          button:hover {
              background-color: #0056b3;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="message-box">
              <h1>Vidéo uploadée avec succès</h1>
              <p>Votre vidéo a été uploadée avec succès.</p>
          </div>
      </div>

      <script>
          // Disappear after 3 seconds
          setTimeout(function() {
              document.querySelector('.container').style.display = 'none';
          }, 3000);
      </script>
  </body>
  </html>`;

  res.send(successHtml);
});
});



router.get('/liste_cours', (req, res) => {
  const query = 'SELECT * FROM courses';
  queryPromise(query).then(courses => {
    res.render('liste_cours', { courses });
  }).catch(err => {
    console.error(err);
    res.status(500).send('Erreur du serveur');
  });
});


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


router.post('/comments', (req, res) => {
  const { author, comment } = req.body;

  const query = 'INSERT INTO comments (author, comment, created_at) VALUES (?, ?, ?, NOW())';
  db.query(query, [video_id, author, comment], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion du commentaire : ', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du commentaire' });
    }
    res.json({ success: true, message: 'Commentaire ajouté avec succès' });
  });
});


router.get('/comments', (req, res) => {
  const query = 'SELECT * FROM comments ORDER BY created_at DESC';
  queryPromise(query).then(comments => {
    res.json(comments);
  }).catch(err => {
    console.error(err);
    res.status(500).send('Erreur du serveur');
  });
});

router.get('/upload_cours', (req, res) => {

  const userRole = req.user.role;
  res.render('/upload_cours', { role: userRole });
});




module.exports = router;
