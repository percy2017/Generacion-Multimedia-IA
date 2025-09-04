// Función para cargar estadísticas del usuario
export async function loadUserStats() {
  const statsContainer = document.getElementById("profile-stats-container");
  if (!statsContainer) return;

  // Mostrar indicador de carga
  statsContainer.innerHTML = `
    <div class="col-12">
      <div class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando estadísticas...</span>
        </div>
        <p class="mt-2">Cargando estadísticas...</p>
      </div>
    </div>
  `;

  try {
    // Obtener estadísticas del servidor
    const response = await fetch("/api/stats");
    if (!response.ok) {
      throw new Error(`Error al cargar estadísticas: ${response.status}`);
    }
    
    const stats = await response.json();
    
    // Renderizar estadísticas
    renderUserStats(stats);
  } catch (error) {
    console.error("Error al cargar estadísticas del usuario:", error);
    statsContainer.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
          <p>Error al cargar estadísticas. Por favor, inténtalo de nuevo.</p>
          <button class="btn btn-sm btn-outline-primary" id="retry-stats-btn">Reintentar</button>
        </div>
      </div>
    `;
    
    // Añadir event listener al botón de reintento
    const retryBtn = document.getElementById("retry-stats-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", loadUserStats);
    }
  }
}

// Función para renderizar estadísticas del usuario
function renderUserStats(stats) {
  const statsContainer = document.getElementById("profile-stats-container");
  if (!statsContainer) return;

  // Formatear la fecha de la última generación
  let lastGenerationText = "Nunca";
  if (stats.lastGeneration) {
    const date = new Date(stats.lastGeneration.timestamp);
    lastGenerationText = date.toLocaleString();
  }

  // Generar HTML para herramientas más usadas
  let toolsHtml = "";
  if (stats.toolsUsage && stats.toolsUsage.length > 0) {
    toolsHtml = `
      <ul class="list-group list-group-flush">
        ${stats.toolsUsage.map(tool => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${tool.toolName}</span>
            <span class="badge bg-primary rounded-pill">${tool.count}</span>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    toolsHtml = `
      <div class="text-center py-3">
        <p class="text-muted mb-0">No hay datos disponibles</p>
      </div>
    `;
  }

  // Renderizar estadísticas
  statsContainer.innerHTML = `
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-header">
          <h6 class="mb-0 fw-bold"><i class="fas fa-chart-bar me-2"></i>Estadísticas Generales</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-6 mb-3">
              <div class="text-center">
                <div class="stat-number">${stats.totalFiles}</div>
                <div class="stat-label">Archivos Generados</div>
              </div>
            </div>
            <div class="col-6 mb-3">
              <div class="text-center">
                <div class="stat-number">${stats.totalSpend.toFixed(4)}</div>
                <div class="stat-label">Gasto Total</div>
              </div>
            </div>
            <div class="col-12">
              <div class="text-center">
                <div class="stat-label mb-1">Última Generación</div>
                <div class="stat-text">${lastGenerationText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-header">
          <h6 class="mb-0 fw-bold"><i class="fas fa-robot me-2"></i>Herramientas Más Usadas</h6>
        </div>
        <div class="card-body p-0">
          ${toolsHtml}
        </div>
      </div>
    </div>
  `;
}

// Función para inicializar la pestaña de perfil
export function initProfileTab() {
  // Cargar estadísticas cuando se muestra la pestaña de perfil
  loadUserStats();
}