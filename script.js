// Store all the images found in the Images directory (sorted chronologically)
const images = [
    "Images/IMG_7371.JPG",
    "Images/IMG_7637.JPG",
    "Images/IMG_7716.JPG",
    "Images/IMG_7729.JPG",
    "Images/IMG_7950.JPG",
    "Images/IMG_8213.JPG",
    "Images/IMG_8226.JPG",
    "Images/cpm35 2026-04-10 1517543E94BB4A636D.JPG",
    "Images/IMG_8248.JPG",
    "Images/IMG_8643.JPG",
    "Images/cpm35 2026-04-26 122448106F21C25BE4.JPG",
    "Images/cpm35 2026-05-01 1831510E8D589B9E31.JPG",
    "Images/cpm35 2026-05-01 183204E1073066CDBB.JPG",
    "Images/IMG_9226.JPG",
    "Images/IMG_9306.JPG",
    "Images/cpm35 2026-05-01 184347BC147FE431E1.JPG",
    "Images/cpm35 2026-05-01 184524DE4490355951.JPG",
    "Images/cpm35 2026-05-04 142453BC6913715072.JPG",
    "Images/IMG_9853.JPG"
];

// Second slideshow images (sorted chronologically)
const images2 = [
    "Images/second/IMG_7350.MP4",
    "Images/second/IMG_7635.JPG",
    "Images/second/IMG_7636.JPG",
    "Images/second/IMG_7662.JPG",
    "Images/second/IMG_7682.JPG",
    "Images/second/IMG_7915.JPG",
    "Images/second/RenderedImage.JPEG",
    "Images/second/D69A1146-94B6-4FDF-B191-3980807C4DD8.JPG",
    "Images/second/IMG_8244.JPG",
    "Images/second/IMG_8362.JPG",
    "Images/second/IMG_9417.JPG",
    "Images/second/cpm35 2026-05-04 142453BC6913715072.JPG"
];

// Screen Elements
const loginScreen = document.getElementById('login-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const profilesScreen = document.getElementById('profiles-screen');
const slideshowScreen = document.getElementById('slideshow-screen');
const paragraphScreen = document.getElementById('paragraph-screen');
const slideshow2Screen = document.getElementById('slideshow2-screen');
const paragraph2Screen = document.getElementById('paragraph2-screen');

// Interactive Elements
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const usProfile = document.getElementById('us-profile');
const slideshowImg = document.getElementById('slideshow-img');
const continueBtn = document.getElementById('continue-btn');
const slideshow2Img = document.getElementById('slideshow2-img');
const slideshow2Video = document.getElementById('slideshow2-video');

// Function to transition between screens smoothly
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    
    // Wait for the fade-out CSS transition to finish before showing the next screen
    setTimeout(() => {
        toScreen.classList.add('active');
    }, 800); 
}

// Background Music
const bgMusic = document.getElementById('bg-music');

// 1. Handle Login
loginBtn.addEventListener('click', () => {
    if (passwordInput.value === 'Nevaeh') {
        loginError.textContent = '';

        // Start background music with a smooth fade-in
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            // Fade volume in over 2 seconds
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol += 0.05;
                if (vol >= 1) {
                    vol = 1;
                    clearInterval(fadeIn);
                }
                bgMusic.volume = vol;
            }, 100);
        }).catch(err => {
            console.log('Audio autoplay blocked:', err);
        });

        switchScreen(loginScreen, welcomeScreen);
        
        // Wait for welcome animation (3.5s) to finish before moving to profiles
        setTimeout(() => {
            switchScreen(welcomeScreen, profilesScreen);
        }, 3500);
    } else {
        loginError.textContent = 'Incorrect password. Please try again.';
    }
});

// Allow hitting "Enter" to submit password
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// 2. Handle Profile Selection
usProfile.addEventListener('click', () => {
    switchScreen(profilesScreen, slideshowScreen);
    
    // Start the slideshow after the screen transition finishes
    setTimeout(() => {
        startSlideshow();
    }, 800);
});

