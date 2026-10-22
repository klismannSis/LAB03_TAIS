export class ErrorMessage {
  private messageElement: HTMLParagraphElement;

  constructor(private container: HTMLElement) {
    this.messageElement = document.createElement('p');
    this.messageElement.className = 'error-message';
    this.messageElement.setAttribute('role', 'alert');
    this.container.replaceChildren(this.messageElement);
  }

  show(message: string): void {
    this.messageElement.textContent = message;
    this.container.hidden = false;
  }

  clear(): void {
    this.messageElement.textContent = '';
    this.container.hidden = true;
  }
}