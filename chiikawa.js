const timer = document.getElementById('timer');
const progress = document.getElementById('progress');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status');
const soundButton = document.getElementById('sound-button');
const sessionLength = 15 * 60;
let sessionStartedAt;
let sessionTimer;
let youtubePlayer;

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('youtube-player', {
    events: { onReady: startSession, onError: showPlayerError }
  });
};

function startSession() {
  if (sessionTimer) return;
  sessionStartedAt = Date.now();
  sessionTimer = window.setInterval(updateSession, 250);
  statusText.textContent = 'Afspiller playlist muted';
  statusDot.classList.add('ready');
  youtubePlayer?.playVideo();
}

function updateSession() {
  const elapsed = Math.floor((Date.now() - sessionStartedAt) / 1000);
  const remaining = Math.max(0, sessionLength - elapsed);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  timer.textContent = `${minutes}:${seconds}`;
  progress.style.width = `${(elapsed / sessionLength) * 100}%`;
  if (remaining === 0) stopSession();
}

function stopSession() {
  if (sessionTimer) window.clearInterval(sessionTimer);
  sessionTimer = null;
  youtubePlayer?.pauseVideo();
  timer.textContent = '00:00';
  progress.style.width = '100%';
  statusText.textContent = 'Session færdig';
}

function showPlayerError() {
  statusText.textContent = 'YouTube kunne ikke afspille playlisten';
  statusDot.classList.remove('ready');
}

soundButton.addEventListener('click', () => {
  if (!youtubePlayer) return;
  if (youtubePlayer.isMuted()) {
    youtubePlayer.unMute();
    soundButton.textContent = 'Sluk lyd';
    statusText.textContent = 'Afspiller med lyd';
  } else {
    youtubePlayer.mute();
    soundButton.textContent = 'Start lyd';
    statusText.textContent = 'Afspiller uden lyd';
  }
});
