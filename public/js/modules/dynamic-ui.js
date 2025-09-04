// Función para poblar las opciones de herramientas
export function populateToolOptions() {
  const toolSelector = document.getElementById("tool-selector");
  if (!toolSelector) return;
  
  // Clear existing options except the first one (placeholder)
  while (toolSelector.options.length > 1) {
    toolSelector.remove(1);
  }

  // Verificar que TOOL_SCHEMAS esté definido y sea un array
  if (typeof TOOL_SCHEMAS !== 'undefined' && Array.isArray(TOOL_SCHEMAS)) {
    TOOL_SCHEMAS.forEach((tool) => {
      const option = document.createElement("option");
      option.value = tool.id;
      option.textContent = tool.name;
      toolSelector.appendChild(option);
    });
  } else {
    console.warn("TOOL_SCHEMAS no está definido o no es un array:", TOOL_SCHEMAS);
  }
}

// Función para obtener una herramienta por ID
export function getToolById(id) {
  if (typeof TOOL_SCHEMAS !== 'undefined') {
    return TOOL_SCHEMAS.find((tool) => tool.id === id);
  }
  return null;
}

// Función para generar UI dinámica basada en el esquema de la herramienta
export function generateDynamicUI(tool) {
  const dynamicUiContainer = document.getElementById("dynamic-ui-container");
  if (!dynamicUiContainer) return;
  
  // Clear previous UI
  dynamicUiContainer.innerHTML = "";

  // Create UI elements for each input in the tool schema
  tool.inputs.forEach((input) => {
    const element = createInputElement(input);
    if (element) {
      dynamicUiContainer.appendChild(element);
    }
  });
}

