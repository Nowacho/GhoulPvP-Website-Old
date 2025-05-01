/**
 * Loads the player profile based on the player name obtained from the URL.
 * Fetches the profile data and player statistics, then updates the profile info on the webpage.
 * Redirects to 404 page if profile is not found.
 * Displays an error message if any error occurs during the process.
 * @async
 * @function loadPlayerProfile
 */
async function loadPlayerProfile() {
    const playerName = getPlayerNameFromURL();

    try {
        const profileData = await fetchProfileData();
        const playerProfile = profileData.find(player => player.lowerCaseName === playerName.toLowerCase());

        if (!playerProfile) {
            // Redirect to 404.html if profile is not found
            window.location.href = '/404.html';
            return;
        }

        const playerStats = await fetchPlayerStats(playerProfile.uuid);
        if (!playerStats) {
            displayError('Player statistics could not be obtained.');
            return;
        }

        updateProfileInfo(playerProfile, playerStats);
    } catch (error) {
        console.error('Error obtaining profile data:', error);
        displayError('Error loading profile.');
    }
}

/**
 * Retrieves the player name from the current URL.
 * @function getPlayerNameFromURL
 * @returns {string} The player name extracted from the URL.
 */
function getPlayerNameFromURL() {
    return window.location.pathname.split('/u/')[1];
}

/**
 * Fetches all player profile data from the API.
 * @async
 * @function fetchProfileData
 * @returns {Promise<Array>} A promise that resolves to an array of player profile objects.
 * @throws {Error} Throws an error if the response is not ok.
 */
async function fetchProfileData() {
    const profileResponse = await fetch('http://api.ghoulpvp.club/v1/profile');
    if (!profileResponse.ok) throw new Error(`Error: ${profileResponse.status}`);
    return await profileResponse.json();
}

/**
 * Fetches statistics for a specific player based on their UUID.
 * @async
 * @function fetchPlayerStats
 * @param {string} playerUUID - The UUID of the player.
 * @returns {Promise<Object>} A promise that resolves to an object containing UHC and Meetup statistics.
 */
async function fetchPlayerStats(playerUUID) {
    try {
        const [uhcStats, meetupStats] = await Promise.all([
            fetchStats('uhc', playerUUID),
            fetchStats('meetup', playerUUID)
        ]);

        return {
            uhc: processStats(uhcStats),
            meetup: processStats(meetupStats)
        };
    } catch (error) {
        console.error('Error when obtaining player statistics:', error);
        return null;
    }
}

/**
 * Fetches statistics for a specific game type and player based on UUID.
 * @async
 * @function fetchStats
 * @param {string} type - The type of game ('uhc' or 'meetup').
 * @param {string} playerUUID - The UUID of the player.
 * @returns {Promise<Object>} A promise that resolves to the player's statistics for the specified game type.
 * @throws {Error} Throws an error if the response is not ok.
 */
async function fetchStats(type, playerUUID) {
    const response = await fetch(`http://api.ghoulpvp.club/v1/leaderboards/${type}/uuid/${playerUUID}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${type} stats: ${errorText}`);
        if (type === 'uhc') displayNoUHCStats();
        throw new Error(`Failed to fetch ${type} stats`);
    }
    return await response.json();
}

/**
 * Processes the raw statistics data and formats it for display.
 * @function processStats
 * @param {Object} data - The raw statistics data.
 * @returns {Object} An object containing formatted statistics such as kills, wins, and elo.
 */
function processStats(data) {
    return {
        kills: data.kills || 0,
        wins: data.wins || 0,
        deaths: data.deaths || 0,
        elo: data.elo || 0,
        ks: data.deaths > 0 ? (data.kills / data.deaths).toFixed(2) : 'N/A',
    };
}

/**
 * Displays a message indicating that no UHC statistics are available for the player.
 * @function displayNoUHCStats
 */
function displayNoUHCStats() {
    document.querySelector('.uhc-bg').parentElement.innerHTML = `
        <div class="card-header uhc-bg">
            <span>UHC</span>
        </div>
        <div class="card-body error-card">
            No stats for this player.
        </div>`;
}

