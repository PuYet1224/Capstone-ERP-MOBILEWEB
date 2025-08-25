export class PSString {
  public static isNullOrWhitespace(str: string): boolean {
    return str == null || str == undefined || str.trim().length == 0;
  }

  public static highlightRequiredLabels() {
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        if (el.children.length === 0 && el.textContent?.includes('(*)')) {
          el.innerHTML = el.textContent.replace(
            /\(\*\)/g, '<span class="material-icons required-icons">emergency</span>'
          );
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}