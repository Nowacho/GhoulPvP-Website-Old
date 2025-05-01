document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    let playerSearchTimeout = null;

    searchResults.style.display = "none";

    searchInput.addEventListener("input", handleSearchInput);

    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            hideSearchResults();
        }
    });

    function handleSearchInput() {
        const searchText = searchInput.value.trim();

        if (!searchText) {
            hideSearchResults();
            return;
        }

        clearTimeout(playerSearchTimeout);
        playerSearchTimeout = setTimeout(() => searchPlayers(searchText), 300);
    }

    async function searchPlayers(query) {
        const validFormat = /^\/u\/[a-zA-Z0-9_]+$/;
        if (!validFormat.test(query)) {
            console.error("Formato de búsqueda inválido.");
            hideSearchResults();
            return;
        }

        const encodedQuery = encodeURIComponent(query);

        console.log("Searching for: ", encodedQuery);

        try {
            const response = await fetch(`/search?query=${encodedQuery}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const { users = [] } = await response.json();
            if (users.length === 0) {
                console.warn("No users found.");
                hideSearchResults();
                return;
            }

            displaySearchResults(users);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    }

    function displaySearchResults(users) {
        searchResults.innerHTML = '';
        users.forEach(createUserListItem);
        searchResults.style.display = users.length > 0 ? "block" : "none";
    }

    function createUserListItem(user) {
        const listItem = document.createElement("li");
        const userMetaDiv = document.createElement("div");
        userMetaDiv.classList.add("user-meta");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");

        const img = document.createElement("img");
        img.src = user.avatar || 'default-avatar.png';

        avatarDiv.appendChild(img);

        const userLink = document.createElement("a");
        userLink.href = `/u/${user.name}`;
        userLink.textContent = user.name;
        userLink.setAttribute("role", "link");
        userLink.setAttribute("tabindex", "0");

        userMetaDiv.append(avatarDiv, userLink);
        listItem.appendChild(userMetaDiv);

        listItem.addEventListener('click', hideSearchResults);
        searchResults.appendChild(listItem);
    }

    function hideSearchResults() {
        searchResults.style.display = "none";
    }
});
