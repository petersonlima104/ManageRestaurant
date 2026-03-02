import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let pratosSelecionados = [];

const select = document.getElementById("selectPratos");

if (select) {
  onSnapshot(collection(db, "pratos"), (snapshot) => {
    select.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      select.innerHTML += `
        <option value="${p.nome}">${p.nome}</option>
      `;
    });
  });
}

window.adicionarPrato = function () {
  pratosSelecionados.push({
    nome: select.value,
    quantidade: quantidade.value,
  });

  listaSelecionados.innerHTML += `
    <div>${select.value} x ${quantidade.value}</div>
  `;
};

window.registrarPedido = async function () {
  await addDoc(collection(db, "pedidos"), {
    mesa: mesa.value,
    pratos: pratosSelecionados,
    ponto: ponto.value,
    status: "Pendente",
    dataHora: serverTimestamp(),
  });

  alert("Pedido registrado!");
};
