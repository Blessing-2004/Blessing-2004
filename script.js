// Optional: Menu toggle and request button
// document.querySelector("#menuToggle").addEventListener("click", function () {
//   document.querySelector(".toggleMenu").classList.toggle("hidden");
// });

// document.getElementById("requestBtn").addEventListener("click", () => {
//   window.location.href = "login.html";
// });

// Utility functions
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function setUser(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function generateAccountNumber() {
  const users = getUsers();
  let accountNumber;
  do {
    accountNumber = "3" + Math.floor(1000000000 + Math.random() * 9000000000);
  } while (users.some((u) => u.accountNumber === accountNumber));
  return accountNumber;
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const signupButton = document.querySelector("#signup_button");
  const loginButton = document.querySelector("#login_button");
  const logoutButton = document.querySelector("#logout_button");
  const userInfo = document.getElementById("user-info");
  const withdrawForm = document.querySelector("#withdrawModal form");
  if (withdrawForm) {
    withdrawForm.addEventListener("submit", handleWithdrawForm);
  }

  // Signup
  if (signupButton) {
    signupButton.addEventListener("click", (e) => {
      e.preventDefault();
      const fullName = document.querySelector("#full_name").value.trim();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();
      const users = getUsers();

      if (!fullName || !email || !password) {
        alert("Please fill in all fields");
        return;
      }

      if (users.find((u) => u.email === email)) {
        alert("User already exists");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      const newUser = {
        fullName,
        email,
        password,
        balance: 0,
        transactions: [],
        saves: 0,
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        accountNumber: generateAccountNumber(),
      };

      users.push(newUser);
      setUser(users);

      alert("Account created successfully!");
      window.location.href = "login.html";
    });
  }

  // Login
  if (loginButton) {
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.querySelector("#login_email").value.trim();
      const password = document.querySelector("#login_password").value.trim();
      const users = getUsers();

      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      const matchedUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (matchedUser) {
        localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid email or password");
      }
    });
  }

  // Dashboard Info Display
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (userInfo) {
    if (!loggedInUser) {
      alert("You must be logged in to view this page.");
      window.location.href = "login.html";
    } else {
      userInfo.innerHTML = `
      <div class="ml-6 mt-4 ">
        <h2 class="text-2xl font-bold">Welcome, ${loggedInUser.fullName}</h2>
        <p ><strong>Account Number:</strong> ${loggedInUser.accountNumber}</p>
        <p><strong>Balance:</strong> <span id="balance_display">NGN ${loggedInUser.balance.toFixed(
          2
        )}</span></p>
        </div>
      `;
    }
  }

  // Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }

  window.justAlert = function (id) {
    alert(`This feature is not available yet!, ${id}`);
  };

  // Open the modal
  window.openModal = function (modalId) {
    alert("Modal opened!");
    document.getElementById(modalId).classList.remove("hidden");
  };

  // Close the modal
  window.closeModal = function (modalId) {
    document.getElementById(modalId).classList.add("hidden");
  };

  // Handle Deposit Form
  function handleDepositForm(event) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    event.preventDefault();
    const form = event.target;
    const bankName = form.querySelector('input[placeholder="Bank Name"]').value;
    const accountNumber = form.querySelector(
      'input[placeholder="Account Number"]'
    ).value;
    const accountName = form.querySelector(
      'input[placeholder="Account Name"]'
    ).value;
    const amount = form.querySelector('input[placeholder="Amount"]').value;

    if (!bankName || !accountNumber || !accountName || !amount) {
      alert("Please fill all fields.");
      return;
    }

    console.log(amount, accountName, accountNumber, bankName);

    if (!loggedInUser) {
      alert("You must be logged in to deposit money.");
      return;
    }

    if (isNaN(parseInt(accountNumber))) {
      alert("Account Number must be a Number");
    } else {
      // Update the user's balance
      const parsedAmount = parseFloat(amount);
      loggedInUser.balance += parsedAmount;

      loggedInUser.transactions.push({
        type: "Deposit",
        amount: parsedAmount,
        date: new Date().toLocaleString(),
      });
      const users = getUsers().map((user) =>
        user.id === loggedInUser.id ? loggedInUser : user
      );

      setUser(users);
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      localStorage.setItem("users", JSON.stringify(users));
      alert("Deposit successful!");
      console.log("users");

      const balanceDisplay = document.getElementById("balance_display");
      if (balanceDisplay) {
        balanceDisplay.textContent = `NGN ${loggedInUser.balance.toFixed(2)}`;
      }
    }

    console.log("Depositing:", {
      bankName,
      accountNumber,
      accountName,
      amount,
    });
    form.reset();
    closeModal("depositModal");
  }

  // Handle Withdraw Form
  function handleWithdrawForm(event) {
    event.preventDefault();
    const form = event.target;
    const bankName = form.querySelector('input[placeholder="Bank Name"]').value;
    const accountNumber = form.querySelector(
      'input[placeholder="Account Number"]'
    ).value;
    const accountName = form.querySelector(
      'input[placeholder="Account Name"]'
    ).value;
    const amount = parseFloat(
      form.querySelector('input[placeholder="Amount"]').value
    );

    if (
      !bankName ||
      !accountNumber ||
      !accountName ||
      !amount ||
      isNaN(amount)
    ) {
      alert("Please fill all fields with valid data.");
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("You must be logged in to withdraw money.");
      return;
    }

    if (amount > loggedInUser.balance) {
      alert("Insufficient balance.");
      return;
    }

    // Deduct the amount
    loggedInUser.balance -= amount;

    // Add to transaction history
    loggedInUser.transactions.push({
      type: "Withdraw",
      amount: amount,
      date: new Date().toLocaleString(),
    });

    // Update user list
    const users = getUsers().map((user) =>
      user.id === loggedInUser.id ? loggedInUser : user
    );

    setUser(users);
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

    // Update the balance on the page
    const balanceDisplay = document.getElementById("balance_display");
    if (balanceDisplay) {
      balanceDisplay.textContent = `NGN ${loggedInUser.balance.toFixed(2)}`;
    }

    alert("Withdrawal successful!");

    form.reset();
    closeModal("withdrawModal");
  }

  // Handle Savings Form
  function handleSavingsForm(event) {
    event.preventDefault();

    const form = event.target;
    const amount = parseFloat(
      form.querySelector('input[placeholder="Amount"]').value.trim()
    );

    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const users = getUsers();

    if (!loggedInUser) {
      alert("You must be logged in to save money.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (loggedInUser.balance < amount) {
      alert("Insufficient balance.");
      return;
    }

    // Deduct from balance and add to savings
    loggedInUser.balance -= amount;
    loggedInUser.saves += amount;

    // Record transaction
    loggedInUser.transactions.push({
      type: "Savings",
      amount: amount,
      date: new Date().toLocaleString(),
    });

    // Update users array and localStorage
    const updatedUsers = users.map((u) =>
      u.id === loggedInUser.id ? loggedInUser : u
    );
    setUser(updatedUsers);
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

    // Update UI if needed
    const balanceDisplay = document.getElementById("balance_display");
    if (balanceDisplay) {
      balanceDisplay.textContent = `NGN ${loggedInUser.balance.toFixed(2)}`;
    }

    alert("Amount saved successfully!");
    form.reset();
    closeModal("savingsModal");
  }

  // Transaction History Rendering
  const transactionTableBody = document.getElementById("transactionTableBody");
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (transactionTableBody && currentUser) {
    // Get and sort transactions
    const transactions = currentUser.transactions.sort((a, b) => {
      return new Date(b.date) - new Date(a.date); // Newest first
    });

    if (transactions.length === 0) {
      transactionTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="px-4 py-2 text-center text-gray-500">No transactions yet.</td>
      </tr>
    `;
    } else {
      transactionTableBody.innerHTML = transactions
        .map((txn) => {
          return `
          <tr>
            <td class="px-4 py-2">${txn.date}</td>
            <td class="px-4 py-2">${txn.type}</td>
            <td class="px-4 py-2">NGN ${txn.amount.toFixed(2)}</td>
          </tr>
        `;
        })
        .join("");
    }
  }

  loggedInUser.transactions.push({
    id: Date.now(), // unique identifier
    type: "Deposit",
    // amount: parsedAmount,
    date: new Date().toLocaleString(),
  });
  // Render Transaction History
  function renderTransactionHistory() {
    const transactionTableBody = document.getElementById(
      "transactionTableBody"
    );
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!currentUser || !transactionTableBody) return;

    const transactions = currentUser.transactions;

    if (transactions.length === 0) {
      transactionTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-2 text-center text-gray-500">No transactions yet.</td>
      </tr>
    `;
    } else {
      transactionTableBody.innerHTML = transactions
        .map((txn) => {
          return `
          <tr>
            <td class="px-4 py-2">${txn.date}</td>
            <td class="px-4 py-2">${txn.type}</td>
            <td class="px-4 py-2">NGN ${txn.amount.toFixed(2)}</td>
            <td class="px-4 py-2">
              <button onclick="deleteTransaction('${
                txn.id
              }')" class="text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        `;
        })
        .join("");
    }
  }
  // Delete Transaction

  function deleteTransaction(transactionId) {
    const users = getUsers();
    let currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!currentUser) return;

    // Filter out the transaction
    currentUser.transactions = currentUser.transactions.filter(
      (txn) => txn.id.toString() !== transactionId.toString()
    );

    // Update localStorage
    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? currentUser : user
    );
    setUser(updatedUsers);

    // Refresh the table
    renderTransactionHistory();
  }

  // Attach form listeners after DOM loads
  window.addEventListener("DOMContentLoaded", () => {
    const depositForm = document.querySelector("#depositModal form");
    const withdrawForm = document.querySelector("#withdrawModal form");
    const savingsForm = document.querySelector("#savingsModal form");

    depositForm.addEventListener("submit", handleDepositForm);
    withdrawForm.addEventListener("submit", handleWithdrawForm);
    savingsForm.addEventListener("submit", handleSavingsForm);
  });
});

  
