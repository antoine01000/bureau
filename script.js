/**************************************************************
 * admin.js
 **************************************************************/
const supabase = window.supabaseClient

// Suggestions de nettoyage par pièce (pour la liste d’options)
const cleaningTasks = {
  cuisine: [...],
  salon: [...],
  /* ... */
  exterieur: [...]
};

// Récupération des éléments du DOM
const peopleList = document.getElementById('peopleList');
const roomsList = document.getElementById('roomsList');
const tasksList = document.getElementById('tasksList');
const roomSelect = document.getElementById('roomSelect');
const taskSuggestionsAdmin = document.getElementById('taskSuggestionsAdmin');

// Fonctions Supabase - People
async function fetchPeople() {
  const { data, error } = await supabase.from('people').select('*')
  if (error) {
    console.error('fetchPeople error:', error)
    return []
  }
  return data
}
async function insertPerson(name) {
  await supabase.from('people').insert([{ name }])
}
async function deletePersonById(id) {
  await supabase.from('people').delete().eq('id', id)
}

// Fonctions Supabase - Rooms
async function fetchRooms() {
  const { data, error } = await supabase.from('rooms').select('*')
  if (error) {
    console.error('fetchRooms error:', error)
    return []
  }
  return data
}
async function insertRoom(name) {
  await supabase.from('rooms').insert([{ name }])
}
async function deleteRoomById(id) {
  await supabase.from('rooms').delete().eq('id', id)
}

// Fonctions Supabase - Tasks
async function fetchTasksByRoom(roomId) {
  // Sélectionne toutes les tâches pour une pièce donnée (room_id = roomId)
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('room_id', roomId)
  if (error) {
    console.error('fetchTasksByRoom error:', error)
    return []
  }
  return data
}
async function insertTask(name, roomId) {
  await supabase.from('tasks').insert([{ name, room_id: roomId }])
}
async function deleteTaskById(taskId) {
  await supabase.from('tasks').delete().eq('id', taskId)
}

// ======================
// Rendu People
// ======================
async function renderPeople() {
  const people = await fetchPeople()
  peopleList.innerHTML = ''
  people.forEach(person => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${person.name}
      <div class="item-actions">
        <button class="delete-btn" data-id="${person.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    peopleList.appendChild(li);
  });

  // Gérer la suppression
  peopleList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      if (confirm('Supprimer cette personne ?')) {
        await deletePersonById(id)
        renderPeople()
      }
    })
  })
}

// ======================
// Rendu Rooms
// ======================
async function renderRooms() {
  const rooms = await fetchRooms()
  roomsList.innerHTML = ''
  roomSelect.innerHTML = '<option value="">Choisir une pièce...</option>';

  rooms.forEach(room => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${room.name}
      <div class="item-actions">
        <button class="delete-btn" data-id="${room.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    roomsList.appendChild(li);

    // Ajout dans le select
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });

  // Suppression d’une room
  roomsList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      if (confirm('Supprimer cette pièce ?')) {
        await deleteRoomById(id)
        renderRooms()
        tasksList.innerHTML = '' // nettoyer l’affichage si besoin
      }
    })
  })
}

// ======================
// Rendu des tâches (pour la pièce sélectionnée)
// ======================
async function renderTasks() {
  tasksList.innerHTML = ''
  const selectedRoomId = roomSelect.value
  if (!selectedRoomId) return

  // On récupère les tâches pour roomId
  const tasks = await fetchTasksByRoom(selectedRoomId)
  tasks.forEach(task => {
    const li = document.createElement('li')
    li.innerHTML = `
      ${task.name}
      <div class="item-actions">
        <button class="delete-btn" data-task-id="${task.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
    tasksList.appendChild(li)
  })

  // Gérer la suppression
  tasksList.querySelectorAll('button.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const taskId = btn.dataset.taskId
      if (confirm('Supprimer cette tâche ?')) {
        await deleteTaskById(taskId)
        renderTasks()
      }
    })
  })
}

// ======================
// Gestion Event Listeners
// ======================

// Ajouter une personne
document.getElementById('addPerson').addEventListener('click', async () => {
  const input = document.getElementById('newPersonName')
  const name = input.value.trim()
  if (name) {
    await insertPerson(name)
    input.value = ''
    renderPeople()
  }
})

// Ajouter une room
document.getElementById('addRoom').addEventListener('click', async () => {
  const input = document.getElementById('newRoomName')
  const name = input.value.trim()
  if (name) {
    await insertRoom(name)
    input.value = ''
    renderRooms()
  }
})

// Changement de pièce => on actualise la liste des tâches
roomSelect.addEventListener('change', async () => {
  const selectedRoomId = roomSelect.value
  // Mise à jour des suggestions
  taskSuggestionsAdmin.innerHTML = ''
  if (selectedRoomId) {
    // Retrouver le nom de la pièce
    const opt = roomSelect.options[roomSelect.selectedIndex]
    const roomName = opt.textContent.toLowerCase().replace(/\s/g, '_').replace(/[éèê]/g, 'e')
    const suggestions = cleaningTasks[roomName]
    taskSuggestionsAdmin.disabled = false
    if (suggestions && suggestions.length > 0) {
      taskSuggestionsAdmin.innerHTML = `<option value="">Choisir une tâche suggérée...</option>` +
        suggestions.map(task => `<option value="${task}">${task}</option>`).join('')
    } else {
      taskSuggestionsAdmin.innerHTML = `<option value="">Aucune suggestion</option>`
    }

    // Actualisation de la liste de tâches
    renderTasks()
  } else {
    taskSuggestionsAdmin.disabled = true
    taskSuggestionsAdmin.innerHTML = `<option value="">Sélectionnez d'abord une pièce...</option>`
    tasksList.innerHTML = ''
  }
})

// Choix d’une suggestion => remplir l’input
taskSuggestionsAdmin.addEventListener('change', () => {
  if (taskSuggestionsAdmin.value) {
    document.getElementById('newTaskName').value = taskSuggestionsAdmin.value
  }
})

// Ajouter une nouvelle tâche
document.getElementById('addTask').addEventListener('click', async () => {
  const roomId = roomSelect.value
  const input = document.getElementById('newTaskName')
  const taskName = input.value.trim()
  if (roomId && taskName) {
    await insertTask(taskName, roomId)
    input.value = ''
    renderTasks()
  }
})

// ======================
// Initialisation
// ======================
;(async function initAdmin() {
  await renderPeople()
  await renderRooms()
  // tasksList se mettra à jour si on choisit une pièce
})()
