import AIInput from "./components/AIInput/AIInput";
import DynamicForm from "./components/DynamicForm/DynamicForm";

const fields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your name",
  },

  {
    name: "incidentType",
    label: "Incident Type",
    type: "select",
    required: true,
    options: [
      "Animal Collision",
      "Vehicle Collision",
      "Other",
    ],
  },

  {
    name: "animalType",
    label: "Animal Type",
    type: "select",
    required: true,
    options: [
      "Deer",
      "Dog",
      "Other",
    ],
    showIf: {
      incidentType: "Animal Collision",
    },
  },

  {
    name: "vehicleDetails",
    label: "Vehicle Details",
    type: "text",
    required: true,
    placeholder: "Enter vehicle details",
    showIf: {
      incidentType: "Vehicle Collision",
    },
  },

  {
    name: "description",
    label: "Incident Description",
    type: "textarea",
    required: true,
    placeholder: "Describe what happened...",
  },
];

function App() {
  return (
    <main>
      <h1>Forma AI</h1>

      <p>AI-Augmented Dynamic Form Engine</p>

      <AIInput />

      <hr />

      <h2>Incident Details</h2>

      <DynamicForm fields={fields} />
    </main>
  );
}

export default App;