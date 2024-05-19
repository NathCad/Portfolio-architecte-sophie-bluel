function handleLogin() {
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  console.log({ email, password });
  //Valider la saisie
  if (!email || !password) {
    showError("Veuillez remplir email et mot de passe");
  } else {
    loginToServer(email, password);
  }
}
function showError(text) {
  const errorElement = document.querySelector(".error");
  errorElement.textContent = text;
  errorElement.style.visibility = "visible";
}

async function loginToServer(email, password) {
  const response = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  console.log(response);
  if (!response.ok) {
    showError("Identifiant/mot de passe invalide");
  } else {
    const json = await response.json();
    handleUserLoggedIn(json);
  }
}
function handleUserLoggedIn(json) {
  console.log(json);
  sessionStorage.setItem("user", JSON.stringify(json));
  window.location.href = "http://localhost:5500/FrontEnd/index.html";
}
