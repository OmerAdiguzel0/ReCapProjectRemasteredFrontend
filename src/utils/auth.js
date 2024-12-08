export const isAdmin = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        
        const user = JSON.parse(userStr);
        return user.isAdmin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

export const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
};

export const getUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Sabitler
const INACTIVITY_TIMEOUT = 60000; // 1 dakika hareketsizlik süresi
const SESSION_TIMEOUT = 3600000; // 60 dakika maksimum oturum süresi

let inactivityTimer;
let sessionTimer;
let lastActivityTime = Date.now();

// Kullanıcı aktivitesini izle
export const setupActivityTracking = () => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, handleUserActivity);
    });

    // İlk zamanlayıcıları başlat
    handleUserActivity();
};

// Kullanıcı aktivitesini yönet
const handleUserActivity = () => {
    lastActivityTime = Date.now();
    
    // Hareketsizlik zamanlayıcısını sıfırla
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        endSession();
    }, INACTIVITY_TIMEOUT);

    // Oturum zamanlayıcısını sıfırla
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        endSession();
    }, SESSION_TIMEOUT);
};

// Oturumu sonlandır
const endSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearTimeout(inactivityTimer);
    clearTimeout(sessionTimer);
    window.location.href = '/login';
};

// Token kontrolü ve süre yönetimi
export const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - lastActivityTime;

        // Hareketsizlik kontrolü (1 dakika)
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            endSession();
            return false;
        }

        // Token hala geçerli, kullanıcı aktif
        return true;
    } catch {
        endSession();
        return false;
    }
}; 