document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("customGameShareButton").addEventListener("click", () => {
        document.getElementById("shareGameModal").classList.add('show');
    });

    document.getElementById("shareGameModalCloseButton").addEventListener("click", () => {
        document.getElementById("shareGameModal").classList.remove('show');
    });

    document.getElementById("shareCustomGame").addEventListener("click", () => {
        let url = document.getElementById("customGameLinkInput").value.trim();

        if (url === "") {
            alert("Please enter a valid URL");
        } else if (!url.startsWith("https://starblast.io/")) {
            alert("The URL must start with 'https://starblast.io/'");
        } else {
            sendDataToServer(url);
        }
    });
});

function sendDataToServer(url) {
    const apiUrl = "https://starblast.dankdmitron.dev/api/post";

    fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}