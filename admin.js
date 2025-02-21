// Récupération ou initialisation des pièces et des personnes depuis le localStorage
let rooms = JSON.parse(localStorage.getItem('rooms')) || [
    { id: 'cuisine', name: 'Cuisine', tasks: [] },
    { id: 'salon', name: 'Salon', tasks: [] },
    { id: 'salle_de_bain', name: 'Salle de bain', tasks: [] },
    { id: 'chambre', name: 'Chambre', tasks: [] },
    { id: 'bureau', name: 'Bureau', tasks: [] },
    { id: 'buanderie', name: 'Buanderie', tasks: [] },
    { id: 'garage', name: 'Garage', tasks: [] },
    { id: 'entree', name: 'Entrée', tasks: [] },
    { id: 'toilettes', name: 'Toilettes', tasks: [] },
    { id: 'exterieur', name: 'Extérieur', tasks: [] }
];

let people = JSON.parse(localStorage.getItem('people')) || ['John', 'Marie', 'Pierre'];

// Fonction de sauvegarde des données
const saveRooms = () => localStorage.setItem('rooms', JSON.stringify(rooms));
const savePeople = () => localStorage.setItem('people', JSON.stringify(people));

// Liste exhaustive d'actions de nettoyage par pièce
const cleaningTasks = {
    cuisine: [
        'Faire la vaisselle',
        'Nettoyer les plans de travail',
        'Nettoyer l’évier',
        'Nettoyer le sol',
        'Dégraisser la hotte',
        'Nettoyer le four',
        'Nettoyer le micro-ondes',
        'Vider la poubelle',
        'Ranger les placards'
    ],
    salon: [
        'Passer l’aspirateur',
        'Dépoussiérer les meubles',
        'Nettoyer les vitres',
        'Nettoyer la table basse',
        'Ranger les coussins',
        'Aérer la pièce'
    ],
    salle_de_bain: [
        'Nettoyer la douche/baignoire',
        'Nettoyer le lavabo',
        'Nettoyer le miroir',
        'Laver le sol',
        'Changer les serviettes',
        'Vider la poubelle'
    ],
    chambre: [
        'Faire le lit',
        'Changer les draps',
        'Passer l’aspirateur',
        'Dépoussiérer les meubles',
        'Ranger les vêtements'
    ],
    bureau: [
        'Dépoussiérer le bureau',
        'Organiser les documents',
        'Nettoyer l’écran'
    ],
    buanderie: [
        'Faire une lessive',
        'Plier le linge',
        'Nettoyer la machine',
        'Balayer le sol'
    ],
    garage: [
        'Balayer le sol',
        'Ranger les outils',
        'Nettoyer l’établi'
    ],
    entree: [
        'Balayer le sol',
        'Ranger les chaussures',
        'Nettoyer le paillasson'
    ],
    toilettes: [
        'Nettoyer la cuvette',
        'Nettoyer le lavabo',
        'Laver le sol',
        'Vider la poubelle',
        'Remplacer le papier toilette'
    ],
    exterieur: [
        'Balayer la terrasse',
        'Nettoyer les vitres extérieures',
        'Tondre la pelouse',
        'Arroser les plantes',
        'Ranger le mobilier de jardin'
    ]
};

// DOM Elements
const peopleList = document.getElementById('peopleList');
const roomsList = document.getElementById('roomsList');
const tasksList = document.getElementById('tasksList');
const roomSelect = document.getElementById('roomSelect');
const taskSuggestionsAdmin = document.getElementById('taskSuggestionsAdmin');

// Fonction de rendu des personnes
const renderPeople = () => {
    peopleList.innerHTML = '';
    people.forEach(person => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${person}
            <div class="item-actions">
                <button class="edit-btn" onclick="editPerson('${person}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deletePerson('${person}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        peopleList.appendChild(li);
    });
};

