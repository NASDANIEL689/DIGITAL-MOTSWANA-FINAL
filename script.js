document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const burger = document.querySelector(".burger")
  const nav = document.querySelector(".nav-links")

  if (burger) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("active")
    })
  }

  // Sidebar Toggle for Dashboard
  const menuToggle = document.querySelector(".menu-toggle")
  const sidebar = document.querySelector(".sidebar")

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains("active")
      ) {
        sidebar.classList.remove("active")
      }
    })
  }

  // Dashboard Navigation
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a")
  const dashboardSections = document.querySelectorAll(".dashboard-section")

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all links
      sidebarLinks.forEach((link) => {
        link.parentElement.classList.remove("active")
      })

      // Add active class to clicked link
      this.parentElement.classList.add("active")

      // Hide all sections
      dashboardSections.forEach((section) => {
        section.classList.remove("active")
      })

      // Show the corresponding section
      const sectionId = this.getAttribute("data-section")
      document.getElementById(sectionId).classList.add("active")
    })
  })

  // Set active menu item based on current section
  function setActiveMenuItem() {
    const currentSection = document.querySelector(".dashboard-section.active")
    if (currentSection) {
      const sectionId = currentSection.id
      const menuItem = document.querySelector(`.sidebar-nav a[data-section="${sectionId}"]`)

      // Remove active class from all menu items
      document.querySelectorAll(".sidebar-nav a").forEach((item) => {
        item.classList.remove("active")
      })

      // Add active class to current menu item
      if (menuItem) {
        menuItem.classList.add("active")
      }
    }
  }

  // Call on page load
  setActiveMenuItem()

  // Update active menu item when changing sections
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(setActiveMenuItem, 100)
    })
  })

  // Upload Document Modal
  const uploadBtn = document.getElementById("upload-document-btn")
  const uploadModal = document.getElementById("upload-modal")
  const closeModal = document.querySelector(".close-modal")
  const cancelUpload = document.querySelector(".cancel-upload")
  const addCard = document.querySelector(".add-card")

  if (uploadBtn && uploadModal) {
    uploadBtn.addEventListener("click", () => {
      uploadModal.style.display = "block"
    })

    if (addCard) {
      addCard.addEventListener("click", () => {
        uploadModal.style.display = "block"
      })
    }

    if (closeModal) {
      closeModal.addEventListener("click", () => {
        uploadModal.style.display = "none"
      })
    }

    if (cancelUpload) {
      cancelUpload.addEventListener("click", () => {
        uploadModal.style.display = "none"
      })
    }

    window.addEventListener("click", (e) => {
      if (e.target === uploadModal) {
        uploadModal.style.display = "none"
      }
    })
  }

  // Document Type Selection
  const documentType = document.getElementById("document-type")
  const otherDocumentTypeGroup = document.getElementById("other-document-type-group")

  if (documentType && otherDocumentTypeGroup) {
    documentType.addEventListener("change", function () {
      if (this.value === "other") {
        otherDocumentTypeGroup.style.display = "block"
      } else {
        otherDocumentTypeGroup.style.display = "none"
      }
    })
  }

  // File Upload Preview
  const documentFront = document.getElementById("document-front")
  const documentBack = document.getElementById("document-back")
  const frontPreview = document.getElementById("front-preview")
  const backPreview = document.getElementById("back-preview")

  if (documentFront && frontPreview) {
    documentFront.addEventListener("change", function () {
      previewFile(this, frontPreview)
    })
  }

  if (documentBack && backPreview) {
    documentBack.addEventListener("change", function () {
      previewFile(this, backPreview)
    })
  }

  function previewFile(input, previewElement) {
    const file = input.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = document.createElement("img")
        img.src = e.target.result
        img.style.maxWidth = "100%"
        img.style.maxHeight = "100%"

        previewElement.innerHTML = ""
        previewElement.appendChild(img)
      }

      reader.readAsDataURL(file)
    }
  }

  // QR Code Generation
  const generateQrBtn = document.getElementById("generate-qr-btn")
  const qrCodeImage = document.getElementById("qr-code-image")
  const downloadQrBtn = document.getElementById("download-qr-btn")

  if (generateQrBtn && qrCodeImage) {
    generateQrBtn.addEventListener("click", () => {
      // Get QR code options
      const includeName = document.getElementById("include-name").checked
      const includeDob = document.getElementById("include-dob").checked
      const includeAddress = document.getElementById("include-address").checked
      const includeIdNumber = document.getElementById("include-id-number").checked
      const includePhoto = document.getElementById("include-photo").checked

      // Create QR code data
      const userData = {
        name: includeName ? "John Doe" : undefined,
        dob: includeDob ? "1990-01-01" : undefined,
        address: includeAddress ? "123 Main Street, Anytown, AT 12345" : undefined,
        idNumber: includeIdNumber ? "ID12345678" : undefined,
        hasPhoto: includePhoto,
      }

      // Generate QR code
      const qrData = JSON.stringify(userData)

      // Using qrcode-generator library
      const typeNumber = 0
      const errorCorrectionLevel = "L"
      // Fix: Declare the qrcode variable
      const qr = qrcode(typeNumber, errorCorrectionLevel)
      qr.addData(qrData)
      qr.make()

      // Display QR code
      qrCodeImage.innerHTML = qr.createImgTag(5)

      // Enable download button
      if (downloadQrBtn) {
        downloadQrBtn.disabled = false
      }
    })

    if (downloadQrBtn) {
      downloadQrBtn.addEventListener("click", () => {
        const qrImg = qrCodeImage.querySelector("img")

        if (qrImg) {
          // Create a temporary link
          const link = document.createElement("a")
          link.href = qrImg.src
          link.download = "identity-qr-code.png"

          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      })
    }
  }

  // Form Submissions
  const registerForm = document.getElementById("register-form")
  const loginForm = document.getElementById("login-form")
  const contactForm = document.getElementById("contact-form")
  const documentUploadForm = document.getElementById("document-upload-form")

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()
      // In a real application, you would send the form data to the server
      alert("Registration successful! Redirecting to dashboard...")
      window.location.href = "dashboard.html"
    })
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      // In a real application, you would validate credentials
      alert("Login successful! Redirecting to dashboard...")
      window.location.href = "dashboard.html"
    })
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()
      // In a real application, you would send the message to the server
      alert("Message sent successfully! We will get back to you soon.")
      this.reset()
    })
  }

  if (documentUploadForm) {
    documentUploadForm.addEventListener("submit", (e) => {
      e.preventDefault()
      // In a real application, you would upload the document to the server
      alert("Document uploaded successfully!")
      uploadModal.style.display = "none"

      // Refresh the documents grid (in a real app, this would be done with the server response)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    })
  }
})
