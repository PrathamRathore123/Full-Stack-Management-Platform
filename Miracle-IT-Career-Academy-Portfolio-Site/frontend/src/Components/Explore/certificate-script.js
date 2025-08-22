// This script adds interactivity to the Certificate page

document.addEventListener('DOMContentLoaded', function() {
  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-toggle').textContent = '+';
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
      const toggle = item.querySelector('.faq-toggle');
      toggle.textContent = item.classList.contains('active') ? '−' : '+';
    });
  });
  
  // Initialize animation observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
});