import { populateToolOptions, initDynamicUI } from './modules/dynamic-ui.js';
import { initGenerationForm } from './modules/form-handler.js';
import { initTabHandlers } from './modules/tab-handler.js';
import { initGalleryOnLoad } from './modules/gallery-handler.js';

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tool options
  populateToolOptions();
  
  // Initialize dynamic UI event listeners
  initDynamicUI();
  
  // Initialize form handlers
  initGenerationForm();
  
  // Initialize tab handlers
  initTabHandlers();
  
  // Initialize gallery on page load if it's the active tab
  initGalleryOnLoad();
});