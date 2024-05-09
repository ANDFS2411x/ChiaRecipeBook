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
const firebaseConfig = {
  apiKey: "AIzaSyAkyOgsZBAD6E1P0nlxTs4_5XO3FYyOed4",
  authDomain: "chiarecipeboook.firebaseapp.com",
  projectId: "chiarecipeboook",
  storageBucket: "chiarecipeboook.appspot.com",
  messagingSenderId: "252717458095",
  appId: "1:252717458095:web:4eef3ce12bcea4e087ea5a",
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

  console.log(recipe);

  recipeItem.innerHTML = `
        <h2>${recipe.title}</h2>
        <div class="recipe-details">
            <h3>Ingredientes:</h3>
            <p>${recipe.ingredients}</p>
            <h3>Instrucciones:</h3>
            <p>${recipe.instructions}</p>
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
