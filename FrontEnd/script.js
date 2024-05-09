/*const { categories } = require("../Backend/models");*/
const data = await fetch("http://localhost:5678/api/works");
const travaux = await data.json();
console.log(data, travaux);

const nomsCategories = recupererNomsCategoriesTravaux(travaux);
console.log(nomsCategories);

contenu(travaux);

/*Creer le bouton tous. Lui il change jamais et est connu à l'avance*/
const boutonTous = document.createElement("button");
/*ajout du texte*/
boutonTous.textContent = "Tous";
/*Selectionner div filtre pour ajouts bouton*/
const filtreContainer = document.querySelector(".filtres");
filtreContainer.appendChild(boutonTous);

function contenu(travaux) {
  /*vider gallerie*/
  const gallery = document.querySelector(".gallery");
  gallery.replaceChildren();
  for (const { imageUrl, title } of travaux) {
    //Creer l'image
    const image = document.createElement("img");
    image.setAttribute("src", imageUrl);
    image.setAttribute("alt", title);
    //creer figcaption
    const figcaption = document.createElement("figcaption");
    figcaption.innerText = title;
    const figure = document.createElement("figure");
    figure.appendChild(image);
    figure.appendChild(figcaption);
    //ajouter figure a gallery
    gallery.appendChild(figure);
  }
}
