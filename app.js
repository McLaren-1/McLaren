// loading
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const content = document.getElementById("content");
  preloader.style.display = "none";
  content.style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const contentContainer = document.getElementById("content-container");

  async function loadHeader() {
    try {
      const response = await fetch("header.html");
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const data = await response.text();
      headerPlaceholder.innerHTML = data;
      attachHeaderEventListeners(); // ✅ Pasang event listener setelah header dimuat
      updateActiveNavLink();
    } catch (error) {
      console.error("Gagal memuat header:", error);
    }
  }

  function loadCss(filename) {
    const head = document.getElementsByTagName("head")[0];
    const oldLink = document.getElementById("dynamic-page-css");
    if (oldLink) head.removeChild(oldLink);
    const link = document.createElement("link");
    link.id = "dynamic-page-css";
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = filename;
    head.appendChild(link);
  }

  async function loadPageContent(pageName) {
    let pageUrl;
    let pageCssFile = null;

    switch (pageName) {
      case "index":
      case "ownership":
        pageUrl = "index.html";
        pageCssFile = "style.css";
        break;
      case "models":
        pageUrl = "models.html";
        pageCssFile = "models.css";
        break;
      case "beyond":
        pageUrl = "beyond.html";
        pageCssFile = "beyond.css";
        break;
      case "contact":
        pageUrl = "contact.html";
        pageCssFile = "contact.css";
        break;
      default:
        pageUrl = "index.html";
        pageCssFile = "style.css";
    }

    try {
      contentContainer.classList.add("fade-out");
      await new Promise((resolve) => setTimeout(resolve, 300));
      const response = await fetch(pageUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newMainContent = doc.getElementById("content-container")
        ? doc.getElementById("content-container").innerHTML
        : "";
      contentContainer.innerHTML = newMainContent;
      if (pageCssFile) {
        loadCss(pageCssFile);
      } else {
        const oldLink = document.getElementById("dynamic-page-css");
        if (oldLink) {
          document.getElementsByTagName("head")[0].removeChild(oldLink);
        }
      }
      contentContainer.classList.remove("fade-out");
      contentContainer.classList.add("fade-in");
      await new Promise((resolve) => setTimeout(resolve, 500));
      contentContainer.classList.remove("fade-in");

      if (pageName === "models") {
        initializeModelsPage();
      }

      window.history.pushState({}, "", pageUrl);
      updateActiveNavLink();
    } catch (error) {
      console.error(`Gagal memuat halaman ${pageName}:`, error);
    }
  }

  function attachHeaderEventListeners() {
    const navLinks = document.querySelectorAll(
      "#header-placeholder .nav-links li a"
    );
    const logoLink = document.querySelector("#header-placeholder .logo a");

    // ✅ Tambahkan: Toggle hamburger menu
    const menuToggle = document.querySelector(
      "#header-placeholder #menu-toggle"
    );
    const navMenu = document.querySelector("#header-placeholder #nav-links");
    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("show");
      });
    }

    if (logoLink) {
      logoLink.addEventListener("click", function (event) {
        event.preventDefault();
        loadPageContent("index");
      });
    }

    navLinks.forEach((link) => {
      if (link.dataset.targetPage) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          loadPageContent(this.dataset.targetPage);
          if (navMenu && navMenu.classList.contains("show")) {
            navMenu.classList.remove("show"); // ✅ Tutup menu setelah klik link
          }
        });
      }
    });
  }

  function updateActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(
      "#header-placeholder .nav-links li a"
    );
    navLinks.forEach((link) => {
      const linkTarget =
        link.getAttribute("href") || link.dataset.targetPage + ".html";
      if (
        linkTarget === currentPath ||
        (currentPath === "" && linkTarget === "index.html") ||
        (currentPath === "index.html" && linkTarget === "")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function initializeModelsPage() {
    const modelLinks = document.querySelectorAll(
      ".model-selection-menu .model-link"
    );
    if (!modelLinks || modelLinks.length === 0) return;

    const carDisplayImage = document.getElementById("car-display-image");
    const overlayModelName = document.getElementById("overlay-model-name");
    const infoStripModelName = document.getElementById("info-strip-model-name");
    const maxPowerDisplay = document.getElementById("max-power-display");
    const maxSpeedDisplay = document.getElementById("max-speed-display");
    const accelDisplay = document.getElementById("accel-display");
    const detailsSectionTitle = document.getElementById(
      "details-section-title"
    );
    const detailsSectionText = document.getElementById("details-section-text");
    const footerModelName = document.getElementById("footer-model-name");

    if (
      !carDisplayImage ||
      !overlayModelName ||
      !infoStripModelName ||
      !maxPowerDisplay ||
      !maxSpeedDisplay ||
      !accelDisplay ||
      !detailsSectionTitle ||
      !detailsSectionText ||
      !footerModelName
    ) {
      console.warn("Missing elements for initializeModelsPage.");
      return;
    }

    function updateModelContent(modelData) {
      carDisplayImage.classList.add("fade-out");
      overlayModelName.classList.add("fade-out");
      infoStripModelName.classList.add("fade-out");
      maxPowerDisplay.classList.add("fade-out");
      maxSpeedDisplay.classList.add("fade-out");
      accelDisplay.classList.add("fade-out");
      detailsSectionTitle.classList.add("fade-out");
      detailsSectionText.classList.add("fade-out");
      footerModelName.classList.add("fade-out");

      setTimeout(() => {
        carDisplayImage.src = modelData.image;
        overlayModelName.textContent = modelData.model;
        infoStripModelName.textContent = modelData.model;
        maxPowerDisplay.textContent = modelData.power;
        maxSpeedDisplay.textContent = modelData.speed;
        accelDisplay.textContent = modelData.accel;
        detailsSectionTitle.textContent = `Discover the ${modelData.model}`;
        detailsSectionText.textContent = modelData.desc;
        footerModelName.textContent = modelData.model;

        [
          carDisplayImage,
          overlayModelName,
          infoStripModelName,
          maxPowerDisplay,
          maxSpeedDisplay,
          accelDisplay,
          detailsSectionTitle,
          detailsSectionText,
          footerModelName,
        ].forEach((el) => {
          el.classList.remove("fade-out");
          el.classList.add("fade-in");
        });

        setTimeout(() => {
          [
            carDisplayImage,
            overlayModelName,
            infoStripModelName,
            maxPowerDisplay,
            maxSpeedDisplay,
            accelDisplay,
            detailsSectionTitle,
            detailsSectionText,
            footerModelName,
          ].forEach((el) => el.classList.remove("fade-in"));
        }, 500);
      }, 300);
    }

    modelLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        modelLinks.forEach((item) => item.classList.remove("active"));
        this.classList.add("active");
        const modelData = {
          model: this.dataset.model,
          image: this.dataset.image,
          power: this.dataset.power,
          speed: this.dataset.speed,
          accel: this.dataset.accel,
          desc: this.dataset.desc,
        };
        updateModelContent(modelData);
      });
    });

    const defaultModelLink = document.querySelector(
      ".model-selection-menu .model-link.active"
    );
    if (defaultModelLink) {
      const defaultModelData = {
        model: defaultModelLink.dataset.model,
        image: defaultModelLink.dataset.image,
        power: defaultModelLink.dataset.power,
        speed: defaultModelLink.dataset.speed,
        accel: defaultModelLink.dataset.accel,
        desc: defaultModelLink.dataset.desc,
      };
      updateModelContent(defaultModelData);
    }
  }

  // ✅ Load pertama kali
  loadHeader().then(() => {
    const initialPage =
      window.location.pathname.split("/").pop().replace(".html", "") || "index";
    loadPageContent(initialPage);
  });

  // ✅ Back/Forward browser
  window.addEventListener("popstate", () => {
    const page =
      window.location.pathname.split("/").pop().replace(".html", "") || "index";
    loadPageContent(page);
  });
});
