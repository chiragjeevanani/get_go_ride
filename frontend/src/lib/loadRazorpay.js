/**
 * Dynamically injects the Razorpay Checkout script into the DOM.
 * Returns a Promise that resolves to true once loaded, or false if it fails.
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // If already loaded in window context, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
