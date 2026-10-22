export class LoadingIndicator {
    container;
    constructor(container) {
        this.container = container;
    }
    show() {
        this.container.hidden = false;
    }
    hide() {
        this.container.hidden = true;
    }
}
//# sourceMappingURL=LoadingIndicator.js.map