
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Database memori sementara untuk menyimpan akun user
const users = {};
const transactions = [];

// Endpoint Register dari halaman Terminator AI
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, error: "Email dan Password wajib diisi!" });
    }

    if (users[email]) {
        return res.json({ success: false, error: "Email sudah terdaftar! Silakan login." });
    }

    // Buat akun baru
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    users[email] = {
        userId,
        username: username || 'Arif Trader',
        email,
        password,
        balance: 50000 // Bonus saldo awal demo/pembuka Rp 50.000
    };

    console.log(`[REGISTRASI] Akun baru: ${email}`);
    res.json({ success: true, message: "Registrasi Berhasil!", userId, username: users[email].username });
});

// Endpoint Login dari halaman Terminator AI
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!users[email]) {
        // Auto-register jika email belum ada untuk memudahkan pengujian
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        users[email] = {
            userId,
            username: email.split('@')[0],
            email,
            password,
            balance: 50000
        };
    }

    const user = users[email];
    if (user.password !== password) {
        return res.json({ success: false, error: "Password salah!" });
    }

    console.log(`[LOGIN] ${email} masuk ke sistem.`);
    res.json({ success: true, message: "Login Berhasil!", userId: user.userId, username: user.username });
});

// Endpoint Cek Saldo
app.get('/api/balance/:userId', (req, res) => {
    const { userId } = req.params;
    // Cari user berdasarkan userId
    let foundUser = Object.values(users).find(u => u.userId === userId);

    if (foundUser) {
        res.json({ balance: foundUser.balance });
    } else {
        res.json({ balance: 50000 });
    }
});

// Endpoint Deposit Saldo (DANA, OVO, BCA, BRI, Mandiri, dll)
app.post('/api/deposit', (req, res) => {
    const { userId, amount, paymentMethod } = req.body;

    let foundUser = Object.values(users).find(u => u.userId === userId);
    if (!foundUser) {
        // Buat temporary user jika tidak ketemu
        foundUser = { userId, username: 'Arif Trader', balance: 0 };
        users[userId] = foundUser;
    }

    const numAmount = Number(amount);
    if (numAmount < 10000) {
        return res.json({ success: false, error: "Minimum deposit adalah Rp 10.000" });
    }

    foundUser.balance += numAmount;

    transactions.push({
        userId,
        type: 'DEPOSIT',
        amount: numAmount,
        method: paymentMethod,
        time: new Date().toLocaleTimeString()
    });

    console.log(`[DEPOSIT BERHASIL] ${userId} | Rp ${numAmount} via ${paymentMethod}`);
    res.json({
        success: true,
        message: `Deposit Rp ${numAmount.toLocaleString('id-ID')} via ${paymentMethod} Berhasil!`,
        newBalance: foundUser.balance
    });
});

// Endpoint Transaksi Trading / Betting (Profit / Loss)
app.post('/api/bet', (req, res) => {
    const { userId, betAmount, prediction, marketResult } = req.body;

    let foundUser = Object.values(users).find(u => u.userId === userId);
    if (!foundUser || foundUser.balance < betAmount) {
        return res.status(400).json({ success: false, error: "Saldo tidak mencukupi atau user tidak valid!" });
    }

    foundUser.balance -= Number(betAmount);

    const isWin = prediction === marketResult;
    let payout = 0;

    if (isWin) {
        payout = Math.round(Number(betAmount) * 1.90);
        foundUser.balance += payout;
    }

    res.json({
        success: true,
        isWin,
        payout,
        newBalance: foundUser.balance
    });
});


// Halaman Terminal Pro Desktop
app.get('/desktop.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'desktop.html'));
});

// Halaman Scanner Utama (Via URL langsung dengan ekstensi)
app.get('/scanner.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'scanner.html'));
});

// Halaman Scanner Utama (Via Root /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'scanner.html'));
});


app.listen(PORT, () => {    console.log('==================================================');
    console.log(`🚀 TERMINATOR AI & TRADING PRO AKTIF DI PORT ${PORT}`);
    console.log(`💻 Akses browser: http://localhost:${PORT}/`);
    console.log('==================================================');
});