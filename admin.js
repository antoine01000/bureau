/**************************************************************
 * admin.js - Page Admin
 **************************************************************/

const supabase = window.supabaseClient;

// Suggestions de nettoyage locales (pour le select des tâches suggérées)
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

/**************************************************************
 * Fonctions Supabase - People
 **************************************************************/
async function fetchPeople() {
  const { data, error } = await supabase.from('people').select('*');
  if (error) {
    console.error('fetchPeople error:', error);
    return [];
  }
  return data;
}
async function insertPerson(name) {
  await supabase.from('people').insert([{ name }]);
}
async function deletePersonById(id) {
  await supabase.from('people').delete().eq('id', id);
}

/**************************************************************
 * Fonctions Supabase - Rooms
 **************************************************************/
async function fetchRooms() {
  const { data, error } = await supabase.from('rooms').select('*');
  if (error) {
    console.error('fetchRooms error:', error);
    return [];
  }
  return data;
}
async function insertRoom(name) {
  await supabase.from('rooms').insert([{ name }]);
}
async function deleteRoomById(id) {
  await supabase.from('rooms').delete().eq('id', id);
}
async function updateRoomName(id, newName) {
  await supabase.from('rooms').update({ name: newName }).eq('id', id);
}

/**************************************************************
 * Fonctions Supabase - Tasks
 **************************************************************/
async function fetchTasksByRoom(roomId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('room_id', roomId);
  if (error) {
    console.error('fetchTasksByRoom error:', error);
    return [];
  }
  return data;
}
async function insertTaskDB(roomId, taskName) {
  await supabase.from('tasks').insert([{ name: taskName, room_id: parseInt(roomId) }]);
}
async function updateTaskName(taskId, newName) {
  await supabase.from('tasks').update({ name: newName }).eq('id', taskId);
}
async function deleteTaskDB(taskId) {
  await supabase.from('tasks').delete().eq('id', taskId);
}

/**************************************************************
 * Rendu People
 **************************************************************/
async function renderPeople() {
  const people = await fetchPeople();
  peopleList.innerHTML = '';
  people.forEach(person => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${person.name}
      <div class="item-actions">
        <button class="delete-btn" data-id="${person.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    peopleList.appendChild(li);
  });
  peopleList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm('Supprimer cette personne ?')) {
        await deletePersonById(id);
        renderPeople();
      }
    });
  });
}

/**************************************************************
 * Rendu Rooms
 **************************************************************/
async function renderRooms() {
  const rooms = await fetchRooms();
  roomsList.innerHTML = '';
  roomSelect.innerHTML = '<option value="">Choisir une pièce...</option>';
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${room.name}
      <div class="item-actions">
        <button class="delete-btn" data-id="${room.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    roomsList.appendChild(li);
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
  roomsList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm('Supprimer cette pièce ?')) {
        await deleteRoomById(id);
        renderRooms();
        tasksList.innerHTML = '';
      }
    });
  });
}

/**************************************************************
 * Rendu Tasks pour la pièce sélectionnée
 **************************************************************/
async function renderTasks() {
  tasksList.innerHTML = '';
  const selectedRoomId = roomSelect.value;
  if (!selectedRoomId) return;
  const tasks = await fetchTasksByRoom(selectedRoomId);
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${task.name}
      <div class="item-actions">
        <button class="delete-btn" data-task-id="${task.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    tasksList.appendChild(li);
  });
  tasksList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const taskId = btn.dataset.taskId;
      if (confirm('Supprimer cette tâche ?')) {
        await deleteTaskDB(taskId);
        renderTasks();
      }
    });
  });
}

/**************************************************************
 * Événements
 **************************************************************/

// Changement de pièce => actualise suggestions et tâches
roomSelect.addEventListener('change', async () => {
  taskSuggestionsAdmin.innerHTML = '';
  const selectedRoomId = roomSelect.value;
  if (selectedRoomId) {
    const opt = roomSelect.options[roomSelect.selectedIndex];
    const roomName = opt.textContent.toLowerCase().replace(/\s/g, '_').replace(/[éèê]/g, 'e');
    const suggestions = cleaningTasks[roomName];
    taskSuggestionsAdmin.disabled = false;
    if (suggestions && suggestions.length > 0) {
      taskSuggestionsAdmin.innerHTML = `<option value="">Choisir une tâche suggérée...</option>` +
        suggestions.map(t => `<option value="${t}">${t}</option>`).join('');
    } else {
      taskSuggestionsAdmin.innerHTML = `<option value="">Aucune suggestion</option>`;
    }
    renderTasks();
  } else {
    taskSuggestionsAdmin.disabled = true;
    taskSuggestionsAdmin.innerHTML = `<option value="">Sélectionnez d'abord une pièce...</option>`;
    tasksList.innerHTML = '';
  }
});

// Choix d'une suggestion => remplir l'input
taskSuggestionsAdmin.addEventListener('change', () => {
  if (taskSuggestionsAdmin.value) {
    document.getElementById('newTaskName').value = taskSuggestionsAdmin.value;
  }
});

// Ajouter une nouvelle tâche
document.getElementById('addTask').addEventListener('click', async () => {
  const roomId = roomSelect.value;
  const input = document.getElementById('newTaskName');
  const taskName = input.value.trim();
  if (roomId && taskName) {
    await insertTaskDB(roomId, taskName);
    input.value = '';
    renderTasks();
  }
});

/**************************************************************
 * Initialisation
 **************************************************************/
(async function initAdmin() {
  await renderPeople();
  await renderRooms();
})();
