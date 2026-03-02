import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.cadastrarPrato = async function () {
  await addDoc(collection(db, "pratos"), {
    nome: nomePrato.value,
    preco: parseFloat(precoPrato.value),
    ativo: true,
    criadoEm: serverTimestamp(),
  });

  nomePrato.value = "";
  precoPrato.value = "";
};

const lista = document.getElementById("listaPratos");

if (lista) {
  onSnapshot(collection(db, "pratos"), (snapshot) => {
    lista.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      lista.innerHTML += `
        <div class="card mb-2">
          <div class="card-body">
            ${p.nome} - R$ ${p.preco}
          </div>
        </div>
      `;
    });
  });
}
