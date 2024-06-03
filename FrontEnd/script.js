function getModal() {
  return document.getElementById("modal-administration");
}
function getModalContentDeleteWork() {
  return document.getElementById("modal-content-delete-work");
}
function getModalContentAddWork() {
  return document.getElementById("modal-content-add-work");
}
function getShowModalContentAddWorkButton() {
  return document.getElementById("show-modal-content-add-work-button");
}
function getFileUploadInput() {
  return document.getElementById("file-upload-input");
}
function getModifyWorksButton() {
  return document.getElementById("modify-works-button");
}

//#region Modal

/**
 *
 * @param {*} e
 */
function addNewWorkSubmitEventHandler(e) {
  const upLoadImageToServer = async (
    fileUploaded,
    photoTitle,
    categorieFiltres
  ) => {
    const handleAddPhotoSuccess = (work) => {
      showModalContentDeleteWork();
      work.category = categories.find(
        (cat) => cat.id === Number(work.categoryId)
      );
      const modalContent = document.getElementById("modal-content");
      createModalPhoto(work, modalContent);
      const gallery = document.querySelector(".gallery");
      createWorkItem(work, gallery);
      works.push(work);
    };
    const formData = new FormData();
    formData.append("image", fileUploaded);
    formData.append("title", photoTitle);
    formData.append("category", categorieFiltres);
    const response = await fetch(worksApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });
    if (!response.ok) {
      document.getElementById("error-upload").textContent =
        "erreur de chargement";
    } else {
      handleAddPhotoSuccess(await response.json());
    }
  };

  e.preventDefault();
  //effacer les erreurs précédentes
  document.getElementById("error-file").textContent = "";
  document.getElementById("error-title").textContent = "";

  const fileUploaded = getFileUploadInput().files?.[0];
  const photoTitle = document.getElementById("title").value;
  const categorieFiltres = document.getElementById(
    "modal-select-filtres"
  ).value;

  if (!fileUploaded || !photoTitle) {
    if (!fileUploaded) {
      document.getElementById("error-file").textContent =
        "Veuillez ajouter une image";
    }
    if (!photoTitle) {
      document.getElementById("error-title").textContent =
        "Veuillez indiquer un titre";
    }
  } else {
    upLoadImageToServer(fileUploaded, photoTitle, categorieFiltres);
  }
}

/**
 *
 */
function addEventListenerOnSubmitAddWork() {
  document
    .getElementById("form-add-new-work")
    .addEventListener("submit", addNewWorkSubmitEventHandler);
}

/**
 *
 * @param {*} maxFileSizeForFileUpload
 */
function addEventListenerOnFileUploadInput(maxFileSizeForFileUpload) {
  const input = getFileUploadInput();
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    //gestion erreur
    if (file && file.size > maxFileSizeForFileUpload) {
      document.getElementById("error-file").textContent =
        "Votre fichier est trop grand";
      return;
    }
    const fileReader = new FileReader();
    const preview = document.getElementById("file-preview");
    fileReader.addEventListener("load", (e) => {
      preview.setAttribute("src", e.target.result);
      document.getElementById("photo-file-loader-input").style.display = "none";
    });
    fileReader.readAsDataURL(file);
  });
}

/**
 * créer toutes les options pour le selecteur option du formulaire ajouter photos
 * @param {*} categories
 */
function createAddPhotoCategoriesOptions(categories) {
  const modalFiltreSelect = document.getElementById("modal-select-filtres");
  for (const categorie of categories) {
    const option = document.createElement("option");
    option.setAttribute("value", categorie.id);
    option.textContent = categorie.name;
    modalFiltreSelect.appendChild(option);
  }
}

/**
 * gère le click dans la modale
 * si la cible du click est la modale et non pas le wrapper (on a cliqué en dehors du wrapper)
 * alors closeModal est appelé
 * @param {*} e
 */
function clickOutsideModalContentEventHandler(e) {
  const modal = getModal();
  if (e.target === modal) {
    closeModalEventHandler(modal);
  }
}
/**
 * ferme la modal et enlève l'eventhandler du click modal
 */
