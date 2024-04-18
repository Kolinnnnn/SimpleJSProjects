class Todo {
    constructor() {
      this.tasks = this.loadTasksFromLocalStorage(); 
      this.editingIndex = -1; 
      this.term = ''; 
      this.draw();
      this.bindEvents();
    }
    
    //Dodanie zadania do listy
    addTask(taskText) {
      this.tasks.push({ text: taskText, completed: false });
      this.saveTasksToLocalStorage(); 
      this.draw();
    }
    
    //Usuwa zadanie z listy
    removeTask(index) {
      if (index >= 0 && index < this.tasks.length) {
        this.tasks.splice(index, 1);
        this.saveTasksToLocalStorage(); 
        this.editingIndex = -1;
        this.draw();
      }
    }
    
    //Usuwa zadanie z listy na podstawie ID
    removeTaskById(id) {
      const index = parseInt(id.split('-')[1]);
      if (!isNaN(index) && index >= 0 && index < this.tasks.length) {
        this.tasks.splice(index, 1);
        this.saveTasksToLocalStorage();
        this.editingIndex = -1;
        this.draw();
      }
    }
    
    //Reset wyszukiwania
    updateSearchTerm(term) {
      this.term = term;
      this.draw();
    }
    
    //Filtrowanie listy zadan
    get filteredTasks() {
      return this.tasks.filter(task => {
        return task.text.toLowerCase().includes(this.term.toLowerCase());
      });
    }
  
    //Zmiana stanu ukończenia zadania
    toggleTaskCompletion(index) {
      if (index >= 0 && index < this.tasks.length) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.saveTasksToLocalStorage(); 
        this.draw();
      }
    }
    
    //Edycja tekstu zadania
    editTask(index, newText) {
      if (index >= 0 && index < this.tasks.length) {
        this.tasks[index].text = newText;
        this.editingIndex = -1;
        this.saveTasksToLocalStorage();
        this.draw();
      }
    }
    
    //Pobieranie listy zadan z localstroage i zwracanie jako tablica
    loadTasksFromLocalStorage() {
      const tasksJSON = localStorage.getItem('tasks');
      console.log("taskJSON",tasksJSON);
      return tasksJSON ? JSON.parse(tasksJSON) : [];
    }
    
    //Zapis listy zadan do localstorage
    saveTasksToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

//Widok listy zadan 
draw() {
    const todoList = document.getElementById('todo-list');

    
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    console.log(this.tasks);
    this.tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';

        
        const taskText = task.text;
        console.log("taskText", taskText);
        const searchText = this.term;
        const textParts = taskText.split(new RegExp(`(${searchText})`, 'gi'));

        for (const part of textParts) {
            const textElement = document.createElement('span');
            if (part.toLowerCase() === searchText.toLowerCase()) {
                textElement.classList.add('highlight');
            }
            textElement.textContent = part;
            listItem.appendChild(textElement);
        }

        if (task.completed) {
            listItem.classList.add('completed');
        }

        
const removeButton = document.createElement('button');
removeButton.textContent = 'Usuń';
removeButton.className = 'remove-button';

removeButton.addEventListener('click', (event) => {
    event.stopPropagation(); 
    this.removeTask(index);
});

listItem.appendChild(removeButton);

listItem.addEventListener('click', () => {
    if (this.editingIndex === -1) {
        this.editingIndex = index;
        const newText = prompt('Edytuj zadanie:', task.text);
        console.log("newText", newText);
        if (newText !== null) {
          console.log("string");
            this.editTask(index, newText);
        }else {
          this.editTask(index, this.tasks[index].text)
        }
    }
});

        todoList.appendChild(listItem);
    });

  
    this.tasks.forEach((task, index) => {
        const listItem = document.getElementsByClassName('task-item')[index];
        if (this.term && task.text.toLowerCase().indexOf(this.term.toLowerCase()) === -1) {
            listItem.style.display = 'none';
        }
    });
}

    //Obsługa kliknięcia poza listą zadań
    handleClickOutsideList(event) {
      if (this.editingIndex !== -1) {
        const target = event.target;
        const todoList = document.getElementById('todo-list');
        if (target !== todoList) {
          this.editTask(this.editingIndex, todoList.children[this.editingIndex].textContent);
          this.editingIndex = -1;
        }
      }
    }
    
    //Obsługa zdarzeń
    bindEvents() {
      document.addEventListener('click', (event) => this.handleClickOutsideList(event));
      const searchInput = document.getElementById('search');
      searchInput.addEventListener('input', (event) => this.updateSearchTerm(event.target.value));
  
      const addItemButton = document.getElementById('add-item');
      addItemButton.addEventListener('click', () => {
        const newItemInput = document.getElementById('new-item');
        const newItemText = newItemInput.value;
        if (newItemText.trim() !== '') {
          this.addTask(newItemText);
          newItemInput.value = ''; 
        }
      });
  
      todoList.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
          const listItem = event.target.parentNode;
          const id = listItem.id;
          this.removeTaskById(id);
        }
      });
    }
  }
  
  const todo = new Todo();