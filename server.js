const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Static Files (CSS, JS) Load செய்ய
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// index.html எங்கு இருந்தாலும் சரியாகக் கண்டுபிடித்து அனுப்பும் Route
app.get('/', (req, res) => {
    const viewsPath = path.join(__dirname, 'views', 'index.html');
    const publicPath = path.join(__dirname, 'public', 'index.html');

    if (fs.existsSync(viewsPath)) {
        res.sendFile(viewsPath);
    } else if (fs.existsSync(publicPath)) {
        res.sendFile(publicPath);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Frontend UI Server running on http://localhost:3000`);
});