const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const modal = document.getElementById('game-modal');
const title = document.getElementById('game-title');
const instructions = document.getElementById('game-instructions');
const scoreElement = document.getElementById('score');
const deviceStatus = document.getElementById('device-status');
const gamesContainer = document.querySelector('.games');
const gameSearch = document.getElementById('game-search');
const keys = new Set();
let currentGame = '';
let animationId;
let timerId;
let gameState;

const savedScore = Number(localStorage.getItem('stormHighscore') || 0);
scoreElement.textContent = savedScore ? `Din highscore: ${savedScore}` : 'Ingen score endnu';
updateDeviceLayout();
window.addEventListener('resize', updateDeviceLayout);
window.addEventListener('orientationchange', updateDeviceLayout);
document.addEventListener('keydown', (event) => { keys.add(event.key.toLowerCase()); if (event.key === 'Escape') closeGame(); });
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener('click', handleCanvasClick);

const onlineGames = [
  ['2048', 'Saml talbrikkerne og nå 2048.', 'puzzle'], ['Tetris', 'Byg rækker og ryd banen.', 'arcade'], ['Minesweeper', 'Find minerne uden at eksplodere.', 'puzzle'], ['Solitaire', 'Klassisk kortspil til en rolig runde.', 'cards'], ['Chess', 'Spil skak mod en modstander online.', 'strategy'],
  ['Checkers', 'Flyt brikkerne og slå modstanderen.', 'strategy'], ['Sudoku', 'Fyld alle felter med de rigtige tal.', 'puzzle'], ['Mahjong', 'Find matchende brikker og ryd bordet.', 'puzzle'], ['Flappy Bird', 'Fly gennem rørene uden at ramme.', 'arcade'], ['Doodle Jump', 'Hop højere og højere uden at falde.', 'arcade'],
  ['Pac-Man', 'Spis prikker og undgå spøgelserne.', 'arcade'], ['Asteroids', 'Skyd asteroider og overlev i rummet.', 'arcade'], ['Pong', 'Slå bolden tilbage og vind duellen.', 'sports'], ['Breakout', 'Smadr alle blokkene med bolden.', 'arcade'], ['Frogger', 'Kryds vejen og floden sikkert.', 'arcade'],
  ['Space Invaders', 'Forsvar jorden mod invasionen.', 'arcade'], ['Sonic Runner', 'Løb hurtigt og saml bonusser.', 'action'], ['Endless Runner', 'Løb så langt som muligt.', 'action'], ['Tower Defense', 'Forsvar basen mod bølger af fjender.', 'strategy'], ['Bloons', 'Spræng balloner med præcise skud.', 'strategy'],
  ['Cut the Rope', 'Klip rebene og giv monsteret slik.', 'puzzle'], ['Fireboy and Watergirl', 'Samarbejd gennem tempelbanerne.', 'adventure'], ['Action Turnip', 'Kæmp dig gennem farlige baner.', 'action'], ['Little Alchemy', 'Bland elementer og opdag nye ting.', 'puzzle'], ['Cookie Clicker', 'Klik, bag og byg et cookie-imperium.', 'casual'],
  ['A Dark Room', 'Byg en verden fra næsten ingenting.', 'adventure'], ['Hextris', 'Match farver i en roterende arena.', 'arcade'], ['Krunker', 'Hurtigt multiplayer-skydespil i browseren.', 'action'], ['Shell Shockers', 'Kæmp som et æg i arenaen.', 'action'], ['Surviv.io', 'Overlev mod andre i en battle royale.', 'action'],
  ['Slither.io', 'Bliv større og undgå de andre slanger.', 'action'], ['Agar.io', 'Spis mindre celler og voks dig stor.', 'action'], ['Paper.io', 'Udvid dit område uden at blive fanget.', 'strategy'], ['Hole.io', 'Slug byen og voks hurtigst muligt.', 'action'], ['Drift Hunters', 'Drift gennem baner og forbedr bilen.', 'racing'],
  ['Moto X3M', 'Kør motorcykel gennem vilde baner.', 'racing'], ['Fireboy and Watergirl 2', 'Løs nye samarbejdsbaner sammen.', 'adventure'], ['Worlds Hardest Game', 'Prøv at klare ekstremt svære baner.', 'arcade'], ['Geometry Dash', 'Hop i takt og undgå forhindringer.', 'arcade'], ['Vex 6', 'Løb gennem præcise platformbaner.', 'action'],
  ['Action Games Hub', 'Find flere gratis action-spil online.', 'action'], ['Puzzle Games Hub', 'Find flere gratis puzzle-spil online.', 'puzzle'], ['Racing Games Hub', 'Find flere gratis racerspil online.', 'racing'], ['Strategy Games Hub', 'Find flere gratis strategispil online.', 'strategy'], ['Adventure Games Hub', 'Find flere gratis eventyrspil online.', 'adventure']
];

