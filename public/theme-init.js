// Corre antes do React para evitar flash de tema e manter o idioma guardado.
(function () {
  try {
    var storedTheme = localStorage.getItem('salu_theme');
    var dark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (error) {}
  try {
    var storedLocale = localStorage.getItem('salu_locale');
    if (storedLocale === 'pt' || storedLocale === 'en') document.documentElement.lang = storedLocale;
  } catch (error) {}
})();
