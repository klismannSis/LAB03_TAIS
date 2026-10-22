export class ErrorMessage {
    container;
    messageElement;
    constructor(container) {
        this.container = container;
        this.messageElement = document.createElement('p');
        this.messageElement.className = 'error-message';
        this.messageElement.setAttribute('role', 'alert');
        this.container.replaceChildren(this.messageElement);
    }
    show(message) {
        this.messageElement.textContent = message;
        this.container.hidden = false;
    }
    clear() {
        this.messageElement.textContent = '';
        this.container.hidden = true;
    }
}
//# sourceMappingURL=ErrorMessage.js.map