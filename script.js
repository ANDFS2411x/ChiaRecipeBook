import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    onChildAdded,
    remove,
    update,
    onChildChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDtm7GfGFosRrC_yb2_KgGnitjJBKic_Xk",
  authDomain: "basededatoschiaoctubre.firebaseapp.com",
  projectId: "basededatoschiaoctubre",
  storageBucket: "basededatoschiaoctubre.appspot.com",
  messagingSenderId: "119608084530",
  appId: "1:119608084530:web:24b8a3e58946047dc8542b"
};

// Inicializa Firebase
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
        alert("Por favor, completa todos los campos.");
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
        alert("¡Receta actualizada exitosamente!");
        addRecipeBtn.querySelector('.button-82-front').textContent = '¡Agregar!';
    } else {
        const newRecipeRef = push(ref(database, "recipes"));
        set(newRecipeRef, {
            title,
            ingredients,
            instructions,
            category,
        });
        alert("¡Receta agregada exitosamente!");
    }

    recipeForm.reset();
    delete recipeForm.dataset.id;
    triggerConfetti(category);
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

searchBar.addEventListener("input", (e) => {
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
}

function displayRecipes(recipesToDisplay) {
    recipeList.innerHTML = "";
    recipesToDisplay.forEach(recipe => {
        const recipeItem = document.createElement("li");
        recipeItem.classList.add("recipe");
        recipeItem.setAttribute('data-category', recipe.category);

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.addEventListener("click", () => {
            const confirmation = confirm("¿Estás seguro de que deseas eliminar esta receta?");
            if (confirmation) {
                remove(ref(database, "recipes/" + recipe.id));
                recipes = recipes.filter(r => r.id !== recipe.id);
                displayRecipes(recipes);
            }
        });

        const editBtn = document.createElement("button");
        editBtn.classList.add("edit-btn");
        editBtn.textContent = "Editar";
        editBtn.addEventListener("click", () => {
            recipeForm.title.value = recipe.title;
            recipeForm.ingredients.value = recipe.ingredients;
            recipeForm.instructions.value = recipe.instructions;
            recipeForm.category.value = recipe.category;
            recipeForm.dataset.id = recipe.id;
            addRecipeBtn.querySelector('.button-82-front').textContent = 'Actualizar';
            
            recipeForm.scrollIntoView({ behavior: 'smooth' });
        });

        const ingredientsHTML = recipe.ingredients.replace(/\n/g, "<br>");
        const instructionsHTML = recipe.instructions.replace(/\n/g, "<br>");

        recipeItem.innerHTML = `
            <h2>${recipe.title}</h2>
            <div class="recipe-details">
                <h3>Categoría: ${recipe.category}</h3>
                <h3>Ingredientes:</h3>
                <p>${ingredientsHTML}</p>
                <h3>Instrucciones:</h3>
                <p>${instructionsHTML}</p>
            </div>
        `;

        recipeItem.addEventListener("click", () => {
            const recipeDetails = recipeItem.querySelector(".recipe-details");
            recipeDetails.classList.toggle("active");
        });

        recipeItem.appendChild(deleteBtn);
        recipeItem.appendChild(editBtn);
        recipeList.appendChild(recipeItem);
    });
}

function formatIngredients(ingredients) {
    return ingredients.split('\n').map(ingredient => `• ${ingredient}`).join('\n');
}

function triggerConfetti(category) {
    const confettiType = {
        "Pasteleria Plant Based": "🍓",
        "Cocina Plant Based": "🌱",
        "Cocina Vegetariana": "🌿",
        "Pasteleria": "🎂",
        "Panaderia": "🥐"
    };

    const confettiSymbol = confettiType[category] || "✨";

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.innerText = confettiSymbol;
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
}
