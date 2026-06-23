export const initIframeHeightListener = () => {
  let timeoutId;

  const sendHeightToParent = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    }, 100);
  };

  // Send height on load and resize
  window.addEventListener('load', sendHeightToParent);
  window.addEventListener('resize', sendHeightToParent);

  // Observe DOM changes
  const observer = new MutationObserver(() => {
    sendHeightToParent();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('load', sendHeightToParent);
    window.removeEventListener('resize', sendHeightToParent);
    observer.disconnect();
  };
};