const gameLinks = {
  '2048': 'https://play2048.co/', 'Tetris': 'https://tetris.com/play-tetris', 'Minesweeper': 'https://minesweeperonline.com/', 'Solitaire': 'https://solitaired.com/', 'Chess': 'https://lichess.org/', 'Checkers': 'https://www.playok.com/en/checkers/', 'Sudoku': 'https://sudoku.com/', 'Mahjong': 'https://www.247mahjong.com/', 'Flappy Bird': 'https://flappybird.io/', 'Doodle Jump': 'https://doodlejump.io/', 'Pac-Man': 'https://pacman.platzh1rsch.ch/', 'Asteroids': 'https://asteroids.ee/', 'Pong': 'https://ponggame.org/', 'Breakout': 'https://breakoutgame.net/', 'Frogger': 'https://froggerclassic.net/', 'Space Invaders': 'https://spaceinvaders.io/', 'Sonic Runner': 'https://www.sonicgames.com/', 'Endless Runner': 'https://www.coolmathgames.com/0-run-3', 'Tower Defense': 'https://www.kingdomrush.com/', 'Bloons': 'https://ninjakiwi.com/Games', 'Cut the Rope': 'https://cuttherope.net/', 'Fireboy and Watergirl': 'https://fireboywatergirl.io/', 'Action Turnip': 'https://poki.com/en/g/action-turnip', 'Little Alchemy': 'https://littlealchemy.com/', 'Cookie Clicker': 'https://orteil.dashnet.org/cookieclicker/', 'A Dark Room': 'https://adarkroom.doublespeakgames.com/', 'Hextris': 'https://hextris.io/', 'Krunker': 'https://krunker.io/', 'Shell Shockers': 'https://shellshock.io/', 'Surviv.io': 'https://surviv.io/', 'Slither.io': 'https://slither.io/', 'Agar.io': 'https://agar.io/', 'Paper.io': 'https://paper-io.com/', 'Hole.io': 'https://hole-io.com/', 'Drift Hunters': 'https://drift-hunters.co/', 'Moto X3M': 'https://moto-x3m.com/', 'Fireboy and Watergirl 2': 'https://fireboywatergirl.io/fireboy-and-watergirl-2/', 'Worlds Hardest Game': 'https://worldshardestgame.com/', 'Geometry Dash': 'https://geometrydash.io/', 'Vex 6': 'https://vex6.io/', 'Action Games Hub': 'https://poki.com/en/action', 'Puzzle Games Hub': 'https://poki.com/en/puzzle', 'Racing Games Hub': 'https://poki.com/en/racing', 'Strategy Games Hub': 'https://poki.com/en/strategy', 'Adventure Games Hub': 'https://poki.com/en/adventure'
};

