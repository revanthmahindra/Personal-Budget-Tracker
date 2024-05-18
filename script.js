// Sample data
let transactions = [];

// Initialize chart and ledger
window.onload = function () {
    renderChart();
    renderLedger();
    renderPieChart();
};

// Function to add a transaction
function addTransaction() {
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const category = document.getElementById('category').value;
    let reason = '';

    if (category === 'Not Mentioned') {
       reason = document.getElementById('reason').value;
    }

    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    if (!isNaN(income)) {
        transactions.push({ id: generateId(), type: 'Income', amount: income, category, reason, day, month, year });
    }

    if (!isNaN(expenses)) {
        transactions.push({ id: generateId(), type: 'Expense', amount: expenses, category, reason, day, month, year });
    }

    renderChart();
    renderLedger();
}

// Function to render chart
function renderChart() {
    let incomeData = [];
    let expenseData = [];

    transactions.forEach(transaction => {
        if (transaction.type === 'Income') {
            incomeData.push({ x: new Date(transaction.year, monthToIndex(transaction.month), transaction.day), y: transaction.amount });
        } else if (transaction.type === 'Expense') {
            expenseData.push({ x: new Date(transaction.year, monthToIndex(transaction.month), transaction.day), y: transaction.amount });
        }
    });

    const chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title: {
            text: "Income vs Expenses"
        },
        axisX: {
            title: "Date",
            valueFormatString: "DD MMM YYYY"
        },
        axisY: {
            title: "Amount (USD)"
        },
        data: [{
            type: "line",
            name: "Income",
            showInLegend: true,
            dataPoints: incomeData
        },
        {
            type: "line",
            name: "Expenses",
            showInLegend: true,
            dataPoints: expenseData
        }]
    });
    chart.render();
}

// Function to render pie chart
function renderPieChart() {
    const categoryExpenses = {};

    transactions.forEach(transaction => {
        if (transaction.type === 'Expense') {
            if (!categoryExpenses.hasOwnProperty(transaction.category)) {
                categoryExpenses[transaction.category] = 0;
            }
            categoryExpenses[transaction.category] += transaction.amount;
        }
    });

    const dataPoints = Object.entries(categoryExpenses).map(([category, amount]) => ({ y: amount, label: category }));

    const pieChart = new CanvasJS.Chart("pieChartContainer", {
        animationEnabled: true,
        title: {
            text: "Spending by Category"
        },
        data: [{
            type: "pie",
            indexLabel: "{label}: {y} USD",
            dataPoints: dataPoints
        }]
    });
    pieChart.render();
}


// Function to render ledger
function renderLedger() {
    const ledgerDiv = document.getElementById('ledger');
    ledgerDiv.innerHTML = '<h3>Transaction Ledger</h3><ul>';

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        const sign = transaction.type === 'Income' ? '+' : '-';
        let listItem = `<li id="transaction-${transaction.id}">${transaction.type}: ${sign}$${transaction.amount.toFixed(2)} `;

        if (transaction.category === 'Not Mentioned' && transaction.reason) {
            listItem += `(${transaction.reason}, ${transaction.day} ${transaction.month} ${transaction.year})`;
        } else {
            listItem += `(${transaction.category}, ${transaction.day} ${transaction.month} ${transaction.year})`;
        }

        listItem += ` <button onclick="editTransaction(${transaction.id})">Edit</button></li>`;

        ledgerDiv.innerHTML += listItem;

        if (transaction.type === 'Income') {
            totalIncome += transaction.amount;
        } else if (transaction.type === 'Expense') {
            totalExpenses += transaction.amount;
        }
    });

    const remainingBalance = totalIncome - totalExpenses;
    ledgerDiv.innerHTML += `<li><strong>Remaining Balance:</strong> $${remainingBalance.toFixed(2)}</li>`;

    ledgerDiv.innerHTML += '</ul>';
}



// Function to edit a transaction
function editTransaction(transactionId) {
    const transactionIndex = transactions.findIndex(transaction => transaction.id === transactionId);
    const transaction = transactions[transactionIndex];

    const newAmount = parseFloat(prompt(`Enter new amount for ${transaction.type} transaction:`));
    const newCategory = prompt(`Enter new category for ${transaction.type} transaction:`);
    let newReason = '';

    if (newCategory === 'Not Mentioned') {
        newReason = prompt(`Enter reason for ${transaction.type} transaction (optional):`);
    }

    if (!isNaN(newAmount)) {
        transactions[transactionIndex].amount = newAmount;
    }

    if (newCategory) {
        transactions[transactionIndex].category = newCategory;
    }

    if (newReason !== undefined) {
        transactions[transactionIndex].reason = newReason;
    }

    renderChart();
    renderLedger();
}

// Function to download ledger as Excel sheet
function downloadLedgerExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transactions);

    XLSX.utils.book_append_sheet(wb, ws, "Ledger");

    XLSX.writeFile(wb, "ledger.xlsx");
}



// Helper function to generate unique ID for transactions
function generateId() {
    return Math.floor(Math.random() * 1000000) + 1;
}

// Helper function to convert month name to index
function monthToIndex(monthName) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
}

// Function to toggle reason input field
function toggleReasonInput() {
    const categorySelect = document.getElementById('category');
    const reasonInput = document.getElementById('reason');
    
    if (categorySelect.value === 'Not Mentioned') {
        reasonInput.style.display = 'block';
    } else {
        reasonInput.style.display = 'none';
    }
}