function closeModalEventHandler() {
  const modal = getModal();
  modal.style.display = "none";
  modal.removeEventListener("click", clickOutsideModalContentEventHandler);
}
/**
 * ajout  un eventListener sur le bouton modifier gallerie, et affiche la modale
 */
function addEventListenerOnModifyWorksButton() {
  const modifyWorksButton = getModifyWorksButton();
  modifyWorksButton.addEventListener("click", () => {
    const modal = getModal();
    modal.style.display = "flex";
    modal.addEventListener("click", clickOutsideModalContentEventHandler);
  });
}
/**
 *
 */
function addEventListenerOnButtonCloseModal() {
  const closeModalButton = document.getElementById("close-modal-button");
  closeModalButton.addEventListener("click", closeModalEventHandler);
}
/**
 *
 */
function showModalContentDeleteWork() {
  getModalContentDeleteWork().style.display = "flex";
  getModalContentAddWork().style.display = "none";
}
/**
 *
 */
function addEventListenerOnReturnToModalContentDeleteWorkButton() {
  const buttonArrowLeft = document.getElementById(
    "return-to-modal-content-delete-work-button"
  );
  buttonArrowLeft.addEventListener("click", () => {
    showModalContentDeleteWork();
  });
}
/**
 *
 */
function addEventListenerOnButtonShowModalContentAddWork() {
  const showModalContentAddWorkButton = getShowModalContentAddWorkButton();
  showModalContentAddWorkButton.addEventListener("click", () => {
    getModalContentAddWork().style.display = "flex";
    getModalContentDeleteWork().style.display = "none";
  });
}

