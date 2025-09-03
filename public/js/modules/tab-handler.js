import { loadLLMModels } from './model-handler.js';
import { loadGallery } from './gallery-handler.js';

// Función para inicializar los event listeners de los tabs
export function initTabHandlers() {
  // Profile tab functionality
  const profileTab = document.getElementById("profile-tab");
  if (profileTab) {
    profileTab.addEventListener("shown.bs.tab", () => {
      // This event fires when the profile tab is shown
      // We could load additional profile data here if needed
      // La variable global USER_DATA es creada por el servidor en main.ejs
    });
  }

  // Models tab functionality
  const modelsTab = document.getElementById("models-tab");
  if (modelsTab) {
    modelsTab.addEventListener("shown.bs.tab", () => {
      // This event fires when the models tab is shown
      loadLLMModels();
    });
  }

  // Gallery tab functionality
  const galleryTab = document.getElementById("gallery-tab");
  if (galleryTab) {
    galleryTab.addEventListener("shown.bs.tab", () => {
      // This event fires when the gallery tab is shown
      loadGallery();
    });
  }
}