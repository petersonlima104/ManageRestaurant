import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaPedidos");

const q = query(collection(db, "pedidos"), orderBy("dataHora", "asc"));

onSnapshot(q, (snapshot) => {
  lista.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const pedido = docSnap.data();
    const id = docSnap.id;

    let pratosHTML = "";
    pedido.pratos.forEach((p) => {
      pratosHTML += `<li>${p.nome} x ${p.quantidade}</li>`;
    });

    let classeStatus = "";
    let corStatus = "";

    switch (pedido.status) {
      case "Pendente":
        classeStatus = "status-pendente";
        corStatus = "danger";
        break;

      case "Preparando":
        classeStatus = "status-preparando";
        corStatus = "warning";
        break;

      case "Pronto":
        classeStatus = "status-pronto";
        corStatus = "success";
        break;

      default:
        classeStatus = "";
        corStatus = "secondary";
    }

    lista.innerHTML += `
      <div class="card mb-3 shadow-sm ${classeStatus}">
        <div class="card-body">

          <div class="d-flex justify-content-between">
            <h5>Mesa ${pedido.mesa}</h5>
            <span class="badge bg-${corStatus}">
              ${pedido.status}
            </span>
          </div>

          <hr>

          <ul>
            ${pratosHTML}
          </ul>

          <p><strong>Ponto da carne:</strong> ${pedido.ponto}</p>

          <div class="d-flex gap-2 mt-3">
            <button onclick="alterarStatus('${id}','Preparando')" 
              class="btn btn-warning btn-sm">
              Preparando
            </button>

            <button onclick="alterarStatus('${id}','Pronto')" 
              class="btn btn-success btn-sm">
              Pronto
            </button>
          </div>

        </div>
      </div>
    `;
  });
});

window.alterarStatus = async function (id, novoStatus) {
  const pedidoRef = doc(db, "pedidos", id);
  await updateDoc(pedidoRef, { status: novoStatus });
};
