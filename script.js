// script.js
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipeList');

// Función para obtener las recetas almacenadas en el almacenamiento local
function getSavedRecipes() {
    const savedRecipes = localStorage.getItem('recipes');
    return savedRecipes ? JSON.parse(savedRecipes) : [];
}

// Función para guardar las recetas en el almacenamiento local
function saveRecipes(recipes) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
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

    const recipes = getSavedRecipes();
    recipes.push(recipe);
    saveRecipes(recipes);

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

    let recipes = getSavedRecipes();
    recipes = recipes.filter(recipe => recipe.title !== recipeTitle);
    saveRecipes(recipes);

    recipeListItem.remove();
}
