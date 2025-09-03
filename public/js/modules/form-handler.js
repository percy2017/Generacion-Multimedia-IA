import { getToolById } from './dynamic-ui.js';

// Variables globales
const USER_DATA = window.USER_DATA || {};

// Función para manejar el envío del formulario de generación
export function handleGenerationFormSubmit(event) {
  event.preventDefault();
  
  const toolSelector = document.getElementById("tool-selector");
  const generateBtn = document.getElementById("generate-btn");
  const generationForm = document.getElementById("generation-form");
  
  if (!toolSelector || !generateBtn || !generationForm) return;

  // Get selected tool
  const selectedToolId = toolSelector.value;
  const selectedTool = getToolById(selectedToolId);

  if (!selectedTool) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, selecciona una herramienta válida.",
    });
    return;
  }

  // Collect form data
  const formData = new FormData(generationForm);
  const toolInputs = {};

  // Process form data based on tool schema
  selectedTool.inputs.forEach((input) => {
    if (input.type === "group" && input.children) {
      // Process group children
      input.children.forEach((child) => {
        if (child.type === "image_upload") {
          // Handle file uploads specially
          const fileInput = document.getElementById(child.name);
          if (fileInput && fileInput.files.length > 0) {
            toolInputs[child.name] = fileInput.files[0];
          }
        } else {
          toolInputs[child.name] = formData.get(child.name);
        }
      });
    } else if (input.type === "image_upload") {
      // Handle file uploads specially
      const fileInput = document.getElementById(input.name);
      if (fileInput && fileInput.files.length > 0) {
        toolInputs[input.name] = fileInput.files[0];
      }
    } else {
      toolInputs[input.name] = formData.get(input.name);
    }
  });

  // Show loading state
  const originalBtnText = generateBtn.innerHTML;
  generateBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generando...';
  generateBtn.disabled = true;

  // Send request to backend
  sendGenerationRequest(selectedToolId, toolInputs)
    .then(result => {
      // Show success message
      Swal.fire({
        icon: "success",
        title: "¡Generación completada!",
        text: "El contenido se ha generado exitosamente.",
        showConfirmButton: false,
        timer: 1500,
      });

      // Update user balance display
      if (result.userSpend !== undefined) {
        const userBalanceElement = document.getElementById("user-balance");
        if (userBalanceElement) {
          const budgetDisplay =
            result.userBudget !== undefined
              ? result.userBudget
                ? result.userBudget.toFixed(2)
                : "∞"
              : USER_DATA.budget
              ? USER_DATA.budget.toFixed(2)
              : "∞";
          userBalanceElement.textContent = `${result.userSpend.toFixed(
            4
          )} / ${budgetDisplay}`;
        }
      }

      // Display generated media
      const imageResultWrapper = document.getElementById(
        "image-result-wrapper"
      );
      if (imageResultWrapper) {
        if (result.mediaType === "image") {
          imageResultWrapper.innerHTML = `<img src="${result.mediaUrl}" class="img-fluid rounded" alt="Resultado generado">`;
        } else if (result.mediaType === "video") {
          imageResultWrapper.innerHTML = `<video src="${result.mediaUrl}" class="img-fluid rounded" controls></video>`;
        }
      }
    })
    .catch(error => {
      console.error("Error en la generación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Ocurrió un error durante la generación. Por favor, inténtalo de nuevo.",
      });
    })
    .finally(() => {
      // Restore button state
      generateBtn.innerHTML = originalBtnText;
      generateBtn.disabled = false;
    });
}

// Función para enviar la solicitud de generación al backend
async function sendGenerationRequest(toolId, inputs) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      toolId: toolId,
      inputs: inputs,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error en la generación");
  }

  return result;
}

// Función para inicializar el event listener del formulario
export function initGenerationForm() {
  const generationForm = document.getElementById("generation-form");
  if (generationForm) {
    generationForm.addEventListener("submit", handleGenerationFormSubmit);
  }
}