document.addEventListener('DOMContentLoaded', fetchLeaderboard);

/**
 * Fetches leaderboard data for various metrics (kills, wins, elo) and types (uhc, meetup).
 * Renders the leaderboards once the data is retrieved.
 * @async
 * @function fetchLeaderboard
 */
async function fetchLeaderboard() {
    try {
        const types = ['uhc', 'meetup'];
        const metrics = ['kills', 'wins', 'elo'];

        // Fetch leaderboard data for all metrics and types
        const leaderboardData = await Promise.all(
            types.flatMap(type => metrics.map(metric => fetchLeaderboardData(metric, type)))
        );

        // Render leaderboards
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const [killsData, winsData, eloData] = leaderboardData.slice(i * metrics.length, (i + 1) * metrics.length);
            renderLeaderboards(killsData, winsData, eloData, type);
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

/**
 * Fetches leaderboard data for a specific field and type (uhc or meetup).
 * @async
 * @function fetchLeaderboardData
 * @param {string} field - The field to fetch data for (e.g., 'kills', 'wins', 'elo').
 * @param {string} type - The type of leaderboard ('uhc' or 'meetup').
 * @returns {Promise<Array>} - A promise that resolves to the leaderboard data.
 * @throws {Error} Throws an error if the response is not ok.
 */
async function fetchLeaderboardData(field, type) {
    const response = await fetch(`http://api.ghoulpvp.club/v1/leaderboards/${type}/sorted?field=${field}&direction=desc`);
    
    if (!response.ok) {
        console.error(`Error fetching ${type} leaderboard data for field ${field}:`, response.status, await response.text());
        throw new Error('Network response was not ok');
    }

    return response.json();
}

/**
 * Renders the leaderboards for a given type by calling the appropriate rendering functions.
 * @function renderLeaderboards
 * @param {Array} killsData - The array of player data for kills.
 * @param {Array} winsData - The array of player data for wins.
 * @param {Array} eloData - The array of player data for Elo.
 * @param {string} type - The type of leaderboard ('uhc' or 'meetup').
 */
function renderLeaderboards(killsData, winsData, eloData, type) {
    renderTopPlayers(killsData, 'kills', type);
    renderTopPlayers(winsData, 'wins', type);
    renderTopPlayers(eloData, 'elo', type);
}

/**
 * Renders the top player for a given metric and updates the corresponding HTML element.
 * @function renderTopPlayers
 * @param {Array} players - The array of player objects.
 * @param {string} metric - The metric to find the top player for (e.g., 'kills', 'wins', 'elo').
 * @param {string} type - The type of leaderboard ('uhc' or 'meetup').
 */
function renderTopPlayers(players, metric, type) {
    if (!players.length) {
        console.warn(`No players found for metric: ${metric}`);
        return;
    }

    const topPlayer = players.reduce((prev, current) => (prev[metric] > current[metric]) ? prev : current);
    const elementId = `top-player-${metric}-${type}`;
    const element = document.getElementById(elementId);

    if (element) {
        element.innerHTML = `
            <div class="avatar">
                <img src="https://skins.mcstats.com/body/side/${topPlayer.uuid}" alt="${topPlayer.name}'s avatar">
            </div>
            <div class="user-meta">
                <a href="/u/${topPlayer.name}" style="color: #5555FF !important">${topPlayer.name}</a>
                <span>Top ${metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
            </div>`;
    }

    renderLeaderboard(players, metric, `${metric}-list-${type}`);
}

/**
 * Renders a leaderboard for a specific metric by updating the corresponding HTML list element.
 * @function renderLeaderboard
 * @param {Array} players - The array of player objects.
 * @param {string} metric - The metric to display (e.g., 'kills', 'wins', 'elo').
 * @param {string} listId - The ID of the HTML list element to update.
 */
function renderLeaderboard(players, metric, listId) {
    const listElement = document.getElementById(listId);
    if (listElement) {
        listElement.innerHTML = ''; // Clear existing list

        players.forEach(player => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `
                <div class="user-meta">
                    <div class="avatar">
                        <img src="https://mc-heads.net/avatar/${player.uuid}/32" alt="${player.name}'s avatar">
                    </div>
                    <a href="/u/${player.name}" style="color: #5555FF !important">${player.name}</a>
                </div>
                <span class="float-right">${player[metric]}</span>`;

            listElement.appendChild(listItem);
        });
    }
}
