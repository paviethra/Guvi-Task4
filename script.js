const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');

// Get transactions from local storage (Read operation on page load)
const localStorageTransactions = JSON.parse(
    localStorage.getItem('transactions')
);

let transactions = localStorageTransactions !== null ? localStorageTransactions : [];

// Function to add a new transaction (Create operation)
function addTransaction(e) {
    e.preventDefault();

    const transactionType = typeInput.value;
    const transactionAmount = parseFloat(amountInput.value);
    const finalAmount = transactionType === 'income' ? Math.abs(transactionAmount) : -Math.abs(transactionAmount);

    const transaction = {
        id: generateID(),
        description: descriptionInput.value,
        amount: finalAmount
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    // Clear form fields
    descriptionInput.value = '';
    amountInput.value = '';
    typeInput.value = 'expense';
}

// Generate a random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list (Read operation helper)
function addTransactionDOM(transaction) {
    // Get sign
    const sign = transaction.amount < 0 ? '-' : '+';

    const item = document.createElement('li');

    // Add class based on value
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        ${transaction.description} <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">✎</button>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
}

// Update the balance, income and expense totals
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balance.innerText = `₹${total}`;
    money_plus.innerText = `₹${income}`;
    money_minus.innerText = `₹${expense}`;
}

// Edit transaction (Update operation)
function editTransaction(id) {
    const transactionToEdit = transactions.find(transaction => transaction.id === id);

    if (transactionToEdit) {
        // Populate the form with current values
        descriptionInput.value = transactionToEdit.description;
        amountInput.value = Math.abs(transactionToEdit.amount);
        typeInput.value = transactionToEdit.amount < 0 ? 'expense' : 'income';

        // Remove the transaction from the list temporarily for update
        removeTransaction(id, false); // false to avoid updating local storage twice

        // The 'Add transaction' button will now act as an 'Update' button implicitly when user clicks it after form is populated.
        // A more robust solution would dynamically change the button text and behavior, but this works for a simple CRUD.
    }
}

// Remove transaction by ID (Delete operation)
function removeTransaction(id, update = true) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    if (update) {
        updateLocalStorage();
        init(); // Re-render the list
    }
}

// Update local storage transactions
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Reset calculator (Clear all data)
function resetCalculator() {
    transactions = [];
    updateLocalStorage();
    init();
}

// Initialize app
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();

// Event listeners
form.addEventListener('submit', addTransaction);
