
(function () {
  /* =========================================================
     AD NETWORK CONFIGURATION
     ========================================================= */

  // true  = Enable this network
  // false = Completely ignore this network

  const ENABLE_ADEXIUM = true;
  const ENABLE_RICHADS = true;
  const ENABLE_MONETAG = true;
  const ENABLE_ADSGRAM = true;


  /* =========================================================
     ADEXIUM CONFIG
     ========================================================= */

  const ADEXIUM_WID = "6cc505fa-0056-49d4-80cc-42dea0b37cb6";
  const ADEXIUM_SDK_SRC =
    "https://cdn.tgads.space/assets/js/adexium-widget.min.js";


  /* =========================================================
     RICHADS CONFIG
     ========================================================= */

  const RICHADS_SDK_SRC =
    "https://richinfo.co/richpartners/telegram/js/tg-ob.js";

  const RICHADS_PUB_ID = "1002945";
  const RICHADS_APP_ID = "6335";


  /* =========================================================
     MONETAG CONFIG
     ========================================================= */

  const MONETAG_ZONE_ID = "11118432";

  const MONETAG_SDK_SRC = "//libtl.com/sdk.js";

  const MONETAG_FN = "show_" + MONETAG_ZONE_ID;


  /* =========================================================
     ADSGRAM CONFIG
     ========================================================= */

  const ADSGRAM_SDK_SRC =
    "https://sad.adsgram.ai/js/sad.min.js";

  // IMPORTANT:
  // Replace this with your real AdsGram blockId
  const ADSGRAM_BLOCK_ID = "42012";


  /* =========================================================
     LOAD ADEXIUM SDK
     ========================================================= */

  function loadAdexiumSDK() {
    if (!ENABLE_ADEXIUM) {
      return Promise.resolve();
    }

    if (window.__adexiumSDK) {
      return window.__adexiumSDK;
    }

    window.__adexiumSDK = new Promise((resolve, reject) => {
      if (
        document.querySelector(
          `script[src="${ADEXIUM_SDK_SRC}"]`
        )
      ) {
        return resolve();
      }

      const s = document.createElement("script");

      s.src = ADEXIUM_SDK_SRC;
      s.async = true;

      s.onload = resolve;

      s.onerror = () =>
        reject(new Error("Adexium SDK load failed"));

      document.head.appendChild(s);
    });

    return window.__adexiumSDK;
  }


  /* =========================================================
     LOAD RICHADS SDK
     ========================================================= */

  function loadRichAdsSDK() {
    if (!ENABLE_RICHADS) {
      return Promise.resolve();
    }

    if (window.__richAdsSDK) {
      return window.__richAdsSDK;
    }

    window.__richAdsSDK = new Promise((resolve, reject) => {
      if (window.TelegramAdsController) {
        return resolve();
      }

      const s = document.createElement("script");

      s.src = RICHADS_SDK_SRC;
      s.async = true;

      s.onload = () => {
        try {
          window.TelegramAdsController =
            new TelegramAdsController();

          window.TelegramAdsController.initialize({
            pubId: RICHADS_PUB_ID,
            appId: RICHADS_APP_ID,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      s.onerror = () =>
        reject(new Error("RichAds SDK load failed"));

      document.head.appendChild(s);
    });

    return window.__richAdsSDK;
  }


  /* =========================================================
     LOAD MONETAG SDK
     ========================================================= */

  function loadMonetagSDK() {
    if (!ENABLE_MONETAG) {
      return Promise.resolve();
    }

    if (window.__monetagSDK) {
      return window.__monetagSDK;
    }

    window.__monetagSDK = new Promise((resolve, reject) => {
      if (
        document.querySelector(
          `script[src="${MONETAG_SDK_SRC}"]`
        )
      ) {
        return resolve();
      }

      const s = document.createElement("script");

      s.src = MONETAG_SDK_SRC;
      s.async = true;

      s.setAttribute("data-zone", MONETAG_ZONE_ID);
      s.setAttribute("data-sdk", MONETAG_FN);

      s.onload = resolve;

      s.onerror = () =>
        reject(new Error("Monetag SDK load failed"));

      document.head.appendChild(s);
    });

    return window.__monetagSDK;
  }


  /* =========================================================
     LOAD ADSGRAM SDK
     ========================================================= */

  function loadAdsGramSDK() {
    if (!ENABLE_ADSGRAM) {
      return Promise.resolve();
    }

    if (window.__adsGramSDK) {
      return window.__adsGramSDK;
    }

    window.__adsGramSDK = new Promise((resolve, reject) => {

      // Already loaded
      if (window.Adsgram) {
        return resolve();
      }

      const existingScript = document.querySelector(
        `script[src="${ADSGRAM_SDK_SRC}"]`
      );

      if (existingScript) {

        existingScript.addEventListener("load", () => {
          resolve();
        });

        existingScript.addEventListener("error", () => {
          reject(
            new Error("AdsGram SDK load failed")
          );
        });

        return;
      }

      const s = document.createElement("script");

      s.src = ADSGRAM_SDK_SRC;
      s.async = true;

      s.onload = () => {
        if (window.Adsgram) {
          resolve();
        } else {
          reject(
            new Error("AdsGram SDK loaded but Adsgram is unavailable")
          );
        }
      };

      s.onerror = () =>
        reject(new Error("AdsGram SDK load failed"));

      document.head.appendChild(s);
    });

    return window.__adsGramSDK;
  }


  /* =========================================================
     SHOW ADEXIUM AD
     ========================================================= */

  function showAdexiumAd() {

    if (!ENABLE_ADEXIUM) {
      return Promise.reject("Adexium disabled");
    }

    return new Promise((resolve, reject) => {

      loadAdexiumSDK()
        .then(() => {

          try {

            const ad = new AdexiumWidget({
              wid: ADEXIUM_WID,
              adFormat: "interstitial",
            });

            ad.on("adReceived", (a) => {
              ad.displayAd(a);
            });

            ad.on("noAdFound", () => {
              reject("Adexium no ad");
            });

            ad.on("adClosed", () => {
              resolve({
                network: "adexium",
                event: "closed",
              });
            });

            ad.on("adRedirected", () => {
              resolve({
                network: "adexium",
                event: "redirected",
              });
            });

            ad.requestAd("interstitial");

          } catch (error) {
            reject(error);
          }

        })
        .catch(reject);
    });
  }


  /* =========================================================
     SHOW RICHADS NATIVE
     ========================================================= */

  function showRichAdsNative() {

    if (!ENABLE_RICHADS) {
      return Promise.reject("RichAds disabled");
    }

    return new Promise((resolve, reject) => {

      loadRichAdsSDK()
        .then(() => {

          if (!window.TelegramAdsController) {
            return reject(
              new Error("RichAds controller unavailable")
            );
          }

          window.TelegramAdsController
            .triggerNativeNotification(true)

            .then((r) => {
              resolve({
                network: "richads_native",
                result: r,
              });
            })

            .catch(reject);

        })

        .catch(reject);
    });
  }


  /* =========================================================
     SHOW RICHADS INTERSTITIAL
     ========================================================= */

  function showRichAdsInterstitial() {

    if (!ENABLE_RICHADS) {
      return Promise.reject("RichAds disabled");
    }

    return new Promise((resolve, reject) => {

      loadRichAdsSDK()
        .then(() => {

          if (!window.TelegramAdsController) {
            return reject(
              new Error("RichAds controller unavailable")
            );
          }

          window.TelegramAdsController
            .triggerInterstitialBanner(true)

            .then((r) => {
              resolve({
                network: "richads_interstitial",
                result: r,
              });
            })

            .catch(reject);

        })

        .catch(reject);
    });
  }


  /* =========================================================
     SHOW MONETAG AD
     ========================================================= */

  function showMonetagAd() {

    if (!ENABLE_MONETAG) {
      return Promise.reject("Monetag disabled");
    }

    return new Promise((resolve, reject) => {

      loadMonetagSDK()
        .then(() => {

          let t = 0;

          const iv = setInterval(() => {

            t++;

            if (
              typeof window[MONETAG_FN] === "function"
            ) {

              clearInterval(iv);

              window[MONETAG_FN]()

                .then((r) => {

                  resolve({
                    network: "monetag",
                    result: r,
                  });

                })

                .catch(reject);

            }

            else if (t > 50) {

              clearInterval(iv);

              reject("Monetag timeout");
            }

          }, 100);

        })

        .catch(reject);
    });
  }


  /* =========================================================
     SHOW ADSGRAM AD
     ========================================================= */

  function showAdsGramAd() {

    if (!ENABLE_ADSGRAM) {
      return Promise.reject("AdsGram disabled");
    }

    return new Promise((resolve, reject) => {

      loadAdsGramSDK()

        .then(() => {

          try {

            if (!window.Adsgram) {
              return reject(
                new Error("AdsGram is unavailable")
              );
            }

            if (
              !ADSGRAM_BLOCK_ID ||
              ADSGRAM_BLOCK_ID === "YOUR_ADSGRAM_BLOCK_ID"
            ) {
              return reject(
                new Error("AdsGram blockId is not configured")
              );
            }

            const AdController =
              window.Adsgram.init({
                blockId: ADSGRAM_BLOCK_ID,
              });

            if (!AdController) {
              return reject(
                new Error("AdsGram controller initialization failed")
              );
            }

            AdController
              .show()

              .then((result) => {

                resolve({
                  network: "adsgram",
                  result: result,
                });

              })

              .catch((error) => {

                reject(error);

              });

          } catch (error) {
            reject(error);
          }

        })

        .catch(reject);
    });
  }


  /* =========================================================
     PRELOAD ENABLED SDKs ONLY
     ========================================================= */

  if (ENABLE_ADEXIUM) {
    loadAdexiumSDK().catch(() => {});
  }

  if (ENABLE_RICHADS) {
    loadRichAdsSDK().catch(() => {});
  }

  if (ENABLE_MONETAG) {
    loadMonetagSDK().catch(() => {});
  }

  if (ENABLE_ADSGRAM) {
    loadAdsGramSDK().catch(() => {});
  }


  /* =========================================================
     GLOBAL API
     ========================================================= */

  window.showAdsmone = function () {

    return new Promise(async (resolve, reject) => {

      const results = {

        success: false,

        adexium: null,

        richads_native: null,

        richads_interstitial: null,

        monetag: null,

        adsgram: null,

      };


      /* =====================================================
         ADEXIUM
         ===================================================== */

      if (ENABLE_ADEXIUM) {

        try {

          results.adexium =
            await showAdexiumAd();

        } catch (e) {

          // Ignore failed network

        }
      }


      /* =====================================================
         RICHADS NATIVE
         ===================================================== */

      if (ENABLE_RICHADS) {

        try {

          results.richads_native =
            await showRichAdsNative();

        } catch (e) {

          // Ignore failed network

        }
      }


      /* =====================================================
         RICHADS INTERSTITIAL
         ===================================================== */

      if (ENABLE_RICHADS) {

        try {

          results.richads_interstitial =
            await showRichAdsInterstitial();

        } catch (e) {

          // Ignore failed network

        }
      }


      /* =====================================================
         MONETAG
         ===================================================== */

      if (ENABLE_MONETAG) {

        try {

          results.monetag =
            await showMonetagAd();

        } catch (e) {

          // Ignore failed network

        }
      }


      /* =====================================================
         ADSGRAM
         ===================================================== */

      if (ENABLE_ADSGRAM) {

        try {

          results.adsgram =
            await showAdsGramAd();

        } catch (e) {

          // Ignore failed network

        }
      }


      /* =====================================================
         SUCCESS CHECK
         ===================================================== */

      if (
        results.adexium ||
        results.richads_native ||
        results.richads_interstitial ||
        results.monetag ||
        results.adsgram
      ) {

        results.success = true;

        resolve(results);

      } else {

        reject("All enabled ad networks failed");

      }

    });

  };


  /* =========================================================
     OPTIONAL: GET CURRENT NETWORK STATUS
     ========================================================= */

  window.getAdNetworkStatus = function () {

    return {

      adexium: ENABLE_ADEXIUM,

      richads: ENABLE_RICHADS,

      monetag: ENABLE_MONETAG,

      adsgram: ENABLE_ADSGRAM,

    };

  };


})();

