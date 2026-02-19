/* ============================================================
   auth.js — Shared logic for login.html & signup.html
   WebGL mesh | Supabase Auth | Form validation | Password strength
   ============================================================ */

// ── 0. SUPABASE CLIENT ───────────────────────────────────────
const SUPABASE_URL = 'https://ueboldprywbsoajqfuut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlYm9sZHByeXdic29hanFmdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjQ3MDEsImV4cCI6MjA4NzA0MDcwMX0.pqCyYHNUJEe5o6538FrI8JGpYNJyNLtJDRsTisxBIGE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ── 1. WEBGL BACKGROUND ──────────────────────────────────────
(function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    if (!window.THREE || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4);

    const geo = new THREE.PlaneGeometry(10, 10, 50, 50);
    const pos = geo.attributes.position;
    const origZ = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) origZ[i] = pos.getZ(i);

    const mat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed, wireframe: true, opacity: 0.14, transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 3.5;
    mesh.position.y = -1.5;
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl1 = new THREE.PointLight(0x06b6d4, 2, 20);
    pl1.position.set(3, 3, 3); scene.add(pl1);
    const pl2 = new THREE.PointLight(0x7c3aed, 2, 20);
    pl2.position.set(-3, -2, 2); scene.add(pl2);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i);
            pos.setZ(i, origZ[i] +
                Math.sin(x * 0.8 + t * 0.5) * 0.12 +
                Math.sin(y * 0.6 + t * 0.4) * 0.1 +
                Math.sin((x + y) * 0.4 + t * 0.7) * 0.07
            );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        mesh.rotation.z = t * 0.015;
        camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.15 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();
})();


// ── 2. HELPERS ───────────────────────────────────────────────
function setError(inputEl, msgEl, msg) {
    if (inputEl) { inputEl.classList.add('is-error'); inputEl.classList.remove('is-success'); }
    if (msgEl) msgEl.textContent = msg;
}
function setSuccess(inputEl, msgEl) {
    if (inputEl) { inputEl.classList.remove('is-error'); inputEl.classList.add('is-success'); }
    if (msgEl) msgEl.textContent = '';
}
function clearState(inputEl, msgEl) {
    if (inputEl) { inputEl.classList.remove('is-error', 'is-success'); }
    if (msgEl) msgEl.textContent = '';
}

