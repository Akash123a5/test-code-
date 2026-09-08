(function () {
  /* =========================================================
     CONFIG
  ========================================================= */

  const MONETAG_ZONE_ID = "11598734";

  const ADEXIUM_WID =
    "6cc505fa-0056-49d4-80cc-42dea0b37cb6";

  const MONETAG_SDK_SRC =
    "//libtl.com/sdk.js";

  const ADEXIUM_SDK_SRC =
    "https://cdn.tgads.space/assets/js/adexium-widget.min.js";

  const RICHADS_SDK_SRC =
    "https://richinfo.co/richpartners/telegram/js/tg-ob.js";

  const RICHADS_PUB_ID = "1002945";
  const RICHADS_APP_ID = "6335";

  /* =========================================================
     ONCLICKA CONFIG
  ========================================================= */

  /*
   * IMPORTANT:
   * Replace this with the SPOT-ID provided by
   * your OneClicka Account Manager.
   */
  const ONCLICKA_SPOT_ID = "6104578";

  const ONCLICKA_SDK_SRC =
    "https://js.onclckvd.com/in-stream-ad-admanager/tma.js";

  /*
   * OneClicka needs more time for SDK initialization.
   *
   * Other networks keep their existing behavior.
   * OneClicka gets up to 30 seconds.
   */
  const ONCLICKA_TIMEOUT = 30000;

  const MONETAG_FN =
    "show_" + MONETAG_ZONE_ID;


  /* =========================================================
     LOAD ADEXIUM
  ========================================================= */

  function loadAdexiumSDK() {
    if (window.__adexiumSDK) {
      return window.__adexiumSDK;
    }

    window.__adexiumSDK = new Promise(
      (resolve, reject) => {

        if (
          document.querySelector(
            `script[src="${ADEXIUM_SDK_SRC}"]`
          )
        ) {
          return resolve();
        }

        const s =
          document.createElement("script");

        s.src = ADEXIUM_SDK_SRC;
        s.async = true;

        s.onload = resolve;

        s.onerror = () => {
          reject(
            new Error(
              "Adexium SDK load failed"
            )
          );
        };

        document.head.appendChild(s);
      }
    );

    return window.__adexiumSDK;
  }


  /* =========================================================
     LOAD RICH ADS
  ========================================================= */

  function loadRichAdsSDK() {
    if (window.__richAdsSDK) {
      return window.__richAdsSDK;
    }

    window.__richAdsSDK = new Promise(
      (resolve, reject) => {

        if (window.TelegramAdsController) {
          return resolve();
        }

        const s =
          document.createElement("script");

        s.src = RICHADS_SDK_SRC;
        s.async = true;

        s.onload = () => {
          try {

            window.TelegramAdsController =
              new TelegramAdsController();

            window.TelegramAdsController.initialize({
              pubId: RICHADS_PUB_ID,
              appId: RICHADS_APP_ID
            });

            resolve();

          } catch (e) {
            reject(e);
          }
        };

        s.onerror = () => {
          reject(
            new Error(
              "RichAds SDK load failed"
            )
          );
        };

        document.head.appendChild(s);
      }
    );

    return window.__richAdsSDK;
  }


  /* =========================================================
     LOAD MONETAG
  ========================================================= */

  function loadMonetagSDK() {
    if (window.__monetagSDK) {
      return window.__monetagSDK;
    }

    window.__monetagSDK = new Promise(
      (resolve, reject) => {

        if (
          document.querySelector(
            `script[src="${MONETAG_SDK_SRC}"]`
          )
        ) {
          return resolve();
        }

        const s =
          document.createElement("script");

        s.src = MONETAG_SDK_SRC;
        s.async = true;

        s.setAttribute(
          "data-zone",
          MONETAG_ZONE_ID
        );

        s.setAttribute(
          "data-sdk",
          MONETAG_FN
        );

        s.onload = resolve;

        s.onerror = () => {
          reject(
            new Error(
              "Monetag SDK load failed"
            )
          );
        };

        document.head.appendChild(s);
      }
    );

    return window.__monetagSDK;
  }


  /* =========================================================
     LOAD ONCLICKA
  ========================================================= */

  function loadOnClickaSDK() {

    if (window.__onclickaSDK) {
      return window.__onclickaSDK;
    }

    window.__onclickaSDK = new Promise(
      (resolve, reject) => {

        /*
         * If OneClicka is already available,
         * don't load the script again.
         */
        if (
          typeof window.initCdTma ===
          "function"
        ) {
          return resolve();
        }


        /*
         * Check whether the script was
         * already added to the document.
         */
        const existingScript =
          document.querySelector(
            `script[src="${ONCLICKA_SDK_SRC}"]`
          );


        if (existingScript) {

          let elapsed = 0;

          const checkInterval =
            setInterval(() => {

              elapsed += 100;

              if (
                typeof window.initCdTma ===
                "function"
              ) {

                clearInterval(
                  checkInterval
                );

                resolve();

              } else if (
                elapsed >=
                ONCLICKA_TIMEOUT
              ) {

                clearInterval(
                  checkInterval
                );

                reject(
                  new Error(
                    "OneClicka SDK initialization timeout"
                  )
                );
              }

            }, 100);

          return;
        }


        /*
         * Load OneClicka SDK
         */
        const s =
          document.createElement("script");

        s.src = ONCLICKA_SDK_SRC;
        s.async = true;


        s.onload = () => {

          let elapsed = 0;

          /*
           * Wait until initCdTma becomes available.
           * Maximum: 30 seconds.
           */
          const checkInterval =
            setInterval(() => {

              elapsed += 100;

              if (
                typeof window.initCdTma ===
                "function"
              ) {

                clearInterval(
                  checkInterval
                );

                resolve();

              } else if (
                elapsed >=
                ONCLICKA_TIMEOUT
              ) {

                clearInterval(
                  checkInterval
                );

                reject(
                  new Error(
                    "OneClicka SDK initialization timeout"
                  )
                );
              }

            }, 100);
        };


        s.onerror = () => {

          reject(
            new Error(
              "OneClicka SDK load failed"
            )
          );

        };


        document.head.appendChild(s);
      }
    );

    return window.__onclickaSDK;
  }


  /* =========================================================
     SHOW ADEXIUM
  ========================================================= */

  function showAdexiumAd() {

    return new Promise(
      (resolve, reject) => {

        loadAdexiumSDK()

          .then(() => {

            try {

              const ad =
                new AdexiumWidget({
                  wid: ADEXIUM_WID,
                  adFormat: "interstitial"
                });


              ad.on(
                "adReceived",
                (a) => {
                  ad.displayAd(a);
                }
              );


              ad.on(
                "noAdFound",
                () => {
                  reject(
                    "Adexium no ad"
                  );
                }
              );


              ad.on(
                "adClosed",
                () => {

                  resolve({
                    network: "adexium",
                    event: "closed"
                  });

                }
              );


              ad.on(
                "adRedirected",
                () => {

                  resolve({
                    network: "adexium",
                    event: "redirected"
                  });

                }
              );


              ad.requestAd(
                "interstitial"
              );

            } catch (e) {

              reject(e);

            }

          })

          .catch(reject);
      }
    );
  }


  /* =========================================================
     SHOW RICH ADS - NATIVE
  ========================================================= */

  function showRichAdsNative() {

    return new Promise(
      (resolve, reject) => {

        loadRichAdsSDK()

          .then(() => {

            window.TelegramAdsController
              .triggerNativeNotification(true)

              .then((r) => {

                resolve({
                  network:
                    "richads_native",
                  result: r
                });

              })

              .catch(reject);

          })

          .catch(reject);
      }
    );
  }


  /* =========================================================
     SHOW RICH ADS - INTERSTITIAL
  ========================================================= */

  function showRichAdsInterstitial() {

    return new Promise(
      (resolve, reject) => {

        loadRichAdsSDK()

          .then(() => {

            window.TelegramAdsController
              .triggerInterstitialBanner(true)

              .then((r) => {

                resolve({
                  network:
                    "richads_interstitial",
                  result: r
                });

              })

              .catch(reject);

          })

          .catch(reject);
      }
    );
  }


  /* =========================================================
     SHOW MONETAG
  ========================================================= */

  function showMonetagAd() {

    return new Promise(
      (resolve, reject) => {

        loadMonetagSDK()

          .then(() => {

            let t = 0;

            const iv =
              setInterval(() => {

                t++;

                if (
                  typeof window[
                    MONETAG_FN
                  ] === "function"
                ) {

                  clearInterval(iv);

                  window[
                    MONETAG_FN
                  ]()

                    .then((r) => {

                      resolve({
                        network:
                          "monetag",
                        result: r
                      });

                    })

                    .catch(reject);


                } else if (t > 50) {

                  clearInterval(iv);

                  reject(
                    "Monetag timeout"
                  );

                }

              }, 100);

          })

          .catch(reject);
      }
    );
  }


  /* =========================================================
     SHOW ONCLICKA
  ========================================================= */

  function showOnClickaAd() {

    return new Promise(
      (resolve, reject) => {

        /*
         * Wait for OneClicka SDK.
         * This has the extended timeout.
         */
        loadOnClickaSDK()

          .then(() => {

            /*
             * Confirm official OneClicka
             * initialization method exists.
             */
            if (
              typeof window.initCdTma !==
              "function"
            ) {

              return reject(
                "OneClicka initCdTma unavailable"
              );
            }


            /*
             * Official integration pattern:
             *
             * window.initCdTma({
             *   id: Spot ID
             * }).then(show => ...)
             */
            let initResult;

            try {

              initResult =
                window.initCdTma({
                  id: ONCLICKA_SPOT_ID
                });

            } catch (e) {

              return reject(e);

            }


            /*
             * Make sure initialization
             * returned a Promise.
             */
            if (
              !initResult ||
              typeof initResult.then !==
              "function"
            ) {

              return reject(
                "OneClicka initialization did not return a Promise"
              );
            }


            /*
             * Get the SHOW function.
             */
            initResult

              .then((show) => {

                if (
                  typeof show !==
                  "function"
                ) {

                  throw new Error(
                    "OneClicka SHOW method unavailable"
                  );
                }


                /*
                 * Save the official SHOW method
                 * globally as requested by the
                 * OneClicka integration pattern.
                 */
                window.__onclickaShow =
                  show;


                /*
                 * Execute the ad.
                 *
                 * The returned Promise determines
                 * whether the ad display succeeded.
                 */
                return show();

              })

              .then((result) => {

                resolve({
                  network:
                    "onclicka",
                  result: result
                });

              })

              .catch(reject);

          })

          .catch(reject);
      }
    );
  }


  /* =========================================================
     PRELOAD ALL SDKs
  ========================================================= */

  loadAdexiumSDK()
    .catch(() => {});

  loadRichAdsSDK()
    .catch(() => {});

  loadMonetagSDK()
    .catch(() => {});

  loadOnClickaSDK()
    .catch(() => {});


  /* =========================================================
     GLOBAL API
  ========================================================= */

  window.showAdsmone =
    function () {

      return new Promise(
        async (resolve, reject) => {

          const results = {

            success: false,

            adexium: null,

            richads_native: null,

            richads_interstitial: null,

            monetag: null,

            onclicka: null

          };


          /* ================================================
             ADEXIUM
          ================================================= */

          try {

            results.adexium =
              await showAdexiumAd();

          } catch (e) {

            console.log(
              "[Adsmone] Adexium failed:",
              e
            );

          }


          /* ================================================
             RICHADS NATIVE
          ================================================= */

          try {

            results.richads_native =
              await showRichAdsNative();

          } catch (e) {

            console.log(
              "[Adsmone] RichAds Native failed:",
              e
            );

          }


          /* ================================================
             RICHADS INTERSTITIAL
          ================================================= */

          try {

            results.richads_interstitial =
              await showRichAdsInterstitial();

          } catch (e) {

            console.log(
              "[Adsmone] RichAds Interstitial failed:",
              e
            );

          }


          /* ================================================
             MONETAG
          ================================================= */

          try {

            results.monetag =
              await showMonetagAd();

          } catch (e) {

            console.log(
              "[Adsmone] Monetag failed:",
              e
            );

          }


          /* ================================================
             ONCLICKA
          ================================================= */

          try {

            results.onclicka =
              await showOnClickaAd();

          } catch (e) {

            console.log(
              "[Adsmone] OneClicka failed:",
              e
            );

          }


          /* ================================================
             FINAL RESULT
          ================================================= */

          if (

            results.adexium ||

            results.richads_native ||

            results.richads_interstitial ||

            results.monetag ||

            results.onclicka

          ) {

            results.success = true;

            resolve(results);

          } else {

            reject(
              "All ad networks failed"
            );

          }

        }
      );
    };

})();
