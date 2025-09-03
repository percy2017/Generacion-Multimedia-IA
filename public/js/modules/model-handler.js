// Función para cargar los modelos LLM
export function loadLLMModels() {
  const modelsContainer = document.getElementById("llm-models-container");
  if (!modelsContainer) return;

  // Clear the container
  modelsContainer.innerHTML = "";

  // Create model cards for each tool in TOOL_SCHEMAS
  if (typeof TOOL_SCHEMAS !== 'undefined' && TOOL_SCHEMAS.length > 0) {
    TOOL_SCHEMAS.forEach((tool) => {
      const modelCard = document.createElement("div");
      modelCard.className = "col-md-4 col-lg-3 mb-3";
      modelCard.innerHTML = `
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">
                                ${
                                  tool.logo
                                    ? `<img src="${tool.logo}" alt="${tool.name}" class="tool-logo">`
                                    : ""
                                }
                                ${tool.name}
                            </h5>
                            <p class="card-text flex-grow-1">${
                              tool.description
                            }</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="badge bg-primary">${
                                  tool.provider
                                }</span>
                                <small class="text-muted">ID: ${tool.id}</small>
                            </div>
                        </div>
                    </div>
                `;
      modelsContainer.appendChild(modelCard);
    });
  } else {
    modelsContainer.innerHTML = `
                <div class="col-12">
                    <div class="text-center text-muted py-5">
                        <i class="fas fa-robot fa-3x mb-3"></i>
                        <p>No se encontraron modelos disponibles.</p>
                    </div>
                </div>
            `;
  }
}