function createModalPhoto(work, modalContent) {
  /**
   * gère l'évenement delete work et en fetchant le serveur en delete et en supprimant
   * le work de la liste des travaux et en reconstruisant tous les items liés
   * @param {*} id
   */
  const deleteWork = async (id) => {
    const response = await fetch(`${worksApiUrl}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    //test ok
    if (response.ok) {
      //supprimer le work des travaux
      works = works.filter((work) => work.id !== id);
      const mapIdCategoryName = recupererNomsCategoriesTravaux(works);
      createFilterButtons(mapIdCategoryName);
      document.getElementById(getFigureHtmlId(id)).remove();
      document.getElementById(getArticleHtmlId(id)).remove();
    }
  };
  const article = document.createElement("article");
  article.setAttribute("id", getArticleHtmlId(work.id));
  const image = document.createElement("img");
  image.setAttribute("src", work.imageUrl);
  image.setAttribute("alt", work.title);

  const deletePhotoButton = document.createElement("button");
  deletePhotoButton.addEventListener("click", () => deleteWork(work.id));

  const deleteIcon = document.createElement("i");
  deleteIcon.setAttribute("class", "fa-solid fa-trash-can");

  deletePhotoButton.appendChild(deleteIcon);
  article.appendChild(deletePhotoButton);
  article.appendChild(image);
  modalContent.appendChild(article);
}

//#endregion

//#region accueil

/**
 * fonction de gestion de l'event click bouton filtre
 * affiche les travaux filtrés en fonction du bouton cliqué
 * @param {*} e
 */
function filtreEventHandler(e) {
  let selectedCategoryForFilter;
  if (e.target.id === "Tous") {
    createWorkItemsFromWorks(works);
    selectedCategoryForFilter = null;
  } else {
    selectedCategoryForFilter = getIdFromCategoryHtmlId(e.target.id);
    /*en fonction du bouton je dois créer une nouvelle liste filtrée*/
    /*recuperer l'ID du bouton e*/
    const travauxFiltres = works.filter(
      (work) => selectedCategoryForFilter === work.category.id
    );
    /* rappeler la fonction contenu avec la liste filtrée*/
    createWorkItemsFromWorks(travauxFiltres);
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
 * gère l'affichage de l'accueil quand le user est loggé (bandeau admin, bouton logout, bouton modifier)
 */
function handleUserIsLoggedIn() {
  const user = window.sessionStorage.getItem("user")
    ? JSON.parse(window.sessionStorage.getItem("user"))
    : null;

  if (user?.token) {
    const modifyWorksButton = getModifyWorksButton();
    modifyWorksButton.style.display = "inline-block";
    const editionButton = document.getElementById("edition");
    editionButton.style.display = "flex";
    const linkLogin = document.getElementById("login");
    linkLogin.setAttribute("href", accueilUrl);
    linkLogin.textContent = "Logout";
    linkLogin.addEventListener("click", () => {
      sessionStorage.removeItem("user");
      modifyWorksButton.style.display = "none";
      editionButton.style.display = "none";
    });
  }
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
 * Creer figures, boutons filtres, modal content à partir des travaux
 * @param {*} travaux
 */
function createAllWorksItems(travaux) {
  createWorkItemsFromWorks(travaux);
  createAllModalPhotoFromWorks(travaux);
  const mapIdCategoryName = recupererNomsCategoriesTravaux(travaux);
  createFilterButtons(mapIdCategoryName);
}

/**
 * function qui créé les images avec le boutons supprimer
 * @param {object[]} works
 */
function createAllModalPhotoFromWorks(works) {
  const modalContent = document.getElementById("modal-content");
  modalContent.replaceChildren();
  for (const work of works) {
    createModalPhoto(work, modalContent);
  }
}

function getFigureHtmlId(id) {
  return `gallery-figure-${id}`;
}
function getArticleHtmlId(id) {
  return `modale-gallerie-article-${id}`;
}
/**
 * Créer un id unique pour le bouton filtre plutot que 1, 2, 3, etc...
 * @param {number} id de la catégorie
 * @returns {string} un id html
 */
function getCategoryHtmlId(id) {
  return `button-filter-category-${id}`;
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
function createWorkItemsFromWorks(travaux) {
  /*vider gallerie*/
  const gallery = document.querySelector(".gallery");
  gallery.replaceChildren();
  for (const work of travaux) {
    //Creer l'image*/
    createWorkItem(work, gallery);
  }
}
function createWorkItem(work, gallery) {
  const image = document.createElement("img");
  image.setAttribute("src", work.imageUrl);
  image.setAttribute("alt", work.title);
  //creer figcaption
  const figcaption = document.createElement("figcaption");
  figcaption.innerText = work.title;
  const figure = document.createElement("figure");
  figure.setAttribute("id", getFigureHtmlId(work.id));
  figure.appendChild(image);
  figure.appendChild(figcaption);
  //ajouter figure a gallery
  gallery.appendChild(figure);
}

/**
 * recupère dans un map les catégories présentes dans la liste des travaux
 * @param {object[]} travaux
 * @returns
 */
function recupererNomsCategoriesTravaux(travaux) {
  const categorieTravaux = new Map();
  for (const work of travaux) {
    /*recuperer nom des categories*/
    categorieTravaux.set(work.category.id, work.category.name);
  }
  return categorieTravaux;
}

/**
 * Extrait le token du sessionStorage
 * @returns le token
 */
function getToken() {
  return JSON.parse(sessionStorage.getItem("user")).token;
}

//#endregion

const worksApiUrl = "http://localhost:5678/api/works";
const categoryApiUrl = "http://localhost:5678/api/categories";
const accueilUrl = "index.html";
const maxFileSizeForFileUpload = 4 * 1024 * 1024;

const fetchedWorks = await fetch(worksApiUrl);
let works = await fetchedWorks.json();

//recuperer categories
const fetchedCategories = await fetch(categoryApiUrl);
const categories = await fetchedCategories.json();

handleUserIsLoggedIn();
createAllWorksItems(works);

addEventListenerOnModifyWorksButton();
createAddPhotoCategoriesOptions(categories);
addEventListenerOnButtonCloseModal();
addEventListenerOnButtonShowModalContentAddWork();
addEventListenerOnReturnToModalContentDeleteWorkButton();
addEventListenerOnFileUploadInput(maxFileSizeForFileUpload);
addEventListenerOnSubmitAddWork();
