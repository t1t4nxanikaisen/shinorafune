const proxyWarmup = {
  proxyOnrenderUrl: import.meta.env.VITE_M3U8_PROXY_ONRENDER_URL,
  intervalId: null,
  hasInitialWarmup: false,

  // Check if proxy URL is available
  isProxyAvailable() {
    return this.proxyOnrenderUrl && this.proxyOnrenderUrl.trim() !== '' && this.proxyOnrenderUrl !== 'undefined';
  },

  // Make warm-up call
  async makeWarmupCall() {
    if (!this.isProxyAvailable()) return;
    
    try {
      await fetch(this.proxyOnrenderUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('M3U8 proxy warm-up call successful');
    } catch (error) {
      console.log('M3U8 proxy warm-up attempt');
    }
  },

  // Start periodic warm-up every 15 minutes
  startPeriodicWarmup() {
    if (!this.isProxyAvailable()) return;

    this.stopPeriodicWarmup();
    
    this.intervalId = setInterval(() => {
      console.log('Periodic M3U8 proxy warm-up...');
      this.makeWarmupCall();
    }, 15 * 60 * 1000);

    console.log('Started periodic M3U8 proxy warm-up every 15 minutes');
  },

  // Stop periodic warm-up
  stopPeriodicWarmup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  // Main warm-up logic
  async smartWarmup() {
    if (!this.isProxyAvailable()) return;

    const isWatchRoute = window.location.pathname.includes('/watch');

    // 1. Run on initial reload of page
    // 2. Run on /watch/* routes every 15mins (handled by periodic)
    if (!this.hasInitialWarmup || isWatchRoute) {
      console.log('Starting M3U8 proxy warm-up...');
      await this.makeWarmupCall();
      this.hasInitialWarmup = true;
    }

    // Start periodic warm-up for /watch/* routes
    if (isWatchRoute) {
      this.startPeriodicWarmup();
    } else {
      this.stopPeriodicWarmup();
    }
  },

  // Cleanup
  cleanup() {
    this.stopPeriodicWarmup();
  }
};

export default proxyWarmup;