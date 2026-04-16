```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>

  <style>
    body {
      font-family: Arial;
      padding: 20px;
    }

    h2 {
      margin-bottom: 20px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .filters input {
      padding: 8px;
      margin-right: 10px;
    }

    button {
      padding: 8px 14px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
    }

    .delete-btn {
      background: #dc2626;
      color: white;
    }

    .delete-btn:hover {
      background: #b91c1c;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      border: 1px solid #ccc;
    }

    th {
      background: #1e3a8a;
      color: white;
    }
  </style>
</head>
<body>

<h2>Ministry Signups</h2>

<div class="top-bar">
  <div class="filters">
    <input id="nameFilter" placeholder="Filter by name">
    <input id="emailFilter" placeholder="Filter by email">
    <input id="ministryFilter" placeholder="Filter by ministry">
  </div>

  <button onclick="downloadExcel()">Download Excel</button>
</div>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Ministry</th>
      <th>Message</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>

<script>
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "admin.html";
}

let allData = [];

/* FETCH DATA */
fetch("https://nfm-backend.onrender.com/admin/signups", {
  headers: {
    Authorization: token
  }
})
.then(res => res.json())
.then(data => {
  allData = data;
  renderTable(data);
});

/* RENDER TABLE */
function renderTable(data) {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  data.forEach(item => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.ministry}</td>
        <td>${item.message}</td>
        <td>${new Date(item.date).toLocaleString()}</td>
        <td>
          <button class="delete-btn" onclick="deleteRow('${item._id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

/* DELETE ROW */
function deleteRow(id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;

  fetch(`https://nfm-backend.onrender.com/admin/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  })
  .then(() => {
    allData = allData.filter(item => item._id !== id);
    renderTable(allData);
  });
}

/* FILTERING */
document.getElementById("nameFilter").addEventListener("input", applyFilters);
document.getElementById("emailFilter").addEventListener("input", applyFilters);
document.getElementById("ministryFilter").addEventListener("input", applyFilters);

function applyFilters() {
  const name = document.getElementById("nameFilter").value.toLowerCase();
  const email = document.getElementById("emailFilter").value.toLowerCase();
  const ministry = document.getElementById("ministryFilter").value.toLowerCase();

  const filtered = allData.filter(item =>
    item.name.toLowerCase().includes(name) &&
    item.email.toLowerCase().includes(email) &&
    item.ministry.toLowerCase().includes(ministry)
  );

  renderTable(filtered);
}

/* DOWNLOAD CSV */
function downloadExcel() {
  let csv = "Name,Email,Ministry,Message,Date\n";

  allData.forEach(item => {
    csv += `${item.name},${item.email},${item.ministry},${item.message},${new Date(item.date).toLocaleString()}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "signups.csv";
  a.click();
}
</script>

</body>
</html>
```