const morePokiGames = [
  ['Fireboy Watergirl Forest Temple', 'fireboy-and-watergirl-forest-temple', 'adventure'], ['Red Ball 4', 'red-ball-4', 'arcade'], ['Stickman Hook', 'stickman-hook', 'action'], ['Subway Surfers', 'subway-surfers', 'action'], ['Temple Run 2', 'temple-run-2', 'action'], ['Papa Louie 2', 'papa-louie-2', 'adventure'], ['Monkey Mart', 'monkey-mart', 'casual'], ['My Perfect Hotel', 'my-perfect-hotel', 'casual'], ['Drive Mad', 'drive-mad', 'racing'], ['Getaway Shootout', 'getaway-shootout', 'action'],
  ['Rooftop Snipers', 'rooftop-snipers', 'action'], ['Basket Random', 'basket-random', 'sports'], ['Soccer Random', 'soccer-random', 'sports'], ['Boxing Random', 'boxing-random', 'sports'], ['Volley Random', 'volley-random', 'sports'], ['Drift Boss', 'drift-boss', 'racing'], ['Highway Traffic', 'highway-traffic', 'racing'], ['Monster Truck Racing', 'monster-truck-racing', 'racing'], ['Uphill Rush', 'uphill-rush', 'racing'], ['Super Star Car', 'super-star-car', 'racing'],
  ['Stickman Hook 2', 'stickman-hook-2', 'action'], ['Stickman Climb', 'stickman-climb', 'action'], ['Stickman Fighter', 'stickman-fighter', 'action'], ['Venge.io', 'venge-io', 'action'], ['Zombs Royale', 'zombs-royale', 'action'], ['Combat Online', 'combat-online', 'action'], ['Time Shooter', 'time-shooter', 'action'], ['Gun Mayhem 2', 'gun-mayhem-2', 'action'], ['Fireboy and Watergirl 3', 'fireboy-and-watergirl-3', 'adventure'], ['Fireboy and Watergirl 4', 'fireboy-and-watergirl-4', 'adventure'],
  ['Bob the Robber', 'bob-the-robber', 'adventure'], ['Bob the Robber 2', 'bob-the-robber-2', 'adventure'], ['Adam and Eve', 'adam-and-eve', 'adventure'], ['Adam and Eve Go', 'adam-and-eve-go', 'adventure'], ['Snail Bob', 'snail-bob', 'adventure'], ['Snail Bob 2', 'snail-bob-2', 'adventure'], ['Wheely', 'wheely', 'puzzle'], ['Wheely 2', 'wheely-2', 'puzzle'], ['Viking Escape', 'viking-escape', 'action'], ['Ninja Clash Heroes', 'ninja-clash-heroes', 'action'],
  ['Papa Pizza', 'papa-pizza', 'casual'], ['Papa Burgeria', 'papa-burgeria', 'casual'], ['Papa Donuteria', 'papa-donuteria', 'casual'], ['Papa Pancakeria', 'papa-pancakeria', 'casual'], ['Fireboy Watergirl Maze', 'fireboy-watergirl-maze', 'puzzle'], ['House Paint', 'house-paint', 'puzzle'], ['Color Pixel Art Classic', 'color-pixel-art-classic', 'puzzle'], ['Draw Climber', 'draw-climber', 'puzzle'], ['Brain Test', 'brain-test', 'puzzle'], ['Brain Test 2', 'brain-test-2', 'puzzle'],
  ['Narrow One', 'narrow-one', 'action'], ['Action Combat', 'action-combat', 'action'], ['Crazy Shooters', 'crazy-shooters', 'action'], ['Masked Forces', 'masked-forces', 'action'], ['Pixel Warfare', 'pixel-warfare', 'action'], ['Mini Royale Nations', 'mini-royale-nations', 'action'], ['Rally Point', 'rally-point', 'racing'], ['Super Bike the Champion', 'super-bike-the-champion', 'racing'], ['Car Rush', 'car-rush', 'racing'], ['City Car Driving', 'city-car-driving', 'racing'],
  ['Drift Dudes', 'drift-dudes', 'racing'], ['Parking Fury', 'parking-fury', 'racing'], ['Parking Fury 3', 'parking-fury-3', 'racing'], ['Bus Driver', 'bus-driver', 'racing'], ['Moto Road Rash 3D', 'moto-road-rash-3d', 'racing'], ['Snow Rider 3D', 'snow-rider-3d', 'racing'], ['Winter Clash 3D', 'winter-clash-3d', 'action'], ['Action King', 'action-king', 'action'], ['Stick Merge', 'stick-merge', 'action'], ['Ragdoll Archers', 'ragdoll-archers', 'action'],
  ['Idle Breakout', 'idle-breakout', 'casual'], ['Idle Mining Empire', 'idle-mining-empire', 'casual'], ['Idle Lumber Run', 'idle-lumber-run', 'casual'], ['Merge Cakes', 'merge-cakes', 'casual'], ['Gold Digger FRVR', 'gold-digger-frvr', 'casual'], ['Farm Land', 'farm-land', 'casual'], ['Big Farm', 'big-farm', 'casual'], ['Fish Eat Fish', 'fish-eat-fish', 'casual'], ['Duck Life', 'duck-life', 'sports'], ['Duck Life 4', 'duck-life-4', 'sports'],
  ['Chess Challenges', 'chess-challenges', 'strategy'], ['Master Chess', 'master-chess', 'strategy'], ['Checkers Legend', 'checkers-legend', 'strategy'], ['Fireboy Watergirl Online', 'fireboy-watergirl-online', 'strategy'], ['Stickman War', 'stickman-war', 'strategy'], ['Battle Wheels', 'battle-wheels', 'strategy'], ['Plants vs Zombies', 'plants-vs-zombies', 'strategy'], ['Kingdom Rush', 'kingdom-rush', 'strategy'], ['Ninja Clash', 'ninja-clash', 'strategy'], ['Bad Ice Cream', 'bad-ice-cream', 'puzzle'],
  ['Bad Ice Cream 2', 'bad-ice-cream-2', 'puzzle'], ['Bad Ice Cream 3', 'bad-ice-cream-3', 'puzzle'], ['Worlds Hardest Game 2', 'worlds-hardest-game-2', 'puzzle'], ['Bloxorz', 'bloxorz', 'puzzle'], ['Cut the Rope Experiments', 'cut-the-rope-experiments', 'puzzle'], ['Snail Bob 8', 'snail-bob-8', 'adventure'], ['Red and Blue Stickman', 'red-and-blue-stickman', 'adventure'], ['Two Cat', 'two-cat', 'adventure'], ['Duo Vikings', 'duo-vikings', 'adventure'], ['Viking Pub', 'viking-pub', 'adventure']
].map(([name, slug, category]) => [name, `Spil ${name} direkte på Poki.`, category, `https://poki.com/en/g/${slug}`]);
onlineGames.push(...morePokiGames);
populateOnlineGames();
gameSearch.addEventListener('input', filterGames);

