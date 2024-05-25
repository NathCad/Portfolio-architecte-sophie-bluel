const worksApiUrl = "http://localhost:5678/api/works";
const accueilUrl = "index.html";

const user = window.sessionStorage.getItem("user")
  ? JSON.parse(window.sessionStorage.getItem("user"))
  : null;

if (user?.token) {
  const modifierButton = document.getElementById("modifier");
  modifierButton.style.display = "inline-block";
  const editionButton = document.getElementById("edition");
  editionButton.style.display = "flex";
  const linkLogin = document.getElementById("login");
  linkLogin.setAttribute("href", accueilUrl);
  linkLogin.textContent = "Logout";
  linkLogin.addEventListener("click", () => {
    localStorage.removeItem("user");
    modifierButton.style.display = "none";
    editionButton.style.display = "none";
  });
}
const data = await fetch(worksApiUrl);
let travaux = await data.json();
/*Selectionner div filtre pour ajouts bouton*/
createAllWorksItems(travaux);

const modal = document.getElementById("modal-ajout-photo");
modal.style.display = "none";

const boutonModifier = document.getElementById("modifier");
boutonModifier.addEventListener("click", () => {
  modal.style.display = "flex";
  modal.addEventListener("click", clickOutsideModalContentEventHandler);
});
const boutonCloseModal = document.getElementById("close-modal-button");
boutonCloseModal.addEventListener("click", () => {
  closeModal();
});

/**
 * ferme la modal et enlève l'eventhandler du click modal
 */
function closeModal() {
  modal.style.display = "none";
  modal.removeEventListener("click", clickOutsideModalContentEventHandler);
}

/**
 * gère le click dans la modale
 * si la cible du click est la modale et non pas le wrapper (on a cliqué en dehors du wrapper)
 * alors closeModal est appelé
 * @param {*} e
 */
function clickOutsideModalContentEventHandler(e) {
  if (e.target === modal) {
    closeModal();
  }
}

/**
 * Creer figures, boutons filtres, modal content à partir des travaux
 * @param {*} travaux
 */
function createAllWorksItems(travaux) {
  afficherListeTravaux(travaux);
  creerPhotoModal(travaux);
  const mapIdCategoryName = recupererNomsCategoriesTravaux(travaux);
  createFilterButtons(mapIdCategoryName);
}

/**
 * Vide les boutons filtres et les re-créé à partir d'une map d'id et de noms de categories
 * @param {*} mapIdCategoryName
 */
function createFilterButtons(mapIdCategoryName) {
  const filtreContainer = document.querySelector(".filtres");
  filtreContainer.replaceChildren();
  //Bouton tous
  const boutonTous = document.createElement("button");
  boutonTous.setAttribute("id", "Tous");
  boutonTous.textContent = "Tous";
  boutonTous.addEventListener("click", filtreEventHandler);
  boutonTous.setAttribute("class", "selectionne");
  filtreContainer.appendChild(boutonTous);

  /* Pour les autres boutons utiliser les categories récupérées plus haut*/
  for (const id of Array.from(mapIdCategoryName.keys()).sort()) {
    const bouton = document.createElement("button");
    bouton.setAttribute("id", getCategoryHtmlId(id));
    bouton.textContent = mapIdCategoryName.get(id);
    bouton.addEventListener("click", filtreEventHandler);
    filtreContainer.appendChild(bouton);
  }
}

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
  let selectedCategoryForFilter;
  if (e.target.id === "Tous") {
    afficherListeTravaux(travaux);
    selectedCategoryForFilter = null;
  } else {
    selectedCategoryForFilter = getIdFromCategoryHtmlId(e.target.id);
    /*en fonction du bouton je dois créer une nouvelle liste filtrée*/
    /*recuperer l'ID du bouton e*/
    const travauxFiltres = travaux.filter(
      (travail) => selectedCategoryForFilter === travail.category.id
    );
    /* rappeler la fonction contenu avec la liste filtrée*/
    afficherListeTravaux(travauxFiltres);
  }

  /*changement de couleur du bouton au click*/
  const filtreConteneur = document.querySelector(".filtres");
  for (const bouton of filtreConteneur.children) {
    //Bouton tous
    if (bouton.id === "Tous") {
      toggleBoutonTous(bouton, selectedCategoryForFilter);
      continue;
    }
    //Autres boutons
    if (getIdFromCategoryHtmlId(bouton.id) !== selectedCategoryForFilter) {
      bouton.setAttribute("class", "");
    } else {
      bouton.setAttribute("class", "selectionne");
    }
  }
}

/**
 * Gère le toggle du bouton tous en fonction de la selectedCategory
 * @param {*} bouton
 * @param {*} selectedCategory
 */
function toggleBoutonTous(bouton, selectedCategory) {
  if (selectedCategory === null) {
    bouton.setAttribute("class", "selectionne");
  } else {
    bouton.setAttribute("class", "");
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
/*fenêtre modale*/

/**
 * function qui créé les images avec le boutons supprimer
 * @param {object[]} travaux
 */
function creerPhotoModal(travaux) {
  const modalContent = document.getElementById("modal-content");
  modalContent.replaceChildren();
  for (const travail of travaux) {
    const article = document.createElement("article");

    const image = document.createElement("img");
    image.setAttribute("src", travail.imageUrl);
    image.setAttribute("alt", travail.title);

    const deletePhotoButton = document.createElement("button");
    deletePhotoButton.addEventListener("click", () => deleteWork(travail.id));

    const deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "fa-solid fa-trash-can");

    deletePhotoButton.appendChild(deleteIcon);
    article.appendChild(deletePhotoButton);
    article.appendChild(image);
    modalContent.appendChild(article);
  }
}

/**
 * gère l'évenement delete work et en fetchant le serveur en delete et en supprimant
 * le work de la liste des travaux et en reconstruisant tous les items liés
 * @param {*} id
 */
async function deleteWork(id) {
  const response = await fetch(worksApiUrl + "/" + id, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  //test ok
  if (response.ok) {
    //supprimer le work des travaux
    travaux = travaux.filter((travail) => travail.id !== id);
    createAllWorksItems(travaux);
  }
}
function getToken() {
  return JSON.parse(sessionStorage.getItem("user")).token;
}