// Función para crear elementos de UI basados en el tipo de input
function createInputElement(input) {
  // Create a container div for the input
  const container = document.createElement("div");
  container.className = "dynamic-input-group mb-3";

  // Handle different input types
  switch (input.type) {
    case "textbox":
      // Create label
      const textboxLabel = document.createElement("label");
      textboxLabel.textContent = input.label;
      textboxLabel.className = "form-label";
      textboxLabel.setAttribute("for", input.name);

      // Create textarea or input based on lines
      let textboxElement;
      if (input.lines && input.lines > 1) {
        textboxElement = document.createElement("textarea");
        textboxElement.rows = input.lines;
      } else {
        textboxElement = document.createElement("input");
        textboxElement.type = "text";
      }

      textboxElement.className = "form-control";
      textboxElement.id = input.name;
      textboxElement.name = input.name;
      textboxElement.placeholder = input.placeholder || "";

      if (input.required) {
        textboxElement.required = true;
      }

      // Add to container
      container.appendChild(textboxLabel);
      container.appendChild(textboxElement);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      return container;

    case "number":
    case "stepper":
      // Create label
      const numberLabel = document.createElement("label");
      numberLabel.textContent = input.label;
      numberLabel.className = "form-label";
      numberLabel.setAttribute("for", input.name);

      // Create input
      const numberInput = document.createElement("input");
      numberInput.type = "number";
      numberInput.className = "form-control";
      numberInput.id = input.name;
      numberInput.name = input.name;
      numberInput.value = input.default !== undefined ? input.default : "";

      if (input.min !== undefined) {
        numberInput.min = input.min;
      }

      if (input.max !== undefined) {
        numberInput.max = input.max;
      }

      if (input.step !== undefined) {
        numberInput.step = input.step;
      }

      // Add to container
      container.appendChild(numberLabel);
      container.appendChild(numberInput);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      return container;

    case "button_group":
      // Create label
      const buttonGroupLabel = document.createElement("label");
      buttonGroupLabel.textContent = input.label;
      buttonGroupLabel.className = "form-label";

      // Create container for buttons
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "btn-group w-100";
      buttonContainer.role = "group";

      // Create hidden input to store selected value
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.id = input.name;
      hiddenInput.name = input.name;
      hiddenInput.value = input.default || "";

      // Create buttons
      input.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-outline-primary";
        button.textContent =
          typeof option === "string" ? option : option.label;
        button.dataset.value =
          typeof option === "string" ? option : option.value;

        // Set active class if this is the default option
        if (
          (typeof option === "string" ? option : option.value) ===
          input.default
        ) {
          button.classList.add("active");
          button.classList.remove("btn-outline-primary");
          button.classList.add("btn-primary");
        }

        // Add click event listener
        button.addEventListener("click", () => {
          // Update hidden input value
          hiddenInput.value = button.dataset.value;

          // Update button states
          const buttons = buttonContainer.querySelectorAll(".btn");
          buttons.forEach((btn) => {
            btn.classList.remove("active", "btn-primary");
            btn.classList.add("btn-outline-primary");
          });

          // Set this button as active
          button.classList.remove("btn-outline-primary");
          button.classList.add("btn-primary", "active");
        });

        buttonContainer.appendChild(button);
      });

      // Add to container
      container.appendChild(buttonGroupLabel);
      container.appendChild(hiddenInput);
      container.appendChild(buttonContainer);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      return container;

    case "group":
      // Create fieldset for group
      const fieldset = document.createElement("fieldset");
      fieldset.className = "border p-3 rounded";

      // Create legend for group label
      const legend = document.createElement("legend");
      legend.className = "w-auto px-2";
      legend.textContent = input.label;
      fieldset.appendChild(legend);

      // Process children
      input.children.forEach((child) => {
        const childElement = createInputElement(child);
        if (childElement) {
          fieldset.appendChild(childElement);
        }
      });

      return fieldset;

    case "image_upload":
      // Create label
      const imageLabel = document.createElement("label");
      imageLabel.textContent = input.label;
      imageLabel.className = "form-label";
      imageLabel.setAttribute("for", input.name);

      // Create file input
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.className = "form-control";
      fileInput.id = input.name;
      fileInput.name = input.name;
      fileInput.accept = "image/*";

      if (input.required) {
        fileInput.required = true;
      }

      // Create preview container
      const previewContainer = document.createElement("div");
      previewContainer.className = "mt-2";
      previewContainer.style.display = "none";

      const previewImage = document.createElement("img");
      previewImage.className = "img-thumbnail";
      previewImage.style.maxWidth = "200px";
      previewImage.style.maxHeight = "200px";
      previewContainer.appendChild(previewImage);

      // Add event listener for file selection
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else {
          previewContainer.style.display = "none";
        }
      });

      // Add to container
      container.appendChild(imageLabel);
      container.appendChild(fileInput);
      container.appendChild(previewContainer);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      // Add helper text if exists
      if (input.helper_text) {
        const helperText = document.createElement("div");
        helperText.className = "form-text";
        helperText.textContent = input.helper_text;
        container.appendChild(helperText);
      }

      return container;

    case "toggle":
      // Create label
      const toggleLabel = document.createElement("label");
      toggleLabel.textContent = input.label;
      toggleLabel.className = "form-label";

      // Create checkbox input
      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.className = "form-check-input";
      toggleInput.id = input.name;
      toggleInput.name = input.name;
      toggleInput.checked =
        input.default !== undefined ? input.default : false;

      // Create wrapper for toggle switch
      const toggleWrapper = document.createElement("div");
      toggleWrapper.className = "form-check form-switch";

      // Add to wrapper
      toggleWrapper.appendChild(toggleInput);
      toggleWrapper.appendChild(toggleLabel);

      // Add to container
      container.appendChild(toggleWrapper);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      return container;

    case "checkbox":
      // Create label
      const checkboxLabel = document.createElement("label");
      checkboxLabel.textContent = input.label;
      checkboxLabel.className = "form-label";

      // Create checkbox input
      const checkboxInput = document.createElement("input");
      checkboxInput.type = "checkbox";
      checkboxInput.className = "form-check-input";
      checkboxInput.id = input.name;
      checkboxInput.name = input.name;
      checkboxInput.checked =
        input.default !== undefined ? input.default : false;

      // Create wrapper for checkbox
      const checkboxWrapper = document.createElement("div");
      checkboxWrapper.className = "form-check";

      // Add to wrapper
      checkboxWrapper.appendChild(checkboxInput);
      checkboxWrapper.appendChild(checkboxLabel);

      // Add to container
      container.appendChild(checkboxWrapper);

      // Add description if exists
      if (input.description) {
        const description = document.createElement("div");
        description.className = "form-text text-muted";
        description.textContent = input.description;
        container.appendChild(description);
      }

      return container;

    default:
      // For unsupported types, create a simple text input
      console.warn(`Unsupported input type: ${input.type}`);
      const defaultLabel = document.createElement("label");
      defaultLabel.textContent = input.label;
      defaultLabel.className = "form-label";
      defaultLabel.setAttribute("for", input.name);

      const defaultInput = document.createElement("input");
      defaultInput.type = "text";
      defaultInput.className = "form-control";
      defaultInput.id = input.name;
      defaultInput.name = input.name;
      defaultInput.placeholder = `Unsupported type: ${input.type}`;

      container.appendChild(defaultLabel);
      container.appendChild(defaultInput);

      return container;
  }
}

// Función para inicializar los event listeners de la UI dinámica
export function initDynamicUI() {
  const toolSelector = document.getElementById("tool-selector");
  const toolDescription = document.getElementById("tool-description");
  const generateBtn = document.getElementById("generate-btn");
  
  if (!toolSelector || !toolDescription || !generateBtn) return;
  
  // Event listener for tool selection changes
  toolSelector.addEventListener("change", (event) => {
    const selectedToolId = event.target.value;
    const selectedTool = getToolById(selectedToolId);

    if (selectedTool) {
      // Update tool description
      toolDescription.textContent = selectedTool.description;

      // Generate dynamic UI
      generateDynamicUI(selectedTool);

      // Enable generate button
      generateBtn.disabled = false;
    } else {
      // Clear description and UI if no tool is selected
      toolDescription.textContent = "";
      const dynamicUiContainer = document.getElementById("dynamic-ui-container");
      if (dynamicUiContainer) {
        dynamicUiContainer.innerHTML =
          '<div class="text-center text-muted mt-5"><p>Selecciona una herramienta para configurar las opciones.</p></div>';
      }
      generateBtn.disabled = true;
    }
  });
}