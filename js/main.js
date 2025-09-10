const form = document.querySelector('#form');
const taskInput = document.querySelector('#taskInput');
const tasksList = document.querySelector('#tasksList');
const emptyList = document.querySelector('#emptyList');

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
    // Проверяем, что кликнули именно по кнопке редактирования
    if (event.target.dataset.action !== "edit") return;

    // Находим задачу в DOM
    const parentNode = event.target.closest('.list-group-item');
    const id = Number(parentNode.id);

    // Находим задачу в массиве
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    // Находим элемент с текстом задачи
    const taskTitleElement = parentNode.querySelector('.task-title');
    if (!taskTitleElement) return;

    // Создаём инпут для редактирования
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm';
    input.value = task.text;

    // Стили, чтобы не ломался макет
    input.style.width = `$600px`;
    input.style.minWidth = '50px';
    input.style.maxWidth = '900px';
    input.style.border = '1px solid #b300ffff';
    input.style.borderRadius = '4px';
    input.style.padding = '2px 6px';

    // Заменяем текст на инпут
    taskTitleElement.replaceWith(input);

    // Фокус на поле
    input.focus();

    // Флаг, чтобы избежать двойного вызова при Enter + blur
    let isHandled = false;

    // Сохраняем при потере фокуса
    input.addEventListener('blur', () => {
        if (isHandled) return;
        isHandled = true;
        finishEditing();
    });

    // Сохраняем по Enter, отменяем по Escape
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

    // Функция сохранения
    function finishEditing() {
        const newText = input.value.trim();

        // Если текст пустой — не сохраняем, отменяем
        if (newText === '') {
            alert('Задача не может быть пустой!');
            cancelEditing();
            return;
        }

        // Обновляем задачу в массиве
        task.text = newText;
        saveToLocalStorage();

        // Создаём новый span с обновлённым текстом
        const newTaskTitleElement = document.createElement('span');
        newTaskTitleElement.className = task.done ? 'task-title task-title--done' : 'task-title';
        newTaskTitleElement.textContent = newText;

        // Заменяем input на span
        input.replaceWith(newTaskTitleElement);
    }

    // Функция отмены (Escape или пустой ввод)
    function cancelEditing() {
        // Восстанавливаем исходный span
        const originalSpan = document.createElement('span');
        originalSpan.className = task.done ? 'task-title task-title--done' : 'task-title';
        originalSpan.textContent = task.text;

        // Заменяем input на span
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

