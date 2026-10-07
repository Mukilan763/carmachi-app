export const getTheme = () => localStorage.getItem('carmachi_theme') || 'light';
export const setTheme = (theme: string) => {
    localStorage.setItem('carmachi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    window.dispatchEvent(new Event('theme-updated'));
};
