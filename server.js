const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Frandraisana json avu @ frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/cuves', require('./routes/cuves'));
app.use('/api/mouvements', require('./routes/mouvements'));

app.listen(PORT, () => {
    console.log(`🚀 Serveur click ctrl+touche http://localhost:${PORT}`);
});