const audioCache = {}; // For fast replays
async function searchSongs() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '🔎 Searching...';

  try {
    // ✅ Call your own backend, not YouTube directly
const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);

    const data = await res.json();

    if (!data.items) {
      resultsDiv.innerHTML = '❌ No songs found.';
      return;
    }

    resultsDiv.innerHTML = '';

    for (const item of data.items) {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const thumbnail = item.snippet.thumbnails.medium.url;

      // Show results instantly
      const resultDiv = document.createElement('div');
      resultDiv.className = "bg-gray-800 p-4 rounded flex items-center gap-4";

      resultDiv.innerHTML = `
        <img src="${thumbnail}" class="w-20 rounded">
        <div class="flex-1">
          <p class="font-semibold">${title}</p>
          <button onclick="playAudioFromId('${videoId}')" class="bg-blue-500 px-3 py-1 mt-2 rounded hover:bg-blue-600">▶ Play</button>
        </div>
      `;

      resultsDiv.appendChild(resultDiv);
    }
  } catch (error) {
    console.error("❌ Error in searchSongs():", error);
    resultsDiv.innerHTML = '❌ Something went wrong.';
  }
}

// On-demand fetch only when clicked
async function playAudioFromId(videoId) {
  try {
    let audioUrl = audioCache[videoId];

    const audio = document.getElementById('audioPlayer');
    audio.src = "";
    audio.load();

    document.getElementById("loading")?.remove();
    audio.insertAdjacentHTML("beforebegin", "<p id='loading' class='text-yellow-400'>⏳ Loading song...</p>");

    if (!audioUrl) {
      const res = await fetch(`http://localhost:3000/audio?videoId=${videoId}`);
      const data = await res.json();
      audioUrl = data.audioUrl;
      audioCache[videoId] = audioUrl;
    }

    document.getElementById("loading")?.remove();

    // ✅ Play with custom player UI
    playSong(audioUrl, "Unknown Title", "Unknown Artist", `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);

  } catch (err) {
    alert("⚠️ Failed to play the song. Try again.");
    console.error(err);
  }
}


const audioPlayer = document.getElementById('audioPlayer');
const playerContainer = document.getElementById('playerContainer');
const playerThumbnail = document.getElementById('playerThumbnail');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
const progressBar = document.getElementById('progressBar');
const bufferedBar = document.getElementById('bufferedBar');
const currentTimeText = document.getElementById('currentTime');
const remainingTimeText = document.getElementById('remainingTime');
const loopBtn = document.getElementById('loopBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let songHistory = [];
let currentIndex = -1;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function playSong(url, title = "Unknown Title", artist = "Unknown Artist", thumbnail = "") {
  audioPlayer.src = url;
  audioPlayer.play();

  // Show UI
  playerContainer.classList.remove('hidden');
  playerTitle.textContent = title;
  playerArtist.textContent = artist;
  playerThumbnail.src = thumbnail || 'https://via.placeholder.com/56x56?text=♪';
  playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;

  // Save to history
  songHistory.push({ url, title, artist, thumbnail });
  currentIndex = songHistory.length - 1;
}

// Play/Pause Button
playPauseBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
  } else {
    audioPlayer.pause();
    playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`;
  }
});

// Sync button icon when audio is controlled from Bluetooth or media keys
audioPlayer.addEventListener('play', () => {
  playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
});

audioPlayer.addEventListener('pause', () => {
  playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`;
});


// Volume Control
volumeControl.addEventListener('input', () => {
  audioPlayer.volume = volumeControl.value;
});

// Progress Bar + Buffer
audioPlayer.addEventListener('timeupdate', () => {
  if (!isNaN(audioPlayer.duration)) {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    const remaining = duration - current;

    progressBar.value = (current / duration) * 100;
    currentTimeText.textContent = formatTime(current);
    remainingTimeText.textContent = formatTime(remaining);

    // Buffered % display
    if (audioPlayer.buffered.length) {
      const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / duration) * 100;
      bufferedBar.style.width = `${bufferedPercent}%`;
    }
  }
});

// Seek using Progress Bar
progressBar.addEventListener('input', () => {
  if (!isNaN(audioPlayer.duration)) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  }
});

// Loop Button
loopBtn.addEventListener('click', () => {
  audioPlayer.loop = !audioPlayer.loop;
  loopBtn.textContent = audioPlayer.loop ? 'Looping' : 'Loop';
});

// Next / Previous Buttons
nextBtn.addEventListener('click', () => {
  if (currentIndex < songHistory.length - 1) {
    const next = songHistory[++currentIndex];
    playSong(next.url, next.title, next.artist, next.thumbnail);
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    const prev = songHistory[--currentIndex];
    playSong(prev.url, prev.title, prev.artist, prev.thumbnail);
  }
});


// Optional: auto switch icon if song ends
audioPlayer.addEventListener('ended', () => {
  playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`;
});
