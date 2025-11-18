export class CustomError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CustomError";
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
