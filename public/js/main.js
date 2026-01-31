/**
 * IEEE CIS CUSB Theme JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Navigation scroll effect
    const nav = document.getElementById('mainNav');
    
    if (nav) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Smooth continuous scrolling - parallax layers
    const sections = document.querySelectorAll('section');
    let ticking = false;
    
    function updateParallax() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        sections.forEach(function(section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionCenter = sectionTop + section.offsetHeight / 2;
            const viewportCenter = scrollY + windowHeight / 2;
            const distance = sectionCenter - viewportCenter;
            const parallaxAmount = distance * 0.05;
            
            // Apply subtle parallax to section content
            const content = section.querySelector('.about-content, .join-content, .events-header');
            if (content) {
                content.style.transform = `translateY(${parallaxAmount}px)`;
            }
        });
        
        // Animate global particles based on scroll
        const globalParticles = document.querySelectorAll('.global-particle');
        globalParticles.forEach(function(particle, index) {
            const speed = 0.02 + (index % 5) * 0.01;
            const offset = scrollY * speed;
            particle.style.transform = `translateY(${-offset}px)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    // Global background mouse tracking effect
    const globalBackground = document.getElementById('globalBackground');
    
    if (globalBackground) {
        document.addEventListener('mousemove', function(e) {
            globalBackground.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(100, 200, 255, 0.12) 0%, transparent 50%)`;
        }, { passive: true });
    }

    // About section scroll reveal - each item animates as it comes into view
    const aboutItems = document.querySelectorAll('.about-item');
    
    if (aboutItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-50px',
            threshold: 0.2
        };
        
        const aboutObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve so animation can replay if needed
                } else {
                    // Remove visible class when out of view for re-animation on scroll back
                    // Uncomment below line if you want animation to replay when scrolling back
                    // entry.target.classList.remove('visible');
                }
            });
        }, observerOptions);
        
        aboutItems.forEach(function(item) {
            aboutObserver.observe(item);
        });
    }

    // Scroll reveal for any element with .scroll-reveal class
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    if (scrollRevealElements.length > 0) {
        const scrollRevealOptions = {
            root: null,
            rootMargin: '-100px',
            threshold: 0.15
        };
        
        const scrollRevealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, scrollRevealOptions);
        
        scrollRevealElements.forEach(function(el) {
            scrollRevealObserver.observe(el);
        });
    }

    // Team cards scroll reveal with staggered animation
    const teamCards = document.querySelectorAll('.team-card');
    
    if (teamCards.length > 0) {
        const teamObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const teamObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index')) || 0;
                    setTimeout(function() {
                        entry.target.classList.add('visible');
                    }, index * 150);
                }
            });
        }, teamObserverOptions);
        
        teamCards.forEach(function(card) {
            teamObserver.observe(card);
        });
    }

    // Hackathon cards scroll reveal with staggered animation - FAST trigger
    const hackathonCards = document.querySelectorAll('.hackathon-card');
    
    if (hackathonCards.length > 0) {
        const hackathonObserverOptions = {
            root: null,
            rootMargin: '100px 0px 100px 0px', // Trigger 100px before entering viewport
            threshold: 0
        };
        
        const hackathonObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index')) || 0;
                    // Faster stagger: 60ms between cards for snappier cascade
                    setTimeout(function() {
                        entry.target.classList.add('visible');
                    }, index * 60);
                    hackathonObserver.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, hackathonObserverOptions);
        
        hackathonCards.forEach(function(card) {
            hackathonObserver.observe(card);
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        if (mobileMenuToggle) {
                            mobileMenuToggle.innerHTML = '☰';
                        }
                    }
                }
            }
        });
    });

    // Hero parallax effect
    const heroTitle = document.querySelector('.hero-title');
    const heroTagline = document.querySelector('.hero-tagline');
    
    if (heroTitle && heroTagline) {
        window.addEventListener('scroll', function() {
            const scrollProgress = window.scrollY / window.innerHeight;
            const scale = 1 - scrollProgress * 0.1;
            const opacity = Math.max(0, 1 - scrollProgress * 1.2);
            const translateY = scrollProgress * 60;
            
            heroTitle.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            heroTitle.style.opacity = opacity;
            heroTagline.style.opacity = opacity;
            heroTagline.style.transform = `translateY(${translateY * 0.5}px)`;
        }, { passive: true });
    }

    // Glow orb animation
    const glowOrb1 = document.querySelector('.hero-glow-1');
    const glowOrb2 = document.querySelector('.hero-glow-2');
    
    if (glowOrb1 && glowOrb2) {
        const duration = 8000;
        const startTime = Date.now();
        
        function animateGlowOrbs() {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            
            glowOrb1.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * 30}px) translateX(${Math.cos(progress * Math.PI * 2) * 20}px)`;
            glowOrb2.style.transform = `translateY(${Math.sin((progress + 0.5) * Math.PI * 2) * 30}px) translateX(${Math.cos((progress + 0.5) * Math.PI * 2) * 20}px)`;
            
            requestAnimationFrame(animateGlowOrbs);
        }
        
        requestAnimationFrame(animateGlowOrbs);
    }

    // Footer fade in effect
    const footer = document.querySelector('.site-footer');
    
    if (footer) {
        const footerObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    footer.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        footerObserver.observe(footer);
    }

    // Join section scroll reveal animation
    const joinContent = document.querySelector('.join-content');
    
    if (joinContent) {
        const joinObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    joinContent.classList.add('visible');
                    joinObserver.unobserve(entry.target);
                }
            });
        }, { 
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        });
        
        joinObserver.observe(joinContent);
    }
});
