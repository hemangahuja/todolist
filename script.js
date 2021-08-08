var todoList = [];
const todoListElement = document.querySelector("#myUL");

document.querySelector("#add_button").addEventListener("click", addTodo);
document.querySelector("#myInput").addEventListener("keydown", function (e) {
  if (e.keyCode == 13) {
    addTodo();
  }
});

function populate() {
  todoListElement.innerHTML = "";
  todoList = [];
  fetch("/readtodo", {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      for (const todoItem of data) {
        todoList.push(todoItem);
      }
      displayTodos();
    })
    .catch((err) => {
      console.log(err);
    });
}

window.onload = populate;

//-------GETTING VALUES FROM INPUT TO ARRAY OF OBJECTS-------
function addTodo() {
  const todotext = document.querySelector("#myInput").value.trim();
  if (todotext == "") {
    alert("You did not enter any item");
  } else {
    const todoObject = {
      todotext: todotext,
      isdone: 0,
    };
    //---WITH push WE ADD THE NEW ELEMENT TO THE BEGINNING OF THE ARRAY
    //--SO THAT THE NEW ITEMS SHOW UP ON TOP

    fetch("/addtodo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      body: JSON.stringify(todoObject),
    })
      .then((todoObject) => {
        console.log("Success:", todoObject);
      })
      .catch((error) => {
        console.error("Add Error:", error);
      });
  }
  populate();
}

//------CHANGING THE isdone VALUE TO TRUE WHEN THE ELEMENT IS CLICKED
//------OR TO FALSE IF IT WAS TRUE BEFORE
function updateTodo(todoId, todelete) {
  let path = todelete ? "/deletetodo" : "/updatetodo";
  fetch(path, {
    method: "POST",
    //mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    body: JSON.stringify({ uuid: todoId }),
  })
    .then((todoId) => {
      console.log("Success:", todoId);
    })
    .catch((error) => {
      console.error("Update Error:", error);
    });
  populate();
}

//----TO DELETE AN ITEM; FROM THE LIST
function deleteItem(selectedTodoIndex) {
  fetch("/deletetodo", {
    method: "POST",
    //mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    body: JSON.stringify({ uuid: selectedTodoIndex }),
  })
    .then((selectedTodoIndex) => {
      console.log("Success:", selectedTodoIndex);
    })
    .catch((error) => {
      console.error("Delete Error:", error);
    });
  populate();
}

//adding event listeners

//---------DISPLAYING THE ENTERED ITEMS ON THE SCREEN------
function displayTodos() {
  todoListElement.innerHTML = "";
  document.querySelector("#myInput").value = "";
  for (let item of todoList) {
    const listElement = document.createElement("li");
    const delBtn = document.createElement("i");

    listElement.innerHTML = item.todotext;
    listElement.setAttribute("data-id", item.uuid);

    delBtn.setAttribute("data-id", item.uuid);
    delBtn.className = "far fa-trash-alt";
    delBtn.setAttribute("data-id", item.uuid);

    if (item.isdone) {
      listElement.classList.add("checked");
    }

    listElement.addEventListener("click", function (e) {
      if (e.target === delBtn) {
        return;
      }
      const selectedId = e.target.getAttribute("data-id");
      updateTodo(selectedId);
    });

    delBtn.addEventListener("click", function (e) {
      const delId = e.target.getAttribute("data-id");
      updateTodo(delId, true);
    });

    todoListElement.appendChild(listElement);
    listElement.appendChild(delBtn);
  }
}
