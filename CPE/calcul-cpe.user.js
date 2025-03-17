// ==UserScript==
// @name         Calcul CPE
// @namespace    http://tampermonkey.net/
// @version      2502.1
// @description  Affiche les notes avec les moyennes calculées
// @author       Loïc PUPIER
// @match        https://mycpe.cpe.fr/faces/ChoixDonnee.xhtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cpe.fr
// @updateURL    https://github.com/loicpp/User-Script/raw/refs/heads/main/CPE/calcul-cpe.user.js
// @downloadURL  https://github.com/loicpp/User-Script/raw/refs/heads/main/CPE/calcul-cpe.user.js
// @grant        none
// ==/UserScript==

// General component
const renderDialog = document.createElement('div');
const dialogContent = document.createElement('div');

// General constants
const datas = [];
const notes = {};

(function() {
    'use strict';
    console.log("Initialisation");
    extractDatas();
    calculDatas();
    initDisplay();
    initRenderButton();
})();

function extractDatas() {
    const dataHtml = document.getElementById('form:j_idt181_data').children;
    for (let i = 0; i < dataHtml.length; i++) {
        let data = {};
        data.semester = dataHtml[i].children[0].children[1].innerHTML;
        data.module = dataHtml[i].children[1].children[1].innerHTML;
        data.cours = dataHtml[i].children[2].children[1].innerHTML;
        data.epreuve = dataHtml[i].children[3].children[1].innerHTML;
        data.coeff = parseNumber(dataHtml[i].children[4].children[1].innerHTML);
        data.note = parseNumber(dataHtml[i].children[5].children[1].innerHTML);
        data.abs = dataHtml[i].children[6].children[1]?.innerHTML;
        datas.push(data);
    }
    console.log('Datas: ');
    console.log(datas);
}

function calculDatas() {
    for (let i = 0; i < datas.length; i++) {
        let key = getKey(datas[i]);
        notes[key] = notes[key] == undefined ? {} : notes[key];
        notes[key].sum = notes[key].sum == undefined ? datas[i].note * datas[i].coeff : notes[key].sum + datas[i].note * datas[i].coeff;
        notes[key].size = notes[key].size == undefined ? datas[i].coeff : notes[key].size + datas[i].coeff;
        notes[key].average = parseFloat((notes[key].sum / notes[key].size).toFixed(2));
    }
    console.log('Notes: ');
    console.log(notes);
}

function getKey(dataToKey) {
    let semester = dataToKey.semester.split(" ").pop();
    let module = dataToKey.module.split(" ").pop();
    return semester + '-' + module;
}

function parseNumber(value) {
    return parseFloat(value.replace(',', '.'));
}

function initDisplay() {
    var container = document.getElementById('form:dataTableFavori');

    // Ajouter le tableau au DOM
    var divWithTable = generateTable();
    injectStyles();
    container.insertBefore(divWithTable, container.lastChild);
}

function generateTable() {
    // Créer un div contenant le tableau
    var div = document.createElement('div');

    // Créer le tableau
    var table = document.createElement('table');
    table.classList.add('cinereousTable');

    // Créer l'en-tête du tableau
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var headers = ['Matière', 'Type', 'Coeff', 'Note', 'UE1', 'UE2', 'UE3', 'UE4', 'UE5', 'UE6'];
    headers.forEach(function (header) {
        var th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Créer le pied de page du tableau
    var tfoot = document.createElement('tfoot');
    var footerRow = document.createElement('tr');
    var footers = ['', '', '', '', notes["5-1"].average, notes["5-2"].average, notes["5-3"].average, notes["5-4"].average, notes["5-5"].average, notes["5-6"].average];
    footers.forEach(function (footer) {
        var td = document.createElement('td');
        td.textContent = footer;
        footerRow.appendChild(td);
    });
    tfoot.appendChild(footerRow);
    table.appendChild(tfoot);

    // Créer le corps du tableau
    var tbody = document.createElement('tbody');
    for (var i = 0; i <= datas.length; i++) {
        var row = document.createElement('tr');
        for (var j = 1; j <= 10; j++) {
            var td = document.createElement('td');
            row.appendChild(td);
        }
        row.children[0].textContent = datas[i]?.cours
        row.children[1].textContent = datas[i]?.epreuve
        row.children[2].textContent = datas[i]?.coeff
        row.children[3].textContent = datas[i]?.note
        row.children[4].textContent = datas[i]?.module == "Unité d'Enseignement 1" ? 'x' : ''
        row.children[5].textContent = datas[i]?.module == "Unité d'Enseignement 2" ? 'x' : ''
        row.children[6].textContent = datas[i]?.module == "Unité d'Enseignement 3" ? 'x' : ''
        row.children[7].textContent = datas[i]?.module == "Unité d'Enseignement 4" ? 'x' : ''
        row.children[8].textContent = datas[i]?.module == "Unité d'Enseignement 5" ? 'x' : ''
        row.children[9].textContent = datas[i]?.module == "Unité d'Enseignement 6" ? 'x' : ''
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // Ajouter le tableau au div
    div.appendChild(table);

    // Retourner le div avec le tableau
    return div;
}

function injectStyles() {
    var style = document.createElement('style');
    style.innerHTML = `
        table.cinereousTable {
            border: 3px solid #000000;
            width: 100%;
            text-align: center;
        }
        table.cinereousTable td, table.cinereousTable th {
            border: 1px solid #ECEFF1;
            padding: 4px 4px;
        }
        table.cinereousTable tbody td {
            font-size: 13px;
        }
        table.cinereousTable tr:nth-child(even) {
            background: #ECEFF1;
        }
        table.cinereousTable thead {
            background: #ECEFF1;
            background: -moz-linear-gradient(top, #f1f3f4 0%, #eef0f2 66%, #ECEFF1 100%);
            background: -webkit-linear-gradient(top, #f1f3f4 0%, #eef0f2 66%, #ECEFF1 100%);
            background: linear-gradient(to bottom, #f1f3f4 0%, #eef0f2 66%, #ECEFF1 100%);
        }
        table.cinereousTable thead th {
            font-size: 17px;
            font-weight: bold;
            text-align: left;
            border-left: 2px solid;
        }
        table.cinereousTable thead th:first-child {
            border-left: none;
        }
        table.cinereousTable tfoot {
            font-size: 16px;
            font-weight: bold;
        }
        table.cinereousTable tfoot td {
            font-size: 16px;
        }
    `;
    document.head.appendChild(style); // Ajouter le style à l'élément <head> du DOM
}

// function initRenderButton() {
//     var container = document.getElementById('form:dataTableFavori').children[0].children[0];
//     container.style.display = 'flex';
//     container.style.alignItems = 'center';

//     renderButton.id = 'form:renderButton';
//     renderButton.name = 'form:renderButton';
//     renderButton.type = 'button';
//     renderButton.role = 'button';
//     renderButton.ariaDisabled = 'false';
//     renderButton.className = 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-left YellowButton exportButton cacherImpression';
//     renderButton.addEventListener('click', function() {
//         renderDialog.style.width = 'auto';
//         renderDialog.style.height = 'auto';
//         renderDialog.style.zIndex = 1001;
//         renderDialog.style.display = 'block';
//     });

//     var spanIcon = document.createElement('span');
//     spanIcon.className = 'ui-button-icon-left ui-icon ui-c fa fa-tv White';

//     var spanText = document.createElement('span');
//     spanText.className = 'ui-button-text ui-c';
//     spanText.textContent = 'Rendu';

//     renderButton.appendChild(spanIcon);
//     renderButton.appendChild(spanText);

//     container.appendChild(renderButton);
// }