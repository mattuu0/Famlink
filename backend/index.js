require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ルートのインポート
const userRoutes = require('./routes/userRoutes');
const familyRoutes = require('./routes/familyRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// ルーティングの設定
app.use('/api', userRoutes);     // /api/register, /api/login, /api/users/:email
app.use('/api/families', familyRoutes); // /api/families/create, join, leave
app.use('/api/messages', messageRoutes); // /api/messages/ (GET/POST)


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