function populateOnlineGames() {
  onlineGames.forEach(([name, description, category, directUrl], index) => {
    const card = document.createElement('article');
    card.className = 'card online-card';
    card.dataset.search = `${name} ${description} ${category}`.toLowerCase();
    card.innerHTML = `<div class="card-top"><span class="icon online-icon">↗</span><span class="game-number">${String(index + 6).padStart(3, '0')}</span></div><h3>${name}</h3><p>${description}</p><a class="online-link" href="${directUrl || gameLinks[name]}" target="_blank" rel="noopener noreferrer">Spil nu <span>↗</span></a>`;
    gamesContainer.append(card);
  });
}

function filterGames() {
  const searchTerm = gameSearch.value.trim().toLowerCase();
  document.querySelectorAll('.games .card').forEach((card) => {
    const searchableText = `${card.dataset.search || ''} ${card.innerText}`.toLowerCase();
    card.hidden = searchTerm && !searchableText.includes(searchTerm);
  });
}

function startGame(name) {
  currentGame = name;
  title.textContent = name;
  modal.hidden = false;
  modal.classList.add('is-fullscreen');
  document.body.classList.add('game-is-fullscreen');
  enterFullscreen();
  cancelLoops();
  if (name === 'Snake') setupSnake();
  if (name === 'Block Runner') setupRunner();
  if (name === 'Space Dodge') setupDodge();
  if (name === 'Neon Tap') setupTap();
  if (name === 'Orbit Catch') setupOrbit();
}
function restartGame() { startGame(currentGame); }
function getDeviceType() {
  if (window.matchMedia('(max-width: 600px)').matches) return 'phone';
  if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet';
  return 'desktop';
}
function updateDeviceLayout() {
  const device = getDeviceType();
  document.body.dataset.device = device;
  if (deviceStatus) deviceStatus.innerHTML = `<span class="status-dot"></span> ${device === 'phone' ? 'MOBIL' : device === 'tablet' ? 'TABLET' : 'DESKTOP'}`;
}
function isPhone() { return getDeviceType() === 'phone'; }
function enterFullscreen() {
  const target = document.documentElement;
  const request = target.requestFullscreen || target.webkitRequestFullscreen;
  if (request) Promise.resolve(request.call(target)).catch(() => {});
}
function closeGame() { cancelLoops(); modal.hidden = true; modal.classList.remove('is-fullscreen'); document.body.classList.remove('game-is-fullscreen'); if (document.fullscreenElement) document.exitFullscreen?.(); }
function cancelLoops() { cancelAnimationFrame(animationId); clearInterval(timerId); keys.clear(); }
function finishGame(points, message) {
  cancelLoops();
  const oldScore = Number(localStorage.getItem('stormHighscore') || 0);
  if (points > oldScore) { localStorage.setItem('stormHighscore', points); scoreElement.textContent = `Ny highscore: ${points}!`; }
  else { scoreElement.textContent = `${currentGame}: ${points} point. Highscore: ${oldScore}`; }
  closeGame();
}
function clearCanvas() { context.fillStyle = '#101820'; context.fillRect(0, 0, canvas.width, canvas.height); }
function drawText(value, x, y, size = 16, color = '#f2efe8') { context.fillStyle = color; context.font = `${size}px Arial`; context.fillText(value, x, y); }