function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function setButtonLoading(btn, labelEl, loading) {
    if (loading) {
        btn.disabled = true;
        btn.classList.add('loading');
    } else {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

function setButtonSuccess(btn, labelEl, text) {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.classList.add('success');
    if (labelEl) labelEl.textContent = text;
}

function showToast(message, type = 'info') {
    // Remove any existing toast
    const existing = document.getElementById('sb-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'sb-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: type === 'error' ? 'rgba(239,68,68,0.9)' : type === 'success' ? 'rgba(34,197,94,0.9)' : 'rgba(99,102,241,0.9)',
        color: '#fff',
        padding: '0.85rem 1.8rem',
        borderRadius: '999px',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.95rem',
        fontWeight: '500',
        zIndex: '9999',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.4s ease',
        opacity: '0',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}


// ── 3. TOGGLE PASSWORD VISIBILITY ───────────────────────────
function initTogglePass(toggleId, inputId) {
    const btn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    let visible = false;
    btn.addEventListener('click', () => {
        visible = !visible;
        input.type = visible ? 'text' : 'password';
        btn.style.opacity = visible ? '1' : '0.5';
    });
}

initTogglePass('toggle-login-pass', 'login-pass');
initTogglePass('toggle-su-pass', 'su-pass');
initTogglePass('toggle-su-confirm', 'su-confirm');


// ── 4. PASSWORD STRENGTH METER ───────────────────────────────
const suPassInput = document.getElementById('su-pass');
if (suPassInput) {
    suPassInput.addEventListener('input', () => {
        const val = suPassInput.value;
        const wrap = document.getElementById('strength-wrap');
        const fill = document.getElementById('strength-fill');
        const label = document.getElementById('strength-label');
        if (!wrap) return;

        if (val.length === 0) { wrap.classList.remove('visible'); return; }
        wrap.classList.add('visible');

        let score = 0;
        if (val.length >= 8) score++;
        if (val.length >= 12) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { pct: '20%', color: '#ef4444', text: 'Very Weak' },
            { pct: '40%', color: '#f97316', text: 'Weak' },
            { pct: '60%', color: '#eab308', text: 'Fair' },
            { pct: '80%', color: '#22c55e', text: 'Strong' },
            { pct: '100%', color: '#10b981', text: 'Very Strong' },
        ];
        const lv = levels[Math.min(score, levels.length - 1)];
        fill.style.width = lv.pct;
        fill.style.background = lv.color;
        label.textContent = lv.text;
        label.style.color = lv.color;
    });
}


// ── 5. LOGIN FORM — SUPABASE AUTH ────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');
    const emailErr = document.getElementById('email-err');
    const passErr = document.getElementById('pass-err');
    const submitBtn = document.getElementById('login-submit');
    const btnLabel = document.getElementById('login-label');

    // Live validation
    emailInput.addEventListener('blur', () => {
        if (!emailInput.value) {
            setError(emailInput, emailErr, 'Email is required');
        } else if (!validateEmail(emailInput.value)) {
            setError(emailInput, emailErr, 'Enter a valid email address');
        } else {
            setSuccess(emailInput, emailErr);
        }
    });
    emailInput.addEventListener('input', () => clearState(emailInput, emailErr));

    passInput.addEventListener('blur', () => {
        if (!passInput.value) setError(passInput, passErr, 'Password is required');
        else if (passInput.value.length < 6) setError(passInput, passErr, 'Password too short');
        else setSuccess(passInput, passErr);
    });
    passInput.addEventListener('input', () => clearState(passInput, passErr));

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        if (!emailInput.value || !validateEmail(emailInput.value)) {
            setError(emailInput, emailErr, 'Enter a valid email address'); valid = false;
        }
        if (!passInput.value || passInput.value.length < 6) {
            setError(passInput, passErr, 'Password must be at least 6 characters'); valid = false;
        }
        if (!valid) return;

        setButtonLoading(submitBtn, btnLabel, true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.value.trim(),
            password: passInput.value,
        });

        if (error) {
            setButtonLoading(submitBtn, btnLabel, false);
            showToast(error.message, 'error');
            setError(emailInput, emailErr, ' ');
            setError(passInput, passErr, 'Invalid email or password');
        } else {
            setButtonSuccess(submitBtn, btnLabel, '✓ Signed In!');
            showToast('Welcome back! Redirecting...', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        }
    });

    // Forgot password link
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (!email || !validateEmail(email)) {
                setError(emailInput, emailErr, 'Enter your email first, then click Forgot Password');
                return;
            }
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/login.html',
            });
            if (error) {
                showToast(error.message, 'error');
            } else {
                showToast('Password reset email sent! Check your inbox.', 'success');
            }
        });
    }

    // Google OAuth
    const googleBtn = document.getElementById('google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.style.opacity = '0.6';
            googleBtn.style.pointerEvents = 'none';
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + '/index.html' },
            });
            if (error) {
                showToast(error.message, 'error');
                googleBtn.style.opacity = '';
                googleBtn.style.pointerEvents = '';
            }
        });
    }

    // GitHub OAuth
    const githubBtn = document.getElementById('github-btn');
    if (githubBtn) {
        githubBtn.addEventListener('click', async () => {
            githubBtn.style.opacity = '0.6';
            githubBtn.style.pointerEvents = 'none';
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: window.location.origin + '/index.html' },
            });
            if (error) {
                showToast(error.message, 'error');
                githubBtn.style.opacity = '';
                githubBtn.style.pointerEvents = '';
            }
        });
    }
}


