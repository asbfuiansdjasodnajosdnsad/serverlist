// Starblast System Viewer - Full Script
let notificationShown = false;

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
}

let clansData = { clans: {}, cheaters: { nicks: [], color: '#ad005fb8' } };

function normalizeName(name) {
    return name.toLowerCase().replace(/[​-‍﻿]/g, '').trim();
}

async function fetchSystemDetails(id, name, mode, time, criminal, playerCount, region, address, isClick = false) {
    try {
        const res = await fetch(`https://starblast.dankdmitron.dev/api/status/${id}@${address}`);
        if (!res.ok) throw new Error(`Failed to fetch system details: ${res.status}`);
        const systemDetails = await res.json();
        if (!systemDetails || !systemDetails.name) throw new Error(`System not found`);

        let ecpCount = 0;
        const clans = {}, teamColors = {}, otherPlayers = [];
        const normalizedCheaters = clansData.cheaters.nicks.map(n => normalizeName(n));

        for (const pid in systemDetails.players) {
            const player = systemDetails.players[pid];
            const playerName = player.player_name || 'Unknown';
            const normalized = normalizeName(playerName);
            let foundClan = false;

            for (const [clanName, info] of Object.entries(clansData.clans)) {
                if (info.tags.map(normalizeName).some(tag => normalized.includes(tag))) {
                    clans[clanName] ??= [];
                    teamColors[clanName] = info.color;
                    clans[clanName].push(playerName);
                    foundClan = true;
                    break;
                }
            }

            if (!foundClan && normalizedCheaters.some(n => normalized.includes(n))) {
                clans['Cheaters'] ??= [];
                teamColors['Cheaters'] = clansData.cheaters.color;
                clans['Cheaters'].push(playerName);
            } else if (!foundClan) {
                otherPlayers.push(playerName);
            }

            if (player.custom) ecpCount++;
        }

        const htmlParts = [];
        for (const clan in clans) {
            if (clan !== 'Cheaters') {
                htmlParts.push(`<span style="margin-right: 10px; color: ${teamColors[clan]} !important;"><strong style="color:${teamColors[clan]} !important">${clan}</strong>: ${clans[clan].length}</span>`);
            }
        }
        if (clans['Cheaters']) {
            htmlParts.push(`<span style="margin-right: 10px; color: ${teamColors['Cheaters']} !important;"><strong style="color:${teamColors['Cheaters']} !important">Cheaters</strong>: ${clans['Cheaters'].length}</span>`);
        }
        if (
            otherPlayers.length > 0 &&
            clans['Cheaters'] && clans['Cheaters'].length > 0 ||
            Object.keys(clans).some(clan => clan !== 'Cheaters' && clans[clan].length > 0)
        ) {
            htmlParts.push(`<span><strong>Others</strong>: ${otherPlayers.length}</span>`);
        }
        
        const system = {
            id,
            html: htmlParts.join(''),
            isClick,
            name, mode, time, criminal, playerCount, region, address,
            ecpCount, clans, teamColors, otherPlayers
        };

        if (isClick) {
            renderSystemReport(system);
        }

        return system;

    } catch (err) {
        console.error(`System detail error:`, err);
        return null;
    }
}

