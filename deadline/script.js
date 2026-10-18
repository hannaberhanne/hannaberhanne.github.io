// PRELOADER LOGIC
let assetsLoaded = 0;
let totalAssets = 11; // 10 panels + 1 video
const loadingFill = document.querySelector('.loading-fill');
const loadingText = document.querySelector('.loading-text');

function updateProgress() {
    assetsLoaded++;
    const progress = (assetsLoaded / totalAssets) * 100;
    if (loadingFill) loadingFill.style.width = progress + '%';
    
    if (assetsLoaded === totalAssets) {
        setTimeout(() => {
            if (loadingText) loadingText.textContent = 'Ready...';
            setTimeout(() => {
                document.getElementById('preloader').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('preloader').style.display = 'none';
                    initializeStage();
                }, 800);
            }, 400);
        }, 500);
    }
}

// Preload all panel images
const panelImages = [
    'assets/actualpanel1.jpg',
    'assets/actualpanel2.jpg',
    'assets/actualpanel3.jpg',
    'assets/actualpanel4.jpg',
    'assets/actualpanel5.jpg',
    'assets/actualpanel6.jpg',
    'assets/actualpanel7.jpg',
    'assets/actualpanel8.jpg',
    'assets/actualpanel9.jpg',
    'assets/actualpanel10.jpg'
];

panelImages.forEach(src => {
    const img = new Image();
    img.onload = updateProgress;
    img.onerror = updateProgress; // Count even if fails
    img.src = src;
});

// Wait for video to be ready
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('coffee-video');
    video.addEventListener('canplaythrough', updateProgress, { once: true });
    
    // Fallback if video doesn't load
    setTimeout(() => {
        if (assetsLoaded < totalAssets) {
            assetsLoaded = totalAssets - 1;
            updateProgress();
        }
    }, 8000); // Max 8 second wait
});

// MAIN STAGE LOGIC
function initializeStage() {
    const stage = document.getElementById('stage');
    const video = document.getElementById('coffee-video');
    const audio = document.getElementById('bg-audio');
    const btn = document.getElementById('sound-toggle');
    const zones = document.querySelectorAll('.story-zone');
    const errorMsg = document.getElementById('error-message');
    const titleOverlay = document.getElementById('title-overlay');
    const chapterIndicator = document.getElementById('chapter-indicator');

    let isPlaying = false;

    function flashErrorMessage(message) {
        errorMsg.textContent = message;
        errorMsg.style.opacity = 1;
        setTimeout(() => {
            errorMsg.style.opacity = 0;
        }, 800);
    }

    function setChapterPulse(chapterNum) {
        zones.forEach(z => z.style.animation = 'none');
        const nextZone = document.querySelector(`.story-zone[data-chapter="${chapterNum}"]`);
        if (nextZone) {
            nextZone.style.animation = 'pulse 2s infinite alternate';
        }
    }

    function flashTitle(title, subtitle) {
        titleOverlay.querySelector('.ch-title').textContent = title;
        titleOverlay.querySelector('.ch-subtitle').textContent = subtitle;
        titleOverlay.style.opacity = 1;
        
        setTimeout(() => {
            titleOverlay.style.opacity = 0.15;
        }, 600);
    }

    function flashChapterIndicator(text) {
        chapterIndicator.textContent = text;
        chapterIndicator.style.opacity = 1;
        
        setTimeout(() => {
            chapterIndicator.style.opacity = 0.2;
        }, 600);
    }

    // Initial setup
    stage.style.opacity = 0;
    setTimeout(() => {
        stage.style.transition = "opacity 2.5s ease";
        stage.style.opacity = 1;
        
        // Show initial title after fade in
        setTimeout(() => {
            flashTitle('በስራና በቤተሰብ መካከል', 'A journey through tension, identity, and balance');
            setChapterPulse(1);
        }, 1000);
    }, 100);

    // Audio toggle
    if (btn && audio) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const soundOff = btn.querySelector('.sound-off');
            const soundOn = btn.querySelector('.sound-on');

            if (isPlaying) {
                audio.pause();
                if (soundOff) soundOff.style.display = 'inline';
                if (soundOn) soundOn.style.display = 'none';
                isPlaying = false;
            } else {
                audio.play().catch(e => console.log("Audio needs user interaction"));
                audio.volume = 0.5;
                if (soundOff) soundOff.style.display = 'none';
                if (soundOn) soundOn.style.display = 'inline';
                isPlaying = true;
            }
        });
    } else if (btn) {
        // hide toggle when audio asset missing
        btn.style.display = 'none';
    }

    // Sequential navigation
    zones.forEach(zone => {
        zone.addEventListener('mouseenter', () => {
            const chapter = parseInt(zone.getAttribute('data-chapter'));
            const currentState = stage.getAttribute('data-state');
            const currentChapterNum = currentState === 'idle' ? 0 : parseInt(currentState.slice(-1));

            video.playbackRate = 0.2;
            
            if (chapter === currentChapterNum + 1) {
                const newState = 'ch' + chapter;
                stage.setAttribute('data-state', newState);
                
                const titles = ['WORK', 'CRISIS', 'CONNECTION', 'BALANCE'];
                const subtitles = [
                    'Focus meets obligation',
                    'The breaking point',
                    'Finding roots in ritual',
                    'Two worlds, one heart'
                ];
                
                flashTitle(`CHAPTER ${chapter}: ${titles[chapter - 1]}`, subtitles[chapter - 1]);
                flashChapterIndicator(`Chapter ${chapter}: ${titles[chapter - 1]}`);
                
                if (chapter < 4) {
                    setChapterPulse(chapter + 1);
                } else {
                    zones.forEach(z => z.style.animation = 'none');
                }
                
            } else if (chapter > currentChapterNum + 1) {
                flashErrorMessage("🚫 Must complete the Ritual in order");
            }
        });

        zone.addEventListener('mouseleave', () => {
            video.playbackRate = 1.0;
        });
    });
}