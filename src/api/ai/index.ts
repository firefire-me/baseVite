/**
 * AI问答相关API
 */
export const aiApi = {
  /**
   * 发送AI问答请求（流式）
   * @param question 用户问题
   * @returns 响应对象
   */
  async askQuestion(question: string) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${baseUrl}/api/chat/ask`;
    
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
  },
};
