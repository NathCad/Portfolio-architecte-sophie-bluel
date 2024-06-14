//=================================== EventListener adds =======================================//

function addEventListenerOnAddNewWorkSubmitButton() {
  document
    .getElementById("form-add-new-work")
    .addEventListener("submit", handleAddNewWorkSubmit);
}

function addEventListenerOnAddNewWorkTitleInput() {
  getAddNewWorkTitleInput().addEventListener(
    "input",
    handleAddNewWorkTitleInput
  );
}

function addEventListenerOnCloseModalButton() {
  const closeModalButton = document.getElementById("close-modal-button");
  closeModalButton.addEventListener("click", doCloseModal);
}

function addEventListenerOnFileUploadInput(maxFileSizeForFileUpload) {
  const input = getFileUploadInput();
  input.addEventListener("change", () => {
    doEnableDisableAddNewWorkSubmitButton();
    const file = input.files?.[0];
    //gestion erreur
    if (file && file.size > maxFileSizeForFileUpload) {
      document.getElementById("error-file").textContent =
        "Votre fichier est trop grand";
      return;
    } else if (!isFileExtensionValid()) {
      document.getElementById(
        "error-file"
      ).textContent = `Seules les extensions ${allowedExtensions.join(
        ", "
      )} sont autorisées`;
      return;
    }
    const fileReader = new FileReader();
    const preview = getFilePreview();
    fileReader.addEventListener("load", (e) => {
      preview.setAttribute("src", e.target.result);
      preview.style.display = "block";
      getPhotoFileUploadInput().style.display = "none";
    });
    fileReader.readAsDataURL(file);
  });
}

/**
 * ajout  un eventListener sur le bouton modifier gallerie, et affiche la modale
 */
function addEventListenerOnModifyWorksButton() {
  const modifyWorksButton = getModifyWorksButton();
  modifyWorksButton.addEventListener("click", () => {
    const modal = getModal();
    modal.style.display = "flex";
    modal.addEventListener("click", handleOutsideModalContentClick);
    doSelectShowAllItemsFilterButton();
  });
}

function addEventListenerOnReturnToModalContentDeleteWorkButton() {
  const buttonArrowLeft = document.getElementById(
    "return-to-modal-content-delete-work-button"
  );
  buttonArrowLeft.addEventListener(
    "click",
    handleReturnToModalContentDeleteWorkButtonClick
  );
}

function addEventListenerOnShowModalContentAddWorkButton() {
  const showModalContentAddWorkButton = getShowModalContentAddWorkButton();
  showModalContentAddWorkButton.addEventListener("click", () => {
    getModalContentAddWork().style.display = "flex";
    getModalContentDeleteWork().style.display = "none";
  });
}

//=================================== Calls =======================================//

/**
 * gère l'évenement delete work et en fetchant le serveur en delete et en supprimant
 * le work de la liste des travaux et en reconstruisant tous les items liés
 * @param {*} id
 */
