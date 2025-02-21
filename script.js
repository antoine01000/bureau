// Chargement des données depuis le localStorage ou valeurs par défaut
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let members = JSON.parse(localStorage.getItem('people')) || ['John', 'Marie', 'Pierre'];
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

// Liste de suggestions de tâches par pièce
const cleaningTasks = {
  cuisine: [
    'Faire la vaisselle',
    'Nettoyer le plan de travail',
    'Balayer le sol',
    'Vider la poubelle',
    'Nettoyer le réfrigérateur'
  ],
  salon: [
    'Passer l’aspirateur',
    'Dépoussiérer les meubles',
    'Nettoyer les vitres'
  ],
  salle_de_bain: [
    'Nettoyer la douche/baignoire',
    'Nettoyer le lavabo',
    'Nettoyer le miroir',
    'Laver le sol'
  ],
  chambre: [
    'Faire le lit',
    'Changer les draps',
    'Passer l’aspirateur'
  ],
  bureau: [
    'Dépoussiérer le bureau',
    'Organiser les documents'
  ],
  buanderie: [
    'Faire une lessive',
    'Plier le linge'
  ],
  garage: [
    'Balayer le sol',
    'Ranger les outils'
  ],
  entree: [
    'Balayer le sol',
    'Ranger les chaussures'
  ],
  toilettes: [
    'Nettoyer la cuvette',
    'Nettoyer le lavabo'
  ],
  exterieur: [
    'Balayer la terrasse',
    'Arroser les plantes'
  ]
};

// Récupération des éléments du DOM
const roomSelect = document.getElementById('roomSelect');
const taskSuggestions = document.getElementById('taskSuggestions');
const taskInput = document.getElementById('taskInput');
const assigneeSelect = document.getElementById('assigneeSelect');
const statusSelect = document.getElementById('statusSelect');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

// Fonction pour remplir le select des pièces
const renderRooms = () => {
  roomSelect.innerHTML = '<option value="">Choisir une pièce...</option>';
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
};

// Fonction pour remplir le select des personnes
const renderMembers = () => {
  assigneeSelect.innerHTML = '<option value="">Choisir une personne...</option>';
  members.forEach(member => {
    const option = document.createElement('option');
    option.value = member;
    option.textContent = member;
    assigneeSelect.appendChild(option);
  });
};

// Mise à jour des suggestions de tâche en fonction de la pièce sélectionnée
roomSelect.addEventListener('change', () => {
  const selectedRoomId = roomSelect.value;
  taskSuggestions.innerHTML = '';
  if (selectedRoomId) {
    const suggestions = cleaningTasks[selectedRoomId];
    taskSuggestions.disabled = false;
    if (suggestions && suggestions.length > 0) {
      taskSuggestions.innerHTML = `<option value="">Choisir une tâche suggérée...</option>` +
        suggestions.map(task => `<option value="${task}">${task}</option>`).join('');
    } else {
      taskSuggestions.innerHTML = `<option value="">Aucune suggestion</option>`;
    }
  } else {
    taskSuggestions.disabled = true;
    taskSuggestions.innerHTML = `<option value="">Sélectionnez d'abord une pièce...</option>`;
  }
});

// Remplissage automatique du champ de tâche lorsque l'utilisateur choisit une suggestion
taskSuggestions.addEventListener('change', () => {
  if (taskSuggestions.value) {
    taskInput.value = taskSuggestions.value;
  }
});

// Sauvegarde des tâches dans le localStorage
const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Affichage de la liste des tâches
const renderTasks = (filter = 'all') => {
  taskList.innerHTML = '';
  let filteredTasks = tasks;
  if (filter !== 'all') {
    filteredTasks = tasks.filter(task => task.status === filter);
  }
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div class="task-info">
        <div class="task-name">${task.name}</div>
        <div class="task-assignee">${task.assignee}</div>
        <div class="task-room">${task.room}</div>
        <div class="task-status">${task.status}</div>
      </div>
      <div class="task-actions">
        <button class="delete-btn" onclick="deleteTask(${task.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    taskList.appendChild(li);
  });
};

// Ajout d'une nouvelle tâche
addTaskButton.addEventListener('click', () => {
  const roomId = roomSelect.value;
  const taskName = taskInput.value.trim();
  const assignee = assigneeSelect.value;
  const status = statusSelect.value;
  
  if (roomId && taskName && assignee && status) {
    const roomName = roomSelect.options[roomSelect.selectedIndex].text;
    const newTask = {
      id: Date.now(),
      name: taskName,
      assignee: assignee,
      room: roomName,
      status: status
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    // Réinitialisation du formulaire
    taskInput.value = '';
    roomSelect.value = '';
    taskSuggestions.disabled = true;
    taskSuggestions.innerHTML = `<option value="">Sélectionnez d'abord une pièce...</option>`;
    assigneeSelect.value = '';
    statusSelect.value = '';
  } else {
    alert('Veuillez remplir tous les champs.');
  }
});

// Fonction globale pour supprimer une tâche
const deleteTask = (taskId) => {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
};

// Filtrage des tâches via les boutons
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderTasks(button.dataset.filter);
  });
});

// Initialisation de l'affichage
renderRooms();
renderMembers();
renderTasks();
