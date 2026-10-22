export declare class CitySearchForm {
    private container;
    private onSearch;
    private form;
    private input;
    private button;
    private validationMessage;
    constructor(container: HTMLElement, onSearch: (cityName: string) => void);
    private initialize;
    private setupEventListeners;
    private handleSubmit;
    private showValidationMessage;
    private clearValidation;
    setEnabled(enabled: boolean): void;
    clear(): void;
    focus(): void;
    getValue(): string;
}
//# sourceMappingURL=CitySearchForm.d.ts.map