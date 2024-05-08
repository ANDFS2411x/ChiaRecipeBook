// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onChildAdded, remove } from "firebase/database";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "T",
  authDomain: "chiarecipebook.firebaseapp.com",
  databaseURL: "https://chiarecipebook-default-rtdb.firebaseio.com",
  projectId: "chiarecipebook",
  storageBucket: "chiarecipebook.appspot.com",
  messagingSenderId: "901418297920",
  appId: "1:901418297920:web:49070f17a4084f62920da5",
  measurementId: "G-S46YGH9RRW"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Obtén referencias a los elementos del formulario y la lista de recetas
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipeList');

// Función para obtener las recetas almacenadas en la base de datos de Firebase
function getSavedRecipes() {
    // Firebase no usa almacenamiento local, obtén recetas de la base de datos
    const recipesRef = ref(database, 'recipes');
    const recipes = [];
    onChildAdded(recipesRef, (snapshot) => {
        recipes.push(snapshot.val());
    });
    return recipes;
}

// Función para guardar las recetas en la base de datos de Firebase
function saveRecipe(recipe) {
    push(ref(database, 'recipes'), recipe);
}

// Cargar recetas al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const recipes = getSavedRecipes();
    recipes.forEach(recipe => {
        const recipeHTML = `
            <li class="recipe">
                <h2>${recipe.title}</h2>
                <div class="recipe-details">
                    <h3>Ingredientes:</h3>
                    <p>${recipe.ingredients}</p>
                    <h3>Instrucciones:</h3>
                    <p>${recipe.instructions}</p>
                    <button class="delete-btn" onclick="deleteRecipe(this)" role="button">Eliminar</button>
                </div>
            </li>
        `;
        recipeList.insertAdjacentHTML('beforeend', recipeHTML);
    });
});

recipeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = recipeForm.title.value;
    const ingredients = recipeForm.ingredients.value;
    const instructions = recipeForm.instructions.value;

    const recipe = { title, ingredients, instructions };

    // Guarda la receta en la base de datos de Firebase
    saveRecipe(recipe);

    const recipeHTML = `
        <li class="recipe">
            <h2>${title}</h2>
            <div class="recipe-details">
                <h3>Ingredientes:</h3>
                <p>${ingredients}</p>
                <h3>Instrucciones:</h3>
                <p>${instructions}</p>
                <button class="delete-btn" onclick="deleteRecipe(this)" role="button">Eliminar</button>
            </div>
        </li>
    `;

    recipeList.insertAdjacentHTML('beforeend', recipeHTML);

    recipeForm.reset();
});

recipeList.addEventListener('click', (event) => {
    if (event.target.tagName === 'H2') {
        const recipeDetails = event.target.nextElementSibling;
        recipeDetails.classList.toggle('recipe-details');
    }
});

function deleteRecipe(deleteButton) {
    const recipeListItem = deleteButton.closest('.recipe');
    const recipeTitle = recipeListItem.querySelector('h2').innerText;

    // Elimina la receta de la base de datos de Firebase
    database.ref('recipes').orderByChild('title').equalTo(recipeTitle).once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            childSnapshot.ref.remove();
        });
    });

    recipeListItem.remove();
}


