// Twitter Events tracking utility
declare global {
  interface Window {
    twq?: (command: string, event: string, params: object) => void;
  }
}

export const trackTwitterEvent = () => {
  if (window.twq) {
    // Insert Twitter Event ID exactly as provided
    window.twq('event', 'tw-p4a38-p4a38', {});
  }
};
