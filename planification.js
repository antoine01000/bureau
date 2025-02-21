// planification.js

// Récupère les pièces et leurs tâches depuis le localStorage
let rooms = JSON.parse(localStorage.getItem('rooms')) || [];

// Stocke la configuration "périodicité" par pièce et par tâche
// Exemple de structure possible : 
// {
//   cuisine: {
//     "Faire la vaisselle": "hebdomadaire",
//     ...
//   },
//   salon: { ... }
// }
let taskFrequencies = JSON.parse(localStorage.getItem('taskFrequencies')) || {};

// Liste des options de périodicité
const frequencyOptions = [
  { value: 'journalier',   text: 'Journalier' },
  { value: 'hebdomadaire', text: 'Hebdomadaire' },
  { value: 'mensuel',      text: 'Mensuel' },
  { value: '3mois',        text: 'Tous les 3 mois' },
  { value: '6mois',        text: 'Tous les 6 mois' },
  { value: 'annuel',       text: 'Tous les 12 mois' },
];

// Sauvegarde de la configuration dans localStorage
function saveFrequencies() {
  localStorage.setItem('taskFrequencies', JSON.stringify(taskFrequencies));
}

// Affichage de la planification
function renderPlanification() {
  const planificationContainer = document.getElementById('planificationContainer');
  planificationContainer.innerHTML = '';

  // Parcourt toutes les pièces (rooms)
  rooms.forEach(room => {
    // Bloc de la pièce
    const roomDiv = document.createElement('div');
    roomDiv.classList.add('room-block');

    // Titre de la pièce
    const roomTitle = document.createElement('h2');
    roomTitle.textContent = room.name;
    roomDiv.appendChild(roomTitle);

    // Vérifie si la pièce possède des tâches
    if (room.tasks && room.tasks.length > 0) {
      const taskUl = document.createElement('ul');

      // Pour chaque tâche de la pièce
      room.tasks.forEach(taskName => {
        const li = document.createElement('li');
        
        // Libellé de la tâche
        const taskLabel = document.createElement('span');
        taskLabel.textContent = taskName;
        li.appendChild(taskLabel);

        // Sélecteur de périodicité
        const frequencySelect = document.createElement('select');

        // Récupère la périodicité déjà sauvegardée, si elle existe
        const existingFreq = taskFrequencies[room.id]?.[taskName] || '';

        // Ajoute au select chaque option de fréquence
        frequencyOptions.forEach(opt => {
          const optionEl = document.createElement('option');
          optionEl.value = opt.value;
          optionEl.textContent = opt.text;
          // Sélectionne si correspond à la valeur déjà enregistrée
          if (opt.value === existingFreq) {
            optionEl.selected = true;
          }
          frequencySelect.appendChild(optionEl);
        });

        // Gestion du changement de périodicité
        frequencySelect.addEventListener('change', e => {
          const selectedFrequency = e.target.value;
          if (!taskFrequencies[room.id]) {
            taskFrequencies[room.id] = {};
          }
          taskFrequencies[room.id][taskName] = selectedFrequency;
          saveFrequencies();
        });

        li.appendChild(frequencySelect);
        taskUl.appendChild(li);
      });

      roomDiv.appendChild(taskUl);
    } else {
      // Si la pièce n’a pas de tâches, on l’indique
      const noTaskP = document.createElement('p');
      noTaskP.textContent = 'Aucune tâche pour cette pièce.';
      roomDiv.appendChild(noTaskP);
    }

    planificationContainer.appendChild(roomDiv);
  });
}

// Lance l’affichage au chargement de la page
renderPlanification();
