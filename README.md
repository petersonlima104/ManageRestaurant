# 🍽️ Sistema de Gestão para Restaurante

Aplicação web desenvolvida para gerenciamento completo de um restaurante, com controle de pedidos, organização por setor e relatório de faturamento.

Projeto focado em **controle de acesso por perfil**, **regras de negócio reais** e **atualização em tempo real** utilizando Firebase.

---

## 🚀 Tecnologias

- HTML5
- CSS3
- Bootstrap
- JavaScript (ES6+)
- Firebase Authentication
- Firebase Firestore

---

## 👥 Controle de Perfis

O sistema possui restrição de funcionalidades conforme o perfil do usuário:

### 👑 Dono

- Cadastrar, editar e excluir pratos
- Cadastrar usuários
- Visualizar todos os pedidos
- Alterar qualquer status
- Marcar pedidos como pagos
- Fechar mesas
- Acessar relatório de faturamento com filtro por data

### 👨‍🍳 Cozinha

- Visualiza pedidos pendentes
- Pode alterar para **Preparando** ou **Pronto**
- Não vê bebidas
- Não vê pedidos entregues ou pagos
- Não vê valores

### 🧑‍🍽️ Garçom

- Visualiza pedidos
- Pode marcar como **Entregue**
- Não vê pedidos pagos

### 💰 Caixa

- Visualiza pedidos agrupados por mesa
- Vê total individual e total geral da mesa
- Marca pedidos como pagos
- Fecha mesa (marca todos como pagos)

---

## 📦 Funcionalidades

- Cadastro de pratos (nome, preço, categoria)
- Registro de pedidos por mesa
- Controle de status:
  - Pendente
  - Preparando
  - Pronto
  - Entregue

- Controle de pagamento (Aberto / Pago)
- Agrupamento automático de pedidos por mesa
- Atualização em tempo real com `onSnapshot`
- Relatório de faturamento com filtro por período

---

## 📊 Relatórios

O perfil **Dono** pode:

- Filtrar pedidos por data inicial e final
- Visualizar pedidos do período selecionado
- Calcular o faturamento total dentro do intervalo

---

## 🧠 Conceitos Aplicados

- Manipulação de arrays (`sort`, `every`, `filter`)
- Controle de permissões por perfil
- Atualização reativa da interface
- Cálculo financeiro dinâmico
- Organização de regras de negócio
- Estruturação de dados no Firestore

---

## 🎯 Objetivo do Projeto

Demonstrar habilidades em:

- Desenvolvimento Front-end
- Integração com Firebase
- Controle de autenticação
- Modelagem de regras de negócio
- Organização de sistemas multiusuário

---

🖥️ **Desenvolvido por [Peterson Lima](https://portfoliopetersonlima.wuaze.com/)**
