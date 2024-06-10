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
const searchBar = document.getElementById("searchBar");
const confettiContainer = document.getElementById("confetti-container");

let recipes = [];

recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = recipeForm.title.value;
    const ingredients = recipeForm.ingredients.value;
    const instructions = recipeForm.instructions.value;
    const category = recipeForm.category.value;

    const newRecipeRef = push(ref(database, "recipes"));
    set(newRecipeRef, {
        title: title,
        ingredients: ingredients,
        instructions: instructions,
        category: category,
    });

    recipeForm.reset();

    triggerConfetti(category);
});

onChildAdded(ref(database, "recipes"), (snapshot) => {
    const recipe = snapshot.val();
    recipes.push({ ...recipe, id: snapshot.key });
    displayRecipes(recipes);
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
        recipeList.appendChild(recipeItem);
    });
}

function triggerConfetti(category) {
    const confettiType = {
        "Pasteleria Plant Based": "🍓",
        "Cocina Plant Based": "🌱",
        "Cocina Vegetariana": "🌿",
        "Pasteleria": "🎂"
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
