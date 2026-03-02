import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {
  const emailInput = document.getElementById("email").value;
  const senhaInput = document.getElementById("senha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailInput,
      senhaInput,
    );

    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "usuarios", uid));

    if (!userDoc.exists()) {
      alert("Usuário não possui perfil cadastrado!");
      return;
    }

    localStorage.setItem("perfil", userDoc.data().perfil);
    window.location.href = "pedidos.html";
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
};
