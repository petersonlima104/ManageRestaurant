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
  getDocs,
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
window.adicionarPrato = async function () {
  const pratoNome = select.value;
  const qtd = parseInt(document.getElementById("quantidade").value);

  // 🔥 Buscar prato completo no Firestore
  const snapshot = await getDocs(collection(db, "pratos"));

  let pratoSelecionado = null;

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();
    if (p.nome === pratoNome) {
      pratoSelecionado = p;
    }
  });

  if (!pratoSelecionado) return;

  pratosSelecionados.push({
    nome: pratoSelecionado.nome,
    quantidade: qtd,
    preco: pratoSelecionado.preco,
    categoria: pratoSelecionado.categoria,
  });

  document.getElementById("listaSelecionados").innerHTML += `
    <div class="bg-secondary p-2 rounded mb-2">
      ${pratoSelecionado.nome} x ${qtd}
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
    statusPagamento: "Aberto",
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
    Entregue: 4,
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

  // 🔥 Se for caixa, agrupar por mesa
  if (perfil === "caixa") {
    const mesasAgrupadas = {};

    pedidos.forEach((pedido) => {
      if (!mesasAgrupadas[pedido.mesa]) {
        mesasAgrupadas[pedido.mesa] = {
          pedidos: [],
          total: 0,
        };
      }

      mesasAgrupadas[pedido.mesa].pedidos.push(pedido);

      // Somar total do pedido
      pedido.pratos.forEach((p) => {
        mesasAgrupadas[pedido.mesa].total += (p.preco || 0) * p.quantidade;
      });
    });

    // Renderizar agrupado
    Object.keys(mesasAgrupadas).forEach((mesa) => {
      const todosPagos = mesasAgrupadas[mesa].pedidos.every(
        (p) => p.statusPagamento === "Pago",
      );

      let pedidosHTML = "";

      mesasAgrupadas[mesa].pedidos.forEach((pedido) => {
        let itensHTML = "";

        pedido.pratos.forEach((p) => {
          itensHTML += `<li>${p.nome} x ${p.quantidade}</li>`;
        });

        pedidosHTML += `
        <div class="mb-3 p-2 border rounded">
          <strong>Status:</strong> ${pedido.status}
          <ul>${itensHTML}</ul>
        </div>
      `;
      });

      lista.innerHTML += `
  <div class="card mb-4 shadow-lg ${
    todosPagos ? "border-success" : "border-primary"
  }">
    <div class="card-body">

      <div class="d-flex justify-content-between align-items-center">
        <h4>Mesa ${mesa}</h4>
        ${
          todosPagos
            ? `<span class="badge bg-success">Mesa Fechada</span>`
            : `<span class="badge bg-warning text-dark">Aberta</span>`
        }
      </div>

      <hr>

      ${pedidosHTML}

      <hr>
      <h5>Total Geral: R$ ${mesasAgrupadas[mesa].total.toFixed(2)}</h5>

      ${
        !todosPagos
          ? `
        <button onclick="fecharMesa('${mesa}')"
          class="btn btn-success mt-2">
          Fechar Conta
        </button>
      `
          : ""
      }

    </div>
  </div>
`;
    });

    return; // 🔥 IMPORTANTE: impede renderização normal
  }

  // 🔥 Renderiza já ordenado
  pedidos.forEach((pedido) => {
    // 🔥 Cozinha não vê pedidos entregues
    if (perfil === "cozinha" && pedido.status === "Entregue") {
      return;
    }

    let pratosHTML = "";
    let totalPedido = 0;

    pedido.pratos.forEach((p) => {
      // 👨‍🍳 Cozinha não vê bebidas
      if (perfil === "cozinha" && p.categoria === "Bebida") {
        return;
      }

      pratosHTML += `<li>${p.nome} x ${p.quantidade}</li>`;

      // 💰 Caixa e Dono calculam total
      if (perfil === "caixa" || perfil === "dono") {
        totalPedido += (p.preco || 0) * p.quantidade;
      }
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

      case "Entregue":
        classeStatus = "status-entregue";
        corStatus = "dark";
        break;
    }

    lista.innerHTML += `
    <div class="card mb-3 shadow-sm ${classeStatus}">
      <div class="card-body">

        <div class="d-flex justify-content-between">
          <h5>Mesa ${pedido.mesa}</h5>

          <div>
            <span class="badge bg-${corStatus}">
              ${pedido.status}
            </span>

            ${
              perfil === "caixa" || perfil === "dono"
                ? `
              <span class="badge bg-info">
                ${pedido.statusPagamento || "Aberto"}
              </span>
            `
                : ""
            }
          </div>
        </div>

        <hr>

        <ul>${pratosHTML}</ul>

        ${
          perfil === "caixa" || perfil === "dono"
            ? `
          <hr>
          <h6>Total: R$ ${totalPedido.toFixed(2)}</h6>
        `
            : ""
        }

        <p><strong>Ponto:</strong> ${pedido.ponto}</p>

<div class="d-flex gap-2 mt-3">

  ${
    perfil === "cozinha" || perfil === "dono"
      ? `
    <button onclick="alterarStatus('${pedido.id}','Preparando')" 
      class="btn btn-warning btn-sm">
      Preparando
    </button>

    <button onclick="alterarStatus('${pedido.id}','Pronto')" 
      class="btn btn-success btn-sm">
      Pronto
    </button>
  `
      : ""
  }

  ${
    perfil === "garcom" || perfil === "dono"
      ? `
    <button onclick="alterarStatus('${pedido.id}','Entregue')" 
      class="btn btn-dark btn-sm">
      Entregue
    </button>
  `
      : ""
  }

  ${
    perfil === "caixa" || perfil === "dono"
      ? `
    <button onclick="alterarPagamento('${pedido.id}')"
      class="btn btn-primary btn-sm">
      Marcar como Pago
    </button>
  `
      : ""
  }

</div>

      </div>
    </div>
  `;
  });
});

window.alterarPagamento = async function (id) {
  const pedidoRef = doc(db, "pedidos", id);

  await updateDoc(pedidoRef, {
    statusPagamento: "Pago",
  });
};

window.fecharMesa = async function (mesa) {
  const snapshot = await getDocs(collection(db, "pedidos"));

  snapshot.forEach(async (docSnap) => {
    const pedido = docSnap.data();

    if (pedido.mesa == mesa) {
      await updateDoc(doc(db, "pedidos", docSnap.id), {
        statusPagamento: "Pago",
      });
    }
  });

  alert("Mesa fechada com sucesso!");
};

window.alterarStatus = async function (id, novoStatus) {
  const pedidoRef = doc(db, "pedidos", id);
  await updateDoc(pedidoRef, { status: novoStatus });
};
