// const express = require('express');
// const cors = require('cors');
// const { exec } = require('child_process');

// const app = express();
// const PORT = 3000;

// app.use(cors());

// app.get('/audio', (req, res) => {
//   const videoId = req.query.videoId;
//   if (!videoId) return res.status(400).send('Missing videoId');

//   const url = `https://www.youtube.com/watch?v=${videoId}`;
//   const command = `yt-dlp -g -f bestaudio[ext=m4a] ${url}`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error('yt-dlp error:', stderr);
//       return res.status(500).send('Failed to fetch audio URL');
//     }

//     const audioUrl = stdout.trim();
//     res.json({ audioUrl });
//   });
// });

// app.listen(PORT, () => {
//   console.log(`✅ Melodify backend running at http://localhost:${PORT}`);
// });


require('dotenv').config(); // 👈 This loads the .env file

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'https://smelody.netlify.app'  // ✅ <-- allow your frontend here
}));

// ✅ Secure YouTube Search
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query) return res.status(400).send("Missing search query");

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("YouTube API error:", err);
    res.status(500).send("Failed to fetch YouTube data");
  }
});

// 🎵 Existing Audio Endpoint
app.get('/audio', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).send('Missing videoId');

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const command = `yt-dlp -g -f bestaudio[ext=m4a] ${url}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).send('Failed to fetch audio URL');
    }

    const audioUrl = stdout.trim();
    res.json({ audioUrl });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Melodify backend running at http://localhost:${PORT}`);
});
