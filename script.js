const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const modal = document.getElementById('game-modal');
const title = document.getElementById('game-title');
const instructions = document.getElementById('game-instructions');
const scoreElement = document.getElementById('score');
const keys = new Set();
let currentGame = '';
let animationId;
let timerId;
let gameState;

const savedScore = Number(localStorage.getItem('stormHighscore') || 0);
scoreElement.textContent = savedScore ? `Din highscore: ${savedScore}` : 'Ingen score endnu';
document.addEventListener('keydown', (event) => { keys.add(event.key.toLowerCase()); if (event.key === 'Escape') closeGame(); });
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener('click', handleCanvasClick);

function startGame(name) {
  currentGame = name;
  title.textContent = name;
  modal.hidden = false;
  cancelLoops();
  if (name === 'Snake') setupSnake();
  if (name === 'Block Runner') setupRunner();
  if (name === 'Space Dodge') setupDodge();
  if (name === 'Neon Tap') setupTap();
  if (name === 'Orbit Catch') setupOrbit();
}
function restartGame() { startGame(currentGame); }
function closeGame() { cancelLoops(); modal.hidden = true; }
function cancelLoops() { cancelAnimationFrame(animationId); clearInterval(timerId); keys.clear(); }
function finishGame(points, message) {
  cancelLoops();
  const oldScore = Number(localStorage.getItem('stormHighscore') || 0);
  if (points > oldScore) { localStorage.setItem('stormHighscore', points); scoreElement.textContent = `Ny highscore: ${points}!`; instructions.textContent = `${message} Ny highscore! Tryk Start forfra for en ny runde.`; }
  else { scoreElement.textContent = `${currentGame}: ${points} point. Highscore: ${oldScore}`; instructions.textContent = `${message} Tryk Start forfra for at prøve igen.`; }
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
