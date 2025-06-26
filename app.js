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
      attachHeaderEventListeners(); // Pasang event listener setelah header dimuat
      updateActiveNavLink(); // Panggil setelah header dimuat
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

    // Menentukan URL halaman dan file CSS berdasarkan nama halaman
    switch (pageName) {
      case "index":
      case "ownership": // Asumsi 'ownership' juga menggunakan index.html dan style.css
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
        // Default ke index jika pageName tidak dikenali
        pageUrl = "index.html";
        pageCssFile = "style.css";
    }

    try {
      // Efek fade-out sebelum memuat konten baru
      contentContainer.classList.add("fade-out");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Tunggu sedikit untuk animasi

      const response = await fetch(pageUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Mengambil konten dari #content-container di halaman yang dimuat
      const newMainContent = doc.getElementById("content-container")
        ? doc.getElementById("content-container").innerHTML
        : "";
      contentContainer.innerHTML = newMainContent;

      // Memuat atau menghapus file CSS dinamis
      if (pageCssFile) {
        loadCss(pageCssFile);
      } else {
        const oldLink = document.getElementById("dynamic-page-css");
        if (oldLink) {
          document.getElementsByTagName("head")[0].removeChild(oldLink);
        }
      }

      // Efek fade-in setelah konten baru dimuat
      contentContainer.classList.remove("fade-out");
      contentContainer.classList.add("fade-in");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Tunggu animasi fade-in
      contentContainer.classList.remove("fade-in");

      // Inisialisasi fungsi khusus untuk halaman "models" jika diperlukan
      if (pageName === "models") {
        initializeModelsPage();
      }

      // Memperbarui URL di browser tanpa reload penuh
      window.history.pushState({}, "", pageUrl);
      // Memperbarui status link navigasi yang aktif
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

    // Event listener untuk toggle hamburger menu
    const menuToggle = document.querySelector(
      "#header-placeholder #menu-toggle"
    );
    const navMenu = document.querySelector("#header-placeholder #nav-links");
    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("show");
      });
    }

    // Event listener untuk logo (kembali ke index)
    if (logoLink) {
      logoLink.addEventListener("click", function (event) {
        event.preventDefault();
        loadPageContent("index");
        // Tutup menu hamburger jika terbuka setelah klik logo
        if (navMenu && navMenu.classList.contains("show")) {
          navMenu.classList.remove("show");
        }
      });
    }

    // Event listeners untuk link navigasi
    navLinks.forEach((link) => {
      // Pastikan link memiliki dataset target page
      if (link.dataset.targetPage) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          loadPageContent(this.dataset.targetPage);
          // Tutup menu hamburger setelah klik link
          if (navMenu && navMenu.classList.contains("show")) {
            navMenu.classList.remove("show");
          }
        });
      }
    });
  }

  /**
   * Memperbarui kelas 'active-bold-green' pada tautan navigasi
   * berdasarkan URL saat ini.
   */
  function updateActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop();
    // console.log("Current Path:", currentPath); // Debugging: Lihat path saat ini

    const navLinks = document.querySelectorAll(
      "#header-placeholder .nav-links li a"
    );

    navLinks.forEach((link) => {
      const linkTarget =
        link.getAttribute("href") || link.dataset.targetPage + ".html";

      // Pastikan untuk menghapus kelas 'active-bold-green' dari semua link terlebih dahulu
      link.classList.remove("active");
      // Hapus juga kelas 'active' lama jika masih ada (dari CSS/kode lama Anda)
      link.classList.remove("active");

      // console.log("Comparing:", currentPath, "with", linkTarget); // Debugging: Perbandingan

      let isLinkActive = false;

      // Logika untuk menentukan apakah link aktif
      if (linkTarget === currentPath) {
        isLinkActive = true;
      } else if (currentPath === "" && linkTarget === "index.html") {
        // Menangani root path (e.g., mysite.com/ -> index.html)
        isLinkActive = true;
      } else if (currentPath === "index.html" && linkTarget === "") {
        // Menangani index.html jika href/targetpage kosong (tidak umum)
        isLinkActive = true;
      } else if (
        // Kasus khusus untuk link "Home" atau "Ownership" yang mungkin menunjuk ke index.html
        (currentPath === "index.html" || currentPath === "") &&
        (link.dataset.targetPage === "index" ||
          link.dataset.targetPage === "ownership") // Asumsi "ownership" juga di index.html
      ) {
        isLinkActive = true;
      }

      if (isLinkActive) {
        link.classList.add("active"); // Tambahkan kelas baru jika aktif
        // console.log("Added active-bold-green to:", link.textContent); // Debugging: Link aktif
      }
    });
  }

  function initializeModelsPage() {
    // Memilih semua elemen link model
    const modelLinks = document.querySelectorAll(
      ".model-selection-menu .model-link"
    );
    if (!modelLinks || modelLinks.length === 0) return; // Keluar jika tidak ada link model

    // Mengambil referensi ke semua elemen yang akan diperbarui
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

    // Peringatan jika ada elemen yang hilang
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
      console.warn("Missing elements for initializeModelsPage. Some features may not work.");
      return;
    }

    /**
     * Memperbarui konten halaman model berdasarkan data yang diberikan.
     * Menerapkan efek fade-out/fade-in untuk transisi yang halus.
     * @param {object} modelData - Objek yang berisi data model (image, model, power, speed, accel, desc).
     */
    function updateModelContent(modelData) {
      // Tambahkan kelas fade-out ke semua elemen yang akan diperbarui
      carDisplayImage.classList.add("fade-out");
      overlayModelName.classList.add("fade-out");
      infoStripModelName.classList.add("fade-out");
      maxPowerDisplay.classList.add("fade-out");
      maxSpeedDisplay.classList.add("fade-out");
      accelDisplay.classList.add("fade-out");
      detailsSectionTitle.classList.add("fade-out");
      detailsSectionText.classList.add("fade-out");
      footerModelName.classList.add("fade-out");

      // Tunggu sebentar agar animasi fade-out terlihat sebelum memperbarui konten
      setTimeout(() => {
        // Perbarui konten elemen dengan data model yang baru
        carDisplayImage.src = modelData.image;
        overlayModelName.textContent = modelData.model;
        infoStripModelName.textContent = modelData.model;
        maxPowerDisplay.textContent = modelData.power;
        maxSpeedDisplay.textContent = modelData.speed;
        accelDisplay.textContent = modelData.accel;
        detailsSectionTitle.textContent = `Discover the ${modelData.model}`;
        detailsSectionText.textContent = modelData.desc;
        footerModelName.textContent = modelData.model;

        // Hapus kelas fade-out dan tambahkan kelas fade-in
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

        // Hapus kelas fade-in setelah animasi selesai
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
        }, 500); // Durasi ini harus cocok dengan durasi transisi fade-in di CSS Anda
      }, 300); // Durasi ini harus cocok dengan durasi transisi fade-out di CSS Anda
    }

    // Menambahkan event listener untuk setiap link model
    modelLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        // Hapus kelas 'active' dari semua link model dan tambahkan ke link yang diklik
        modelLinks.forEach((item) => item.classList.remove("active"));
        this.classList.add("active");

        // Buat objek data model dari dataset elemen yang diklik
        const modelData = {
          model: this.dataset.model,
          image: this.dataset.image,
          power: this.dataset.power,
          speed: this.dataset.speed,
          accel: this.dataset.accel,
          desc: this.dataset.desc,
        };
        updateModelContent(modelData); // Perbarui konten dengan data model baru
      });
    });

    // Memuat konten model default saat halaman models pertama kali dimuat
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

  // Pemuatan awal header dan konten halaman
  loadHeader().then(() => {
    // Menentukan halaman awal berdasarkan URL browser
    const initialPage =
      window.location.pathname.split("/").pop().replace(".html", "") || "index";
    loadPageContent(initialPage);
  });

  // Event listener untuk tombol back/forward browser
  window.addEventListener("popstate", () => {
    const page =
      window.location.pathname.split("/").pop().replace(".html", "") || "index";
    loadPageContent(page);
  });
});
