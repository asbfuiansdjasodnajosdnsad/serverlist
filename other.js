document.addEventListener("DOMContentLoaded", () => {
    const clipboard = new ClipboardJS('#systemCopyLink', {
        text: function(trigger) {
            return document.getElementById('systemReportLink').href;
        }
    });

    clipboard.on('success', function(e) {
        const btn = e.trigger;
        btn.setAttribute('data-bs-original-title', 'Copied!');
        const tooltip = new bootstrap.Tooltip(btn);

        setTimeout(() => tooltip.hide(), 2000);

        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Error copying link:', e.action);
    });


    document.getElementById("navbar-button").addEventListener("click", () => {
        const content = document.getElementById('navbarSupportedContent');

        if (content.classList.contains('show')) {
            content.style.height = `${content.scrollHeight}px`;
            content.classList.remove('show');
            content.classList.add('collapsing');

            setTimeout(() => {
                content.style.height = '0';
            }, 10);

            setTimeout(() => {
                content.classList.remove('collapsing');
                content.style.display = 'none';
            }, 350);
        } else {
            content.style.display = 'block';
            content.classList.add('collapsing');

            setTimeout(() => {
                content.style.height = `${content.scrollHeight}px`;
            }, 10);

            setTimeout(() => {
                content.classList.remove('collapsing');
                content.classList.add('show');
                content.style.height = 'auto';
            }, 350);
        }
    });

    document.getElementById('newServerAlert').addEventListener('change', handleNewServerAlert);
});

function handleNewServerAlert() {
    const systemsListElement = document.getElementById('systemsList');
    const systemCards = systemsListElement.querySelectorAll('.system-card');

    let foundNewServer = false;
    systemCards.forEach(card => {
        const timeText = card.querySelector('.float-end').textContent.trim();
        const time = parseInt(timeText.split(' ')[0]);

        if (time >= 0 && time <= 3) {
            foundNewServer = true;
        }
    });

    const newServerAlertCheckbox = document.getElementById('newServerAlert');

    if (Notification.permission === 'denied') {
        console.log('Notifications are blocked. Please enable them in your browser settings to receive alerts.');
        return;
    }

    if (foundNewServer && newServerAlertCheckbox.checked && !notificationShown) {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    createNotification();
                    notificationShown = true;
                    newServerAlertCheckbox.checked = false;
                }
            });
        } else {
            createNotification();
            notificationShown = true;
            newServerAlertCheckbox.checked = false;
        }
    } else if (!foundNewServer || !newServerAlertCheckbox.checked) {
        notificationShown = false;
    }
}

function createNotification() {
    const notification = new Notification("New server detected!", {
        tag : "julia",
        body: "A new server has been detected. Please check the systems list for more information.",
        icon: "https://starblast.io/static/img/icon64.png",
        badge: "https://starblast.io/static/img/icon64.png"
    });
}