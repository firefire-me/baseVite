import type { Directive } from "vue";

export const vDirective: Directive = {
  mounted(
    el: HTMLImageElement & { _lazyObserver?: IntersectionObserver },
    binding,
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 占位图已经在 src 中设置，这里替换为真实图片
            el.src = binding.value;
            observer.unobserve(el);
          }
        });
      },
      {
        rootMargin: "50px", // 提前 50px 开始加载
      },
    );
    el._lazyObserver = observer;
    observer.observe(el);
  },
  unmounted(el: HTMLImageElement & { _lazyObserver?: IntersectionObserver }) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect();
      delete el._lazyObserver;
    }
  },
};
