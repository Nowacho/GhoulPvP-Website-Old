/**
 * Fetches upcoming UHC event data from the server and displays it on the webpage.
 * If an error occurs during the fetch operation, an error message is displayed.
 * @async
 * @function fetchUHCData
 */
async function fetchUHCData() {
    try {
        const response = await fetch("http://api.ghoulpvp.club/v1/upcoming");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        displayUHCs(data);
        startCountdowns(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        const uhcList = document.getElementById('uhc-list');
        uhcList.innerHTML = '<p style="text-align: center; font-weight: bold;">Error fetching UHC data. Please try again later.</p>';
    }
}

/**
 * Displays the UHC events on the webpage.
 * @function displayUHCs
 * @param {Array} data - An array of UHC event objects.
 */
function displayUHCs(data) {
    const uhcList = document.getElementById('uhc-list');
    uhcList.innerHTML = '';
    
    if (data.length === 0) {
        uhcList.innerHTML = '<p style="text-align: center; font-weight: bold;">No UHC events are currently scheduled. Please check back later.</p>';
        return;
    }
    
    data.forEach(uhc => {
        const listItem = document.createElement('li');
        listItem.className = "list-group-item d-flex justify-content-between align-items-center forum-list-group mb-3";

        const dateTimeDiv = document.createElement('div');
        dateTimeDiv.className = "ms-lg-3 me-auto flex-grow-1";
        dateTimeDiv.innerHTML = `
            <div>
                <span class="fw-bold">${new Date(uhc.opens).toLocaleString()}</span>
            </div>
            <div class="card-feed-meta">
                <span>${getTimeAgo(uhc.opens)}</span>
            </div>
        `;
        
        const gameDetailsDiv = document.createElement('div');
        gameDetailsDiv.className = "ms-lg-3 me-auto flex-grow-1";
        gameDetailsDiv.innerHTML = `
            <div>
                <span class="fw-bold">${uhc.teams}, 1.7-1.8, 200 Slots</span>
            </div>
            <div class="card-feed-meta">
                <span>${uhc.scenarios.join(', ')}</span>
            </div>
        `;
        
        const userDiv = document.createElement('div');
        userDiv.className = "node-user me-auto d-flex justify-content-start align-items-center text-align-right";
        userDiv.innerHTML = `
        <div class="avatar xm">
            <img src="https://mc-heads.net/body/${uhc.hostingName}" alt="${uhc.hostingName}">
        </div>
        <div>
            <a href="/u/${uhc.hostingName}" class="fw-bold" style="text-decoration: none; color: #5555FF;">
                ${uhc.hostingName}
            </a>
            <div class="card-feed-meta">
                <span>Hoster</span>
            </div>
        </div>
        `;

        listItem.appendChild(dateTimeDiv);
        listItem.appendChild(gameDetailsDiv);
        listItem.appendChild(userDiv);
        
        uhcList.appendChild(listItem);
    });
}

/**
 * Starts the countdown timers for each UHC event.
 * @function startCountdowns
 * @param {Array} uhcs - An array of UHC event objects.
 */
function startCountdowns(uhcs) {
    const updateAllCountdowns = () => {
        uhcs.forEach(uhc => {
            const countdownElement = document.getElementById(`countdown-${uhc.id}`);
            if (countdownElement) {
                updateCountdown(uhc.opens, countdownElement);
            }
        });
        requestAnimationFrame(updateAllCountdowns);
    };
    updateAllCountdowns();
}

/**
 * Updates the countdown timer displayed for a specific UHC event.
 * @function updateCountdown
 * @param {string} openTime - The opening time of the UHC event in ISO format.
 * @param {HTMLElement} countdownElement - The HTML element to display the countdown.
 */
function updateCountdown(openTime, countdownElement) {
    const now = Date.now();
    const openDate = new Date(openTime).getTime();
    const distance = openDate - now;

    if (distance < 0) {
        countdownElement.textContent = "Event started!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Returns a human-readable time difference since the event opened.
 * @function getTimeAgo
 * @param {string} openTime - The opening time of the UHC event in ISO format.
 * @returns {string} A string representing the time since the event opened.
 */
function getTimeAgo(openTime) {
    const now = Date.now();
    const distance = now - new Date(openTime).getTime();
    
    if (distance < 60000) return "Just now";
    if (distance < 3600000) return Math.floor(distance / 60000) + " minutes ago";
    if (distance < 86400000) return Math.floor(distance / 3600000) + " hours ago";
    return Math.floor(distance / 86400000) + " days ago";
}

/**
 * Fetches UHC data when the DOM content has loaded.
 * @function
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchUHCData();
});
