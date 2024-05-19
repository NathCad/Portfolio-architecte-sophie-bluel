/*const { categories } = require("../Backend/models");*/
const data = await fetch("http://localhost:5678/api/works");
const travaux = await data.json();
console.log(data, travaux);

const nomsCategories = recupererNomsCategoriesTravaux(travaux);
console.log(nomsCategories);

afficherListeTravaux(travaux);

/*Selectionner div filtre pour ajouts bouton*/
const filtreContainer = document.querySelector(".filtres");

/* POur les autres boutons utiliser les categories récupérées plus haut*/
for (const nomCategorie of nomsCategories) {
  const bouton = document.createElement("button");
  bouton.textContent = nomCategorie;
  bouton.setAttribute("id", nomCategorie);
  bouton.addEventListener("click", filtreEventHandler);
  filtreContainer.appendChild(bouton);
}

Tous.addEventListener("click", filtreEventHandler);

function filtreEventHandler(e) {
  /*recuperer l'ID du bouton e*/
  const nomCategorie = e.target.id;
  /*en fonction du bouton je dois créer une nouvelle liste filtrée*/
  if (nomCategorie === "Tous") {
    afficherListeTravaux(travaux);
  } else {
    const travauxFiltres = travaux.filter(
      (travail) => nomCategorie === travail.category.name
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

function recupererNomsCategoriesTravaux(travaux) {
  const categorieTravaux = new Set();
  for (const travail of travaux) {
    /*recuperer nom des categories*/
    console.log(travail.category.name);
    categorieTravaux.add(travail.category.name);
  }
  return categorieTravaux;
}