function setupSnake() { instructions.textContent = 'Brug piletasterne. Spis de orange prikker, men ram ikke dig selv.'; gameState = { snake: [{ x: 10, y: 8 }], direction: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 16, y: 8 }, points: 0 }; timerId = setInterval(updateSnake, 115); drawSnake(); }
function updateSnake() { const directions = { arrowup: { x: 0, y: -1 }, arrowdown: { x: 0, y: 1 }, arrowleft: { x: -1, y: 0 }, arrowright: { x: 1, y: 0 } }; const nextDirection = directions[[...keys].find((key) => directions[key])]; if (nextDirection && nextDirection.x !== -gameState.direction.x && nextDirection.y !== -gameState.direction.y) gameState.next = nextDirection; gameState.direction = gameState.next; const head = { x: gameState.snake[0].x + gameState.direction.x, y: gameState.snake[0].y + gameState.direction.y }; if (head.x < 0 || head.x >= 32 || head.y < 0 || head.y >= 18 || gameState.snake.some((part) => part.x === head.x && part.y === head.y)) return finishGame(gameState.points, 'Du ramte en væg eller dig selv.'); gameState.snake.unshift(head); if (head.x === gameState.food.x && head.y === gameState.food.y) { gameState.points += 10; gameState.food = { x: Math.floor(Math.random() * 32), y: Math.floor(Math.random() * 18) }; } else gameState.snake.pop(); drawSnake(); }
function drawSnake() { clearCanvas(); const size = 20; context.fillStyle = '#ff765c'; context.fillRect(gameState.food.x * size + 3, gameState.food.y * size + 3, 14, 14); gameState.snake.forEach((part, index) => { context.fillStyle = index ? '#c7f36b' : '#f2efe8'; context.fillRect(part.x * size + 2, part.y * size + 2, 16, 16); }); drawText(`SCORE ${gameState.points}`, 14, 22, 13, '#c7f36b'); }

function setupRunner() { instructions.textContent = 'Brug venstre/højre eller A/D for at undgå blokkene.'; gameState = { x: 300, points: 0, blocks: [], tick: 0 }; animationId = requestAnimationFrame(updateRunner); }
function updateRunner() { gameState.tick++; if (keys.has('arrowleft') || keys.has('a')) gameState.x -= 5; if (keys.has('arrowright') || keys.has('d')) gameState.x += 5; gameState.x = Math.max(18, Math.min(622, gameState.x)); if (gameState.tick % 35 === 0) gameState.blocks.push({ x: 20 + Math.random() * 600, y: -25, speed: 2 + gameState.points / 150 }); gameState.blocks.forEach((block) => { block.y += block.speed; }); if (gameState.blocks.some((block) => Math.abs(block.x - gameState.x) < 28 && block.y > 305)) return finishGame(gameState.points, 'En blok ramte dig.'); gameState.blocks = gameState.blocks.filter((block) => block.y < 380); gameState.points++; drawRunner(); animationId = requestAnimationFrame(updateRunner); }
function drawRunner() { clearCanvas(); context.fillStyle = '#c7f36b'; context.fillRect(gameState.x - 18, 315, 36, 20); context.fillStyle = '#ff765c'; gameState.blocks.forEach((block) => context.fillRect(block.x - 13, block.y, 26, 26)); drawText(`SCORE ${gameState.points}`, 14, 22, 13, '#c7f36b'); }

