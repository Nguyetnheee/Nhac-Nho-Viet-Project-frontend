// Utility functions for scroll behavior

export const scrollToTop = (smooth = true) => {
  window.scrollTo({ 
    top: 0, 
    behavior: smooth ? 'smooth' : 'instant' 
  });
};

export const scrollToElement = (elementId, smooth = true) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start'
    });
  }
};

export const scrollToTopWithDelay = (delay = 100) => {
  setTimeout(() => {
    scrollToTop(true);
  }, delay);
};
