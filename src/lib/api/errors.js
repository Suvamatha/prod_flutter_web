export class ApiError extends Error {
  /**
   * @param {'INVALID_REPO'|'REPO_NOT_FOUND'|'NOT_FLUTTER'|'BUILD_FAILED'|'NOT_FOUND'|'NETWORK'} code
   * @param {string} message user-facing message
   * @param {{ step?: number, log?: string[] }} [extra]
   */
  constructor(code, message, extra = {}) {
    super(message)
    this.code = code
    Object.assign(this, extra)
  }
}