// ── 6. SIGNUP FORM — SUPABASE AUTH ───────────────────────────
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    const fnInput = document.getElementById('su-firstname');
    const lnInput = document.getElementById('su-lastname');
    const emInput = document.getElementById('su-email');
    const pwInput = document.getElementById('su-pass');
    const cfInput = document.getElementById('su-confirm');
    const termsChk = document.getElementById('agree-terms');

    const fnErr = document.getElementById('fn-err');
    const lnErr = document.getElementById('ln-err');
    const emErr = document.getElementById('su-email-err');
    const pwErr = document.getElementById('su-pass-err');
    const cfErr = document.getElementById('confirm-err');
    const termsErr = document.getElementById('terms-err');

    const submitBtn = document.getElementById('signup-submit');
    const btnLabel = document.getElementById('signup-label');

    // Live validations
    fnInput.addEventListener('blur', () => {
        fnInput.value.trim() ? setSuccess(fnInput, fnErr) : setError(fnInput, fnErr, 'First name required');
    });
    fnInput.addEventListener('input', () => clearState(fnInput, fnErr));

    lnInput.addEventListener('blur', () => {
        lnInput.value.trim() ? setSuccess(lnInput, lnErr) : setError(lnInput, lnErr, 'Last name required');
    });
    lnInput.addEventListener('input', () => clearState(lnInput, lnErr));

    emInput.addEventListener('blur', () => {
        if (!emInput.value) setError(emInput, emErr, 'Email is required');
        else if (!validateEmail(emInput.value)) setError(emInput, emErr, 'Enter a valid email');
        else setSuccess(emInput, emErr);
    });
    emInput.addEventListener('input', () => clearState(emInput, emErr));

    pwInput.addEventListener('blur', () => {
        if (!pwInput.value) setError(pwInput, pwErr, 'Password is required');
        else if (pwInput.value.length < 8) setError(pwInput, pwErr, 'Minimum 8 characters');
        else setSuccess(pwInput, pwErr);
    });
    pwInput.addEventListener('input', () => clearState(pwInput, pwErr));

    cfInput.addEventListener('blur', () => {
        if (!cfInput.value) setError(cfInput, cfErr, 'Please confirm your password');
        else if (cfInput.value !== pwInput.value) setError(cfInput, cfErr, 'Passwords do not match');
        else setSuccess(cfInput, cfErr);
    });
    cfInput.addEventListener('input', () => clearState(cfInput, cfErr));

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        if (!fnInput.value.trim()) { setError(fnInput, fnErr, 'First name required'); valid = false; }
        if (!lnInput.value.trim()) { setError(lnInput, lnErr, 'Last name required'); valid = false; }
        if (!emInput.value || !validateEmail(emInput.value)) { setError(emInput, emErr, 'Valid email required'); valid = false; }
        if (!pwInput.value || pwInput.value.length < 8) { setError(pwInput, pwErr, 'Min 8 characters'); valid = false; }
        if (cfInput.value !== pwInput.value) { setError(cfInput, cfErr, 'Passwords do not match'); valid = false; }
        if (!termsChk.checked) { termsErr.textContent = 'Please accept Terms & Privacy Policy'; valid = false; }
        else termsErr.textContent = '';

        if (!valid) return;

        setButtonLoading(submitBtn, btnLabel, true);

        const { data, error } = await supabase.auth.signUp({
            email: emInput.value.trim(),
            password: pwInput.value,
            options: {
                data: {
                    first_name: fnInput.value.trim(),
                    last_name: lnInput.value.trim(),
                    full_name: `${fnInput.value.trim()} ${lnInput.value.trim()}`,
                }
            }
        });

        if (error) {
            setButtonLoading(submitBtn, btnLabel, false);
            showToast(error.message, 'error');
            setError(emInput, emErr, error.message);
        } else {
            setButtonSuccess(submitBtn, btnLabel, '✓ Account Created!');
            showToast('Account created! Please check your email to confirm.', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        }
    });

    // Google OAuth
    const googleBtn = document.getElementById('google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.style.opacity = '0.6';
            googleBtn.style.pointerEvents = 'none';
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + '/index.html' },
            });
            if (error) {
                showToast(error.message, 'error');
                googleBtn.style.opacity = '';
                googleBtn.style.pointerEvents = '';
            }
        });
    }

    // GitHub OAuth
    const githubBtn = document.getElementById('github-btn');
    if (githubBtn) {
        githubBtn.addEventListener('click', async () => {
            githubBtn.style.opacity = '0.6';
            githubBtn.style.pointerEvents = 'none';
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: window.location.origin + '/index.html' },
            });
            if (error) {
                showToast(error.message, 'error');
                githubBtn.style.opacity = '';
                githubBtn.style.pointerEvents = '';
            }
        });
    }
}
