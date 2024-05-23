/*const { categories } = require("../Backend/models");*/
const user = window.sessionStorage.getItem("user")
  ? JSON.parse(window.sessionStorage.getItem("user"))
  : null;

if (user?.token) {
  const modifierButton = document.getElementById("modifier");
  modifierButton.style.display = "inline-block";
  const editionButton = document.getElementById("edition");
  editionButton.style.display = "flex";
  const linkLogin = document.getElementById("login");
  linkLogin.setAttribute("href", "http://localhost:5500/FrontEnd/index.html");
  linkLogin.textContent = "Logout";
  linkLogin.addEventListener("click", () => {
    localStorage.removeItem("user");
    modifierButton.style.display = "none";
    editionButton.style.display = "none";
  });
}

const data = await fetch("http://localhost:5678/api/works");
const travaux = await data.json();
const nomsCategories = recupererNomsCategoriesTravaux(travaux);
/*Selectionner div filtre pour ajouts bouton*/
const filtreContainer = document.querySelector(".filtres");

afficherListeTravaux(travaux);

/* POur les autres boutons utiliser les categories récupérées plus haut*/
for (const [id, nomCategorie] of nomsCategories) {
  const bouton = document.createElement("button");
  bouton.textContent = nomCategorie;
  bouton.setAttribute("id", getCategoryHtmlId(id));
  bouton.addEventListener("click", filtreEventHandler);
  filtreContainer.appendChild(bouton);
}

Tous.addEventListener("click", filtreEventHandler);

/**
 * Créer un id unique pour le bouton filtre plutot que 1, 2, 3, etc...
 * @param {number} id de la catégorie
 * @returns {string} un id html
 */
function getCategoryHtmlId(id) {
  return "button-filter-category-" + id;
}
/**
 * récupère un id de categorie à partir d'un id html
 * @param {string} categoryHtmlId
 * @returns {number} l'id de la catégorie
 */
function getIdFromCategoryHtmlId(categoryHtmlId) {
  return Number(categoryHtmlId.split("button-filter-category-")[1]);
}

/**
 * fonction de gestion de l'event click bouton filtre
 * affiche les travaux filtrés en fonction du bouton cliqué
 * @param {*} e
 */
function filtreEventHandler(e) {
  if (e.target.id === "Tous") {
    afficherListeTravaux(travaux);
  } else {
    /*en fonction du bouton je dois créer une nouvelle liste filtrée*/
    /*recuperer l'ID du bouton e*/
    const travauxFiltres = travaux.filter(
      (travail) => getIdFromCategoryHtmlId(e.target.id) === travail.category.id
    );
    /* rappeler la fonction contenu avec la liste filtrée*/
    afficherListeTravaux(travauxFiltres);
  }
  /*changement de couleur du bouton au click*/
  const filtreConteneur = document.querySelector(".filtres");
  for (const bouton of filtreConteneur.children) {
    if (bouton.id !== nomCategorie) {
      bouton.setAttribute("class", "");
    } else {
      bouton.setAttribute("class", "selectionne");
    }
  }
}

/**
 * vide la gallerie et recréé tous les elements de la galerie
 * (figure avec image et figcaption en children)
 * @param {*} travaux
 */
function afficherListeTravaux(travaux) {
  /*vider gallerie*/
  const gallery = document.querySelector(".gallery");
  gallery.replaceChildren();
  for (const travail of travaux) {
    //Creer l'image*/
    const image = document.createElement("img");
    image.setAttribute("src", travail.imageUrl);
    image.setAttribute("alt", travail.title);
    //creer figcaption
    const figcaption = document.createElement("figcaption");
    figcaption.innerText = travail.title;
    const figure = document.createElement("figure");
    figure.appendChild(image);
    figure.appendChild(figcaption);
    //ajouter figure a gallery
    gallery.appendChild(figure);
  }
}
/**
 * recupère dans un map les catégories présentes dans la liste des travaux
 * @param {object[]} travaux
 * @returns
 */
function recupererNomsCategoriesTravaux(travaux) {
  const categorieTravaux = new Map();
  for (const travail of travaux) {
    /*recuperer nom des categories*/
    categorieTravaux.set(travail.category.id, travail.category.name);
  }
  return categorieTravaux;
}