function renderSystemReport(system) {
    const report = document.getElementById('systemReport');
    if (!report) return;

    const {
        id, name, mode, region, time, criminal, playerCount, address,
        ecpCount, clans, teamColors, otherPlayers
    } = system;

    document.getElementById('systemReportSystemName').textContent = name;
    document.getElementById('systemReportMode').textContent = mode;
    document.getElementById('systemReportRegion').textContent = region;
    document.getElementById('systemReportTime').textContent = `${time} min`;
    document.getElementById('systemReportCriminality').textContent = `${criminal} crimes`;
    document.getElementById('systemReportPlayerCount').textContent = `${playerCount}`;
    document.getElementById('systemReportID').textContent = id;
    document.getElementById('systemReportECPPlayerCount').textContent = ecpCount;
    const joinGameLink = document.getElementById('systemReportLink');
    joinGameLink.href = mode.toLowerCase().startsWith('custom') ? `https://starblast.io/#${id}@${address}` : `https://starblast.io/#${id}`;

    const list = document.getElementById('systemReportPlayerList');
    let listHtml = '';
    for (const clan in clans) {
        if (clan !== 'Cheaters') {
            listHtml += `<div style="color:${teamColors[clan]} !important"><strong style="color:${teamColors[clan]} !important">${clan}:</strong> ${clans[clan].join(', ')}</div>`;
        }
    }
    if (clans['Cheaters']) {
        listHtml += `<div style="color:${teamColors['Cheaters']} !important"><strong style="color:${teamColors['Cheaters']} !important">Cheaters:</strong> ${clans['Cheaters'].join(', ')}</div>`;
    }
    if (otherPlayers.length > 0) {
        listHtml += `<div>${otherPlayers.join(', ')}</div>`;
    }

    requestAnimationFrame(() => {
        list.innerHTML = listHtml || 'No players found.';
        report.style.display = 'block';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('players.json')
        .then(r => r.json())
        .then(data => clansData = data)
        .catch(() => {});

    ['teamMode','survivalMode','deathmatchMode','moddingMode','invasionMode','customMode'].forEach((id, idx) => {
        const el = document.getElementById(id);
        el.checked = JSON.parse(localStorage.getItem('selectedModes') || '[true, false, false, false, false, false]')[idx];
        el.addEventListener('change', () => {
            saveSelectedModes();
            fetchDataAndPopulate();
        });
    });

    document.querySelectorAll('input[name="region"]').forEach(r => {
        r.addEventListener('change', () => {
            localStorage.setItem('selectedRegion', document.querySelector('input[name="region"]:checked').id);
            fetchDataAndPopulate();
        });
    });

    fetchDataAndPopulate();
    setInterval(fetchDataAndPopulate, 5000);
});

function getModeIcon(mode) {
    if (mode.toLowerCase().startsWith("custom")) return '<i class="bi bi-wrench"></i>';
    const icons = {
        team: '<i class="bi bi-people-fill"></i>',
        survival: '<i class="bi bi-bullseye"></i>',
        deathmatch: '<i class="bi bi-trophy-fill"></i>',
        modding: '<i class="bi bi-code-slash"></i>',
        invasion: '<i class="bi bi-border"></i>'
    };
    return icons[mode.toLowerCase()] || '';
}

function isSelectedMode(mode) {
    const saved = localStorage.getItem('selectedModes') || '[true, false, false, false, false, false]';
    const selectedModes = JSON.parse(saved);
    mode = mode.toLowerCase();
    if (mode === 'team' || mode === 'custom - team') return selectedModes[0];
    if (mode === 'survival' || mode === 'custom - survival') return selectedModes[1];
    if (mode === 'deathmatch' || mode === 'custom - deathmatch') return selectedModes[2];
    if (mode === 'modding' || mode === 'custom - modding') return selectedModes[3];
    if (mode === 'invasion' || mode === 'custom - invasion') return selectedModes[4];
    if (mode.startsWith('custom')) return selectedModes[5];
    return false;
}

function saveSelectedModes() {
    const selectedModes = [
        'teamMode', 'survivalMode', 'deathmatchMode',
        'moddingMode', 'invasionMode', 'customMode'
    ].map(id => document.getElementById(id).checked);
    localStorage.setItem('selectedModes', JSON.stringify(selectedModes));
}

async function fetchDataAndPopulate() {
    try {
        const region = localStorage.getItem('selectedRegion') || 'Europe';
        const response = await fetch('https://starblast.dankdmitron.dev/api/simstatus.json');
        const data = await response.json();

        const systemsList = document.getElementById('systemsList');
        const seen = new Set();
        const counts = { america: 0, europe: 0, asia: 0 };

        const promises = [];

        data.forEach(loc => {
            if (!loc?.location) return;
            const { location: regionName, address, systems } = loc;
            counts[regionName.toLowerCase()] += loc.current_players;

            if (regionName === region) {
                systems.forEach(sys => {
                    if (sys.unlisted) sys.mode = `Custom - ${sys.mode.charAt(0).toUpperCase() + sys.mode.slice(1)}`;
                    const key = `${address}-${sys.id}`;
                    if (!isSelectedMode(sys.mode || sys.actualMode || 'unknown') || sys.survival) return;
                    seen.add(key);
                    promises.push(fetchSystemDetails(sys.id, sys.name, sys.mode, Math.round(sys.time / 60), sys.criminal_activity, sys.players, region, address));
                });
            }
        });

        const results = await Promise.all(promises);

        const sortedResults = results.filter(Boolean).sort((a, b) => a.time - b.time);
        const fragment = document.createDocumentFragment();

        sortedResults.forEach(system => {
            const key = `${system.address}-${system.id}`;
            const existingCard = document.querySelector(`[data-key='${key}']`);
            const newCard = document.createElement('div');
            newCard.className = 'card system-card mb-3';
            newCard.setAttribute('data-id', system.id);
            newCard.setAttribute('data-key', key);
            newCard.onclick = () => fetchSystemDetails(system.id, system.name, system.mode, system.time, system.criminal, system.playerCount, system.region, system.address, true);
            newCard.innerHTML = `
                <div class="card-body">
                    <h3 class="nunito-sans-bold mb-0">${system.name} <span class="float-end">${system.time} min</span></h3>
                    <span>${getModeIcon(system.mode)} <i>${system.mode}</i> <b class="float-end">${system.playerCount} players</b></span>
                    <div class="clan-info mt-2" id="clanInfo-${system.id}">${system.html}</div>
                </div>`;

            if (existingCard) {
                existingCard.replaceWith(newCard);
            } else {
                fragment.appendChild(newCard);
            }
        });

        systemsList.appendChild(fragment);

        document.getElementById('countAmerica').innerHTML = `<i class="bi bi-person-fill"></i> ${counts.america}`;
        document.getElementById('countEurope').innerHTML = `<i class="bi bi-person-fill"></i> ${counts.europe}`;
        document.getElementById('countAsia').innerHTML = `<i class="bi bi-person-fill"></i> ${counts.asia}`;
        document.getElementById('countTotal').innerHTML = `<i class="bi bi-person-fill"></i> ${counts.america + counts.europe + counts.asia}`;

        systemsList.querySelectorAll('.system-card').forEach(card => {
            const key = card.getAttribute('data-key');
            if (!seen.has(key)) card.remove();
        });

    } catch (err) {
        console.error('Failed to load simstatus:', err);
    }
}
