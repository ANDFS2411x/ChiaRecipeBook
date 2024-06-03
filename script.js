// Importa las funciones necesarias desde Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Tu configuración de Firebase
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDf3D-9xE4Sr7WCaHOugxgKojAG_JlrjU0",
    authDomain: "chiadatabaserecipebook.firebaseapp.com",
    projectId: "chiadatabaserecipebook",
    storageBucket: "chiadatabaserecipebook.appspot.com",
    messagingSenderId: "812746267583",
    appId: "1:812746267583:web:91c36c3c519bc493d91f0a"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Resto del código JavaScript
const recipeForm = document.getElementById("recipeForm");
const recipeList = document.getElementById("recipeList");

// Escucha el evento submit del formulario
recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = recipeForm.title.value;
  const ingredients = recipeForm.ingredients.value;
  const instructions = recipeForm.instructions.value;

  // Agrega la nueva receta a la base de datos
  const newRecipeRef = push(ref(database, "recipes"));
  set(newRecipeRef, {
    title: title,
    ingredients: ingredients,
    instructions: instructions,
  });

  recipeForm.reset();
});

// Escucha cuando se agrega una nueva receta y muestra en la lista
onChildAdded(ref(database, "recipes"), (snapshot) => {
  const recipe = snapshot.val();
  const recipeItem = document.createElement("li");
  recipeItem.classList.add("recipe");

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "Eliminar";
  deleteBtn.addEventListener("click", () => {
    // Eliminar la receta de la base de datos
    remove(snapshot.ref);
    recipeItem.remove();
  });

  // Reemplazar los saltos de línea con <br> en los ingredientes e instrucciones
  const ingredientsHTML = recipe.ingredients.replace(/\n/g, "<br>");
  const instructionsHTML = recipe.instructions.replace(/\n/g, "<br>");

  recipeItem.innerHTML = `
        <h2>${recipe.title}</h2>
        <div class="recipe-details">
            <h3>Ingredientes:</h3>
            <p>${ingredientsHTML}</p>
            <h3>Instrucciones:</h3>
            <p>${instructionsHTML}</p>
        </div>
    `;

  recipeItem.addEventListener("click", () => {
    // Arreglando la pendejada
    const recipeDetails = recipeItem.querySelector(".recipe-details");
    recipeDetails.classList.toggle("active");
  });

  recipeItem.appendChild(deleteBtn);
  recipeList.appendChild(recipeItem);
});
