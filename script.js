const taskList = document.querySelector('#task-list');
const newTaskBtn = document.querySelector('#new-task');

const taskForm = document.querySelector('#task-form');
const taskTitleInput = document.querySelector('#task-title');
const taskDateInput = document.querySelector('#task-date');
const taskDescriptionInput = document.querySelector('#task-description');
const formButtonIcon = document.querySelector('#form-button-icon');
const formButtonText = document.querySelector('#form-button-text');
const closeTaskForm = document.querySelector('#close-task-form');

const discardDialog = document.querySelector('#discard-dialog');
const discardChangesBtn = document.querySelector('#discard-changes');

const tasks = {
  list: JSON.parse(localStorage.getItem('tasks')) || [],
  current: {},
}

const displayEditTaskForm = (id) => {
  tasks.current = tasks.list[tasks.list.findIndex(task => task.id === id)];
  populateFormFields(tasks.current);
  formButtonText.textContent = 'Update task';
  toggleTaskForm();
}

const toggleTaskForm = () => {
  taskList.classList.toggle('hidden');
  taskForm.classList.toggle('hidden');
  newTaskBtn.classList.toggle('hidden');
}

const populateFormFields = ({title, date, description}) => {
  taskTitleInput.value = title;
  taskDateInput.value = date;
  taskDescriptionInput.value = description;
}

const addOrEditTask = () => {
  updateTaskList();
  localStorage.setItem('tasks', JSON.stringify(tasks.list));
  renderTaskList();
  closeAndResetForm();
}

const sortTasksByDate = () => {
  tasks.list.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;

    return new Date(a.date) - new Date(b.date);
  });
}

const updateTaskList = () => {
  const title = taskTitleInput.value;
  const date = taskDateInput.value;
  const description = taskDescriptionInput.value;
  
  const id = Object.keys(tasks.current).length
    ? tasks.current.id
    : `${title.replace(/"/g, '').toLowerCase().split(' ').join('-')}-${Date.now()}`;
  
  const taskObj = {
    id: id,
    title: title,
    date: date,
    description: description,
  }

  if (Object.keys(tasks.current).length) {
    tasks.list[tasks.list.findIndex(task => task.id === tasks.current.id)] = taskObj;
  } else {
    tasks.list.push(taskObj);
  }

  sortTasksByDate();
}

const formatDay = (isoString) => {
  const input = new Date(isoString);
  const now = new Date();

  const startOfDay = (d) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy
  }

  const today = startOfDay(now);
  const target = startOfDay(input);

  const diffDays = Math.round(
    (target - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  if (target >= startOfWeek && target <= endOfWeek) {
    return target.toLocaleDateString(undefined, {
      weekday: 'long',
    });
  }

  return target.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const formatDate = (isoString) => {
  if (!isoString) return '';

  const day = formatDay(isoString);
  const time = new Date(isoString).toLocaleTimeString([], {
    hour: 'numeric',
    hourCycle: 'h12',
    minute: '2-digit',
  });

  return `${day} ${time}`;
}

const renderTaskList = () => {
  taskList.innerHTML = '';

  tasks.list.forEach(task => {
    const { id, title, date, description } = task;
    const dateFormatted = formatDate(date);

    const html = `<div id="${id}" class="task">
      <div class="task-header">
        <div class="task-content">
          <p class="task-title">${title}</p>
          <p class="task-date">${dateFormatted}</p>
        </div>
        <div class="task-controls">
          <button class="button icon-button" onclick="displayEditTaskForm('${id}')">
            <span class="material-symbols-outlined">edit_square</span>
          </button>
          <button class="button icon-button" onclick="deleteTask('${id}')">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <p class="task-description">${description}</p>
    </div>`;
    taskList.insertAdjacentHTML('beforeend', html);
  });
}

const closeAndResetForm = () => {
  tasks.current = {};
  toggleTaskForm();
  taskForm.reset();
  formButtonText.textContent = 'Add task';
}

const deleteTask = (id) => {
  removeTaskFromList(id)
  localStorage.setItem('tasks', JSON.stringify(tasks.list));
  renderTaskList();
}

const removeTaskFromList = (id) => {
  const taskIndex = tasks.list.findIndex(task => task.id === id);
  tasks.list.splice(taskIndex, 1);
}

const showDialogOrCloseForm = () => {
  const titleVal = taskTitleInput.value.trim();
  const dateVal = taskDateInput.value;
  const descriptionVal = taskDescriptionInput.value.trim();

  const containsInput = titleVal || dateVal || descriptionVal;

  const valuesChanged = 
    titleVal !== tasks.current.title || 
    dateVal !== tasks.current.date || 
    descriptionVal !== tasks.current.description;

  if (containsInput && valuesChanged) {
    discardDialog.showModal();
  } else {
    closeAndResetForm();
  }
}

// Event listeners
newTaskBtn.addEventListener('click', toggleTaskForm);

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addOrEditTask();
});

taskTitleInput.addEventListener('input', (event) => {
  const input = event.target;
  if (input.value.trim() === '') {
    input.setCustomValidity('Please fill in this field.');
  } else {
    input.setCustomValidity('');
  }
});

closeTaskForm.addEventListener('click', showDialogOrCloseForm);

discardChangesBtn.addEventListener('click', closeAndResetForm);

document.addEventListener('DOMContentLoaded', renderTaskList);
