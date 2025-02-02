'use strict';

// Utility functions
const utils = {
  elementToggle: (elem) => elem?.classList.toggle("active"),
  
  safeQuerySelector: (selector, context = document) => {
    const element = context.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector "${selector}" not found`);
    }
    return element;
  },
  
  safeQuerySelectorAll: (selector, context = document) => {
    const elements = context.querySelectorAll(selector);
    if (elements.length === 0) {
      console.warn(`No elements found with selector "${selector}"`);
    }
    return elements;
  },

  animate: (element, keyframes, options) => {
    return element.animate(keyframes, options).finished;
  }
};

// Sidebar functionality
class Sidebar {
  constructor() {
    this.sidebar = utils.safeQuerySelector("[data-sidebar]");
    this.sidebarBtn = utils.safeQuerySelector("[data-sidebar-btn]");
    this.init();
  }

  init() {
    if (this.sidebarBtn && this.sidebar) {
      this.sidebarBtn.addEventListener("click", () => utils.elementToggle(this.sidebar));

      // Close sidebar on click outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-sidebar]') && 
            !e.target.closest('[data-sidebar-btn]') && 
            this.sidebar.classList.contains('active')) {
          utils.elementToggle(this.sidebar);
        }
      });
    }
  }
}

// Testimonials functionality
class Testimonials {
  constructor() {
    this.items = utils.safeQuerySelectorAll("[data-testimonials-item]");
    this.modalContainer = utils.safeQuerySelector("[data-modal-container]");
    this.modalCloseBtn = utils.safeQuerySelector("[data-modal-close-btn]");
    this.overlay = utils.safeQuerySelector("[data-overlay]");
    this.modalImg = utils.safeQuerySelector("[data-modal-img]");
    this.modalTitle = utils.safeQuerySelector("[data-modal-title]");
    this.modalText = utils.safeQuerySelector("[data-modal-text]");
    
    this.init();
  }

  toggleModal = () => {
    this.modalContainer?.classList.toggle("active");
    this.overlay?.classList.toggle("active");
    
    if (this.modalContainer?.classList.contains("active")) {
      document.body.style.overflow = 'hidden';
      document.addEventListener("keydown", this.handleEscKey);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener("keydown", this.handleEscKey);
    }
  }

  handleEscKey = (event) => {
    if (event.key === "Escape") {
      this.toggleModal();
    }
  }

  init() {
    this.items.forEach(item => {
      item.addEventListener("click", () => {
        const avatar = item.querySelector("[data-testimonials-avatar]");
        const title = item.querySelector("[data-testimonials-title]");
        const text = item.querySelector("[data-testimonials-text]");

        if (this.modalImg && avatar) {
          this.modalImg.src = avatar.src;
          this.modalImg.alt = avatar.alt;
        }
        if (this.modalTitle && title) this.modalTitle.innerHTML = title.innerHTML;
        if (this.modalText && text) this.modalText.innerHTML = text.innerHTML;

        this.toggleModal();
      });
    });

    this.modalCloseBtn?.addEventListener("click", this.toggleModal);
    this.overlay?.addEventListener("click", this.toggleModal);
  }
}

// Filter functionality
class Filter {
  constructor() {
    this.select = utils.safeQuerySelector("[data-select]");
    this.selectItems = utils.safeQuerySelectorAll("[data-select-item]");
    this.selectValue = utils.safeQuerySelector("[data-selecct-value]");
    this.filterBtn = utils.safeQuerySelectorAll("[data-filter-btn]");
    this.filterItems = utils.safeQuerySelectorAll("[data-filter-item]");
    this.lastClickedBtn = this.filterBtn[0];
    
    this.init();
  }

  async filterElements(selectedValue) {
    const animations = this.filterItems.map(async (item) => {
      const shouldBeActive = 
        selectedValue === "all" || 
        selectedValue === item.dataset.category;
      
      if (shouldBeActive) {
        item.classList.add("active");
        await utils.animate(item, [
          { opacity: 0, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1)' }
        ], {
          duration: 300,
          easing: 'ease-out'
        });
      } else {
        await utils.animate(item, [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.8)' }
        ], {
          duration: 300,
          easing: 'ease-in'
        });
        item.classList.remove("active");
      }
    });

    await Promise.all(animations);
  }

  init() {
    this.select?.addEventListener("click", () => utils.elementToggle(this.select));

    // Close select dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-select]') && 
          this.select?.classList.contains('active')) {
        utils.elementToggle(this.select);
      }
    });

    this.selectItems.forEach(item => {
      item.addEventListener("click", async () => {
        const selectedValue = item.innerText.toLowerCase();
        if (this.selectValue) this.selectValue.innerText = item.innerText;
        utils.elementToggle(this.select);
        await this.filterElements(selectedValue);
      });
    });

    this.filterBtn.forEach(btn => {
      btn.addEventListener("click", async () => {
        const selectedValue = btn.innerText.toLowerCase();
        if (this.selectValue) this.selectValue.innerText = btn.innerText;
        await this.filterElements(selectedValue);

        this.lastClickedBtn?.classList.remove("active");
        btn.classList.add("active");
        this.lastClickedBtn = btn;
      });
    });
  }
}

// Contact form functionality
class ContactForm {
  constructor() {
    this.form = utils.safeQuerySelector("[data-form]");
    this.formInputs = utils.safeQuerySelectorAll("[data-form-input]");
    this.formBtn = utils.safeQuerySelector("[data-form-btn]");
    this.loadingSpinner = this.createLoadingSpinner();
    
    // Initialize EmailJS - Replace with your public key
    emailjs.init("FKFuCBj-k3OhzITWk");
    
    this.init();
  }

  createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner hidden';
    spinner.innerHTML = `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
    this.formBtn?.parentNode.appendChild(spinner);
    return spinner;
  }

  showLoading(show) {
    if (this.formBtn && this.loadingSpinner) {
      this.formBtn.style.display = show ? 'none' : 'block';
      this.loadingSpinner.classList.toggle('hidden', !show);
    }
  }

  async sendEmail(formData) {
    try {
      // Replace with your service and template IDs
      const response = await emailjs.send("service_ownj76e","template_x7tqcv9", {
        from_name: formData.get('name'),
        reply_to: formData.get('email'),
        message: formData.get('message')
      });

      if (response.status === 200) {
        this.showSuccessMessage();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      this.showErrorMessage();
    }
  }

  showSuccessMessage() {
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success mt-3';
    successAlert.innerHTML = `
      <div class="alert-content">
        <i class="fas fa-check-circle"></i>
        Message sent successfully!
      </div>
    `;
    this.form?.appendChild(successAlert);
    
    setTimeout(() => {
      successAlert.remove();
      this.form?.reset();
    }, 3000);
  }

  showErrorMessage() {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger mt-3';
    errorAlert.innerHTML = `
      <div class="alert-content">
        <i class="fas fa-exclamation-circle"></i>
        Failed to send message. Please try again later.
      </div>
    `;
    this.form?.appendChild(errorAlert);
    
    setTimeout(() => {
      errorAlert.remove();
    }, 3000);
  }

  validateForm = () => {
    const isValid = this.form?.checkValidity();
    if (this.formBtn) {
      if (isValid) {
        this.formBtn.removeAttribute("disabled");
      } else {
        this.formBtn.setAttribute("disabled", "");
      }
    }
  }

  init() {
    this.formInputs.forEach(input => {
      input.addEventListener("input", this.validateForm);
      
      // Add floating label effect
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });
      
      input.addEventListener("blur", () => {
        if (!input.value) {
          input.parentElement.classList.remove("focused");
        }
      });
    });

    this.form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.showLoading(true);

      const formData = new FormData(this.form);
      await this.sendEmail(formData);
      
      this.showLoading(false);
    });
  }
}

