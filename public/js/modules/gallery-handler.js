// Función para cargar los elementos de la galería
export function loadGallery() {
  // For now, we'll just show a placeholder message
  // In the future, this will load actual media files
  const galleryContainer = document.getElementById("media-gallery");
  if (galleryContainer) {
    galleryContainer.innerHTML = `
                <div class="text-center text-muted w-100">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando galería...</p>
                </div>
            `;

    // Load media files from server
    fetch("/api/media")
      .then((response) => response.json())
      .then((data) => {
        if (data.media && data.media.length > 0) {
          renderMediaGallery(data.media);
        } else {
          galleryContainer.innerHTML = `
                            <div class="text-center text-muted w-100">
                                <i class="fas fa-images fa-3x mb-3"></i>
                                <p>No hay elementos en la galería todavía.</p>
                                <p class="small">Genera algunas imágenes o videos para verlos aquí.</p>
                            </div>
                        `;
        }
      })
      .catch((error) => {
        console.error("Error loading gallery:", error);
        galleryContainer.innerHTML = `
                        <div class="text-center text-muted w-100">
                            <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                            <p>Error al cargar la galería.</p>
                            <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadGallery()">Reintentar</button>
                        </div>
                    `;
      });
  }
}

// Función para renderizar la galería de medios
function renderMediaGallery(mediaFiles) {
  const galleryContainer = document.getElementById("media-gallery");
  if (!galleryContainer) return;

  galleryContainer.innerHTML = "";

  mediaFiles.forEach((file) => {
    const mediaItem = document.createElement("div");
    mediaItem.className = "media-item";

    // Determine if it's an image or video based on extension
    const isVideo =
      file.name.endsWith(".mp4") ||
      file.name.endsWith(".webm") ||
      file.name.endsWith(".mov");

    if (isVideo) {
      mediaItem.innerHTML = `
                    <video src="${file.url}" class="img-fluid" muted></video>
                    <div class="media-overlay">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="small">${
                              file.fileNumber || file.name
                            }</span>
                            <button class="btn btn-sm btn-light" onclick="downloadMedia('${
                              file.url
                            }', '${file.name}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                        <div class="small mt-1">Generado: ${new Date(
                          file.timestamp
                        ).toLocaleString()}</div>
                        <div class="small">Key: ${file.keyName || "N/A"}</div>
                    </div>
                `;
    } else {
      mediaItem.innerHTML = `
                    <img src="${file.url}" class="img-fluid" alt="${file.name}">
                    <div class="media-overlay">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="small">${
                              file.fileNumber || file.name
                            }</span>
                            <button class="btn btn-sm btn-light" onclick="downloadMedia('${
                              file.url
                            }', '${file.name}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                        <div class="small mt-1">Generado: ${new Date(
                          file.timestamp
                        ).toLocaleString()}</div>
                        <div class="small">Key: ${file.keyName || "N/A"}</div>
                    </div>
                `;
    }

    // Add click event to show in modal
    mediaItem.addEventListener("click", () => {
      showMediaInModal(file);
    });

    galleryContainer.appendChild(mediaItem);
  });
}

// Función para mostrar medios en el modal
function showMediaInModal(file) {
  const modalImage = document.getElementById("modal-image");
  const modalVideo = document.getElementById("modal-video");
  const modalPrompt = document.getElementById("modal-prompt");
  const modalModel = document.getElementById("modal-model");
  const modalDate = document.getElementById("modal-date");
  const modalCost = document.getElementById("modal-cost");
  const downloadLink = document.getElementById("download-link");

  // Hide both image and video elements
  modalImage.style.display = "none";
  modalVideo.style.display = "none";

  // Determine if it's an image or video
  const isVideo =
    file.name.endsWith(".mp4") ||
    file.name.endsWith(".webm") ||
    file.name.endsWith(".mov");

  if (isVideo) {
    modalVideo.src = file.url;
    modalVideo.style.display = "block";
  } else {
    modalImage.src = file.url;
    modalImage.style.display = "block";
  }

  // Set modal content
  modalPrompt.textContent = file.prompt || "No prompt disponible";
  modalModel.textContent = file.toolName || file.keyName || "Desconocido";
  modalDate.textContent = new Date(file.timestamp).toLocaleString();
  modalCost.textContent = file.cost ? `${file.cost.toFixed(4)}` : "N/A";

  // Set download link
  downloadLink.href = file.url;
  downloadLink.download = file.name;

  // Update modal title to include file number
  const modalTitle = document.getElementById("imageDetailModalLabel");
  if (modalTitle) {
    modalTitle.textContent = `Archivo #${file.fileNumber || "N/A"}`;
  }

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("imageDetailModal")
  );
  modal.show();
}

// Función para descargar medios
export function downloadMedia(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función para inicializar la galería si es el tab activo al cargar la página
export function initGalleryOnLoad() {
  const activeTab = document.querySelector(".nav-tabs .nav-link.active");
  if (activeTab && activeTab.id === "gallery-tab") {
    loadGallery();
  }
}