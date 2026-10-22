export class LoadingIndicator {
  constructor(private container: HTMLElement) {}

  show(): void {
    this.container.hidden = false;
  }

  hide(): void {
    this.container.hidden = true;
  }
}