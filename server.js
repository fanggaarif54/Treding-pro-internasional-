const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis (HTML, CSS, JS) dari direktori root
app.use(express.static(__dirname));

// Rute Halaman Utama (Sekarang langsung mengarah ke desktop.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'desktop.html'));
});

// Rute alternatif untuk desktop.html
app.get('/desktop.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'desktop.html'));
});

// Rute khusus jika ingin tetap bisa mengakses halaman scanner
app.get('/scanner.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'scanner.html'));
});

// Menjalankan Server dengan Port Dinamis Railway
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
