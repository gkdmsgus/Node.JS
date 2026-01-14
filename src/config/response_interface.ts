interface ITsoaResponse<T> {
  resultType: 'SUCCESS' | 'FAIL';
  error: {
    errorCode?: string;
    errorMessage?: string | null;
    data?: any | null;
  } | null;
  success: T | null;
}

class TsoaSuccessResponse<T> implements ITsoaResponse<T> {
  resultType: 'SUCCESS' = 'SUCCESS';
  error: null = null;
  success: T;

  constructor(data: T) {
    this.success = data;
  }
}

class TsoaFailResponse<T> implements ITsoaResponse<T> {
  resultType: 'FAIL' = 'FAIL';
  error: {
    errorCode?: string;
    errorMessage?: string | null;
    data?: any | null;
  };
  success = null;
}

export { TsoaSuccessResponse, TsoaFailResponse };
export type { ITsoaResponse };
