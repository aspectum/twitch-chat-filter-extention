// ==UserScript==
// @name         twitch_chat_filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter twitch chat messages
// @author       You
// @match        https://www.twitch.tv/*
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>
// @require      https://raw.githubusercontent.com/sizzlemctwizzle/GM_config/master/gm_config.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        window.onurlchange
// ==/UserScript==
/* globals GM_config */
/// <reference path="GM_config/types/index.d.ts" />

(function () {
  "use strict";

  const observerOptions = {
    childList: true,
    attributes: true,
    subtree: true,
  };

  /**
   *
   * @param {Node} el
   * @param {Array<ChildNode>} descendants
   */
  function textImgChildren(el, descendants) {
    const children = el.childNodes;
    if (children.length > 0) {
      children.forEach((child) => {
        if (child.nodeType === 1) {
          textImgChildren(child, descendants);
        }
        if (child.nodeName === "#text" || child.nodeName === "IMG") {
          descendants.push(child);
        }
      });
    }
  }

  let chat = null;
  let observer = new MutationObserver(filterCallback);
  let filterList = [];
  let debugFlag = false;

  function init() {
    if (window.onurlchange === null) {
      window.addEventListener("urlchange", () => {
        debugFlag && console.log(`[TwitchChatFilter]: URL changed`);
        findChat();
      });
    }

    loadSettings();
    findChat();

    console.log(`[TwitchChatFilter]: Extension loaded`);
  }

  function findChat() {
    const findChatInterval = setInterval(() => {
      if (chat === null || !document.body.contains(chat)) {
        observer.disconnect();
        chat = document.querySelector(
          ".chat-scrollable-area__message-container"
        );

        if (chat === null) {
          debugFlag && console.log(`[TwitchChatFilter]: Chat not found`);
        } else {
          observer.observe(chat, observerOptions);
          console.log(`[TwitchChatFilter]: Chat found`);
          clearInterval(findChatInterval);
        }
      } else {
        debugFlag && console.log(`[TwitchChatFilter]: Chat already exists`);
      }
    }, 1000);
  }

  function loadSettings() {
    filterList = GM_config.get("blacklist").split("\n");
    debugFlag = Boolean(GM_config.get("debugFlag"));
    console.log("[TwitchChatFilter]: loaded filters ", filterList);
    console.log(
      `[TwitchChatFilter]: debug mode ${debugFlag ? "ENABLED" : "DISABLED"} `
    );
  }

  /** @type {MutationCallback} */
  function filterCallback(mutationList) {
    mutationList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes) {
        mutation.addedNodes.forEach((node) => {
          const msg = node.querySelector("span.message");
          if (msg) {
            let des = [];
            textImgChildren(msg, des);

            let txt = "";
            des.forEach((cn) => {
              if (cn.nodeName === "#text") {
                txt = txt + " " + cn.textContent;
              } else if (cn.nodeName === "IMG") {
                txt = txt + " " + cn.alt;
              }
            });
            if (debugFlag) {
              console.log(`[TwitchChatFilter]: ${txt}`);
            }
            filterList.forEach((f) => {
              let re = new RegExp(f, "i");
              if (txt.search(re) >= 0) {
                console.log(`[TwitchChatFilter]: Blocked ${f}`);
                node.style.display = "none";
              }
            });
          }
        });
      }
    });
  }

  GM_config.init({
    id: "TwitchChatFilter",
    fields: {
      blacklist: {
        label: "Blacklist",
        section: ["JS regex syntax, one per line"],
        type: "textarea",
        rows: 20,
        cols: 20,
      },
      debugFlag: {
        label: "Debug mode",
        section: ["Enables debug mode"],
        type: "checkbox",
        default: false,
      },
    },
  });

  init();

  GM_registerMenuCommand("Config", () => GM_config.open());
  GM_registerMenuCommand("Reload settings", () => loadSettings());
})();
