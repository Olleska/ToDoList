const form = document.querySelector('#form');
const taskInput = document.querySelector('#taskInput');
const tasksList = document.querySelector('#tasksList');
const emptyList = document.querySelector('#emptyList');
const saveJsonBtn = document.querySelector('#saveJsonBtn');
const loadJsonBtn = document.querySelector('#loadJsonBtn');
const fileInput = document.querySelector('#fileInput');

let tasks = [];

if (localStorage.getItem('tasks')){
    tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.forEach((task) => renderTask(task));
}

checkEmptyList();

form.addEventListener('submit', addTask);
tasksList.addEventListener('click',deleteTask);
tasksList.addEventListener('click',doneTask);
tasksList.addEventListener('click', editTask); 
saveJsonBtn.addEventListener('click', downloadTasksAsJson);
loadJsonBtn.addEventListener('click', () => {
    fileInput.click(); 
});

function addTask(event){
    event.preventDefault();

    const taskText = taskInput.value;

    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    };

    tasks.push(newTask);

    saveToLocalStorage();

    renderTask(newTask);

    taskInput.value = "";
    taskInput.focus();

    checkEmptyList();
}

function deleteTask(event){
    if (event.target.dataset.action !== "delete") return;

    const parentNode = event.target.closest('.list-group-item');

    const id = parentNode.id;

    const index = tasks.findIndex(function (task){
        return task.id == id;
    })

    tasks.splice(index,1);

    saveToLocalStorage();

    parentNode.remove();

    checkEmptyList();
}

function doneTask(event){
    if (event.target.dataset.action !== "done") return;

    const parentNode = event.target.closest('.list-group-item');

    const id = parentNode.id;

    const task = tasks.find(function (task){
            return task.id == id;
    })
    task.done = !task.done

    saveToLocalStorage();

    const taskTitle = parentNode.querySelector('.task-title');
    taskTitle.classList.toggle('task-title--done');
}

function editTask(event) {
    if (event.target.dataset.action !== "edit") return;

    const parentNode = event.target.closest('.list-group-item');
    const id = Number(parentNode.id);

    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const taskTitleElement = parentNode.querySelector('.task-title');
    if (!taskTitleElement) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm';
    input.value = task.text;

    input.style.width = `$600px`;
    input.style.minWidth = '50px';
    input.style.maxWidth = '900px';
    input.style.border = '1px solid #b300ffff';
    input.style.borderRadius = '4px';
    input.style.padding = '2px 6px';

    taskTitleElement.replaceWith(input);

    input.focus();

    let isHandled = false;

    input.addEventListener('blur', () => {
        if (isHandled) return;
        isHandled = true;
        finishEditing();
    });

    input.addEventListener('keydown', (e) => {
        if (isHandled) return;

        if (e.key === 'Enter') {
            isHandled = true;
            finishEditing();
        }
        if (e.key === 'Escape') {
            isHandled = true;
            cancelEditing();
            e.preventDefault();
        }
    });

    function finishEditing() {
        const newText = input.value.trim();

        if (newText === '') {
            alert('Задача не может быть пустой!');
            cancelEditing();
            return;
        }

        task.text = newText;
        saveToLocalStorage();

        const newTaskTitleElement = document.createElement('span');
        newTaskTitleElement.className = task.done ? 'task-title task-title--done' : 'task-title';
        newTaskTitleElement.textContent = newText;

        input.replaceWith(newTaskTitleElement);
    }

    function cancelEditing() {
        const originalSpan = document.createElement('span');
        originalSpan.className = task.done ? 'task-title task-title--done' : 'task-title';
        originalSpan.textContent = task.text;

        input.replaceWith(originalSpan);
    }
}

function checkEmptyList(){
    if (tasks.length === 0){
        const emptyListHTML=`<li id="emptyList" class="list-group-item empty-list">
					<img src="./img/leaf.svg" alt="Empty" width="48" class="mt-3">
					<div class="empty-list__title">Список дел пуст</div>
				</li>`;
        tasksList.insertAdjacentHTML('afterbegin',emptyListHTML);
    }
    if (tasks.length > 0){
        const emptyListEl = document.querySelector('#emptyList');
        emptyListEl ? emptyListEl.remove() : null;
    }

}

function saveToLocalStorage(){
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

function renderTask(task){
    const cssClass = task.done ? 'task-title task-title--done' : 'task-title';

    const taskHTML = `<li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
					<span class="${cssClass}">${task.text}</span>
					<div class="task-item__buttons">
                        <button type="button" data-action="edit" class="btn-action">
							<img src="./img/pen.svg" alt="Done" width="18" height="18">
						</button>
						<button type="button" data-action="done" class="btn-action">
							<img src="./img/tick.svg" alt="Done" width="18" height="18">
						</button>
						<button type="button" data-action="delete" class="btn-action">
							<img src="./img/cross.svg" alt="Done" width="18" height="18">
						</button>
					</div>
				</li>`;

    tasksList.insertAdjacentHTML('beforeend', taskHTML);
}

function downloadTasksAsJson() {
    if (tasks.length === 0) {
        alert('Нет задач для сохранения!');
        return;
    }

    const dataStr = JSON.stringify(tasks, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-tasks.json'; 

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    alert('Задачи сохранены в файл my-tasks.json!');
}

fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const loadedTasks = JSON.parse(e.target.result);

            if (!Array.isArray(loadedTasks)) {
                throw new Error('Файл должен содержать массив задач');
            }

            for (let task of loadedTasks) {
                if (
                    typeof task.id !== 'number' ||
                    typeof task.text !== 'string' ||
                    typeof task.done !== 'boolean'
                ) {
                    throw new Error('Неверный формат задачи в файле');
                }
            }

            tasks = loadedTasks;

            tasksList.innerHTML = '';

            tasks.forEach(task => renderTask(task));

            saveToLocalStorage();

            checkEmptyList();

            alert('Задачи успешно загружены из файла!');

        } catch (error) {
            alert('Ошибка при загрузке файла: ' + error.message);
            console.error(error);
        } finally {
            fileInput.value = '';
        }
    };

    reader.onerror = function() {
        alert('Ошибка чтения файла');
    };

    reader.readAsText(file);
}