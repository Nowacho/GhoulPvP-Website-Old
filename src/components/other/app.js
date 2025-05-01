function initializeTheme() {
    const theme = localStorage.getItem("theme");

    // Set the theme based on the current value
    const setTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        document.body.className = newTheme;
    };

    // Initialize theme
    setTheme(theme === "dark" ? "dark" : "light");

    // Toggle theme on button click
    document.getElementById("styleToggle").addEventListener('click', () => {
        const currentTheme = document.body.className;
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
        console.log(`Current theme: ${currentTheme}`);
    });
}

function fadeOut(element) {
    if (!element) return;

    let opacity = 1;
    const interval = 50;
    const duration = 1000;
    const step = interval / duration;

    const updateOpacity = () => {
        opacity -= step;

        if (opacity > 0) {
            element.style.opacity = opacity;
            setTimeout(updateOpacity, interval);
        } else {
            element.style.display = "none";
        }
    };

    updateOpacity();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();

    const errorMessage = document.querySelector("#view > div.main--wrapper > div.error-container");
    if (errorMessage) {
        setTimeout(() => fadeOut(errorMessage), 3000);
    }
});