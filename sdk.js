(function () {

  /* =========================================================
     NETWORK ENABLE / DISABLE
     ========================================================= */

  const ENABLE_ADEXIUM = true;
  const ENABLE_RICHADS = true;
  const ENABLE_MONETAG = true;
  const ENABLE_ADSGRAM = true;
  const ENABLE_ONCLICKA = true;


  /* =========================================================
     EXTRA WAIT CONFIGURATION
     ========================================================= */

  /*
   * এই সময়গুলো provider-এর response পাওয়ার পর
   * আমাদের SDK আরও অপেক্ষা করবে।
   *
   * Monetag = 0
   */

  const ADEXIUM_EXTRA_WAIT_MS = 10000;

  const RICHADS_NATIVE_EXTRA_WAIT_MS = 10000;

  const RICHADS_INTERSTITIAL_EXTRA_WAIT_MS = 10000;

  const ADSGRAM_EXTRA_WAIT_MS = 10000;

  /*
   * OnClicka বেশি সময় নেয় বলে 20 seconds রাখা হয়েছে।
   */

  const ONCLICKA_EXTRA_WAIT_MS = 20000;


  /* =========================================================
     SDK LOAD TIMEOUT
     ========================================================= */

  const ADEXIUM_LOAD_TIMEOUT_MS = 30000;

  const RICHADS_LOAD_TIMEOUT_MS = 30000;

  const MONETAG_LOAD_TIMEOUT_MS = 15000;

  const ADSGRAM_LOAD_TIMEOUT_MS = 30000;

  /*
   * OnClicka-এর জন্য বেশি timeout।
   */

  const ONCLICKA_LOAD_TIMEOUT_MS = 60000;


  /* =========================================================
     ADEXIUM CONFIG
     ========================================================= */

  const ADEXIUM_WID =
    "6cc505fa-0056-49d4-80cc-42dea0b37cb6";

  const ADEXIUM_SDK_SRC =
    "https://cdn.tgads.space/assets/js/adexium-widget.min.js";


  /* =========================================================
     RICHADS CONFIG
     ========================================================= */

  const RICHADS_SDK_SRC =
    "https://richinfo.co/richpartners/telegram/js/tg-ob.js";

  const RICHADS_PUB_ID =
    "1002945";

  const RICHADS_APP_ID =
    "6335";


  /* =========================================================
     MONETAG CONFIG
     ========================================================= */

  const MONETAG_ZONE_ID =
    "11118432";

  const MONETAG_SDK_SRC =
    "//libtl.com/sdk.js";

  const MONETAG_FN =
    "show_" + MONETAG_ZONE_ID;


  /* =========================================================
     ADSGRAM CONFIG
     ========================================================= */

  const ADSGRAM_SDK_SRC =
    "https://sad.adsgram.ai/js/sad.min.js";


  /*
   * IMPORTANT:
   *
   * এখানে আপনার REAL AdsGram blockId বসাবেন।
   *
   * Example:
   *
   * const ADSGRAM_BLOCK_ID = "123456";
   */

  const ADSGRAM_BLOCK_ID =
    "YOUR_ADSGRAM_BLOCK_ID";


  /* =========================================================
     ONCLICKA CONFIG
     ========================================================= */

  const ONCLICKA_SPOT_ID =
    "6104578";

  const ONCLICKA_SDK_SRC =
    "https://js.onclckvd.com/in-stream-ad-admanager/tma.js";


  /* =========================================================
     COMMON DELAY FUNCTION
     ========================================================= */

  function delay(ms) {

    return new Promise(function (resolve) {

      setTimeout(
        resolve,
        ms
      );

    });

  }


  /* =========================================================
     LOAD SCRIPT
     ========================================================= */

  function loadScript(
    src,
    checkFunction,
    timeoutMs,
    errorMessage
  ) {

    return new Promise(function (resolve, reject) {

      /*
       * Already available
       */

      if (
        typeof checkFunction === "function" &&
        checkFunction()
      ) {

        resolve();

        return;

      }


      /*
       * Check if script already exists
       */

      let script =
        document.querySelector(
          `script[src="${src}"]`
        );


      let completed = false;


      const timeout =
        setTimeout(function () {

          if (completed) {
            return;
          }

          completed = true;

          reject(
            new Error(
              errorMessage +
              " - timeout"
            )
          );

        }, timeoutMs);


      function finishSuccess() {

        if (completed) {
          return;
        }

        completed = true;

        clearTimeout(timeout);

        resolve();

      }


      function finishError(error) {

        if (completed) {
          return;
        }

        completed = true;

        clearTimeout(timeout);

        reject(error);

      }


      /*
       * Existing script
       */

      if (script) {

        let attempts = 0;


        const interval =
          setInterval(function () {

            attempts++;


            if (
              typeof checkFunction !== "function" ||
              checkFunction()
            ) {

              clearInterval(interval);

              finishSuccess();

              return;

            }


            if (
              attempts >=
              Math.ceil(
                timeoutMs / 100
              )
            ) {

              clearInterval(interval);

              finishError(
                new Error(
                  errorMessage
                )
              );

            }

          }, 100);


        script.addEventListener(
          "error",
          function () {

            clearInterval(interval);

            finishError(
              new Error(
                errorMessage
              )
            );

          },
          {
            once: true
          }
        );


        return;

      }


      /*
       * Create new script
       */

      script =
        document.createElement("script");


      script.src =
        src;

      script.async =
        true;


      script.onload =
        function () {

          let attempts = 0;


          /*
           * Some SDKs expose their global
           * slightly after script.onload.
           */

          const interval =
            setInterval(function () {

              attempts++;


              if (
                typeof checkFunction !== "function" ||
                checkFunction()
              ) {

                clearInterval(interval);

                finishSuccess();

                return;

              }


              if (
                attempts >=
                Math.ceil(
                  timeoutMs / 100
                )
              ) {

                clearInterval(interval);

                finishError(
                  new Error(
                    errorMessage
                  )
                );

              }

            }, 100);

        };


      script.onerror =
        function () {

          finishError(
            new Error(
              errorMessage
            )
          );

        };


      document.head.appendChild(
        script
      );

    });

  }


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


    window.__adexiumSDK =
      loadScript(

        ADEXIUM_SDK_SRC,

        function () {

          return (
            typeof window.AdexiumWidget ===
            "function"
          );

        },

        ADEXIUM_LOAD_TIMEOUT_MS,

        "Adexium SDK load failed"

      );


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


    window.__richAdsSDK =
      loadScript(

        RICHADS_SDK_SRC,

        function () {

          return (
            typeof window.TelegramAdsController !==
            "undefined"
          );

        },

        RICHADS_LOAD_TIMEOUT_MS,

        "RichAds SDK load failed"

      )
      .then(function () {

        /*
         * Initialize controller only once.
         */

        if (
          !window.TelegramAdsController
        ) {

          window.TelegramAdsController =
            new TelegramAdsController();

        }


        /*
         * Initialize RichAds
         */

        window.TelegramAdsController.initialize({

          pubId:
            RICHADS_PUB_ID,

          appId:
            RICHADS_APP_ID

        });

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


    window.__monetagSDK =
      loadScript(

        MONETAG_SDK_SRC,

        function () {

          return (
            typeof window[
              MONETAG_FN
            ] === "function"
          );

        },

        MONETAG_LOAD_TIMEOUT_MS,

        "Monetag SDK load failed"

      );


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


    window.__adsGramSDK =
      loadScript(

        ADSGRAM_SDK_SRC,

        function () {

          return (
            typeof window.Adsgram !==
            "undefined"
          );

        },

        ADSGRAM_LOAD_TIMEOUT_MS,

        "AdsGram SDK load failed"

      );


    return window.__adsGramSDK;

  }


  /* =========================================================
     LOAD ONCLICKA SDK
     ========================================================= */

  function loadOnClickaSDK() {

    if (!ENABLE_ONCLICKA) {

      return Promise.resolve();

    }


    if (window.__onclickaSDK) {

      return window.__onclickaSDK;

    }


    window.__onclickaSDK =
      loadScript(

        ONCLICKA_SDK_SRC,

        function () {

          return (
            typeof window.initCdTma ===
            "function"
          );

        },

        ONCLICKA_LOAD_TIMEOUT_MS,

        "OnClicka SDK load failed"

      );


    return window.__onclickaSDK;

  }


  /* =========================================================
     SHOW ADEXIUM
     ========================================================= */

  function showAdexiumAd() {

    if (!ENABLE_ADEXIUM) {

      return Promise.reject(
        "Adexium disabled"
      );

    }


    return loadAdexiumSDK()

      .then(function () {

        return new Promise(
          function (resolve, reject) {

            let settled =
              false;


            try {

              const ad =
                new AdexiumWidget({

                  wid:
                    ADEXIUM_WID,

                  adFormat:
                    "interstitial"

                });


              /*
               * Ad received
               */

              ad.on(
                "adReceived",
                function (a) {

                  try {

                    ad.displayAd(a);

                  }

                  catch (error) {

                    if (!settled) {

                      settled = true;

                      reject(error);

                    }

                  }

                }
              );


              /*
               * No ad
               */

              ad.on(
                "noAdFound",
                function () {

                  if (settled) {
                    return;
                  }

                  settled = true;

                  reject(
                    "Adexium no ad"
                  );

                }
              );


              /*
               * Ad closed
               */

              ad.on(
                "adClosed",
                function () {

                  if (settled) {
                    return;
                  }

                  settled = true;


                  /*
                   * Extra wait
                   */

                  delay(
                    ADEXIUM_EXTRA_WAIT_MS
                  )
                  .then(function () {

                    resolve({

                      network:
                        "adexium",

                      event:
                        "closed",

                      completed:
                        true

                    });

                  });

                }
              );


              /*
               * Redirect
               */

              ad.on(
                "adRedirected",
                function () {

                  if (settled) {
                    return;
                  }

                  settled = true;


                  delay(
                    ADEXIUM_EXTRA_WAIT_MS
                  )
                  .then(function () {

                    resolve({

                      network:
                        "adexium",

                      event:
                        "redirected",

                      completed:
                        true

                    });

                  });

                }
              );


              /*
               * Request ad
               */

              ad.requestAd(
                "interstitial"
              );

            }

            catch (error) {

              if (!settled) {

                settled = true;

                reject(error);

              }

            }

          }
        );

      });

  }


  /* =========================================================
     SHOW RICHADS NATIVE
     ========================================================= */

  function showRichAdsNative() {

    if (!ENABLE_RICHADS) {

      return Promise.reject(
        "RichAds disabled"
      );

    }


    return loadRichAdsSDK()

      .then(function () {

        if (
          !window.TelegramAdsController
        ) {

          throw new Error(
            "RichAds controller unavailable"
          );

        }


        return window.TelegramAdsController
          .triggerNativeNotification(true);

      })

      .then(function (result) {

        /*
         * Extra wait for RichAds.
         */

        return delay(
          RICHADS_NATIVE_EXTRA_WAIT_MS
        )
        .then(function () {

          return {

            network:
              "richads_native",

            event:
              "resolved",

            completed:
              false,

            result:
              result

          };

        });

      });

  }


  /* =========================================================
     SHOW RICHADS INTERSTITIAL
     ========================================================= */

  function showRichAdsInterstitial() {

    if (!ENABLE_RICHADS) {

      return Promise.reject(
        "RichAds disabled"
      );

    }


    return loadRichAdsSDK()

      .then(function () {

        if (
          !window.TelegramAdsController
        ) {

          throw new Error(
            "RichAds controller unavailable"
          );

        }


        return window.TelegramAdsController
          .triggerInterstitialBanner(true);

      })

      .then(function (result) {

        /*
         * Extra wait for RichAds.
         */

        return delay(
          RICHADS_INTERSTITIAL_EXTRA_WAIT_MS
        )
        .then(function () {

          return {

            network:
              "richads_interstitial",

            event:
              "resolved",

            completed:
              false,

            result:
              result

          };

        });

      });

  }


  /* =========================================================
     SHOW MONETAG
     ========================================================= */

  function showMonetagAd() {

    if (!ENABLE_MONETAG) {

      return Promise.reject(
        "Monetag disabled"
      );

    }


    return loadMonetagSDK()

      .then(function () {

        return new Promise(
          function (resolve, reject) {

            let attempts =
              0;


            const interval =
              setInterval(function () {

                attempts++;


                if (
                  typeof window[
                    MONETAG_FN
                  ] === "function"
                ) {

                  clearInterval(
                    interval
                  );


                  try {

                    const adPromise =
                      window[
                        MONETAG_FN
                      ]();


                    Promise.resolve(
                      adPromise
                    )
                    .then(function (result) {

                      /*
                       * Monetag gets NO extra delay.
                       */

                      resolve({

                        network:
                          "monetag",

                        event:
                          "resolved",

                        completed:
                          false,

                        result:
                          result

                      });

                    })
                    .catch(function (error) {

                      reject(error);

                    });

                  }

                  catch (error) {

                    reject(error);

                  }

                  return;

                }


                /*
                 * Timeout
                 */

                if (
                  attempts >= 150
                ) {

                  clearInterval(
                    interval
                  );


                  reject(
                    "Monetag timeout"
                  );

                }

              }, 100);

          }
        );

      });

  }


  /* =========================================================
     SHOW ADSGRAM
     ========================================================= */

  function showAdsGramAd() {

    if (!ENABLE_ADSGRAM) {

      return Promise.reject(
        "AdsGram disabled"
      );

    }


    return loadAdsGramSDK()

      .then(function () {

        if (!window.Adsgram) {

          throw new Error(
            "AdsGram SDK unavailable"
          );

        }


        /*
         * Make sure Block ID exists.
         */

        if (
          !ADSGRAM_BLOCK_ID ||
          ADSGRAM_BLOCK_ID ===
            "YOUR_ADSGRAM_BLOCK_ID"
        ) {

          throw new Error(
            "AdsGram blockId is not configured"
          );

        }


        /*
         * Initialize AdsGram
         */

        const AdController =
          window.Adsgram.init({

            blockId:
              ADSGRAM_BLOCK_ID

          });


        if (!AdController) {

          throw new Error(
            "AdsGram initialization failed"
          );

        }


        /*
         * Show advertisement
         */

        return AdController.show();

      })

      .then(function (result) {

        /*
         * Extra wait
         */

        return delay(
          ADSGRAM_EXTRA_WAIT_MS
        )
        .then(function () {

          return {

            network:
              "adsgram",

            event:
              "resolved",

            completed:
              false,

            result:
              result

          };

        });

      });

  }


  /* =========================================================
     SHOW ONCLICKA
     ========================================================= */

  function showOnClickaAd() {

    if (!ENABLE_ONCLICKA) {

      return Promise.reject(
        "OnClicka disabled"
      );

    }


    /*
     * Load OnClicka SDK
     */

    return loadOnClickaSDK()

      .then(function () {

        /*
         * Official OnClicka API:
         *
         * window.initCdTma?.({
         *     id: Spot ID
         * })
         */

        if (
          typeof window.initCdTma !==
          "function"
        ) {

          throw new Error(
            "OnClicka SDK not initialized"
          );

        }


        /*
         * Initialize ad engine
         *
         * This returns the SHOW function.
         */

        return window.initCdTma({

          id:
            ONCLICKA_SPOT_ID

        });

      })

      .then(function (show) {

        /*
         * Validate returned SHOW function.
         */

        if (
          typeof show !==
          "function"
        ) {

          throw new Error(
            "Invalid show function from OnClicka"
          );

        }


        /*
         * Official OnClicka API:
         *
         * show()
         *
         * The returned Promise is awaited.
         */

        return show();

      })

      .then(function (result) {

        /*
         * IMPORTANT:
         *
         * OnClicka's supplied integration does not
         * provide a separate adClosed/adCompleted event.
         *
         * Therefore we DO NOT claim that the user
         * completed the advertisement.
         *
         * We wait an additional 20 seconds before
         * returning control to our SDK.
         */

        return delay(
          ONCLICKA_EXTRA_WAIT_MS
        )
        .then(function () {

          return {

            network:
              "onclicka",

            event:
              "resolved",

            completed:
              false,

            result:
              result

          };

        });

      });

  }


  /* =========================================================
     PRELOAD ENABLED NETWORKS
     ========================================================= */

  if (ENABLE_ADEXIUM) {

    loadAdexiumSDK()
      .catch(function (error) {

        console.warn(
          "Adexium preload failed:",
          error
        );

      });

  }


  if (ENABLE_RICHADS) {

    loadRichAdsSDK()
      .catch(function (error) {

        console.warn(
          "RichAds preload failed:",
          error
        );

      });

  }


  if (ENABLE_MONETAG) {

    loadMonetagSDK()
      .catch(function (error) {

        console.warn(
          "Monetag preload failed:",
          error
        );

      });

  }


  if (ENABLE_ADSGRAM) {

    loadAdsGramSDK()
      .catch(function (error) {

        console.warn(
          "AdsGram preload failed:",
          error
        );

      });

  }


  if (ENABLE_ONCLICKA) {

    loadOnClickaSDK()
      .catch(function (error) {

        console.warn(
          "OnClicka preload failed:",
          error
        );

      });

  }


  /* =========================================================
     GLOBAL SHOW API
     ========================================================= */

  window.showAdsmone =
    function () {

      return new Promise(
        async function (
          resolve,
          reject
        ) {

          const results = {

            success:
              false,

            adexium:
              null,

            richads_native:
              null,

            richads_interstitial:
              null,

            monetag:
              null,

            adsgram:
              null,

            onclicka:
              null

          };


          /* =================================================
             ADEXIUM
             ================================================= */

          if (ENABLE_ADEXIUM) {

            try {

              results.adexium =
                await showAdexiumAd();

            }

            catch (error) {

              console.warn(
                "Adexium failed:",
                error
              );

            }

          }


          /* =================================================
             RICHADS NATIVE
             ================================================= */

          if (ENABLE_RICHADS) {

            try {

              results.richads_native =
                await showRichAdsNative();

            }

            catch (error) {

              console.warn(
                "RichAds Native failed:",
                error
              );

            }

          }


          /* =================================================
             RICHADS INTERSTITIAL
             ================================================= */

          if (ENABLE_RICHADS) {

            try {

              results.richads_interstitial =
                await showRichAdsInterstitial();

            }

            catch (error) {

              console.warn(
                "RichAds Interstitial failed:",
                error
              );

            }

          }


          /* =================================================
             MONETAG
             ================================================= */

          if (ENABLE_MONETAG) {

            try {

              results.monetag =
                await showMonetagAd();

            }

            catch (error) {

              console.warn(
                "Monetag failed:",
                error
              );

            }

          }


          /* =================================================
             ADSGRAM
             ================================================= */

          if (ENABLE_ADSGRAM) {

            try {

              results.adsgram =
                await showAdsGramAd();

            }

            catch (error) {

              console.warn(
                "AdsGram failed:",
                error
              );

            }

          }


          /* =================================================
             ONCLICKA
             ================================================= */

          if (ENABLE_ONCLICKA) {

            try {

              results.onclicka =
                await showOnClickaAd();

            }

            catch (error) {

              console.warn(
                "OnClicka failed:",
                error
              );

            }

          }


          /* =================================================
             OVERALL SUCCESS
             ================================================= */

          if (

            results.adexium ||

            results.richads_native ||

            results.richads_interstitial ||

            results.monetag ||

            results.adsgram ||

            results.onclicka

          ) {

            results.success =
              true;


            resolve(
              results
            );

          }

          else {

            reject(
              "All enabled ad networks failed"
            );

          }

        }
      );

    };


  /* =========================================================
     NETWORK STATUS API
     ========================================================= */

  window.getAdNetworkStatus =
    function () {

      return {

        adexium:
          ENABLE_ADEXIUM,

        richads:
          ENABLE_RICHADS,

        monetag:
          ENABLE_MONETAG,

        adsgram:
          ENABLE_ADSGRAM,

        onclicka:
          ENABLE_ONCLICKA

      };

    };


  /* =========================================================
     TIMING CONFIG API
     ========================================================= */

  window.getAdTimingConfig =
    function () {

      return {

        adexiumExtraWait:
          ADEXIUM_EXTRA_WAIT_MS,

        richadsNativeExtraWait:
          RICHADS_NATIVE_EXTRA_WAIT_MS,

        richadsInterstitialExtraWait:
          RICHADS_INTERSTITIAL_EXTRA_WAIT_MS,

        monetagExtraWait:
          0,

        adsgramExtraWait:
          ADSGRAM_EXTRA_WAIT_MS,

        onclickaExtraWait:
          ONCLICKA_EXTRA_WAIT_MS

      };

    };


})();
