const form = document.querySelector('.form');
const input = document.querySelector('.input');
const tbody = document.querySelector('.tbody');
const tfoot = document.querySelector('.tfoot');
const search = document.querySelector('.search');

let arrayTask = []
let combinedData = []

const checkLocalStorage = () => {
    if(localStorage.getItem("task")){
        arrayTask =JSON.parse(localStorage.getItem("task"))
    }
}

const fetchData = async () => {
    try {
        const response = await fetch('https://dummyjson.com/todos');
        const todos = await response.json();
        combinedData = [...todos.todos, ...arrayTask];
        displayData(combinedData);
    } catch (error) {
        alert('Error fetching data:', error);
    }
};

const displayData = (data) => {
    tbody.innerHTML = '';

    data.map(task => {
        const row = document.createElement('tr');
        row.setAttribute('task-id' ,`${task.id}` )
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.todo}</td>
            <td>${task.userId}</td>
            <td>${task.completed ? 'Completed' : 'Pending'}</td>
            <td><button class="delete-btn" data-id="${task.id}">Delete</button>
            <button class="done-btn" data-id="${task.id}">Done</button></td>
        `;

        if (task.completed) {
            row.classList.add("task-id-done");
        }
        tbody.appendChild(row);
    });
    
    count();

};

const count =() =>{
    tfoot.textContent=`Total Task : ${combinedData.length} `
}

const handleFormSubmission = async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (value !== '') {
        await addTask(value);
        input.value = '';
    }
}

const getNextId = () => {
        const currentIndex =Array.from(tbody.querySelectorAll('tr'))

        const nextIndex = currentIndex.map(task => {
           parseInt(task.querySelector('td:first-child').textContent)
        })
        const maxIndex = nextIndex.length +1
        return maxIndex
        
}


const addTask = async (newTask) => {

    const newTaskData = {
        id:getNextId(),
        todo: newTask,
        completed: false,
        userId: Math.floor(Math.random() * 50) + 1,
    };

            
    arrayTask.push(newTaskData)        
    addToLocalStorage(arrayTask)
    fetchData();
    try {

        const updateResponse = await fetch('https://dummyjson.com/todos/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskData)
          })

        if (updateResponse.ok) {
            alert('New TODO added successfully.');

        } else {
            alert('Failed to add new TODO.');

        }
    } catch (error) {
        alert('An error occurred:', error.message);
    }
};


const removeTask = async(e) => {
    if(e.target.classList.contains("delete-btn")){
        const confirmed = confirm("Are you sure you want to delete this task?");
        if(confirmed){
            await deleteTaskFromLS(e.target.parentElement.parentElement.getAttribute("task-id"))
            e.target.parentElement.parentElement.remove();

        }
       
    }
}



const deleteTaskFromLS = async (taskId) => {
    arrayTask = arrayTask.filter(task =>task.id != taskId)
    addToLocalStorage(arrayTask)
    fetchData()

    try {
        const response = await fetch(`https://dummyjson.com/todos/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        if (response.ok) {
            alert('Task deleted successfully.');

        } else {
            alert('Failed to delete task.');
        }

    } catch (error) {
        alert('An error occurred:', error);
    }

}



const makeDoneTask = async(e) => {
    if(e.target.classList.contains("done-btn")){
        const taskRow = e.target.closest("tr");
           const taskId = e.target.parentElement.parentElement.getAttribute("task-id")
           const taskIndex =arrayTask.findIndex(task => task.id ==taskId)
           const taskIndexApi =combinedData.findIndex(task => task.id ==taskId)
           if(taskIndex !== -1){
                arrayTask[taskIndex].completed = !arrayTask[taskIndex].completed
                addToLocalStorage(arrayTask)
                 fetchData()
           }


           try {
                const response = await fetch(`https://dummyjson.com/todos/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        completed : !combinedData[taskIndexApi].completed 
                    })
                  })

                  if (response.ok) {
                    alert("Task status updated");
                } else {
                    alert('An error occurred while updating task status');
                }

           } catch(error) {
            alert('An error occurred while updating task status:', error);

           }
    }
}


const searchTask = () => {
  const searchValue = search.value.trim().toLowerCase();
  const searchedAray = combinedData.filter(task => task.todo.toLowerCase().startsWith(searchValue))
  displayData(searchedAray)
}


const addToLocalStorage =(arrayTask)=>{
    window.localStorage.setItem("task" ,JSON.stringify(arrayTask))
}


const getFromLocalStorage =()=>{
   const data = window.localStorage.getItem("task")
   if(data){
     const task = JSON.parse(data)
     displayData(task)
   }
}

form.addEventListener('submit', handleFormSubmission);
tbody.addEventListener('click', removeTask);
tbody.addEventListener('click', makeDoneTask);
search.addEventListener('input' , searchTask)

fetchData();
checkLocalStorage()
getFromLocalStorage();
