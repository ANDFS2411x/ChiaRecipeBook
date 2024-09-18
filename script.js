import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    onChildAdded,
    remove,
    update,
    onChildChanged,
    onChildRemoved
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtm7GfGFosRrC_yb2_KgGnitjJBKic_Xk",
  authDomain: "basededatoschiaoctubre.firebaseapp.com",
  projectId: "basededatoschiaoctubre",
  storageBucket: "basededatoschiaoctubre.appspot.com",
  messagingSenderId: "119608084530",
  appId: "1:119608084530:web:24b8a3e58946047dc8542b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const recipeForm = document.getElementById("recipeForm");
const recipeList = document.getElementById("recipeList");
const searchBar = document.getElementById("searchBar");
const addRecipeBtn = document.getElementById("addRecipeBtn");

let recipes = [];

recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = recipeForm.title.value.trim();
    const ingredients = formatIngredients(recipeForm.ingredients.value.trim());
    const instructions = recipeForm.instructions.value.trim();
    const category = recipeForm.category.value;
    const recipeId = recipeForm.dataset.id;

    if (!title || !ingredients || !instructions || !category) {
        showNotification("Por favor, completa todos los campos.", "error");
        return;
    }

    if (recipeId) {
        const recipeRef = ref(database, "recipes/" + recipeId);
        update(recipeRef, {
            title,
            ingredients,
            instructions,
            category,
        });
        showNotification("¡Receta actualizada exitosamente!", "success");
        addRecipeBtn.querySelector('.button-fancy-text').textContent = '¡Agregar!';
    } else {
        const newRecipeRef = push(ref(database, "recipes"));
        set(newRecipeRef, {
            title,
            ingredients,
            instructions,
            category,
        });
        showNotification("¡Receta agregada exitosamente!", "success");
    }

    recipeForm.reset();
    delete recipeForm.dataset.id;
    triggerConfetti();
});

onChildAdded(ref(database, "recipes"), (snapshot) => {
    const recipe = snapshot.val();
    recipes.push({ ...recipe, id: snapshot.key });
    displayRecipes(recipes);
});

onChildChanged(ref(database, "recipes"), (snapshot) => {
    const updatedRecipe = snapshot.val();
    const index = recipes.findIndex(recipe => recipe.id === snapshot.key);
    if (index !== -1) {
        recipes[index] = { ...updatedRecipe, id: snapshot.key };
        displayRecipes(recipes);
    }
});

onChildRemoved(ref(database, "recipes"), (snapshot) => {
    recipes = recipes.filter(recipe => recipe.id !== snapshot.key);
    displayRecipes(recipes);
});

searchBar.addEventListener("input", () => {
    filterAndDisplayRecipes();
});

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const category = button.getAttribute('data-category');
        filterAndDisplayRecipes(category);
    });
});

function filterAndDisplayRecipes(category = 'all') {
    const searchTerm = searchBar.value.toLowerCase();
    
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) ||
                              recipe.ingredients.toLowerCase().includes(searchTerm) ||
                              recipe.instructions.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || recipe.category === category;
        return matchesSearch && matchesCategory;
    });

    displayRecipes(filteredRecipes);
    
    // Highlight search terms
    if (searchTerm) {
        highlightSearchTerms(searchTerm);
    }
}

function displayRecipes(recipesToDisplay) {
    recipeList.innerHTML = "";
    recipesToDisplay.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        const ingredientsHTML = recipe.ingredients.replace(/\n/g, "<br>");
        const instructionsHTML = recipe.instructions.replace(/\n/g, "<br>");

        recipeCard.innerHTML = `
            <h3>${recipe.title}</h3>
            <div class="recipe-content">
                <div class="recipe-category">${recipe.category}</div>
                <div class="recipe-details">
                    <h4>Ingredientes:</h4>
                    <p>${ingredientsHTML}</p>
                    <h4>Instrucciones:</h4>
                    <p>${instructionsHTML}</p>
                </div>
                <div class="recipe-actions">
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Eliminar</button>
                </div>
            </div>
        `;

        recipeCard.addEventListener("click", (e) => {
            if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
                recipeCard.querySelector(".recipe-details").classList.toggle("active");
            }
        });

        recipeCard.querySelector('.delete-btn').addEventListener("click", (e) => {
            e.stopPropagation();
            const confirmation = confirm("¿Estás seguro de que deseas eliminar esta receta?");
            if (confirmation) {
                remove(ref(database, "recipes/" + recipe.id));
                showNotification("Receta eliminada exitosamente", "info");
            }
        });

        recipeCard.querySelector('.edit-btn').addEventListener("click", (e) => {
            e.stopPropagation();
            recipeForm.title.value = recipe.title;
            recipeForm.ingredients.value = recipe.ingredients;
            recipeForm.instructions.value = recipe.instructions;
            recipeForm.category.value = recipe.category;
            recipeForm.dataset.id = recipe.id;
            addRecipeBtn.querySelector('.button-fancy-text').textContent = 'Actualizar';
            
            recipeForm.scrollIntoView({ behavior: 'smooth' });
        });

        recipeList.appendChild(recipeCard);
    });
}

function formatIngredients(ingredients) {
    return ingredients.split('\n').map(ingredient => ingredient.trim()).filter(ingredient => ingredient !== '').map(ingredient => `• ${ingredient}`).join('\n');
}

function triggerConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    confettiContainer.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.backgroundColor = getRandomColor();
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
}

function getRandomColor() {
    const colors = ['#ff85a2', '#ffc2d1', '#ff5c8a', '#ffb3ba', '#a8e6cf'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }, 100);
}

function highlightSearchTerms(searchTerm) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const content = card.innerHTML;
        const highlightedContent = content.replace(new RegExp(searchTerm, 'gi'), match => `<mark>${match}</mark>`);
        card.innerHTML = highlightedContent;
    });
}
