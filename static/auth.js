/* ==========================================================================
   AUTH.JS — Authentication modal, form handling, and user menu logic
   ========================================================================== */

// =============================================================================
// AUTH MODAL: Open / Close
// =============================================================================

/**
 * Open the auth modal with a specific tab active.
 * @param {'login'|'signup'} tab - Which tab to show
 */
function openAuthModal(tab) {
    const overlay = document.getElementById('authModalOverlay');
    const modal = document.getElementById('authModal');
    if (!overlay || !modal) return;

    // Reset forms and errors
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';

    // Hide success state, show forms
    const successEl = document.getElementById('authSuccess');
    if (successEl) successEl.style.display = 'none';

    // Show the correct tab
    switchAuthTab(tab || 'login');

    // Show overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input after animation
    setTimeout(function () {
        const activeForm = tab === 'signup' ? 'signupUsername' : 'loginEmail';
        const input = document.getElementById(activeForm);
        if (input) input.focus();
    }, 350);
}


/**
 * Close the auth modal.
 */
function closeAuthModal() {
    const overlay = document.getElementById('authModalOverlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = '';
}


// Close on overlay click (outside modal)
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('authModalOverlay');
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('authModalClose');

    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeAuthModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }

    // ESC key closes modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAuthModal();
    });
});


// =============================================================================
// TAB SWITCHING
// =============================================================================

function switchAuthTab(tab) {
    const loginTab = document.getElementById('authTabLogin');
    const signupTab = document.getElementById('authTabSignup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const indicator = document.getElementById('authTabIndicator');

    if (!loginTab || !signupTab || !loginForm || !signupForm) return;

    // Clear error messages
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').textContent = '';
    document.getElementById('signupError').style.display = 'none';

    if (tab === 'signup') {
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        if (indicator) indicator.style.transform = 'translateX(100%)';
    } else {
        signupTab.classList.remove('active');
        loginTab.classList.add('active');
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
        if (indicator) indicator.style.transform = 'translateX(0)';
    }
}

// Tab click handlers
document.addEventListener('DOMContentLoaded', function () {
    const loginTab = document.getElementById('authTabLogin');
    const signupTab = document.getElementById('authTabSignup');

    if (loginTab) loginTab.addEventListener('click', function () { switchAuthTab('login'); });
    if (signupTab) signupTab.addEventListener('click', function () { switchAuthTab('signup'); });
});


// =============================================================================
// FORM SUBMISSIONS — Login & Signup via fetch()
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {

    // --- LOGIN FORM ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');
            const submitBtn = document.getElementById('loginSubmitBtn');
            const submitText = submitBtn.querySelector('.auth-submit-text');
            const submitLoader = submitBtn.querySelector('.auth-submit-loader');

            // Clear previous error
            errorEl.textContent = '';
            errorEl.style.display = 'none';

            // Show loading
            submitBtn.disabled = true;
            submitText.textContent = 'Signing in...';
            submitLoader.style.display = 'inline-block';

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
                .then(function (res) { return res.json().then(function (data) { return { status: res.status, data }; }); })
                .then(function (result) {
                    submitBtn.disabled = false;
                    submitText.textContent = 'Login';
                    submitLoader.style.display = 'none';

                    if (result.data.success) {
                        showAuthSuccess(result.data.message || 'Welcome back!', result.data.user.username);
                    } else {
                        errorEl.textContent = result.data.error || 'Login failed';
                        errorEl.style.display = 'block';
                    }
                })
                .catch(function (err) {
                    submitBtn.disabled = false;
                    submitText.textContent = 'Login';
                    submitLoader.style.display = 'none';
                    errorEl.textContent = 'Network error. Please try again.';
                    errorEl.style.display = 'block';
                });
        });
    }

    // --- SIGNUP FORM ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('signupUsername').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const errorEl = document.getElementById('signupError');
            const submitBtn = document.getElementById('signupSubmitBtn');
            const submitText = submitBtn.querySelector('.auth-submit-text');
            const submitLoader = submitBtn.querySelector('.auth-submit-loader');

            // Clear previous error
            errorEl.textContent = '';
            errorEl.style.display = 'none';

            // Client-side validation
            if (username.length < 2) {
                errorEl.textContent = 'Username must be at least 2 characters';
                errorEl.style.display = 'block';
                return;
            }
            if (password.length < 6) {
                errorEl.textContent = 'Password must be at least 6 characters';
                errorEl.style.display = 'block';
                return;
            }

            // Show loading
            submitBtn.disabled = true;
            submitText.textContent = 'Creating account...';
            submitLoader.style.display = 'inline-block';

            fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })
                .then(function (res) { return res.json().then(function (data) { return { status: res.status, data }; }); })
                .then(function (result) {
                    submitBtn.disabled = false;
                    submitText.textContent = 'Create Account';
                    submitLoader.style.display = 'none';

                    if (result.data.success) {
                        showAuthSuccess('Account created!', result.data.user.username);
                    } else {
                        errorEl.textContent = result.data.error || 'Signup failed';
                        errorEl.style.display = 'block';
                    }
                })
                .catch(function (err) {
                    submitBtn.disabled = false;
                    submitText.textContent = 'Create Account';
                    submitLoader.style.display = 'none';
                    errorEl.textContent = 'Network error. Please try again.';
                    errorEl.style.display = 'block';
                });
        });
    }
});


// =============================================================================
// AUTH SUCCESS STATE — Show success and reload
// =============================================================================

function showAuthSuccess(message, username) {
    // Hide forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const divider = document.querySelector('.auth-divider');
    const googleBtn = document.getElementById('googleAuthBtn');
    const tabs = document.getElementById('authTabs');

    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (googleBtn) googleBtn.style.display = 'none';
    if (tabs) tabs.style.display = 'none';

    // Show success
    const successEl = document.getElementById('authSuccess');
    const successTitle = document.getElementById('authSuccessTitle');
    const successMsg = document.getElementById('authSuccessMsg');

    if (successTitle) successTitle.textContent = 'Welcome, ' + username + '!';
    if (successMsg) successMsg.textContent = message;
    if (successEl) successEl.style.display = 'flex';

    // Reload after brief success display
    setTimeout(function () {
        window.location.reload();
    }, 1200);
}


// =============================================================================
// GOOGLE AUTH — Placeholder handler
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const googleBtn = document.getElementById('googleAuthBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            fetch('/auth/google')
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    // Show message in whichever error element is visible
                    const loginError = document.getElementById('loginError');
                    const signupError = document.getElementById('signupError');
                    const activeError = document.getElementById('loginForm').style.display !== 'none' ? loginError : signupError;

                    if (activeError) {
                        activeError.textContent = data.message || 'Google auth coming soon!';
                        activeError.style.display = 'block';
                        activeError.classList.add('auth-info');
                    }
                });
        });
    }
});


// =============================================================================
// USER DROPDOWN MENU
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const userBtn = document.getElementById('navUserBtn');
    const dropdown = document.getElementById('navDropdown');

    if (userBtn && dropdown) {
        userBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            userBtn.classList.toggle('open');
        });

        // Close dropdown on outside click
        document.addEventListener('click', function () {
            dropdown.classList.remove('open');
            userBtn.classList.remove('open');
        });

        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // --- LOGOUT ---
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fetch('/logout')
                .then(function (res) { return res.json(); })
                .then(function () {
                    window.location.href = '/';
                });
        });
    }
});


// =============================================================================
// PROTECTED ROUTE INTERCEPT — Open modal instead of navigating
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const protectedLinks = document.querySelectorAll('.nav-protected');

    protectedLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            openAuthModal('login');
        });
    });
});