// 3. First Slideshow Logic
function startSlideshow() {
    let currentIndex = 0;
    const slideDuration = 4000; // 4 seconds total per slide
    const fadeDuration = 1000; // 1 second for fading out (must match CSS transition time)

    function showNext() {
        if (currentIndex >= images.length) {
            switchScreen(slideshowScreen, paragraphScreen);
            return;
        }

        const nextImgUrl = images[currentIndex];
        
        // Create a temporary image object to preload
        const tempImg = new Image();
        tempImg.src = nextImgUrl;
        
        tempImg.onload = () => {
            // Once loaded, set the source and fade in
            slideshowImg.src = nextImgUrl;
            slideshowImg.style.opacity = 1;

            // Wait for slideDuration, then fade out and show next
            setTimeout(() => {
                slideshowImg.style.opacity = 0;
                setTimeout(() => {
                    currentIndex++;
                    showNext();
                }, fadeDuration);
            }, slideDuration);
        };
        
        tempImg.onerror = () => {
            console.error("Failed to load image: " + nextImgUrl);
            // Skip to next image on error so it doesn't get stuck
            currentIndex++;
            showNext();
        };
    }

    // Show the first image
    showNext();
}

// 4. Handle "Continue the journey" button
continueBtn.addEventListener('click', () => {
    switchScreen(paragraphScreen, slideshow2Screen);

    // Start the second slideshow after the screen transition finishes
    setTimeout(() => {
        startSlideshow2();
    }, 800);
});

// 5. Second Slideshow Logic
function startSlideshow2() {
    let currentIndex = 0;
    const slideDuration = 4000; // 4 seconds for images
    const fadeDuration = 1000; // 1 second for fade transitions

    function showNext() {
        if (currentIndex >= images2.length) {
            switchScreen(slideshow2Screen, paragraph2Screen);
            return;
        }

        const currentItem = images2[currentIndex];
        const isVideo = currentItem.toLowerCase().endsWith('.mp4');

        if (isVideo) {
            // Hide image, show video
            slideshow2Img.style.opacity = 0;
            setTimeout(() => {
                slideshow2Img.style.display = 'none';
            }, fadeDuration);
            
            slideshow2Video.style.display = 'block';
            slideshow2Video.src = currentItem;
            slideshow2Video.load();
            
            setTimeout(() => {
                slideshow2Video.style.opacity = 1;
                // Temporarily dip the background music volume during video playback
                bgMusic.volume = 0.15;
                slideshow2Video.volume = 0.8;
                
                slideshow2Video.play().catch(err => {
                    console.log('Video autoplay blocked, muting video:', err);
                    slideshow2Video.muted = true;
                    slideshow2Video.play();
                });
            }, 50);

            // Transition to next slide when video ends
            slideshow2Video.onended = () => {
                slideshow2Video.style.opacity = 0;
                
                // Fade background music back up to full volume
                let vol = bgMusic.volume;
                const fadeUp = setInterval(() => {
                    vol += 0.05;
                    if (vol >= 1.0) {
                        vol = 1.0;
                        clearInterval(fadeUp);
                    }
                    bgMusic.volume = vol;
                }, 100);

                setTimeout(() => {
                    slideshow2Video.style.display = 'none';
                    currentIndex++;
                    showNext();
                }, fadeDuration);
            };
            
        } else {
            // It's an image
            // Hide video, show image
            slideshow2Video.style.opacity = 0;
            slideshow2Video.pause();
            setTimeout(() => {
                slideshow2Video.style.display = 'none';
            }, fadeDuration);
            
            // Preload the image
            const tempImg = new Image();
            tempImg.src = currentItem;
            tempImg.onload = () => {
                slideshow2Img.style.display = 'block';
                slideshow2Img.src = currentItem;
                
                setTimeout(() => {
                    slideshow2Img.style.opacity = 1;
                }, 50);

                // Display for slideDuration, then transition
                setTimeout(() => {
                    slideshow2Img.style.opacity = 0;
                    setTimeout(() => {
                        currentIndex++;
                        showNext();
                    }, fadeDuration);
                }, slideDuration);
            };
            
            tempImg.onerror = () => {
                console.error("Failed to load image: " + currentItem);
                currentIndex++;
                showNext();
            };
        }
    }

    showNext();
}
