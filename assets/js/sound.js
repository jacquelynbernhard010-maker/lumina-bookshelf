/**
 * Lumina Bookshelf - Cozy UI Sound Engine
 * Uses Web Audio API with pre-decoded AudioBuffers for 0ms latency audio feedback.
 */
(function() {
    const SOUND_FILES = {
        click: 'assets/sounds/click_soft_01.wav',
        confirm: 'assets/sounds/confirm_01.wav',
        cancel: 'assets/sounds/cancel_back_01.wav',
        pop: 'assets/sounds/pop_03.wav',
        toggle: 'assets/sounds/toggle_on_01.wav',
        meow: 'assets/sounds/meow_hello_02.wav',
        levelUp: 'assets/sounds/level_up_01.wav',
        coin: 'assets/sounds/purchase_coin_07.wav',
        bonk: 'assets/sounds/error_bonk_01.wav',
        tick: 'assets/sounds/hover_tick_02.wav'
    };

    let audioCtx = null;
    const buffers = {};
    let isLoaded = false;
    let enabled = localStorage.getItem('cozy_sound_enabled') !== 'false';

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    async function loadBuffers() {
        if (isLoaded) return;
        isLoaded = true;
        const ctx = getAudioContext();
        if (!ctx) return;

        for (const [key, path] of Object.entries(SOUND_FILES)) {
            try {
                const res = await fetch(path);
                if (!res.ok) continue;
                const arrayBuffer = await res.arrayBuffer();
                buffers[key] = await ctx.decodeAudioData(arrayBuffer);
            } catch (err) {
                // Silently fallback if decode fails
            }
        }
    }

    // Preload on first user interaction anywhere
    const unlockAudio = () => {
        getAudioContext();
        loadBuffers();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    window.SoundFx = {
        get enabled() {
            return enabled;
        },
        set enabled(val) {
            enabled = Boolean(val);
            try {
                localStorage.setItem('cozy_sound_enabled', enabled ? 'true' : 'false');
            } catch (e) {}
        },
        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        },
        play(name, volume = 0.5) {
            if (!enabled) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const buf = buffers[name];
            if (buf) {
                try {
                    const source = ctx.createBufferSource();
                    source.buffer = buf;
                    const gain = ctx.createGain();
                    gain.gain.value = volume;
                    source.connect(gain);
                    gain.connect(ctx.destination);
                    source.start(0);
                } catch (e) {}
            } else {
                // Fallback to HTML Audio if buffer isn't ready yet
                const filePath = SOUND_FILES[name];
                if (filePath) {
                    try {
                        const a = new Audio(filePath);
                        a.volume = volume;
                        a.play().catch(() => {});
                    } catch (e) {}
                }
            }
        }
    };
})();
