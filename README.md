
# ContractFlow – Contract Management Platform

## 📌 Project Description
ContractFlow is a frontend-based Contract Management Platform built to demonstrate product thinking, UI/UX design, structured state management, and clean frontend architecture. The application enables users to create reusable contract blueprints, generate contracts, and manage their lifecycle without relying on a backend service.
## Live Demo

Check out the live version of this project here: [React App Live](https://contract-flow-phi.vercel.app)

---

## 🚀 Features

### 🔹 Blueprint Creation
- Create reusable contract templates (Blueprints)
- Supported field types:
  - Text
  - Date
  - Signature
  - Checkbox
- Basic positioning of fields on a contract page
- Stores field metadata such as type, label, and position
- Blueprint data stored using mocked/local persistence

### 🔹 Contract Creation
- Generate contracts from existing blueprints
- Contracts inherit all blueprint fields
- Users can fill values for contract fields

### 🔹 Contract Lifecycle Management
Each contract follows a controlled lifecycle:



- Revoked state allowed after Created or Sent
- Lifecycle steps cannot be skipped
- Locked contracts cannot be edited
- Revoked contracts cannot proceed further
- UI clearly shows current status and available actions

### 🔹 Contract Dashboard
- Displays all contracts in a table view
- Filtered/grouped by status:
  - Active
  - Pending
  - Signed
- Table includes:
  - Contract name
  - Blueprint name
  - Status
  - Created date
  - Action buttons (view, update status)

---

## 🛠 Tech Stack
- React
- TypeScript
- Component-based architecture
- Local storage / Mocked data persistence
- Clean folder structure and reusable components

---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/shuchitha28/ContractFlow.git

# Navigate to the project directory
cd contractflow

# Install dependencies
npm install

# Start the development server
npm run dev

## Run Locally

**Prerequisites:**  Node.js
```
##Architecture & Design Decisions

-Modular, component-based structure for scalability

-Centralized state management for contracts and blueprints

-Clear separation of UI components and business logic

-Lifecycle logic enforced through controlled state transitions

-No backend dependency to keep focus on frontend architecture

##⚠️ Assumptions & Limitations

-Backend and authentication are not implemented

-Data is stored locally or mocked

-Field positioning is basic (no advanced drag-and-drop)

-Signature field is a placeholder without real signing logic