async function callDeleteWorkEndPoint(id) {
  const response = await fetch(`${worksApiUrl}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  //test ok
  if (response.ok) {
    //supprimer le work des travaux
    works = works.filter((work) => work.id !== id);
    const mapIdCategoryName = getMapCategoryIdCategoryName(works);
    doCreateFilterButtons(mapIdCategoryName);
    document.getElementById(getFigureHtmlId(id)).remove();
    document.getElementById(getArticleHtmlId(id)).remove();
  }
}

async function callUpLoadImageEndPoint(
  fileUploaded,
  photoTitle,
  categorieFiltres
) {
  //Construire le body
  const formData = new FormData();
  formData.append("image", fileUploaded);
  formData.append("title", photoTitle);
  formData.append("category", categorieFiltres);
  //Post
  const response = await fetch(worksApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });
  //4. Gestion du retour
  if (!response.ok) {
    document.getElementById("error-upload").textContent =
      "erreur de chargement";
  } else {
    //Le serveur renvoie le work créé
    handleAddPhotoSuccessCall(await response.json());
  }
}

//=================================== Does =======================================//

function doClearAddWorkErrors() {
  document.getElementById("error-file").textContent = "";
  document.getElementById("error-title").textContent = "";
}

function doCloseAndResetModalContent() {
  doResetAddNewWorkForm();
  /* On se replace sur la première modale comme ça quand on rouvrira la modale
  elle sera placée sur le bon contenu */
  doReturnToModalContentDeleteWork();
  getModal().style.display = "none";
}

/**
 * ferme la modal et enlève l'eventhandler du click modal
 */
function doCloseModal() {
  const modal = getModal();
  doCloseAndResetModalContent();
  modal.removeEventListener("click", handleOutsideModalContentClick);
}

/**
 * créer toutes les options pour le selecteur option du formulaire ajouter photos
 * @param {*} categories
 */
function doCreateAddPhotoCategoriesOptions(categories) {
  const modalFiltreSelect = document.getElementById("modal-select-filtres");
  for (const categorie of categories) {
    const option = document.createElement("option");
    option.setAttribute("value", categorie.id);
    option.textContent = categorie.name;
    modalFiltreSelect.appendChild(option);
  }
}

/**
 * Vide les boutons filtres et les re-créé à partir d'une map d'id et de noms de categories
 * @param {*} mapIdCategoryName
 */
function doCreateFilterButtons(mapIdCategoryName) {
  const filtreContainer = document.querySelector(".filtres");
  filtreContainer.replaceChildren();
  //Bouton tous
  const showAllButton = document.createElement("button");
  showAllButton.setAttribute("id", filterButtonShowAllCategoryId);
  showAllButton.textContent = "Tous";
  showAllButton.addEventListener("click", handleFilterButtonClick);
  showAllButton.setAttribute("class", "selectionne");
  filtreContainer.appendChild(showAllButton);

  /* Pour les autres boutons utiliser les categories récupérées plus haut*/
  for (const id of Array.from(mapIdCategoryName.keys()).sort()) {
    const bouton = document.createElement("button");
    bouton.setAttribute("id", getCategoryHtmlId(id));
    bouton.textContent = mapIdCategoryName.get(id);
    bouton.addEventListener("click", handleFilterButtonClick);
    filtreContainer.appendChild(bouton);
  }
}

/**
 * function qui créé les images avec le boutons supprimer
 * @param {object[]} works
 */
function doCreateAllModalPhotoFromWorks(works) {
  const modalContent = document.getElementById("modal-content");
  modalContent.replaceChildren();
  for (const work of works) {
    doCreateModalPhoto(work, modalContent);
  }
}

/**
 * Creer figures, boutons filtres, modal content à partir des travaux
 * @param {*} travaux
 */
function doCreateAllWorksItems(travaux) {
  doCreateWorkItemsFromWorks(travaux);
  doCreateAllModalPhotoFromWorks(travaux);
  const mapIdCategoryName = getMapCategoryIdCategoryName(travaux);
  doCreateFilterButtons(mapIdCategoryName);
}

function doCreateModalPhoto(work, modalContent) {
  const article = document.createElement("article");
  article.setAttribute("id", getArticleHtmlId(work.id));
  const image = document.createElement("img");
  image.setAttribute("src", work.imageUrl);
  image.setAttribute("alt", work.title);

  const deletePhotoButton = document.createElement("button");
  deletePhotoButton.addEventListener("click", () =>
    callDeleteWorkEndPoint(work.id)
  );

  const deleteIcon = document.createElement("i");
  deleteIcon.setAttribute("class", "fa-solid fa-trash-can");

  deletePhotoButton.appendChild(deleteIcon);
  article.appendChild(deletePhotoButton);
  article.appendChild(image);
  modalContent.appendChild(article);
}

function doCreateWorkItem(work, gallery) {
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
 * vide la gallerie et recréé tous les elements de la galerie
 * (figure avec image et figcaption en children)
 * @param {*} travaux
 */
function doCreateWorkItemsFromWorks(travaux) {
  /*vider gallerie*/
  const gallery = document.querySelector(".gallery");
  gallery.replaceChildren();
  for (const work of travaux) {
    //Creer l'image*/
    doCreateWorkItem(work, gallery);
  }
}

function doEnableDisableAddNewWorkSubmitButton() {
  if (isFormAddNewWorkValid()) {
    getAddNewWorkSubmitButton().disabled = false;
  } else {
    getAddNewWorkSubmitButton().disabled = true;
  }
}

function doResetAddNewWorkForm() {
  getFileUploadInput().value = "";
  getFilePreview().setAttribute("src", "#");
  getPhotoFileUploadInput().style.display = "flex";
  getFilePreview().style.display = "none";
  doClearAddWorkErrors();
  getAddNewWorkTitleInput().value = "";
  getAddNewWorkSelectInput().value =
    getAddNewWorkSelectInput().options[0].value;
}

function doReturnToModalContentDeleteWork() {
  getModalContentDeleteWork().style.display = "flex";
  getModalContentAddWork().style.display = "none";
  doResetAddNewWorkForm();
}
/**
 * gère l'affichage de l'accueil quand le user est loggé (bandeau admin, bouton logout, bouton modifier)
 */
function doShowUserLoggedInUserInterface() {
  //Si l'user est loggé, le token a été stocké par le formulaire de login dans le session storage
  const user = window.sessionStorage.getItem("user")
    ? JSON.parse(window.sessionStorage.getItem("user"))
    : null;

  //
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

function doSelectShowAllItemsFilterButton() {
  doCreateAllWorksItems(works);
  doUpdateFilterButtonsSelectedStatus(null);
}

/**
 * Gère le toggle du bouton tous en fonction de la selectedCategory
 */
function doToggleShowAllButtonSelectedCssClass(boutonTous, selectedCategory) {
  if (selectedCategory === null) {
    boutonTous.setAttribute("class", "selectionne");
  } else {
    boutonTous.setAttribute("class", "");
  }
}

function doUpdateFilterButtonsSelectedStatus(selectedCategoryForFilter) {
  const filtreConteneur = document.querySelector(".filtres");
  for (const bouton of filtreConteneur.children) {
    //Bouton tous
    if (bouton.id === filterButtonShowAllCategoryId) {
      doToggleShowAllButtonSelectedCssClass(bouton, selectedCategoryForFilter);
      continue;
    }
    //Autres boutons
    if (getIdFromCategoryHtmlId(bouton.id) === selectedCategoryForFilter) {
      bouton.setAttribute("class", "selectionne");
    } else {
      bouton.setAttribute("class", "");
    }
  }
}

//=================================== Gets =======================================//

function getAddNewWorkSelectInput() {
  return document.getElementById("modal-select-filtres");
}
function getAddNewWorkSubmitButton() {
  return document.getElementById("add-new-work-submit-button");
}
function getAddNewWorkTitleInput() {
  return document.getElementById("form-add-new-work-title-input");
}
function getArticleHtmlId(id) {
  return `modale-gallerie-article-${id}`;
}
/**
 * Récupère un id unique pour le bouton filtre plutot que 1, 2, 3, etc...
 * @param {number} id de la catégorie
 * @returns {string} un id html
 */
function getCategoryHtmlId(id) {
  return `button-filter-category-${id}`;
}
function getFigureHtmlId(id) {
  return `gallery-figure-${id}`;
}
function getFilePreview() {
  return document.getElementById("file-preview");
}
function getFileUploadInput() {
  return document.getElementById("file-upload-input");
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
 * recupère dans un map les catégories présentes dans la liste des travaux
 * @param {object[]} travaux
 * @returns
 */
function getMapCategoryIdCategoryName(travaux) {
  const categorieTravaux = new Map();
  for (const work of travaux) {
    /*recuperer nom des categories*/
    categorieTravaux.set(work.category.id, work.category.name);
  }
  return categorieTravaux;
}
function getModal() {
  return document.getElementById("modal-administration");
}
function getModalContentAddWork() {
  return document.getElementById("modal-content-add-work");
}
function getModalContentDeleteWork() {
  return document.getElementById("modal-content-delete-work");
}
function getModifyWorksButton() {
  return document.getElementById("modify-works-button");
}
function getPhotoFileUploadInput() {
  return document.getElementById("photo-file-loader-input");
}
function getShowModalContentAddWorkButton() {
  return document.getElementById("show-modal-content-add-work-button");
}
/**
 * Extrait le token du sessionStorage
 * @returns le token
 */
function getToken() {
  return JSON.parse(sessionStorage.getItem("user")).token;
}

//=================================== Handlers =======================================//

function handleAddNewWorkTitleInput() {
  doEnableDisableAddNewWorkSubmitButton();
}

function handleAddNewWorkSubmit(e) {
  e.preventDefault();
  //effacer les erreurs précédentes
  doClearAddWorkErrors();
  //1. controle des valeurs saisies
  if (!isFormAddNewWorkValid()) {
    if (!isFilePresent()) {
      document.getElementById("error-file").textContent =
        "Veuillez ajouter une image";
    }
    if (!isPhotoTitleValid()) {
      document.getElementById("error-title").textContent =
        "Veuillez indiquer un titre";
    }
    if (!isFileExtensionValid()) {
      document.getElementById(
        "error-file"
      ).textContent = `Erreur: seules les extensions ${allowedExtensions.join(
        ", "
      )}, sont autorisées`;
    }
  } else {
    //2. recuperation des valeurs des input
    const fileUploaded = getFileUploadInput().files?.[0];
    const photoTitle = getAddNewWorkTitleInput().value;
    const categorieFiltres = getAddNewWorkSelectInput().value;
    //3. Envoyer au serveur
    callUpLoadImageEndPoint(fileUploaded, photoTitle, categorieFiltres);
  }
}

function handleAddPhotoSuccessCall(work) {
  //Par contre le work renvoyé ne contient pas la catégorie, on la rajoute
  work.category = categories.find((cat) => cat.id === Number(work.categoryId));
  const modalContent = document.getElementById("modal-content");
  doCreateModalPhoto(work, modalContent);
  const gallery = document.querySelector(".gallery");
  doCreateWorkItem(work, gallery);
  //On enregistre le nouveau travail pour garder les categories utilisées à jour (filtres buttons)
  works.push(work);
  doResetAddNewWorkForm();
  doReturnToModalContentDeleteWork();
}

/**
 * gère le click dans la modale
 * si la cible du click est la modale et non pas le wrapper (on a cliqué en dehors du wrapper)
 * alors closeModal est appelé
 * @param {*} e
 */
function handleOutsideModalContentClick(e) {
  const modal = getModal();
  if (e.target === modal) {
    doCloseModal(modal);
  }
}

/**
 * fonction de gestion de l'event click bouton filtre
 * affiche les travaux filtrés en fonction du bouton cliqué
 * @param {*} e
 */
function handleFilterButtonClick(e) {
  let selectedCategoryForFilter;
  if (e.target.id === filterButtonShowAllCategoryId) {
    doCreateWorkItemsFromWorks(works);
    selectedCategoryForFilter = null;
  } else {
    /*en fonction du bouton je dois créer une nouvelle liste filtrée*/
    /*recuperer l'ID du bouton e*/
    selectedCategoryForFilter = getIdFromCategoryHtmlId(e.target.id);
    const travauxFiltres = works.filter(
      (work) => selectedCategoryForFilter === work.category.id
    );
    /* rappeler la fonction contenu avec la liste filtrée*/
    doCreateWorkItemsFromWorks(travauxFiltres);
  }

  /*changement de couleur du bouton au click*/
  doUpdateFilterButtonsSelectedStatus(selectedCategoryForFilter);
}

function handleReturnToModalContentDeleteWorkButtonClick() {
  doReturnToModalContentDeleteWork();
}

//=================================== Iss =======================================//

function isFilePresent() {
  const fileUploaded = getFileUploadInput().files?.[0];
  return Boolean(fileUploaded);
}

//vérifie l'envoie du bon type de fichier
function isFileExtensionValid() {
  const fileUploaded = getFileUploadInput().files?.[0];
  if (!fileUploaded) {
    return false;
  }
  const nameExtension = fileUploaded.name.split(".");
  //l'extension est la derniere chaine apres un point
  if (!allowedExtensions.includes(nameExtension[nameExtension.length - 1])) {
    return false;
  }
  return true;
}

function isPhotoTitleValid() {
  const photoTitle = getAddNewWorkTitleInput().value;
  return Boolean(photoTitle);
}
function isFormAddNewWorkValid() {
  return isFilePresent() && isFileExtensionValid() && isPhotoTitleValid();
}

//=================================== Main script =======================================//

const worksApiUrl = "http://localhost:5678/api/works";
const categoryApiUrl = "http://localhost:5678/api/categories";
const accueilUrl = "index.html";
const maxFileSizeForFileUpload = 4 * 1024 * 1024;
const allowedExtensions = ["jpg", "png"];
const filterButtonShowAllCategoryId = "show-all-filter-button";

const fetchedWorks = await fetch(worksApiUrl);
//on utilise un let car il est possible d'ajouter et supprimer les travaux via l'interface d'admin.
let works = await fetchedWorks.json();

//recuperer categories
const fetchedCategories = await fetch(categoryApiUrl);
const categories = await fetchedCategories.json();

doCreateAllWorksItems(works);
doShowUserLoggedInUserInterface();
doCreateAddPhotoCategoriesOptions(categories);
//disabled modal input
doEnableDisableAddNewWorkSubmitButton();
doReturnToModalContentDeleteWork();

addEventListenerOnModifyWorksButton();
addEventListenerOnCloseModalButton();
addEventListenerOnShowModalContentAddWorkButton();
addEventListenerOnReturnToModalContentDeleteWorkButton();
addEventListenerOnFileUploadInput(maxFileSizeForFileUpload);
addEventListenerOnAddNewWorkSubmitButton();
addEventListenerOnAddNewWorkTitleInput();
