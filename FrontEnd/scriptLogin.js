//=================================== Does =======================================//
/**
 * procedure de connexion
 * effectue un appel en post sur le endpoint /users/login
 * gère le retour en affichant une erreur ou en lançant la procedure de succès du login
 * @param {string} email
 * @param {string} password
 */
async function doLoginToServer(email, password) {
  const response = await fetch(loginApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  console.log(response);
  if (!response.ok) {
    doShowError("Identifiant/mot de passe invalide");
  } else {
    const json = await response.json();
    doSaveUserLogStatusAndRedirect(json);
  }
}
/**
 * gestion du succès du login
 * ajoute le user loggé au session storage et redirige vers la page d'accueil
 * @param {object} json retour de l'API
 */
function doSaveUserLogStatusAndRedirect(json) {
  window.sessionStorage.setItem("user", JSON.stringify(json));
  window.location.replace(redirectionUrl);
}

/**
 * Remplace le texte de l'element '.error' et le rend visible
 * @param {string} text texte à afficher dans l'element '.error'
 */
function doShowError(text) {
  const errorElement = document.querySelector(".error");
  errorElement.textContent = text;
}

//=================================== Handlers =======================================//

/**
 * fonction de gestion du submit du formulaire login
 * valide la saisie de l'utilisateur puis affiche une erreur ou effectue
 * la procedure de connexion
 * @param {*} e
 */
function handleLogin(e) {
  /*empêche l'envoie du formulaire au serveveur*/
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  //Valider la saisie
  if (!email || !password) {
    doShowError("Veuillez remplir email et mot de passe");
  } else {
    doLoginToServer(email, password);
  }
}

//=================================== Main script =======================================//

const loginApiUrl = "http://localhost:5678/api/users/login";
const redirectionUrl = "index.html";

document.getElementById("loginForm").addEventListener("submit", handleLogin);
