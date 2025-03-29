document.addEventListener("DOMContentLoaded", () => {

    let darkTheme = function() {
        return "";
    }

    let electricTheme = function() {
        return "@import url('./themes/electric.css');";
    }

    let caramelBlueTheme = function() {
        return "@import url('./themes/blue.css');";
    }

    let caramelPinkPurpleTheme = function() {
        return "@import url('./themes/pink-purple.css');";
    }

    let caramelPurpleTheme = function() {
        return "@import url('./themes/purple.css');";
    }

    let caramelCaramelTheme = function() {
        return "@import url('./themes/caramel.css');";
    }

    let pixNeonTheme = function() {
        return "@import url('./themes/neon.css');";
    }

    let bhpsngumStarblastTheme = function() {
        return "@import url('./themes/starblast.css');";
    }

    let apathyAsuTheme = function() {
        return "@import url('./themes/asu.css');"
    }

    let beansssEvoTheme = function() {
        return "@import url('./themes/evo.css');"
    }

    let dank1337Theme = function() {
        return "@import url('./themes/1337.css');"
    }

    let mardonMeteorTheme = function() {
        return "@import url('./themes/meteor.css');"
    }

    let HalcyonSunnyTheme = function() {
        return "@import url('./themes/sunny.css');"
    }

    let HalcyonInfraredTheme = function() {
        return "@import url('./themes/infrared.css');"
    }

    let HalcyonUltravioletTheme = function() {
        return "@import url('./themes/ultraviolet.css');"
    }

    let ApathyEpilogueTheme = function() {
        return "@import url('./themes/epilogue.css');"
    }

    let customTheme = function() {
        return window.localStorage.getItem("customTheme");
    }

    let themes = {
        "Electric": electricTheme,
        "Dark": darkTheme,
        "1337": dank1337Theme,
        "Blue by Caramel#8789": caramelBlueTheme,
        "Pink-Purple by Caramel#8789": caramelPinkPurpleTheme,
        "Purple by Caramel#8789": caramelPurpleTheme,
        "Caramel by Caramel#8789": caramelCaramelTheme,
        "Neon by Pix#7008": pixNeonTheme,
        "Starblast by Bhpsngum#2623": bhpsngumStarblastTheme,
        "Asu by apathy#3993": apathyAsuTheme,
        "Lotus by Evo": beansssEvoTheme,
        "Meteor by TheMardon#7986": mardonMeteorTheme,
        "Sunny by Halcyon#2789": HalcyonSunnyTheme,
        "Infrared by Halcyon#2789": HalcyonInfraredTheme,
        "Ultraviolet by Halcyon#2789": HalcyonUltravioletTheme,
        "Epilogue by apathy#3993": ApathyEpilogueTheme,
        "Custom": customTheme
    }

    function applyThemeCSS(css) {
        const styleElement = document.getElementById("customThemeStyle");
        if (styleElement) {
            styleElement.textContent = css;
        } else {
            const newStyleElement = document.createElement('style');
            newStyleElement.id = "customThemeStyle";
            newStyleElement.textContent = css;
            document.head.appendChild(newStyleElement);
        }
    }

    let selectedTheme = window.localStorage.getItem("selectedTheme");
    if (!selectedTheme || selectedTheme === "") {
        selectedTheme = "Electric";
    }

    window.localStorage.setItem("selectedTheme", selectedTheme);
    applyThemeCSS(themes[selectedTheme]());

    document.getElementById("themeSelect").value = selectedTheme;

    let textarea = document.getElementById("themeEditor");
    let editor = CodeMirror.fromTextArea(textarea, {
        mode: "css"
    });

    let savedCSS = window.localStorage.getItem("customTheme");
    if (!savedCSS || savedCSS === "") {
        savedCSS = "// Enter CSS code here to be applied on every page load."
    }

    editor.setValue(savedCSS);
    if (selectedTheme === "Custom") {
        applyThemeCSS(savedCSS);
    }

    let modal = document.getElementById("customThemeModal");
    modal.addEventListener("shown.bs.modal", () => {
        editor.refresh();
        editor.focus();
        editor.setCursor(editor.lineCount(), 0);
    })

    editor.on("change", () => {
        savedCSS = editor.getValue();
        window.localStorage.setItem("customTheme", savedCSS);
        if (selectedTheme === "Custom") {
            applyThemeCSS(savedCSS);
        }
    });

    function initializeThemeSelection() {
        let selectedTheme = window.localStorage.getItem("selectedTheme") || "Electric";
        document.getElementById("themeSelect").value = selectedTheme;
        applyThemeCSS(themes[selectedTheme]());
    }

    document.getElementById("themeSelect").addEventListener("change", (event) => {
        const selectedTheme = event.target.value;
        window.localStorage.setItem("selectedTheme", selectedTheme);
        applyThemeCSS(themes[selectedTheme]());
    });

    document.getElementById("customThemeShow").addEventListener("click", () => {
        document.getElementById("customThemeModal").classList.add('show');
    });

    editor.setOption("theme", "darcula");
    initializeThemeSelection()

    document.getElementById("themeModalCloseButton").addEventListener("click", () => {
        document.getElementById("customThemeModal").classList.remove('show');
    });
});