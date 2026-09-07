(function () {

  /* =========================================================
     NETWORK ENABLE / DISABLE
     ========================================================= */

  const ENABLE_ADEXIUM = true;
  const ENABLE_RICHADS = true;
  const ENABLE_MONETAG = true;
  const ENABLE_ADSGRAM = false;
  const ENABLE_ONCLICKA = true;


  /* =========================================================
     TIMING CONFIGURATION
     ========================================================= */

  /*
     Extra waiting time AFTER an ad provider resolves.

     Monetag = 0
     Other networks = extra waiting time
  */

  const ADEXIUM_EXTRA_WAIT_MS = 10000;

  const RICHADS_NATIVE_EXTRA_WAIT_MS = 10000;

  const RICHADS_INTERSTITIAL_EXTRA_WAIT_MS = 10000;

  const ADSGRAM_EXTRA_WAIT_MS = 10000;

  /*
     OnClicka gets the longest extra waiting time
     because its ad may take longer to load/display.
  */

  const ONCLICKA_EXTRA_WAIT_MS = 20000;

  /*
     SDK loading timeout.
     This is only used when loading the external SDK.
  */

  const ADEXIUM_LOAD_TIMEOUT_MS = 30000;

  const RICHADS_LOAD_TIMEOUT_MS = 30000;

  const MONETAG_LOAD_TIMEOUT_MS = 15000;

  const ADSGRAM_LOAD_TIMEOUT_MS = 30000;

  const ONCLICKA_LOAD_TIMEOUT_MS = 60000;


  /* =========================================================
     HELPER: DELAY
     ========================================================= */

  function delay(ms) {

    return new Promise(function (resolve) {

      setTimeout(resolve, ms);

    });

  }


  /* =========================================================
     HELPER: LOAD SCRIPT WITH TIMEOUT
     ========================================================= */

  function loadScriptOnce(
    src,
    globalCheck,
    timeoutMs,
    errorMessage
  ) {

    return new Promise(function (resolve, reject) {

      /*
       * Already available
       */

      if (
        typeof globalCheck === "function" &&
        globalCheck()
      ) {

        resolve();

        return;
      }


      /*
       * Existing script
       */

      let script =
        document.querySelector(
          `script[src="${src}"]`
        );


      let finished = false;


      function cleanup() {

        clearTimeout(timeout);

      }


      function success() {

        if (finished) return;

        finished = true;

        cleanup();

        resolve();

      }


      function failure(error) {

        if (finished) return;

        finished = true;

        cleanup();

        reject(error);

      }


      /*
       * Timeout
       */

      const timeout =
        setTimeout(function () {

          failure(
            new Error(
              errorMessage +
              " (timeout)"
            )
          );

        }, timeoutMs);


      /*
       * Existing script
       */

      if (script) {

        script.addEventListener(
          "load",
          function () {

            if (
              !globalCheck ||
              globalCheck()
            ) {

              success();

            } else {

              failure(
                new Error(
                  errorMessage
                )
              );

            }

          },
          {
            once: true
          }
        );


        script.addEventListener(
          "error",
          function () {

            failure(
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


      script.src = src;

      script.async = true;


      script.onload =
        function () {

          if (
            !globalCheck ||
            globalCheck()
          ) {

            success();

          } else {

            failure(
              new Error(
                errorMessage
              )
            );

          }

        };


      script.onerror =
        function () {

          failure(
            new Error(
              errorMessage
            )
          );

        };


      document.head.appendChild(script);

    });

  }


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
     PUT YOUR REAL ADSGRAM BLOCK ID HERE
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
     LOAD ADEXIUM
     ========================================================= */

  function loadAdexiumSDK() {

    if (!ENABLE_ADEXIUM) {

      return Promise.resolve();

    }


    if (window.__adexiumSDK) {

      return window.__adexiumSDK;

    }


    window.__adexiumSDK =
      loadScriptOnce(

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
     LOAD RICHADS
     ========================================================= */

  function loadRichAdsSDK() {

    if (!ENABLE_RICHADS) {

      return Promise.resolve();

    }


    if (window.__richAdsSDK) {

      return window.__richAdsSDK;

    }


    window.__richAdsSDK =
      loadScriptOnce(

        RICHADS_SDK_SRC,

        function () {

          return (
            typeof window.TelegramAdsController !==
            "undefined" ||
            typeof window.TelegramAdsController !==
            "undefined"
          );

        },

        RICHADS_LOAD_TIMEOUT_MS,

        "RichAds SDK load failed"

      )
      .then(function () {

        if (
          !window.TelegramAdsController
        ) {

          window.TelegramAdsController =
            new TelegramAdsController();

        }


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
     LOAD MONETAG
     ========================================================= */

  function loadMonetagSDK() {

    if (!ENABLE_MONETAG) {

      return Promise.resolve();

    }


    if (window.__monetagSDK) {

      return window.__monetagSDK;

    }


    window.__monetagSDK =
      loadScriptOnce(

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


    /*
     * Monetag sometimes exposes its function
     * shortly after script load.
     *
     * Do not fail immediately.
     */

    return window.__monetagSDK;

  }


  /* =========================================================
     LOAD ADSGRAM
     ========================================================= */

  function loadAdsGramSDK() {

    if (!ENABLE_ADSGRAM) {

      return Promise.resolve();

    }


    if (window.__adsGramSDK) {

      return window.__adsGramSDK;

    }


    window.__adsGramSDK =
      loadScriptOnce(

        ADSGRAM_SDK_SRC,

        function () {

          return !!window.Adsgram;

        },

        ADSGRAM_LOAD_TIMEOUT_MS,

        "AdsGram SDK load failed"

      );


    return window.__adsGramSDK;

  }


  /* =========================================================
     LOAD ONCLICKA
     ========================================================= */

  function loadOnClickaSDK() {

    if (!ENABLE_ONCLICKA) {

      return Promise.resolve();

    }


    if (window.__onclickaSDK) {

      return window.__onclickaSDK;

    }


    window.__onclickaSDK =
      loadScriptOnce(

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

            try {

              const ad =
                new AdexiumWidget({

                  wid:
                    ADEXIUM_WID,

                  adFormat:
                    "interstitial"

                });


              let settled = false;


              function finish(
                event,
                result
              ) {

                if (settled) return;

                settled = true;


                /*
                 * Give the ad UI some additional
                 * time before reporting completion.
                 */

                delay(
                  ADEXIUM_EXTRA_WAIT_MS
                )
                .then(function () {

                  resolve({

                    network:
                      "adexium",

                    event:
                      event,

                    result:
                      result

                  });

                });

              }


              ad.on(
                "adReceived",
                function (a) {

                  ad.displayAd(a);

                }
              );


              ad.on(
                "noAdFound",
                function () {

                  if (!settled) {

                    reject(
                      "Adexium no ad"
                    );

                  }

                }
              );


              ad.on(
                "adClosed",
                function () {

                  finish(
                    "closed"
                  );

                }
              );


              ad.on(
                "adRedirected",
                function () {

                  finish(
                    "redirected"
                  );

                }
              );


              ad.requestAd(
                "interstitial"
              );


            } catch (error) {

              reject(error);

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

            let attempts = 0;


            const interval =
              setInterval(
                function () {

                  attempts++;


                  if (
                    typeof window[
                      MONETAG_FN
                    ] === "function"
                  ) {

                    clearInterval(
                      interval
                    );


                    window[
                      MONETAG_FN
                    ]()

                      .then(function (result) {

                        /*
                         * NO EXTRA WAIT FOR MONETAG
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

                      .catch(reject);

                  }


                  else if (
                    attempts > 50
                  ) {

                    clearInterval(
                      interval
                    );


                    reject(
                      "Monetag timeout"
                    );

                  }

                },

                100

              );

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
            "AdsGram is unavailable"
          );

        }


        if (
          !ADSGRAM_BLOCK_ID ||
          ADSGRAM_BLOCK_ID ===
            "YOUR_ADSGRAM_BLOCK_ID"
        ) {

          throw new Error(
            "AdsGram blockId is not configured"
          );

        }


        const AdController =
          window.Adsgram.init({

            blockId:
              ADSGRAM_BLOCK_ID

          });


        if (!AdController) {

          throw new Error(
            "AdsGram controller initialization failed"
          );

        }


        return AdController.show();

      })

      .then(function (result) {

        /*
         * Give AdsGram some additional time
         * before returning to the caller.
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


    return loadOnClickaSDK()

      .then(function () {

        if (
          typeof window.initCdTma !==
          "function"
        ) {

          throw new Error(
            "OnClicka SDK not initialized"
          );

        }


        /*
         * Initialize OnClicka
         */

        return window.initCdTma({

          id:
            ONCLICKA_SPOT_ID

        });

      })

      .then(function (show) {

        if (
          typeof show !== "function"
        ) {

          throw new Error(
            "Invalid show function from OnClicka"
          );

        }


        /*
         * Start the advertisement.
         *
         * IMPORTANT:
         * We wait for the provider Promise.
         */

        return show();

      })

      .then(function (result) {

        /*
         * IMPORTANT:
         *
         * Do NOT call this "completed".
         *
         * OnClicka's supplied API does not expose
         * a separate adClosed/adCompleted callback.
         *
         * We therefore give it an additional 20 seconds
         * before resolving our own SDK call.
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
     PRELOAD ENABLED SDKs
     ========================================================= */

  if (ENABLE_ADEXIUM) {

    loadAdexiumSDK()
      .catch(function () {});

  }


  if (ENABLE_RICHADS) {

    loadRichAdsSDK()
      .catch(function () {});

  }


  if (ENABLE_MONETAG) {

    loadMonetagSDK()
      .catch(function () {});

  }


  if (ENABLE_ADSGRAM) {

    loadAdsGramSDK()
      .catch(function () {});

  }


  if (ENABLE_ONCLICKA) {

    loadOnClickaSDK()
      .catch(function () {});

  }


  /* =========================================================
     GLOBAL API
     ========================================================= */

  window.showAdsmone = function () {

    return new Promise(
      async function (resolve, reject) {

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


        /* ===================================================
           ADEXIUM
           =================================================== */

        if (ENABLE_ADEXIUM) {

          try {

            results.adexium =
              await showAdexiumAd();

          } catch (error) {

            console.warn(
              "Adexium failed:",
              error
            );

          }

        }


        /* ===================================================
           RICHADS NATIVE
           =================================================== */

        if (ENABLE_RICHADS) {

          try {

            results.richads_native =
              await showRichAdsNative();

          } catch (error) {

            console.warn(
              "RichAds Native failed:",
              error
            );

          }

        }


        /* ===================================================
           RICHADS INTERSTITIAL
           =================================================== */

        if (ENABLE_RICHADS) {

          try {

            results.richads_interstitial =
              await showRichAdsInterstitial();

          } catch (error) {

            console.warn(
              "RichAds Interstitial failed:",
              error
            );

          }

        }


        /* ===================================================
           MONETAG
           =================================================== */

        if (ENABLE_MONETAG) {

          try {

            results.monetag =
              await showMonetagAd();

          } catch (error) {

            console.warn(
              "Monetag failed:",
              error
            );

          }

        }


        /* ===================================================
           ADSGRAM
           =================================================== */

        if (ENABLE_ADSGRAM) {

          try {

            results.adsgram =
              await showAdsGramAd();

          } catch (error) {

            console.warn(
              "AdsGram failed:",
              error
            );

          }

        }


        /* ===================================================
           ONCLICKA
           =================================================== */

        if (ENABLE_ONCLICKA) {

          try {

            results.onclicka =
              await showOnClickaAd();

          } catch (error) {

            console.warn(
              "OnClicka failed:",
              error
            );

          }

        }


        /* ===================================================
           SUCCESS
           =================================================== */

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


          resolve(results);

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
     TIMING STATUS API
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
