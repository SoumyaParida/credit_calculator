document.querySelectorAll('input[name="paymentPlan"]').forEach((input) => {
    input.addEventListener('change', function() {
        document.getElementById('fixedAmountValue').disabled = !document.getElementById('fixedAmount').checked;
        document.getElementById('percentageValue').disabled = !document.getElementById('percentageAmount').checked;
        document.getElementById('years').disabled = !document.getElementById('timeframe').checked;
        document.getElementById('months').disabled = !document.getElementById('timeframe').checked;
    });
});

let pieChart;
let lineChart;

function calculatePayoff() {
    const balance = parseFloat(document.getElementById('balance').value);
    const annualRate = parseFloat(document.getElementById('annualRate').value);
    const monthlyRate = annualRate / 12 / 100;
    const results = document.getElementById('results');

    let months = 0;
    let totalInterest = 0;
    let remainingBalance = balance;

    const balanceHistory = [];
    const interestHistory = [];

    let monthlyPayment = 0;

    if (document.getElementById('fixedAmount').checked) {
        monthlyPayment = parseFloat(document.getElementById('fixedAmountValue').value);
        while (remainingBalance > 0) {
            const interest = remainingBalance * monthlyRate;
            remainingBalance = remainingBalance + interest - monthlyPayment;
            totalInterest += interest;
            balanceHistory.push(remainingBalance > 0 ? remainingBalance : 0);
            interestHistory.push(totalInterest);
            months += 1;
        }
    } else if (document.getElementById('percentageAmount').checked) {
        const percentage = parseFloat(document.getElementById('percentageValue').value) / 100;
        while (remainingBalance > 0) {
            monthlyPayment = remainingBalance * percentage + remainingBalance * monthlyRate;
            const interest = remainingBalance * monthlyRate;
            remainingBalance = remainingBalance + interest - monthlyPayment;
            totalInterest += interest;
            balanceHistory.push(remainingBalance > 0 ? remainingBalance : 0);
            interestHistory.push(totalInterest);
            months += 1;
        }
    } else if (document.getElementById('timeframe').checked) {
        const years = parseInt(document.getElementById('years').value);
        const monthsInput = parseInt(document.getElementById('months').value);
        months = years * 12 + monthsInput;
        monthlyPayment = (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
        for (let i = 0; i < months; i++) {
            const interest = remainingBalance * monthlyRate;
            remainingBalance = remainingBalance + interest - monthlyPayment;
            totalInterest += interest;
            balanceHistory.push(remainingBalance > 0 ? remainingBalance : 0);
            interestHistory.push(totalInterest);
        }
    }

    const payoffYears = Math.floor(months / 12);
    const payoffMonths = months % 12;

    results.innerHTML = `
        <p>Monthly Payment: $${monthlyPayment.toFixed(2)}</p>
        <p>Total Interest Paid: $${totalInterest.toFixed(2)}</p>
        <p>Time to Payoff: ${payoffYears} years and ${payoffMonths} months</p>
    `;
    results.style.display = 'block';

    // Destroy existing charts if they exist
    if (pieChart) pieChart.destroy();
    if (lineChart) lineChart.destroy();

    renderCharts(balance, totalInterest, balanceHistory, interestHistory);
}

function renderCharts(principal, interest, balanceHistory, interestHistory) {
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');

    const total = principal + interest;
    const principalPercentage = (principal / total) * 100;
    const interestPercentage = (interest / total) * 100;

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: [`Principal (${principalPercentage.toFixed(2)}%)`, `Interest (${interestPercentage.toFixed(2)}%)`],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#36A2EB', '#FF6384']
            }]
        },
        options: {
            responsive: true
        }
    });

    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: balanceHistory.map((_, i) => i + 1),
            datasets: [
                {
                    label: 'Remaining Balance',
                    data: balanceHistory,
                    borderColor: '#36A2EB',
                    fill: false
                },
                {
                    label: 'Total Interest Paid',
                    data: interestHistory,
                    borderColor: '#FF6384',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}
