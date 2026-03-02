import { auth, db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signOut,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let pratosSelecionados = [];
let pratoEditandoId = null;

const select = document.getElementById("selectPratos");

if (select) {
  onSnapshot(collection(db, "pratos"), (snapshot) => {
    select.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      select.innerHTML += `
        <option value="${p.nome}">
          ${p.nome}
        </option>
      `;
    });
  });
}

// Abrir modal de cadastro de usuário
window.abrirModalUsuario = function () {
  const modal = new bootstrap.Modal(document.getElementById("modalUsuario"));
  modal.show();
};

// Cadastrar usuário
window.cadastrarUsuario = async function () {
  const nome = document.getElementById("nomeUsuario").value;
  const email = document.getElementById("emailUsuario").value;
  const senha = document.getElementById("senhaUsuario").value;
  const perfilNovo = document.getElementById("perfilUsuario").value;

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    // 🔥 Criar segunda instância do auth
    const authSecundario = auth;

    const userCredential = await createUserWithEmailAndPassword(
      authSecundario,
      email,
      senha,
    );

    const user = userCredential.user;

    // 🔥 Salvar perfil no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome,
      email,
      perfil: perfilNovo,
      criadoEm: serverTimestamp(),
    });

    alert("Usuário cadastrado com sucesso!");

    bootstrap.Modal.getInstance(document.getElementById("modalUsuario")).hide();
  } catch (error) {
    alert("Erro: " + error.message);
  }
};

// Adicionar prato ao pedido
window.adicionarPrato = function () {
  const prato = select.value;
  const qtd = document.getElementById("quantidade").value;

  pratosSelecionados.push({
    nome: prato,
    quantidade: qtd,
  });

  document.getElementById("listaSelecionados").innerHTML += `
    <div class="bg-secondary p-2 rounded mb-2">
      ${prato} x ${qtd}
    </div>
  `;
};

const listaPratos = document.getElementById("listaPratos");

onSnapshot(collection(db, "pratos"), (snapshot) => {
  if (!listaPratos) return;

  listaPratos.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const prato = docSnap.data();
    const id = docSnap.id;

    listaPratos.innerHTML += `
      <div class="card bg-secondary text-white mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">

          <div>
            <strong>${prato.nome}</strong><br>
            R$ ${prato.preco?.toFixed(2) || "0.00"} | ${prato.categoria}
          </div>

          <div class="d-flex gap-2">
            <button onclick="editarPrato('${id}','${prato.nome}',${prato.preco},'${prato.categoria}')"
              class="btn btn-warning btn-sm">
              Editar
            </button>

            <button onclick="excluirPrato('${id}')"
              class="btn btn-danger btn-sm">
              Excluir
            </button>
          </div>

        </div>
      </div>
    `;
  });
});

window.registrarPedido = async function () {
  const mesa = document.getElementById("mesa").value;
  const ponto = document.getElementById("ponto").value;

  if (!mesa || pratosSelecionados.length === 0) {
    alert("Preencha mesa e adicione pratos!");
    return;
  }

  await addDoc(collection(db, "pedidos"), {
    mesa,
    pratos: pratosSelecionados,
    ponto,
    status: "Pendente",
    dataHora: serverTimestamp(),
  });

  pratosSelecionados = [];
  document.getElementById("listaSelecionados").innerHTML = "";

  bootstrap.Modal.getInstance(document.getElementById("modalPedido")).hide();
};

window.abrirModalPrato = function () {
  const modal = new bootstrap.Modal(document.getElementById("modalPrato"));
  modal.show();
};

// Salvar prato
window.salvarPrato = async function () {
  const nome = document.getElementById("nomePrato").value;
  const preco = document.getElementById("precoPrato").value;
  const categoria = document.getElementById("categoriaPrato").value;

  if (!nome || !preco) {
    alert("Preencha nome e preço!");
    return;
  }

  if (pratoEditandoId) {
    await updateDoc(doc(db, "pratos", pratoEditandoId), {
      nome,
      preco: parseFloat(preco),
      categoria,
    });

    pratoEditandoId = null;
  } else {
    await addDoc(collection(db, "pratos"), {
      nome,
      preco: parseFloat(preco),
      categoria,
      criadoEm: serverTimestamp(),
    });
  }

  document.getElementById("nomePrato").value = "";
  document.getElementById("precoPrato").value = "";
};

window.editarPrato = function (id, nome, preco, categoria) {
  document.getElementById("nomePrato").value = nome;
  document.getElementById("precoPrato").value = preco;
  document.getElementById("categoriaPrato").value = categoria;

  pratoEditandoId = id;
};

window.excluirPrato = async function (id) {
  if (confirm("Deseja realmente excluir este prato?")) {
    await deleteDoc(doc(db, "pratos", id));
  }
};

const lista = document.getElementById("listaPedidos");
const perfil = localStorage.getItem("perfil");

// Mostrar botões só para dono
if (perfil === "dono") {
  document.getElementById("btnPrato").classList.remove("d-none");
  document.getElementById("btnUsuario").classList.remove("d-none");
}

// Logout
window.logout = async function () {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
};

window.abrirModalPedido = function () {
  const modal = new bootstrap.Modal(document.getElementById("modalPedido"));
  modal.show();
};

// Listar pedidos
const q = collection(db, "pedidos");

onSnapshot(q, (snapshot) => {
  lista.innerHTML = "";

  let pedidos = [];

  snapshot.forEach((docSnap) => {
    pedidos.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  // 🔥 ORDEM DE PRIORIDADE
  const prioridade = {
    Pendente: 1,
    Pronto: 2,
    Preparando: 3,
  };

  pedidos.sort((a, b) => {
    // 1️⃣ Ordena por prioridade de status
    if (prioridade[a.status] !== prioridade[b.status]) {
      return prioridade[a.status] - prioridade[b.status];
    }

    // 2️⃣ Dentro do mesmo status, ordena por data
    const dataA = a.dataHora?.seconds || 0;
    const dataB = b.dataHora?.seconds || 0;

    return dataA - dataB;
  });

  // 🔥 Renderiza já ordenado
  pedidos.forEach((pedido) => {
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

          <ul>${pratosHTML}</ul>

          <p><strong>Ponto:</strong> ${pedido.ponto}</p>

          <div class="d-flex gap-2 mt-3">
            <button onclick="alterarStatus('${pedido.id}','Preparando')" 
              class="btn btn-warning btn-sm">
              Preparando
            </button>

            <button onclick="alterarStatus('${pedido.id}','Pronto')" 
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
