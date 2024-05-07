const needle = document.querySelector('.needle');
const speedInput = document.getElementById('speed');
const scrollEvents = [];
let inertiaInterval;
let returnInterval;

function setSpeed(speed) {
  const angle = (speed / 180) * 270 + 140; // Convert speed to angle (-135 for initial offset)
  needle.style.transform = `rotate(${angle}deg)`;
}

function calculateAverageSpeed() {
  if (scrollEvents.length === 0) return 0;
  const now = new Date().getTime();
  const threshold = now - 5000; // 5 seconds
  let totalDeltaY = 0;
  let count = 0;
  for (let i = scrollEvents.length - 1; i >= 0; i--) {
    if (scrollEvents[i].timestamp < threshold) break;
    totalDeltaY += scrollEvents[i].deltaY;
    count++;
  }
  return count > 0 ? totalDeltaY / count : 0;
}

function updateSpeed() {
  const averageSpeed = calculateAverageSpeed();
  const normalizedSpeed = Math.min(Math.max(averageSpeed, -0.3), 0.3); // Limit speed between -0.3 and 0.3
  const newSpeed = Number(speedInput.value) + normalizedSpeed;
  speedInput.value = Math.min(Math.max(newSpeed, 0), 180); // Limit speed between 0 and 180
  setSpeed(speedInput.value);
}

function startInertia() {
  inertiaInterval = setInterval(() => {
    if (scrollEvents.length === 0) {
      clearInterval(inertiaInterval);
      return;
    }
    const decayRate = 0.98; // Rate at which speed decreases
    const lastEvent = scrollEvents[scrollEvents.length - 1];
    const deltaTime = new Date().getTime() - lastEvent.timestamp;
    if (deltaTime >= 100) { // If no scroll events in the last 100 milliseconds, stop inertia
      clearInterval(inertiaInterval);
      scrollEvents.length = 0;
      return;
    }
    const currentSpeed = calculateAverageSpeed();
    const newSpeed = currentSpeed * decayRate;
    const clampedSpeed = Math.min(Math.max(newSpeed, -0.3), 0.3); // Limit speed between -0.3 and 0.3
    speedInput.value = Math.min(Math.max(Number(speedInput.value) + clampedSpeed, 0), 180); // Limit speed between 0 and 180
    setSpeed(speedInput.value);
    updateSpeed();
  }, 100);
}

function startReturnToZero() {
  setTimeout(() => {
    returnInterval = setInterval(() => {
      if (scrollEvents.length === 0) {
        const currentSpeed = Number(speedInput.value);
        const decayRate = 0.97; // Rate at which speed decreases
        const newSpeed = currentSpeed * decayRate;
        speedInput.value = Math.max(newSpeed, 0);
        setSpeed(speedInput.value);
        if (newSpeed === 0) clearInterval(returnInterval);
      }
    }, 100);
  }, 1000); // Delay the start of the return-to-zero timer by 1 second
}

// Listen for scroll wheel events
window.addEventListener('wheel', function(event) {
  event.preventDefault(); // Prevent the default scrolling behavior
  const deltaY = event.deltaY; // Get the scroll wheel delta
  const timestamp = new Date().getTime();
  scrollEvents.push({ deltaY, timestamp });
  startInertia();
  clearInterval(returnInterval); // Clear return-to-zero timer
});

// Start the return-to-zero timer when there are no scroll events
window.addEventListener('mousemove', function() {
  clearInterval(returnInterval); // Clear return-to-zero timer
  startReturnToZero();
});

setSpeed(0);