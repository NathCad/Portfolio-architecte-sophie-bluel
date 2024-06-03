function getModal() {
  return document.getElementById("modal-administration");
}

function getModalContentDeleteWork() {
  return document.getElementById("modal-content-delete-work");
}
function getShowModalContentAddWorkButton() {
  return document.getElementById("show-modal-content-add-work-button");
}
function getFileUploadInput() {
  return document.getElementById("file-upload-input");
}

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

function addEventListenerOnSubmitAddWork() {
  document
    .getElementById("form-add-new-work")
    .addEventListener("submit", addNewWorkSubmitEventHandler);
}

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

function showModalContentDeleteWork() {
  const modalGalerie = getModalContentDeleteWork();
  modalGalerie.style.display = "flex";
  modalContentAddPhoto.style.display = "none";
}

function addEventListenerOnReturnToModalContentDeleteWorkButton() {
  const buttonArrowLeft = document.getElementById(
    "return-to-modal-content-delete-work-button"
  );
  buttonArrowLeft.addEventListener("click", () => {
    showModalContentDeleteWork();
  });
}

function addEventListenerOnButtonShowModalContentAddWork() {
  const showModalContentAddWorkButton = getShowModalContentAddWorkButton();
  showModalContentAddWorkButton.addEventListener("click", () => {
    const modalGalerie = getModalContentDeleteWork();
    modalContentAddPhoto.style.display = "flex";
    modalGalerie.style.display = "none";
  });
}

addEventListenerOnModifyWorksButton();
createAddPhotoCategoriesOptions(categories);
addEventListenerOnButtonCloseModal();
addEventListenerOnButtonShowModalContentAddWork();
addEventListenerOnReturnToModalContentDeleteWorkButton();
addEventListenerOnFileUploadInput(maxFileSizeForFileUpload);