function setupDodge() { instructions.textContent = 'Brug piletasterne eller WASD. Overlev så længe som muligt.'; gameState = { x: 320, y: 300, points: 0, rocks: [], tick: 0 }; animationId = requestAnimationFrame(updateDodge); }
function updateDodge() { gameState.tick++; if (keys.has('arrowleft') || keys.has('a')) gameState.x -= 4; if (keys.has('arrowright') || keys.has('d')) gameState.x += 4; if (keys.has('arrowup') || keys.has('w')) gameState.y -= 4; if (keys.has('arrowdown') || keys.has('s')) gameState.y += 4; gameState.x = Math.max(15, Math.min(625, gameState.x)); gameState.y = Math.max(45, Math.min(345, gameState.y)); if (gameState.tick % 22 === 0) gameState.rocks.push({ x: Math.random() * 640, y: -20, speed: 2 + Math.random() * 3 }); gameState.rocks.forEach((rock) => { rock.y += rock.speed; }); if (gameState.rocks.some((rock) => Math.hypot(rock.x - gameState.x, rock.y - gameState.y) < 24)) return finishGame(gameState.points, 'En asteroide ramte dit skib.'); gameState.rocks = gameState.rocks.filter((rock) => rock.y < 390); gameState.points++; drawDodge(); animationId = requestAnimationFrame(updateDodge); }
function drawDodge() { clearCanvas(); context.fillStyle = '#c7f36b'; context.beginPath(); context.moveTo(gameState.x, gameState.y - 16); context.lineTo(gameState.x - 13, gameState.y + 14); context.lineTo(gameState.x + 13, gameState.y + 14); context.closePath(); context.fill(); context.fillStyle = '#ff765c'; gameState.rocks.forEach((rock) => { context.beginPath(); context.arc(rock.x, rock.y, 13, 0, Math.PI * 2); context.fill(); }); drawText(`SCORE ${gameState.points}`, 14, 22, 13, '#c7f36b'); }

function setupTap() { instructions.textContent = 'Klik på den orange cirkel så mange gange som muligt på 20 sekunder.'; gameState = { x: 320, y: 180, points: 0, seconds: 20 }; drawTap(); timerId = setInterval(() => { gameState.seconds--; drawTap(); if (gameState.seconds <= 0) finishGame(gameState.points, 'Tiden er gået.'); }, 1000); }
function handleCanvasClick(event) { if (currentGame !== 'Neon Tap' || !gameState) return; const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) * canvas.width / rect.width; const y = (event.clientY - rect.top) * canvas.height / rect.height; if (Math.hypot(x - gameState.x, y - gameState.y) < 28) { gameState.points++; gameState.x = 35 + Math.random() * 570; gameState.y = 55 + Math.random() * 250; drawTap(); } }
function drawTap() { clearCanvas(); context.fillStyle = '#ff765c'; context.beginPath(); context.arc(gameState.x, gameState.y, 27, 0, Math.PI * 2); context.fill(); drawText('TAP!', gameState.x - 15, gameState.y + 5, 12, '#101820'); drawText(`SCORE ${gameState.points}`, 14, 22, 13, '#c7f36b'); drawText(`${gameState.seconds}s`, 585, 22, 13, '#f2efe8'); }

function setupOrbit() { instructions.textContent = 'Brug venstre/højre eller A/D for at dreje. Fang de grønne signaler.'; gameState = { angle: 0, points: 0, target: Math.random() * Math.PI * 2 }; animationId = requestAnimationFrame(updateOrbit); }
function updateOrbit() { if (keys.has('arrowleft') || keys.has('a')) gameState.angle -= .06; if (keys.has('arrowright') || keys.has('d')) gameState.angle += .06; const difference = Math.atan2(Math.sin(gameState.angle - gameState.target), Math.cos(gameState.angle - gameState.target)); if (Math.abs(difference) < .1) { gameState.points += 10; gameState.target = Math.random() * Math.PI * 2; } drawOrbit(); animationId = requestAnimationFrame(updateOrbit); }
function drawOrbit() { clearCanvas(); const center = { x: 320, y: 190 }; context.strokeStyle = '#667078'; context.lineWidth = 2; context.beginPath(); context.arc(center.x, center.y, 105, 0, Math.PI * 2); context.stroke(); context.fillStyle = '#ff765c'; context.beginPath(); context.arc(center.x, center.y, 24, 0, Math.PI * 2); context.fill(); const ship = { x: center.x + Math.cos(gameState.angle) * 105, y: center.y + Math.sin(gameState.angle) * 105 }; context.fillStyle = '#f2efe8'; context.fillRect(ship.x - 7, ship.y - 7, 14, 14); const target = { x: center.x + Math.cos(gameState.target) * 105, y: center.y + Math.sin(gameState.target) * 105 }; context.fillStyle = '#c7f36b'; context.beginPath(); context.arc(target.x, target.y, 10, 0, Math.PI * 2); context.fill(); drawText(`SCORE ${gameState.points}`, 14, 22, 13, '#c7f36b'); }

function resetScore() { localStorage.removeItem('stormHighscore'); scoreElement.textContent = 'Highscore nulstillet!'; }
