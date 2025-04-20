import { tools } from "../modules/Tools.js";

class Panel {
    constructor(data) {
        Object.assign(this, data);

        this.isOpen = false;
        this.isClose = false;
    }

    async open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        this.timepicker = this.create();
        document.body.appendChild(this.timepicker);

        this.onOpen();
        this.position();

        this.timepicker.classList.add("in");
        await tools.animationend(this.timepicker);
    }

    render(el) {
        this.timepicker.firstChild.appendChild(el);
    }

    create() {
        const timepicker = document.createElement("div");
        timepicker.classList.add("timepicker");
        timepicker.addEventListener("mousedown", this.checkClose.bind(this));
        timepicker.addEventListener("touchstart", this.checkClose.bind(this), { passive: true });
        timepicker.addEventListener("click", () => {
            if (this.isClose) {
                this.close();
            }
        });
        this.resize = this.handleResize.bind(this);
        window.addEventListener("resize", this.resize);

        const content = document.createElement("div");
        content.id = "timepicker-content";
        content.classList.add("content");
        content.addEventListener("click", (e) => e.stopPropagation());
        timepicker.appendChild(content);

        return timepicker;
    }

    position() {
        if (document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight)) {
            lockTopScroll('#top', '#timepicker-content');

        }

        const input = this.input.get();
        const rect = input.getBoundingClientRect();

        if (innerWidth < 768) {
            this.timepicker.firstChild.removeAttribute("style");
            return;
        }

        this.observer = new MutationObserver(() => {
            if (rect.top + this.timepicker.firstChild.offsetHeight + input.offsetHeight > window.innerHeight) {
                this.timepicker.firstChild.style.top = `${rect.top - this.timepicker.firstChild.offsetHeight - 4}px`;
            } else {
                this.timepicker.firstChild.style.top = `${rect.top + input.offsetHeight + 2}px`;
            }
        });
        this.observer.observe(this.timepicker.firstChild, { attributes: true });

        this.timepicker.firstChild.style.left = `${rect.left}px`;
    }

    checkClose(e) {
        if (e.target === this.timepicker) {
            this.isClose = true;
        }
    }

    async close() {
        this.isOpen = false;
        this.isClose = false;


        unlockTopScroll('#top', '#timepicker-content');

        this.timepicker.classList.add("out");

        await tools.animationend(this.timepicker);

        this.onClose();
        this.destroy();
    }

    handleResize() {
        this.position();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener("resize", this.resize);
        this.timepicker.remove();
    }
}
const preventDefaultScroll = (e) => e.preventDefault();
const allowScrollWithoutPropagation = (e) => e.stopPropagation();
const lockTopScroll = (parentSelector, childSelector) => {
    const parentElement = document.querySelector(parentSelector);
    //const childElement = document.querySelector(childSelector);

    parentElement?.classList.add('locked-scroll');
    parentElement?.addEventListener('wheel', preventDefaultScroll, { passive: false });
    parentElement?.addEventListener('touchmove', preventDefaultScroll, { passive: false });

    //childElement?.addEventListener('wheel', allowScrollWithoutPropagation, false);
    //childElement?.addEventListener('touchmove', allowScrollWithoutPropagation, false);
};
const unlockTopScroll = (parentSelector, childSelector) => {
    const parentElement = document.querySelector(parentSelector);
    //const childElement = document.querySelector(childSelector);
    parentElement.classList.remove('locked-scroll');
    parentElement.removeEventListener('wheel', preventDefaultScroll);
    parentElement.removeEventListener('touchmove', preventDefaultScroll);

    //childElement.removeEventListener('wheel', allowScrollWithoutPropogation);
    //childElement.removeEventListener('touchmove', allowScrollWithoutPropogation);
};

export default Panel;
