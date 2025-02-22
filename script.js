/**************************************************************
 * script.js - Page principale (Index.html)
 **************************************************************/

const supabase = window.supabaseClient;

// Données locales pour suggestions et membres
let members = ['John', 'Marie', 'Pierre'];
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

// Sélecteurs DOM
const roomSelect = document.getElementById('roomSelect');
const taskSuggestions = document.getElementById('taskSuggestions');
const taskInput = document.getElementById('taskInput');
const assigneeSelect = document.getElementById('assigneeSelect');
const statusSelect = document.getElementById('statusSelect');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

/**************************************************************
 * Fonctions Supabase : Rooms & Tasks
 **************************************************************/

// Récupère les pièces depuis la table "rooms"
async function fetchRooms() {
  const { data, error } = await supabase.from('rooms').select('*');
  if (error) {
    console.error('Erreur fetchRooms:', error);
    return [];
  }
  return data;
}

// Récupère toutes les tâches avec jointure sur rooms pour obtenir le nom
async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, rooms!inner(name)');
  if (error) {
    console.error('Erreur fetchTasks:', error);
    return [];
  }
  return data;
}

// Insertion d'une nouvelle tâche dans la table "tasks"
async function insertTask(taskName, assignee, roomId, status) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      name: taskName,
      assignee: assignee || null,
      room_id: parseInt(roomId),
      status: status || 'à faire'
    }])
    .select();
  if (error) {
    console.error('Erreur insertTask:', error);
  }
  return data;
}

// Suppression d'une tâche dans la table "tasks"
async function deleteTaskInDB(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) {
    console.error('Erreur deleteTaskInDB:', error);
  }
  return data;
}

/**************************************************************
 * Fonctions d'affichage
 **************************************************************/

// Remplit le select des pièces à partir de Supabase
async function renderRooms() {
  roomSelect.innerHTML = '<option value="">Choisir une pièce...</option>';
  const rooms = await fetchRooms();
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
}

// Remplit le select des personnes (données locales)
function renderMembers() {
  assigneeSelect.innerHTML = '<option value="">Choisir une personne...</option>';
  members.forEach(member => {
    const option = document.createElement('option');
    option.value = member;
    option.textContent = member;
    assigneeSelect.appendChild(option);
  });
}

// Lors du changement de pièce, afficher les suggestions de tâches
roomSelect.addEventListener('change', () => {
  taskSuggestions.innerHTML = '';
  const selectedRoomId = roomSelect.value;
  if (selectedRoomId) {
    const roomName = roomSelect.options[roomSelect.selectedIndex].text;
    // Transforme le nom (ex: "Salle de bain" -> "salle_de_bain")
    const key = roomName.toLowerCase().replace(/\s+/g, '_').replace(/[éèê]/g, 'e');
    const suggestions = cleaningTasks[key];
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

// Lorsque l'utilisateur choisit une suggestion, remplir l'input de tâche
taskSuggestions.addEventListener('change', () => {
  if (taskSuggestions.value) {
    taskInput.value = taskSuggestions.value;
  }
});

// Affiche la liste des tâches filtrées par pièce et par statut
async function renderTasks(filter = 'all') {
  const allTasks = await fetchTasks();
  const selectedRoomId = roomSelect.value;
  let filtered = allTasks;
  if (selectedRoomId) {
    filtered = filtered.filter(task => task.room_id == selectedRoomId);
  }
  if (filter !== 'all') {
    filtered = filtered.filter(task => task.status === filter);
  }
  taskList.innerHTML = '';
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const roomName = task.rooms ? task.rooms.name : '';
    li.innerHTML = `
      <div class="task-info">
        <div class="task-name">${task.name}</div>
        <div class="task-assignee">${task.assignee || ''}</div>
        <div class="task-room">${roomName}</div>
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
}

window.deleteTask = async (taskId) => {
  if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
  await deleteTaskInDB(taskId);
  await renderTasks();
};

// Ajout d'une nouvelle tâche via Supabase
addTaskButton.addEventListener('click', async () => {
  const roomId = roomSelect.value;
  const taskName = taskInput.value.trim();
  const assignee = assigneeSelect.value;
  const status = statusSelect.value;
  if (roomId && taskName && assignee && status) {
    await insertTask(taskName, assignee, roomId, status);
    await renderTasks();
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

// Filtrage des tâches via les boutons
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderTasks(button.dataset.filter);
  });
});

// Initialisation de la page
(async function init() {
  await renderRooms();
  renderMembers();
  await renderTasks();
})();
