import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyD9K2U7tAMtfB_9J7aaOHvZAfxecUMlcBU",
  authDomain: "basededatoschiamarch-abril.firebaseapp.com",
  databaseURL: "https://basededatoschiamarch-abril-default-rtdb.firebaseio.com",
  projectId: "basededatoschiamarch-abril",
  storageBucket: "basededatoschiamarch-abril.firebasestorage.app",
  messagingSenderId: "896855808341",
  appId: "1:896855808341:web:c7feb27a142567468cf7dc"
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
                    <button class="print-btn">
                    <i class="fas fa-print"></i>
                    <span>Imprimir</span>
                    </button>

                </div>
            </div>
        `;

        recipeCard.addEventListener("click", (e) => {
            if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn') && !e.target.classList.contains('print-btn')) {
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

        // Botón de imprimir
        recipeCard.querySelector('.print-btn').addEventListener("click", (e) => {
            e.stopPropagation();
            imprimirReceta(recipe);
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
function imprimirReceta(recipe) {
  const ventanaImpresion = window.open('', '', 'width=800,height=600');
  const ingredientesHTML = recipe.ingredients.replace(/\n/g, "<br>");
  const instruccionesHTML = recipe.instructions.replace(/\n/g, "<br>");
  
  ventanaImpresion.document.write(`
    <html>
    <head>
      <title>${recipe.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
          padding: 20px;
          color: #5a3d5c;
          background-color: #ffe6ee;
          line-height: 1.4;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffc0cb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .recipe-card {
          max-width: 700px;
          margin: 0 auto;
          background-color: #fff9fb;
          border-radius: 20px;
          box-shadow: 0 5px 15px rgba(229, 157, 185, 0.3);
          padding: 25px;
          position: relative;
          overflow: hidden;
          border: 1px solid #ffcce0;
        }
        
        .corner-ribbon {
          position: absolute;
          width: 150px;
          height: 150px;
          overflow: hidden;
          top: 0;
          right: 0;
          z-index: 1;
        }
        
        .ribbon {
          position: absolute;
          width: 225px;
          background: linear-gradient(45deg, #ffb7c5, #ff85a2);
          transform: rotate(45deg);
          right: -55px;
          top: 35px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
          padding: 5px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          position: relative;
          background-color: #ffeef5;
          padding: 15px;
          border-radius: 15px;
          border: 1px dashed #ffb7c5;
        }
        
        .header::after {
          content: "";
          display: block;
          width: 80px;
          height: 3px;
          background: linear-gradient(to right, #ffcce0, #ff85a2, #ffcce0);
          margin: 10px auto 5px;
        }
        
        .header::before {
          content: "✿✿✿";
          display: block;
          text-align: center;
          color: #ff85a2;
          font-size: 1rem;
          margin-bottom: 8px;
          letter-spacing: 8px;
        }
        
        h1 {
          font-family: 'Playfair Display', serif;
          color: #e5579b;
          font-size: 2.2rem;
          margin: 0 0 8px 0;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 1px 1px 2px rgba(229, 157, 185, 0.3);
        }
        
        .category {
          color: #b76e79;
          font-size: 1rem;
          font-style: italic;
          margin-top: 5px;
          background-color: #fff;
          display: inline-block;
          padding: 2px 12px;
          border-radius: 20px;
          border: 1px solid #ffcce0;
        }
        
        .section-title {
          font-family: 'Playfair Display', serif;
          color: #e5579b;
          font-size: 1.3rem;
          border-bottom: 2px solid #ffd1dc;
          padding: 8px 15px;
          margin-top: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          background-color: #ffeef5;
          border-radius: 10px 10px 0 0;
          border-top: 1px solid #ffcce0;
          border-left: 1px solid #ffcce0;
          border-right: 1px solid #ffcce0;
        }
        
        .section-title::before {
          content: "❀";
          margin-right: 10px;
          font-size: 1.1rem;
          color: #ff85a2;
        }
        
        .section-content {
          background-color: white;
          padding: 12px 15px;
          border-radius: 0 0 10px 10px;
          border: 1px solid #ffcce0;
          border-top: none;
          margin-bottom: 15px;
        }
        
        p {
          font-size: 0.95rem;
          color: #5a3d5c;
          line-height: 1.5;
          margin: 0;
        }
        
        ul.ingredients-list {
          list-style-type: none;
          padding-left: 5px;
          margin: 0;
          columns: 2;
        }
        
        ul.ingredients-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          font-size: 0.95rem;
          break-inside: avoid;
        }
        
        ul.ingredients-list li:before {
          content: "✿";
          position: absolute;
          left: 0;
          color: #ffb7c5;
        }
        
        .instructions-text {
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        @media print {
          body {
            background: none;
            background-color: #fff9fb;
            padding: 0;
            margin: 0;
          }
          .recipe-card {
            box-shadow: none;
            padding: 15px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .header {
            padding: 10px;
            margin-bottom: 15px;
          }
          h1 {
            font-size: 1.8rem;
          }
          .section-title {
            font-size: 1.2rem;
            padding: 5px 10px;
            margin-top: 10px;
            margin-bottom: 8px;
          }
          .section-content {
            padding: 8px 10px;
            margin-bottom: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="recipe-card">
        <div class="corner-ribbon">
          <div class="ribbon">Recetario de Chía</div>
        </div>
        
        <div class="header">
          <h1>${recipe.title}</h1>
          <div class="category">${recipe.category}</div>
        </div>
      
        <div>
          <div class="section-title">Ingredientes</div>
          <div class="section-content">
            <ul class="ingredients-list">
              ${ingredientesHTML.replace(/<br>/g, "</li><li>")}
            </ul>
          </div>
      
          <div class="section-title">Instrucciones</div>
          <div class="section-content">
            <div class="instructions-text">
              ${instruccionesHTML}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  ventanaImpresion.document.close();
  ventanaImpresion.focus();
  ventanaImpresion.print();
  ventanaImpresion.close();
}