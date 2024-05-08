// script.js
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipeList');

recipeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = recipeForm.title.value;
    const ingredients = recipeForm.ingredients.value;
    const instructions = recipeForm.instructions.value;

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
    recipeListItem.remove();
}