// Navigation functionality
class Navigation {
  constructor() {
    this.navigationLinks = utils.safeQuerySelectorAll("[data-nav-link]");
    this.pages = utils.safeQuerySelectorAll("[data-page]");
    this.currentPage = utils.safeQuerySelector("[data-page].active");
    
    this.init();
  }

  async animatePageTransition(currentPage, nextPage, direction = 'forward') {
    const translateOut = direction === 'forward' ? '-100px' : '100px';
    const translateIn = direction === 'forward' ? '100px' : '-100px';

    await utils.animate(currentPage, [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: `translateX(${translateOut})`, opacity: 0 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    currentPage.classList.remove('active');
    nextPage.classList.add('active');

    return utils.animate(nextPage, [
      { transform: `translateX(${translateIn})`, opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
  }

  init() {
    let lastPageIndex = Array.from(this.pages).findIndex(page => page.classList.contains('active'));

    this.navigationLinks.forEach((link, index) => {
      link.addEventListener("click", async () => {
        const targetPage = link.innerHTML.toLowerCase();
        const currentPage = utils.safeQuerySelector("[data-page].active");
        const nextPage = utils.safeQuerySelector(`[data-page="${targetPage}"]`);

        if (currentPage === nextPage) return;

        const direction = index > lastPageIndex ? 'forward' : 'backward';
        lastPageIndex = index;

        // Update navigation states
        this.navigationLinks.forEach((navLink, navIndex) => {
          navLink.classList.toggle("active", navIndex === index);
        });

        // Perform page transition
        await this.animatePageTransition(currentPage, nextPage, direction);

        // Smooth scroll to top
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });
  }
}

// Initialize all components
document.addEventListener("DOMContentLoaded", () => {
  new Sidebar();
  new Testimonials();
  new Filter();
  new ContactForm();
  new Navigation();
});