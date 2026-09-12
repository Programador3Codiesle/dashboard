export class MustChangePasswordError extends Error {
  readonly userId: string;
  readonly changeToken: string;

  constructor(userId: string, changeToken: string) {
    super('MUST_CHANGE_PASSWORD');
    this.name = 'MustChangePasswordError';
    this.userId = userId;
    this.changeToken = changeToken;
  }
}