// Fonction de rendu des pièces
const renderRooms = () => {
    roomsList.innerHTML = '';
    roomSelect.innerHTML = '<option value="">Choisir une pièce...</option>';
    
    rooms.forEach(room => {
        // ÉLÉMENT LI REPRÉSENTANT LA PIÈCE
        const li = document.createElement('li');
        li.innerHTML = `
            ${room.name}
            <div class="item-actions">
                <button class="edit-btn" onclick="editRoom('${room.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteRoom('${room.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        // On insère ce li dans la liste principale
        roomsList.appendChild(li);

        // AJOUTER UNE SOUS-LISTE DES TÂCHES DE LA PIÈCE
        const tasksUl = document.createElement('ul');
        tasksUl.classList.add('sub-task-list'); // classe CSS pour styliser

        if (room.tasks.length > 0) {
            room.tasks.forEach(task => {
                const taskLi = document.createElement('li');
                taskLi.textContent = task;
                tasksUl.appendChild(taskLi);
            });
        } else {
            const noTaskLi = document.createElement('li');
            noTaskLi.textContent = 'Aucune tâche pour cette pièce.';
            tasksUl.appendChild(noTaskLi);
        }

        // On insère la sous-liste sous le li
        li.appendChild(tasksUl);

        // Ajout de la pièce au menu déroulant
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        roomSelect.appendChild(option);
    });
};

// Fonction de rendu des tâches pour la pièce sélectionnée
const renderTasks = () => {
    const selectedRoomId = roomSelect.value;
    tasksList.innerHTML = '';
    
    if (selectedRoomId) {
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room) {
            room.tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${task}
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editTask('${selectedRoomId}', '${task}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteTask('${selectedRoomId}', '${task}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                tasksList.appendChild(li);
            });
        }
    }
};

// Gestion de l'événement sur le select de pièce pour mettre à jour le dropdown de suggestions
roomSelect.addEventListener('change', () => {
    const selectedRoomId = roomSelect.value;
    taskSuggestionsAdmin.innerHTML = '';
    
    if (selectedRoomId) {
        const suggestions = cleaningTasks[selectedRoomId];
        taskSuggestionsAdmin.disabled = false;
        if (suggestions && suggestions.length > 0) {
            taskSuggestionsAdmin.innerHTML = `<option value="">Choisir une tâche suggérée...</option>` +
                suggestions.map(task => `<option value="${task}">${task}</option>`).join('');
        } else {
            taskSuggestionsAdmin.innerHTML = `<option value="">Aucune suggestion</option>`;
        }
    } else {
        taskSuggestionsAdmin.disabled = true;
        taskSuggestionsAdmin.innerHTML = `<option value="">Sélectionnez d'abord une pièce...</option>`;
    }
    
    // Actualisation de l'affichage des tâches pour la pièce
    renderTasks();
});

// Lorsque l'utilisateur choisit une suggestion, on la place dans l'input de la nouvelle tâche
taskSuggestionsAdmin.addEventListener('change', () => {
    if (taskSuggestionsAdmin.value) {
        document.getElementById('newTaskName').value = taskSuggestionsAdmin.value;
    }
});

// Ajout d'une nouvelle tâche
document.getElementById('addTask').addEventListener('click', () => {
    const roomId = roomSelect.value;
    const input = document.getElementById('newTaskName');
    const task = input.value.trim();
    
    if (roomId && task) {
        const room = rooms.find(r => r.id === roomId);
        if (room && !room.tasks.includes(task)) {
            room.tasks.push(task);
            saveRooms();
            // Mise à jour à la fois de la liste "roomsList" et de la section "tasksList"
            renderRooms();
            renderTasks();
            input.value = '';
        }
    }
});

// Fonctions d'édition et de suppression (tâches, personnes, pièces)
const editTask = (roomId, oldTask) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        const newTask = prompt('Nouvelle tâche :', oldTask);
        if (newTask && newTask.trim() && newTask !== oldTask) {
            room.tasks = room.tasks.map(t => t === oldTask ? newTask : t);
            saveRooms();
            renderRooms();
            renderTasks();
        }
    }
};

const deleteTask = (roomId, task) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && confirm(`Voulez-vous vraiment supprimer la tâche "${task}" ?`)) {
        room.tasks = room.tasks.filter(t => t !== task);
        saveRooms();
        renderRooms();
        renderTasks();
    }
};

const editPerson = (oldName) => {
    const newName = prompt('Nouveau nom :', oldName);
    if (newName && newName.trim() && newName !== oldName) {
        people = people.map(p => p === oldName ? newName : p);
        savePeople();
        renderPeople();
    }
};

const deletePerson = (name) => {
    if (confirm(`Voulez-vous vraiment supprimer ${name} ?`)) {
        people = people.filter(p => p !== name);
        savePeople();
        renderPeople();
    }
};

const editRoom = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        const newName = prompt('Nouveau nom :', room.name);
        if (newName && newName.trim() && newName !== room.name) {
            room.name = newName;
            saveRooms();
            renderRooms();
        }
    }
};

const deleteRoom = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && confirm(`Voulez-vous vraiment supprimer ${room.name} ?`)) {
        rooms = rooms.filter(r => r.id !== roomId);
        saveRooms();
        renderRooms();
        renderTasks();
    }
};

// Initialisation de l'affichage
renderPeople();
renderRooms();
renderTasks();