/**
 * Displays an error message on the player profile page.
 * @function displayError
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    document.querySelector('.player-info').innerHTML = `<h2>${message}</h2>`;
}

/**
 * Updates the profile information displayed on the webpage.
 * @function updateProfileInfo
 * @param {Object} profile - The player's profile data.
 * @param {Object} stats - The player's statistics data.
 */
function updateProfileInfo(profile, stats) {
    const fields = {
        playerName: profile.name,
        playerAvatar: `https://skins.mcstats.com/body/side/${profile.uuid}`,
        playerFirstLogin: new Date(profile.firstLogin).toLocaleDateString(),
        playerLastSeen: new Date(profile.lastSeen).toLocaleString(),
        ...stats
    };

    document.title = `${fields.playerName} | GhoulPvP`;
    document.getElementById('playerName').textContent = fields.playerName;
    document.getElementById('playerAvatar').src = fields.playerAvatar;
    document.getElementById('playerFirstLogin').textContent = fields.playerFirstLogin;
    document.getElementById('playerLastSeen').textContent = fields.playerLastSeen;

    // Update UHC Stats
    updateStats('uhc', fields.uhc);
    // Update Meetup Stats
    updateStats('meetup', fields.meetup);

    updateSocials(profile);
}

/**
 * Updates the statistics display for the specified game type.
 * @function updateStats
 * @param {string} type - The type of game ('uhc' or 'meetup').
 * @param {Object} stats - The statistics data for the specified game type.
 */
function updateStats(type, stats) {
    document.getElementById(`${type}Kills`).textContent = stats.kills;
    document.getElementById(`${type}Wins`).textContent = stats.wins;
    document.getElementById(`${type}Deaths`).textContent = stats.deaths;
    document.getElementById(`${type}Elo`).textContent = stats.elo;
}

/**
 * Updates the player's social media links.
 * @function updateSocials
 * @param {Object} profile - The player's profile data.
 */
function updateSocials(profile) {
    const socialsContainer = document.getElementById('playerSocials');
    const socialLinks = {
        twitter: profile.twitter,
        twitch: profile.twitch,
        youtube: profile.youtube,
        discord: profile.discord,
        instagram: profile.instagram
    };

    let hasSocials = false;

    Object.entries(socialLinks).forEach(([key, value]) => {
        if (value && value !== "None") {
            hasSocials = true;
            const socialLink = document.createElement('a');
            socialLink.id = `player${capitalizeFirstLetter(key)}`;
            socialLink.href = `${getSocialLink(key, value)}`;
            socialLink.style.display = 'inline';
            socialLink.title = capitalizeFirstLetter(key); // Tooltip
            socialLink.innerHTML = `<i class="fab fa-${key}" style="color: ${getSocialColor(key)}"></i>`;
            socialsContainer.appendChild(socialLink);
        }
    });

    if (!hasSocials) {
        socialsContainer.parentElement.style.display = 'none';
    }
}

/**
 * Capitalizes the first letter of a string.
 * @function capitalizeFirstLetter
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Returns the social media link based on the key and value.
 * @function getSocialLink
 * @param {string} key - The social media platform key.
 * @param {string} value - The social media handle.
 * @returns {string} The complete social media link.
 */
function getSocialLink(key, value) {
    const socialLinks = {
        twitter: `https://twitter.com/${value}`,
        twitch: `https://twitch.tv/${value}`,
        youtube: `https://youtube.com/${value}`,
        discord: `https://discord.com/users/${value}`,
        instagram: `https://instagram.com/${value}`
    };
    return socialLinks[key];
}

/**
 * Returns the color associated with the social media platform.
 * @function getSocialColor
 * @param {string} key - The social media platform key.
 * @returns {string} The color associated with the social media platform.
 */
function getSocialColor(key) {
    const socialColors = {
        twitter: '#00acee',
        twitch: '#6441a5',
        youtube: '#FF0000',
        discord: '#7289DA',
        instagram: '#E1306C'
    };
    return socialColors[key];
}

/**
 * Loads the player profile when the window is fully loaded.
 * @function
 */
window.onload = loadPlayerProfile;
