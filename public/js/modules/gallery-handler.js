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
                            <button class="btn btn-sm btn-outline-primary mt-2" id="retry-gallery-btn">Reintentar</button>
                        </div>
                    `;
        
        // Add event listener to retry button
        const retryBtn = document.getElementById("retry-gallery-btn");
        if (retryBtn) {
          retryBtn.addEventListener("click", loadGallery);
        }
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
                            <button class="btn btn-sm btn-light download-media-btn" data-url="${
                              file.url
                            }" data-filename="${file.name}">
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
                            <button class="btn btn-sm btn-light download-media-btn" data-url="${
                              file.url
                            }" data-filename="${file.name}">
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
  
  // Add event listeners for download buttons
  const downloadButtons = galleryContainer.querySelectorAll(".download-media-btn");
  downloadButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the modal
      const url = button.getAttribute("data-url");
      const filename = button.getAttribute("data-filename");
      downloadMedia(url, filename);
    });
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
  const copyPromptBtn = document.getElementById("copy-prompt-btn");
  const modalPublicUrl = document.getElementById("modal-public-url");
  const copyUrlBtn = document.getElementById("copy-url-btn");
  const modalFileNumber = document.getElementById("modal-file-number");

  // Check if all required elements exist
  if (!modalImage || !modalVideo) {
    console.error("Modal elements not found in DOM");
    return;
  }

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
  if (modalPrompt) modalPrompt.textContent = file.prompt || "No prompt disponible";
  if (modalModel) modalModel.textContent = file.toolName || "Desconocido";
  if (modalDate) modalDate.textContent = new Date(file.timestamp).toLocaleString();
  if (modalCost) modalCost.textContent = file.cost ? `${file.cost.toFixed(4)}` : "N/A";
  if (modalFileNumber) modalFileNumber.textContent = file.fileNumber || "N/A";

  // Set download link
  if (downloadLink) {
    downloadLink.href = file.url;
    downloadLink.download = file.name;
  }

  // Set public URL
  if (modalPublicUrl) {
    // Crear la URL pública completa
    const publicUrl = `${window.location.origin}${file.url}`;
    modalPublicUrl.value = publicUrl;
  }

  // Update modal title to include file number
  const modalTitle = document.getElementById("imageDetailModalLabel");
  if (modalTitle) {
    modalTitle.textContent = `Archivo #${file.fileNumber || "N/A"}`;
  }

  // Add event listener to copy prompt button
  if (copyPromptBtn && file.prompt) {
    copyPromptBtn.onclick = function() {
      navigator.clipboard.writeText(file.prompt).then(() => {
        // Show success feedback
        const originalText = copyPromptBtn.innerHTML;
        copyPromptBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
          copyPromptBtn.innerHTML = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Error al copiar el prompt: ', err);
      });
    };
  }

  // Add event listener to copy URL button
  if (copyUrlBtn && modalPublicUrl) {
    copyUrlBtn.onclick = function() {
      const url = modalPublicUrl.value;
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          // Show success feedback
          const originalText = copyUrlBtn.innerHTML;
          copyUrlBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            copyUrlBtn.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Error al copiar la URL: ', err);
        });
      }
    };
  }

  // Show modal only if all required elements exist
  const modalElement = document.getElementById("imageDetailModal");
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
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